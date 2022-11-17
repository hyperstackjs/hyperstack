/* eslint-disable @typescript-eslint/no-var-requires */
import glob from 'glob'
import L from 'lodash'
import createDebug from 'debug'
import { HyperWorker } from './worker'
import { Mailer } from './mailer'
import type {
  BuildWorkersParams,
  CreateWorkerConnectionOpts,
  LoadWorkersOpts,
  WorkerBackendOpts,
  WorkerTypes,
  WorkersMode,
} from './types'
import { BullmqBackend } from './backend'

const debug = createDebug('@hyperstackjs/hyperworker')
const load = (patt: string) =>
  glob.sync(patt).map((f) => {
    let mod = null
    try {
      mod = require(f)
    } catch (e: any) {
      console.log(`error dynamically loading '${f}'\n${e.toString()}`) // eslint-disable-line no-console
      throw e
    }
    return mod.default || mod
  })

export const createBackend = ({
  hyperworkers,
  redis,
  backendOpts,
}: {
  hyperworkers: HyperWorker[]
  redis: any
  backendOpts?: WorkerBackendOpts
}) => {
  return new BullmqBackend(hyperworkers, redis, backendOpts)
}

export const loadWorkers = ({ workersGlob, mailersGlob }: LoadWorkersOpts) => {
  const workers = L.reduce(load(workersGlob), L.merge) || {}
  const mailers = L.reduce(load(mailersGlob), L.merge) || {}

  if (
    Object.keys(workers).includes('default') ||
    Object.keys(mailers).includes('default')
  ) {
    throw new Error('cannot start worker that is exported as default')
  }
  return { workers, mailers }
}

export const createConnection = async ({
  redisUrl,
  rejectUnauthorized = false,
}: CreateWorkerConnectionOpts) => {
  const Redis = require('ioredis')
  return new Redis(redisUrl, {
    name: 'hyperworkers',
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: redisUrl?.startsWith('rediss://')
      ? {
          rejectUnauthorized,
        }
      : undefined,
  })
}

const initializeWorkers = ({
  logger,
  mailerTemplatesRoot,
  mailerSettings,
}: {
  logger: any
  mailerTemplatesRoot: string
  mailerSettings: any
}) => {
  HyperWorker.clear()
  Mailer.clear()
  HyperWorker.initWorker({ logger })
  Mailer.initMailer({
    templatesRoot: mailerTemplatesRoot,
    settings: mailerSettings,
  })
}

// recv: beforeWorkers, afterWorkers (like controllers)
const buildWorkers = async (
  {
    isInProcess,
    workersGlob,
    mailersGlob,
    mailerTemplatesRoot,
    mailerSettings,
    logger,
    redisUrl,
    backendOpts,
    truncate = false,
    beforeWorkers = (_p: WorkerTypes) => {},
    afterWorkers = (_p: any) => {},
  }: BuildWorkersParams,
  mode: WorkersMode
) => {
  // worker types rigging

  initializeWorkers({ logger, mailerTemplatesRoot, mailerSettings })

  // set up mail transport and options
  // set up hyperworker logger, report errors with sentry
  beforeWorkers({ HyperWorker, Mailer })

  // load workers from disk
  const { workers, mailers } = loadWorkers({
    workersGlob,
    mailersGlob,
  })

  const numWorkers = Object.keys(workers).length
  const numMailers = Object.keys(mailers).length
  const workerline = `${numWorkers} workers, ${numMailers} mailers`

  const { magenta, bold } = logger.colors
  const pref = bold(magenta('workers:'))

  if (isInProcess) {
    debug('running in-process')
    logger.info(`${pref} [in-process, duplex] ${workerline}`)
    HyperWorker.setMode({ inprocess: isInProcess })
    return {
      background: 'inprocess',
      backend: null,
      connection: null,
      mode: 'duplex' as WorkersMode,
      mailerTemplatesRoot,
      numMailers,
      numWorkers,
      workers,
      mailers,
    }
  }

  const hyperworkers = [
    ...Object.values(workers),
    ...Object.values(mailers),
  ] as HyperWorker[]
  // set up a redis connection
  if (!redisUrl) {
    throw new Error('cannot find a Redis URL')
  }
  debug('creating a Redis connection')
  const redis = await createConnection({ redisUrl })
  await redis.connect()
  debug('connected to Redis')

  logger.info(`${pref} [queue, ${mode}] ${workerline}`)
  if (truncate) {
    debug('truncating Redis content')
    logger.warn(`${pref} truncating Redis contents`)
    await redis.flushdb()
  }

  // build the backend and finish
  const b = createBackend({ hyperworkers, redis, backendOpts })
  debug('created backend')

  // share the backend for message passing, control, or in Redis
  // case, temporary store for workers: backend.connection
  // this is a bit of an oversharing, but very pragmatic
  HyperWorker.backend = b

  afterWorkers({ backend: b })
  if (mode === 'consumer' || mode === 'duplex') {
    debug('processing jobs: consumer mode')
    b.processJobs()
  }

  // afterWorkers({ backend })
  return {
    background: 'queue',
    backend: b,
    connection: redis,
    mailerTemplatesRoot,
    mode,
    numMailers,
    numWorkers,
    workers,
    mailers,
  }
}

export { buildWorkers }
