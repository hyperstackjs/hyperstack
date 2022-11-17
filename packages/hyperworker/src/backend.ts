import L from 'lodash'
import { Worker as BMWorker, Queue } from 'bullmq'
import createDebug from 'debug'
import type { WorkerBackendOpts } from '@hyperstackjs/typings'
import { HyperWorker } from './worker'
export interface JobCounts {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
}

const debug = createDebug('hyperworker:backend')

const sleep = (t: number) =>
  new Promise((resolve, _reject) => setTimeout(() => resolve(true), t))

const defaultWorkerOpts = {
  lockDuration: 30000,
}

const defaultQueueOpts = {
  // make data sizes predictable, modest, and auto healing
  streams: {
    events: { maxLen: 1000 }, // default was 10k
  },
  defaultJobOptions: {
    removeOnComplete: true, // default never
    removeOnFail: { count: 100 }, // default never
    stackTraceLimit: 5, // default no limit
  },
}
class BullmqBackend {
  // our worker types, for referece
  private workers?: any[]

  // bullmq workers, will 'new' our worker types and give them work
  // they won't work unless calling 'start'
  private bmworkers?: any[]

  // bullmq queues, gives worker types an 'enqueue' method
  private bmqueues: any[]

  private opts: WorkerBackendOpts

  public connection: any

  constructor(workers: any[], connection: any, opts?: WorkerBackendOpts) {
    this.connection = connection
    this.workers = workers
    this.opts = {
      workerOpts: L.merge({}, defaultWorkerOpts, opts?.workerOpts),
      queueOpts: L.merge({}, defaultQueueOpts, opts?.queueOpts),
    }

    debug('opts: %o', this.opts)
    this.bmqueues = workers.map((Klass) => {
      debug(`adding queue: ${Klass.queueName} from class ${Klass.name}`)
      const q = new Queue(Klass.queueName, {
        connection: this.connection,
        ...this.opts.queueOpts,
      })
      q.on('error', (err) => {
        HyperWorker.logger && HyperWorker.logger.error(`[error] ${err}`)
        HyperWorker.reportError(err)
      })
      const enqueue = (data: any, opts: any) => q.add('job', data, opts)
      Klass.enqueue = enqueue
      Klass.queue = q
      return q
    })
    this.workers = workers
  }

  async processJobs() {
    if (this.bmworkers) {
      throw new Error('already processing jobs')
    }
    if (!HyperWorker.logger) {
      throw new Error('logger is missing. did the app boot correctly?')
    }
    const { magenta, bold } = HyperWorker.logger.colors
    const pref = bold(magenta('workers:'))
    if (!this.workers) {
      throw new Error(
        "you need to wire into your worker first. call 'wireInto(<workers>)'"
      )
    }
    this.bmworkers = this.workers
      .filter((Klass) => {
        if (Klass.producerOnly) {
          HyperWorker.logger!.info(
            `${pref} producer only job: ${Klass.queueName}`
          )
          return false
        }
        return true
      })
      .map((Klass) => {
        debug(`processing queue: ${Klass.queueName} from class ${Klass.name}`)
        return new BMWorker(
          Klass.queueName,
          async (job) => {
            debug(`processing job in: ${Klass.queueName}`)
            const w = new Klass()
            await w.perform(job)
          },
          {
            connection: this.connection,
            ...this.opts.workerOpts,
          }
        )
      })
    this.bmworkers.forEach((w) => {
      w.on('drained', (_job: any) => {
        HyperWorker.logger!.info(`${pref} drained: ${w.name}`)
      })

      w.on('completed', (_job: any) => {
        HyperWorker.logger!.info(`${pref} completed: ${w.name}`)
      })

      w.on('failed', (job: any, err: Error) => {
        HyperWorker.logger!.info(`${pref} failed: ${w.name} (${err})`)
        HyperWorker.reportError(err, { worker: w.name, jobId: job.id })
      })
      w.on('error', (err: Error) => {
        HyperWorker.logger!.error(`${pref} error: ${w.name} (${err})`)
        HyperWorker.reportError(err, { worker: w.name })
      })
    })
  }

  async stop() {
    if (this.bmworkers) {
      for (const w of this.bmworkers) {
        if (w) {
          w.connection.removeAllListeners('close')
          w.connection.removeAllListeners('error')
          w.removeAllListeners('error')
          w.removeAllListeners('completed')
          w.removeAllListeners('drained')
          await w.close()
        }
      }
    }
    if (this.bmqueues) {
      for (const q of this.bmqueues) {
        if (q) {
          q.connection.removeAllListeners('close')
          q.connection.removeAllListeners('error')
          q.removeAllListeners('error')
          q.removeAllListeners('completed')
          q.removeAllListeners('drained')
          await q.close()
        }
      }
    }
    await this.connection.quit()
    this.workers = undefined

    await sleep(500) // give some time for emitters to drain
  }
}

export { BullmqBackend }
