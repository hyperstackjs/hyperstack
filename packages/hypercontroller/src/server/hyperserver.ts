import helmet from 'helmet'
import compression from 'compression'
import { Server } from '@hyperstackjs/hypernight'
import { json, urlencoded } from 'body-parser'
import createPino from 'express-pino-logger'
import createPinoLogger from 'pino'
import createDebug from 'debug'
import type { Logger } from '@hyperstackjs/typings'
import type {
  CreateServerOptions,
  RequestIdOpts,
  ServerOptions,
} from '../types'

import indexSender from './index-sender'
import notFound from './not-found'
import setRequestId from './set-request-id'
import errorHandler from './error-handler'
const debug = createDebug('hyperserver')

const getOrCreateLogger = (opts: boolean | any) => {
  if (opts === false) {
    return null
  }
  if (opts && opts !== true) {
    return opts
  }
  debug('creating logger')
  return createPinoLogger()
}

const getOrCreateMiddleware = (logger: Logger, opts: boolean | any) => {
  if (opts === false) {
    return null
  }
  if (opts && opts !== true) {
    return opts
  }
  debug('creating own logger middleware')
  return createPino({ logger: logger as any }) // workaround: e-p-l needs pino 7, while we use pino 8 and types conflict
}

const defaults = {
  helmet: undefined,
  json: { limit: '5mb' },
  urlencoded: { limit: '5mb', extended: true },
  requestIdOpts: { mode: 'passthrough-or-generate' } as RequestIdOpts,
}
const isDefaultSetting = (s: any) => s === true || s === undefined
export class HyperServer extends Server {
  constructor(controllers: any[], opts: ServerOptions) {
    const {
      cookieParserMiddleware,
      forceHttpsMiddleware,
      staticMiddleware,
    } = require('../middleware') // eslint-disable-line @typescript-eslint/no-var-requires
    super(process.env.NODE_ENV === 'development') // setting showLogs to true
    const {
      staticFolder,
      indexCatchAll,
      forceHttps,
      gzip,
      cookieSecret,
      logging,
      helmet: helmetOpts,
      json: jsonOpts,
      urlencoded: urlencodedOpts,
      requestId: requestIdOpts,
      sendValidationErrors,
      beforeControllers,
      afterControllers,
      beforeMiddleware,
      afterMiddleware,
    } = opts

    const logger = getOrCreateLogger(logging && logging.logger)
    const middleware = getOrCreateMiddleware(
      logger,
      logging && logging.middleware
    )
    if (beforeMiddleware) {
      beforeMiddleware(this.app)
    }

    if (requestIdOpts !== false) {
      const res = isDefaultSetting(requestIdOpts)
        ? defaults.requestIdOpts
        : (requestIdOpts as RequestIdOpts)

      this.app.use(setRequestId(res))
    }

    // logging middleware set up
    if (middleware) {
      this.app.use(middleware)
      this.app.use((req, res, next) => {
        // take the pino middleware logger (available in .log) which is enriched with request data,
        // or take a 'dry' logger created here
        ;(req as any).logger = (req as any).log || logger
        if (next) {
          next()
        }
      })
    }

    if (forceHttps) {
      this.app.use(forceHttpsMiddleware)
    }

    if (gzip !== false) {
      const res = isDefaultSetting(gzip) ? undefined : gzip
      debug('gzip: %o', res)
      this.app.use(compression(res))
    }

    if (helmetOpts !== false) {
      const res = isDefaultSetting(helmetOpts) ? defaults.helmet : helmetOpts
      debug('helmet: %o', res)
      this.app.use(helmet(res) as any)
    }

    if (jsonOpts !== false) {
      const res = isDefaultSetting(jsonOpts) ? defaults.json : jsonOpts
      debug('json: %o', res)
      this.app.use(json(res) as any)
    }

    if (urlencodedOpts !== false) {
      const res = isDefaultSetting(urlencodedOpts)
        ? defaults.urlencoded
        : urlencodedOpts
      debug('urlencoded: %o', res)
      this.app.use(urlencoded(res) as any)
    }

    if (cookieSecret) {
      this.app.use(cookieParserMiddleware(cookieSecret))
    }

    if (staticFolder) {
      this.app.use(staticMiddleware(staticFolder))
    }

    if (beforeControllers) {
      beforeControllers(this.app)
    }

    super.addControllers(controllers)
    if (afterControllers) {
      afterControllers(this.app)
    }

    if (staticFolder && indexCatchAll) {
      this.app.get('*', indexSender(staticFolder))
    }

    this.app.use(notFound)

    // give the error handler a logger of its own, guaranteed to exist, in case
    // things go SO bad and a request doesn't even get to have a logger in req.logger
    this.app.use(
      errorHandler({ logger, sendValidationErrors: !!sendValidationErrors })
    ) // logger can be null if user said 'logger: false'

    if (afterMiddleware) {
      afterMiddleware(this.app)
    }
    ;(this.app as any).__opts = opts // hide for metadata about our app, to list out in printers
  }
}
export const createServer = ({
  controllers,
  opts = {},
}: CreateServerOptions) => {
  const server = new HyperServer(
    controllers.map((K) => new K()),
    opts
  )
  return server.app
}
