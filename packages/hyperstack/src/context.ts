import path from 'path'
import createDebug from 'debug'
import L from 'lodash'
import type { Config, ContextStore } from '@hyperstackjs/typings'
import { consts, setters } from './keys'
import type { Context } from './types'
import { printJobCounts, printRoutesV2 } from './utils'

const debug = createDebug('hyperstack:context')

class InMemContext implements Context {
  private __store: ContextStore = {}
  private __config: Config | null = null
  clear = () => {
    this.__store = {}
    this.__config = null
  }

  baseUrl = () => this.__store.controllers!.baseUrl
  logger = () => this.__store.logger
  models = () => this.__store.models!.models
  mailers = () => this.__store.workers!.mailers
  workers = () => this.__store.workers!.workers
  controllers = () => this.__store.controllers!.controllers
  environment = () => this.__store.app!.environmentFile
  helpers = {
    printRoutes: printRoutesV2,
    printJobCounts,
  }

  update = (updater: string, d: Partial<ContextStore>) => {
    debug('[%o] context update: %o', updater, d)
    L.merge(this.__store, d)
  }

  setConfig = (c: Config) => {
    this.__config = c
  }

  store = () => this.__store
  config = () => {
    if (!this.__config) {
      throw new Error('configuration not loaded yet.')
    }
    return this.__config
  }

  initializerProps = <T>(key: string) =>
    L.get(this.__store.initializers?.props || {}, key) as T
}

const context = new InMemContext()

export { context }

export const isTest = () => process.env.NODE_ENV === 'test'
export const isProduction = () => process.env.NODE_ENV === 'production'
export const isDevelopment = () => !isTest() && !isProduction()

export const envMode = () =>
  isTest() ? 'test' : isProduction() ? 'production' : 'development'
export const getEnvironment = () =>
  L.replace(process.env.NODE_ENV || 'development', /[^A-Za-z0-9_-]/g, '')

export const getAppEnvironment = () =>
  process.env[consts.appEnvKey]
    ? L.replace(process.env[consts.appEnvKey]!, /[^A-Za-z0-9_-]/g, '')
    : getEnvironment()

export const resolveAppRoot = (app?: string) =>
  app || path.join(process.cwd(), '/src')

export const tieApp = (context: Context, app?: string) => {
  const appRoot = resolveAppRoot(app)
  context.update(setters.context, {
    app: {
      mode: envMode(),
      environmentFile: getAppEnvironment(),
      root: appRoot,
    },
  })
}
