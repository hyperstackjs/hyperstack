import 'reflect-metadata'
import createDebug from 'debug'
import type { Logger } from '@hyperstackjs/typings'
import type { BullmqBackend, JobCounts } from './backend'
import type { Worker } from './types'
const debug = createDebug('hyperworker:worker')

const K_QUEUE_NAME = 'hyperworker:queue-name'
const K_PRODUCER_ONLY = 'hyperworker:queue-producer-only'

export const queueAs = (queueName: string) => (target: Object) => {
  return Reflect.defineMetadata(K_QUEUE_NAME, queueName, target)
}

export const producerOnly = () => (target: Object) => {
  return Reflect.defineMetadata(K_PRODUCER_ONLY, 'true', target)
}

class HyperWorker implements Worker {
  static inprocess = false

  static logger: Logger | null = null

  static backend: BullmqBackend | null = null

  static enqueue: any = null

  static queue: any = null

  static reportError = (_err: Error, _tags?: any) => {}

  static clear() {
    this.logger = null
    this.backend = null
    this.inprocess = false
    this.enqueue = null
    this.reportError = (_err, _tags?) => {}
  }

  static initWorker({ logger }: any) {
    this.logger = logger
  }

  static setMode({
    inprocess,
    reportError,
  }: {
    inprocess: boolean
    reportError?: (err: Error, tags?: any) => void
  }) {
    this.inprocess = inprocess
    if (reportError) {
      this.reportError = reportError
    }
  }

  static setTest(reportError: any) {
    this.setMode({ inprocess: true, reportError })
  }

  static get queueName() {
    return Reflect.getOwnMetadata(K_QUEUE_NAME, this) || this.name.toLowerCase()
  }

  static get producerOnly() {
    return Reflect.getOwnMetadata(K_PRODUCER_ONLY, this) || false
  }

  static async performNow(args: any) {
    const w = new this()
    return w.perform({ data: args })
  }

  static async performLater(_args: any) {
    if (this.inprocess) {
      debug(`${this.name}: perform now '%o'`, _args)
      return this.performNow(_args)
    }
    debug(`${this.name}: perform later '%o'`, _args)
    return this.enqueue(_args, {}) // TODO opts
  }

  static async jobCounts() {
    return (await this.queue.getJobCounts()) as JobCounts
  }

  get logger() {
    return HyperWorker.logger
  }

  perform(_args: any): any {
    // tbd
  }
}

export { HyperWorker }
