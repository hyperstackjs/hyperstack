import type {
  MailerSettings,
  WorkerBackendOpts,
  WorkersMode,
} from '@hyperstackjs/typings'
import type { HyperWorker } from './worker'
import type { Mailer } from './mailer'
export { MailerSettings, WorkerBackendOpts, WorkersMode }
export interface Worker {
  perform(args: any): any
}
export interface WorkerTypes {
  HyperWorker: typeof HyperWorker
  Mailer: typeof Mailer
}
export interface LoadWorkersOpts {
  workersGlob: string
  mailersGlob: string
}

export interface CreateWorkerConnectionOpts {
  redisUrl: string
  rejectUnauthorized?: boolean
}

export interface BuildWorkersParams {
  isInProcess: boolean
  workersGlob: string
  mailersGlob: string
  mailerTemplatesRoot: string
  mailerSettings?: MailerSettings
  logger: any
  redisUrl?: string
  backendOpts?: WorkerBackendOpts
  truncate?: boolean
  beforeWorkers?: (_p: any) => void
  afterWorkers?: (_p: any) => void
}
