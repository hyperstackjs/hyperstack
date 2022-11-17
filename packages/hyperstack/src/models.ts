import path from 'path'
import { buildModels, converge } from '@hyperstackjs/hypermodel'
import type { App, Context } from './types'
import { setters } from './keys'
import { requireModule } from './utils'

export const seed = (fn: (app: App) => Promise<void>) => fn
export type MigrationsMode = 'auto' | 'none' | 'run'

export const runSeed = async (app: App) => {
  const { context } = app
  const appPath = context.store().app!.root
  const seedfile = path.join(appPath, 'config', 'db', 'seed')
  const seedfn = requireModule(seedfile)
  await seedfn(app)
}

export const tieModels = async (
  context: Context,
  migrationsMode: MigrationsMode
) => {
  const store = context.store()
  const logger = store.logger
  const appRoot = store.app!.root
  const modelsRoot = path.join(appRoot, 'app', 'models/index.[tj]s')
  const config = context.config().database!

  const { models, connection } = await buildModels({
    logger,
    config,
    modelsRoot,
  })
  if (!models) {
    logger.info(
      `No models loaded (no models exported in ${modelsRoot} or no such file)`
    )
  }

  // this brings the DB up to date, using sync, truncate, migrations, etc.
  // based on configuration and state of migrations
  let didTieMigrations = false
  if (migrationsMode !== 'none') {
    const migrationsRoot = path.join(
      appRoot,
      'config',
      'db',
      'migrate',
      '*.[tj]s'
    )
    const resolvedConfig =
      migrationsMode === 'run' ? { ...config, migrate: true } : config
    try {
      await converge({
        migrationsRoot,
        config: resolvedConfig,
        models,
        connection,
        logger,
      })
    } catch (e) {
      logger.error(e)
      throw e
    }
    didTieMigrations = true
  }

  context.update(setters.models, {
    models: {
      models,
      connection,
      didTieModels: true,
      didTieMigrations,
    },
  })
}
