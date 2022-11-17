import { listen } from '@hyperstackjs/hypercontroller'
import createDebug from 'debug'
import type {
  App,
  AppOptions,
  Context,
  ControllersMode,
  MigrationsMode,
  WorkersMode,
} from './types'
import { tieConfig } from './config'
import { tieControllers } from './controllers'
import { context, isTest, tieApp } from './context'
import { tieLogger } from './logger'
import { tieWorkers } from './workers'
import { runSeed, tieModels } from './models'
import { tieInitializers } from './initializers'
import { printBanner } from './utils'
import { getTasks, printTasks, tieTasks } from './tasks'
const debug = createDebug('hyperstack:tie')

export const createApp = async ({
  root,
  configFile,
  configOverrides,
  workersMode = 'duplex',
  migrationsMode = 'auto',
  controllersMode = 'auto',
}: {
  root: string
  configFile?: string
  configOverrides?: any
  workersMode?: WorkersMode
  migrationsMode?: MigrationsMode
  controllersMode?: ControllersMode
}): Promise<App> => {
  const started = new Date().getTime()
  context.clear()

  // root
  tieApp(context, root)

  // config
  await tieConfig(context, {
    exactPath: configFile,
    configOverrides,
  })

  // initializers
  await tieInitializers(context)

  // logger
  const logger = tieLogger(context)

  // models, migration and database schema sync
  await tieModels(context, migrationsMode)

  // workers
  if (workersMode !== 'none') {
    await tieWorkers(context, workersMode)
  }

  if (controllersMode !== 'none' && workersMode !== 'consumer') {
    // controllers
    await tieControllers(context)
  }

  // context.validate()
  await tieTasks(context)

  const app = context.store().controllers?.app
  context.update('performance', {
    stats: {
      bootTime: new Date().getTime() - started,
    },
  })

  // server can be null if we're in consumer mode
  return { app, context, logger }
}

export const shutDown = async (context: Context) => {
  const store = context.store()
  const backend = store.workers?.backend
  if (backend && backend.stop) {
    try {
      debug('shutting down backend connection')
      await backend.stop()
    } catch (e) {
      debug('error while stopping workers backend: %o', e)
    }
  }
  const workersConnection = store.workers?.connection
  if (workersConnection && workersConnection.quit) {
    try {
      debug('shutting down workers connection')
      await workersConnection.quit()
    } catch (e) {
      debug('error while closing workers connection: %o', e)
    }
  }
  const modelsConnection = store.models?.connection
  if (modelsConnection && modelsConnection.close()) {
    try {
      debug('shutting down models connection')
      await modelsConnection.close()
    } catch (e) {
      debug('error while closing models connection: %o', e)
    }
  }
}

export const createUseApp =
  (defaultOpts: any) =>
  async (appOpts: AppOptions, fn = (_a: App) => {}) => {
    const resolvedOpts = {
      ...defaultOpts,
      ...appOpts,
    }
    debug('create app, opts: %o', resolvedOpts)
    const res = await createApp(resolvedOpts)
    try {
      await fn(res)
      if (resolvedOpts.isTask) {
        await shutDown(res.context)
      }
      return res
    } catch (e) {
      if (isTest()) {
        await shutDown(res.context)
        throw e
      }
      console.log('run error', e) // eslint-disable-line no-console
      process.exit(1)
    }
  }

// don't migrate, and let controllers load depending on what the workers mode
// are (producer, consumer, or duplex)
export const useWorkers = createUseApp({
  migrationsMode: 'none' as MigrationsMode,
  workersMode: 'consumer' as WorkersMode,
  controllersMode: 'auto' as ControllersMode,
  isTask: false,
})

export const usePortal = createUseApp({
  migrationsMode: 'none' as MigrationsMode,
  workersMode: 'producer' as WorkersMode,
  controllersMode: 'auto' as ControllersMode,
  isTask: false,
})

// don't do anything other than loading models.
export const useApp = createUseApp({
  migrationsMode: 'none' as MigrationsMode,
  workersMode: 'none' as WorkersMode,
  controllersMode: 'none' as ControllersMode,
  isTask: true,
})

export const useModels = createUseApp({
  migrationsMode: 'none' as MigrationsMode,
  workersMode: 'producer' as WorkersMode, // can enqueue stuff
  controllersMode: 'none' as ControllersMode,
  isTask: true,
})

export const useControllers = createUseApp({
  migrationsMode: 'none' as MigrationsMode,
  workersMode: 'none' as WorkersMode, // can enqueue stuff
  controllersMode: 'auto' as ControllersMode,
  isTask: true,
})

export const useTasks = async (appOpts: AppOptions, yargsParsed: any) =>
  useModels(appOpts, async (app) => {
    const { map: taskmap, root: taskRoot } = getTasks(app.context)
    const args = yargsParsed
    const showTasks = !!args.list
    const [taskname] = args._
    debug('tie task args: %o', args)
    debug('tie taskname: %o', taskname)
    debug('tie taskmap: %o', taskmap)
    const task = taskname && taskmap[taskname]
    // show tasks
    if (showTasks || !task) {
      printTasks(taskRoot, taskmap, console.log) // eslint-disable-line no-console
    } else {
      debug('tie task: %o', taskname)
      const res = await task.exec(args, app)
      debug('tie task result: %o', res)
      return res
    }
  })

export const useSeed = async (appOpts: AppOptions) =>
  useModels(appOpts, runSeed)

export const runApp = async (appOpts: AppOptions) => {
  try {
    const { app, context } = await createApp(appOpts)
    const port = context.store().controllers!.port
    printBanner(context, console.log) // eslint-disable-line no-console
    listen(app, { port, log: () => {} })
  } catch (e) {
    console.log('run error', e) // eslint-disable-line no-console
    process.exit(1)
  }
}
