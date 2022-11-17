import path from 'path'
import fs from 'fs'
import type { ServerOptions } from '@hyperstackjs/hypercontroller'
import { createServer } from '@hyperstackjs/hypercontroller'
import type { Context } from './types'
import { setters } from './keys'
import { requireModule } from './utils'

const VAN_HALEN_PORT = 5150
const resolvePort = () => process.env.PORT || VAN_HALEN_PORT
const createApp = ({
  controllers,
  initializers,
  logging,
  staticFolder,
  indexCatchAll,
  forceHttps,
  gzip,
  cookieSecret,
  sendValidationErrors,
}: { controllers: any; initializers: any } & Partial<ServerOptions>) => {
  return createServer({
    controllers,
    opts: {
      logging,
      staticFolder,
      indexCatchAll,
      forceHttps,
      gzip,
      cookieSecret,
      sendValidationErrors,
      beforeMiddleware: (preapp: any) => {
        if (initializers && initializers.beforeMiddleware) {
          initializers.beforeMiddleware.forEach((init: (app: any) => void) =>
            init(preapp)
          )
        }
      },
      afterMiddleware: (postapp: any) => {
        if (initializers && initializers.afterMiddleware) {
          initializers.afterMiddleware.forEach((init: (app: any) => void) =>
            init(postapp)
          )
        }
      },
      beforeControllers: (preapp: any) => {
        if (initializers && initializers.beforeControllers) {
          initializers.beforeControllers.forEach((init: (app: any) => void) =>
            init(preapp)
          )
        }
      },
      afterControllers: (postapp: any) => {
        if (initializers && initializers.afterControllers) {
          initializers.afterControllers.forEach((init: (app: any) => void) =>
            init(postapp)
          )
        }
      },
    },
  })
}

export const getControllerConfig = (context: Context) => {
  const store = context.store()
  const appRoot = store.app!.root
  const logger = store.logger
  const middleware = store.logging!.middleware
  const initializers = store.initializers
  const controllerPath = path.join(appRoot, 'app', 'controllers')

  const {
    serveStatic,
    indexCatchAll,
    forceHttps,
    gzip,
    cookieSecret,
    sendValidationErrors,
    json,
    helmet,
    urlencoded,
    baseUrl: cBaseUrl,
  } = context.config().controllers || {}

  const baseUrl = cBaseUrl || `http://localhost:${resolvePort()}`

  if (!fs.existsSync(controllerPath)) {
    throw new Error(`tie controllers: no app controller in ${controllerPath}`)
  }
  const { AppController } = requireModule(controllerPath)
  if (!AppController) {
    throw new Error(`No 'AppController' export was found in ${controllerPath}`)
  }

  const staticFolder = serveStatic ? path.join(appRoot, 'public') : undefined
  return {
    controllers: AppController.controllers,
    initializers,
    logging: { logger, middleware },
    staticFolder,
    indexCatchAll,
    forceHttps,
    gzip,
    cookieSecret,
    sendValidationErrors,
    helmet,
    json,
    urlencoded,
    baseUrl,
  }
}

export const tieControllers = async (context: Context) => {
  const appConfig = getControllerConfig(context)
  const app = createApp(appConfig)

  context.update(setters.controllers, {
    controllers: {
      numControllers: appConfig.controllers.length,
      baseUrl: appConfig.baseUrl,
      controllers: appConfig.controllers,
      port: resolvePort(),
      app,
      didTieControllers: true,
    },
  })
}
