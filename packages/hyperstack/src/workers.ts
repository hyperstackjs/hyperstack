import path from 'path'

import type { BuildWorkersParams } from '@hyperstackjs/hyperworker'
import { buildWorkers } from '@hyperstackjs/hyperworker'
import type { Context, WorkerTypes, WorkersMode } from './types'
import { setters } from './keys'

export const getWorkersConfig = (context: Context): BuildWorkersParams => {
  const store = context.store()
  const config = context.config()
  const logger = store.logger
  const appRoot = store.app!.root
  if (!config.workers) {
    throw new Error(
      'cannot configure workers and mailers. app config is not initialized'
    )
  }

  const mailerSettings = config.mailers
  const {
    inprocess: isInProcess,
    backendOpts,
    redis: redisUrl,
    truncate,
  } = config.workers

  const mailersGlob = path.join(appRoot, 'app', 'mailers', 'index.[tj]s')
  const mailerTemplatesRoot = path.join(appRoot, 'app', 'mailers')
  const workersGlob = path.join(appRoot, 'app', 'workers', 'index.[tj]s')
  const initializers = store.initializers!.initializers
  const beforeWorkers = (workerTypes: WorkerTypes) => {
    initializers &&
      initializers.beforeWorkers &&
      initializers.beforeWorkers.forEach((init) => init(workerTypes))
  }
  return {
    isInProcess,
    workersGlob,
    mailersGlob,
    mailerTemplatesRoot,
    mailerSettings,
    logger,
    redisUrl,
    truncate,
    backendOpts,
    beforeWorkers,
    afterWorkers: (_p: any) => {}, // not used
  }
}
export const tieWorkers = async (context: Context, mode: WorkersMode) => {
  const ctx = await buildWorkers(getWorkersConfig(context), mode)

  context.update(setters.workers, {
    workers: {
      ...ctx,
      didTieWorkers: true,
    },
  })
}
