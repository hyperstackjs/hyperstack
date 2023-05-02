import type P from 'pino'
import type { Options as PHOptions } from 'pino-http'

export type Logger = P.Logger & { colors: any }
export interface App {
  context: Context
  logger: Logger
  app: any
}

export interface ContextStore {
  logger?: any
  logging?: {
    middleware: any
  }
  stats?: {
    bootTime: number
  }
  tasks?: {
    root: string
    map: TaskMap
  }
  app?: {
    root: string
    mode: string
    environmentFile: string
  }
  initializers?: {
    initializers: LifecycleMap
    props: any
  }

  workers?: {
    background: string
    backend: any
    connection: any
    mailerTemplatesRoot: string
    mode: WorkersMode
    numMailers: number
    numWorkers: number
    workers: any
    mailers: any
    didTieWorkers: boolean
  }
  controllers?: {
    baseUrl: string
    controllers: any // fix
    didTieControllers: boolean
    numControllers: number
    port: string | number
    app: any
  }
  models?: {
    models: any
    connection: any
    didTieModels: boolean
    didTieMigrations: boolean
  }
}

export interface Context<
  TModels = any,
  TMailers = any,
  TWorkers = any,
  TControllers = any
> {
  store: () => ContextStore
  update: (updater: string, d: Partial<ContextStore>) => void
  clear: (cleanupfn?: (ctx: any) => void) => void
  logger: () => Logger
  models: () => TModels
  mailers: () => TMailers
  workers: () => TWorkers
  controllers: () => TControllers
  environment: () => string
  config: () => Config
  setConfig: (c: Config) => void
  helpers: {
    printRoutes: (controllers: any[], snippets?: string[]) => void
    printJobCounts: (workers: any) => Promise<void>
  }
  baseUrl: () => string
  initializerProps: <T = any>(key: string) => T
}
export type AppLoggerOptions = P.LoggerOptions & {
  stream?: P.DestinationStream
  middleware?: PHOptions
}

export interface DatabaseOptions {
  uri: string
  dropSchema?: boolean
  synchronize?: boolean
  migrate?: boolean
  truncate?: boolean
  logging?: any // fix
  native?: boolean
  ssl?: boolean
  pool?: {
    max?: number
    min?: number
    acquire?: number
    idle?: number
  }
}

export interface ConfigPaths {
  exactPath?: string
  configOverrides?: Partial<Config>
  appPath?: string
}

export interface MailerSettings {
  send?: boolean
  preview?: boolean
  delivery?: 'smtp' | 'test' | 'transport'
  transport?: any
  smtpSettings?: {
    host: string
    port: number
    secure?: boolean
    auth?: {
      user: string
      pass: string
    }
  }
}
export interface WorkerBackendOpts {
  workerOpts?: any // elaborate
  queueOpts?: any // elaborate
}
export interface Config {
  logger?: AppLoggerOptions
  database?: DatabaseOptions
  tasks?: {
    root?: string
  }
  controllers?: {
    cookieSecret: string
    jwtSecret?: string
    jwtExpiry?: string
    jwtAlgorithm?: string
    authCookieName?: string | null | boolean
    baseUrl?: string
    serveStatic?: boolean
    indexCatchAll?: boolean
    forceHttps?: boolean
    sendValidationErrors?: boolean
    gzip?: boolean | any
    helmet?: boolean | any
    json?: boolean | any
    urlencoded?: boolean | any
    bearer?: {
      header: string
      query: string
    }
  }
  mailers?: MailerSettings
  workers?: {
    inprocess: boolean
    redis?: string
    backendOpts?: WorkerBackendOpts
    truncate?: boolean
  }
}

export type BeforeLoggerFn = (logging: {
  logger: any
  middleware: any
}) => void | { logger: any; middleware: any }

export interface LifecycleHooks {
  beforeLogger?: BeforeLoggerFn
  beforeApp?: () => void
  afterModels?: () => void
  beforeWorkers?: (workerTypes: any) => void
  beforeMiddleware?: (app: any) => void
  afterMiddleware?: (app: any) => void
  beforeControllers?: (app: any) => void
  afterControllers?: (app: any) => void
  provideProps?: () => any
}

export interface LifecycleMap {
  beforeLogger?: [BeforeLoggerFn]
  beforeApp?: [() => void]
  afterModels?: [() => void]
  beforeWorkers?: [(workerTypes: any) => void]
  beforeMiddleware?: [(app: any) => void]
  afterMiddlware?: [(app: any) => void]
  beforeControllers?: [(app: any) => void]
  afterControllers?: [(app: any) => void]
  provideProps?: [() => any]
}

export interface Task {
  description: string
  exec: TaskFn
}
export type TaskFn = (args: any, app: App) => Promise<any>
export type TaskMap = Record<string, Task>

export type WorkersMode = 'duplex' | 'producer' | 'consumer' | 'none'
