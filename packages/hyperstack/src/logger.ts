import { createColors } from 'colorette'
import L from 'lodash'
import createDebug from 'debug'
import type P from 'pino'
import pino from 'pino'
import type { AppLoggerOptions, Logger } from '@hyperstackjs/typings'
import pretty from 'pino-pretty'
import createPinoMiddleware from 'express-pino-logger'
import { v4 as uuidv4 } from 'uuid'
import type { Request } from '@hyperstackjs/hypercontroller'
import { setters } from './keys'
import type { Context } from './types'
import { isDevelopment, isProduction, isTest } from './context'
const debug = createDebug('hyperstack:logger')

const devPretty = pretty({
  sync: true,
  colorize: true,
  levelFirst: true,
  translateTime: true,
  singleLine: true,
  ignore: 'pid,hostname',
})

/**
 * Types from Pino
 * @see https://github.com/pinojs/pino/blob/master/pino.d.ts
 */
export type BaseLogger = P.BaseLogger
export type DestinationStream = P.DestinationStream
export type LevelWithSilent = P.LevelWithSilent
export type LoggerOptions = P.LoggerOptions

export const redactionsList: string[] = [
  'access_token',
  'data.access_token',
  'data.*.access_token',
  'data.*.accessToken',
  'accessToken',
  'data.accessToken',
  'DATABASE_URL',
  'data.*.email',
  'data.email',
  'email',
  'event.headers.authorization',
  'data.hashedPassword',
  'data.*.hashedPassword',
  'hashedPassword',
  'host',
  'jwt',
  'data.jwt',
  'data.*.jwt',
  'JWT',
  'data.JWT',
  'data.*.JWT',
  'password',
  'data.password',
  'data.*.password',
  'params',
  'data.salt',
  'data.*.salt',
  'salt',
  'secret',
  'data.secret',
  'data.*.secret',
]

export const logLevel = () => {
  if (typeof process.env.LOG_LEVEL !== 'undefined') {
    return process.env.LOG_LEVEL
  } else if (isProduction()) {
    return 'warn'
  } else if (isTest()) {
    return 'silent'
  } else {
    return 'trace'
  }
}

export const defaultLoggerOptions: Partial<AppLoggerOptions> = {
  level: logLevel(),
  redact: {
    paths: redactionsList,
  },
}

export const createLogger = (loggerOpts: AppLoggerOptions = {}): Logger => {
  const options = L.merge({}, defaultLoggerOptions, loggerOpts)

  debug('Logger Configuration')
  debug(`isProduction: ${isProduction()}`)
  debug(`isDevelopment: ${isDevelopment()}`)
  debug(`isTest: ${isTest()}`)
  debug(`logLevel: ${options.level}`)
  debug(`stream: ${!!options.stream}`)

  const pinoOpts = L.omit(options, ['stream', 'middleware'])
  const colors = createColors({ useColor: !isProduction() })

  let logger = null
  if (isProduction()) {
    logger = pino(
      pinoOpts as LoggerOptions,
      options.stream as DestinationStream
    ) as any as Logger
  } else {
    debug('Logging to dev environment: pretty mode')
    logger = pino(pinoOpts as LoggerOptions, devPretty) as any as Logger
  }

  logger.colors = colors
  return logger
}

export const customRequestProps = (req: Request, _res: Response) => {
  if (req.user) {
    const user = req.user
    // sniff out a reasonable identifier
    const out: any = {}
    ;['id', 'pid', 'email', 'username'].forEach((k) => {
      if (user[k]) {
        out[`user-${k}`] = user[k]
      }
    })
    return out
  }
  return {}
}

export const createMiddleware = (logger: Logger, middlewareConfig?: any) => {
  return createPinoMiddleware({
    logger,
    genReqId: (req) => req.id || uuidv4().toString(),
    customProps: customRequestProps,
    ...(middlewareConfig || {}),
  })
}

export const tieLogger = (context: Context) => {
  const loggerConfig = context.config().logger
  const logger = createLogger(loggerConfig)
  const middlewareConfig = loggerConfig?.middleware
  const middleware = createMiddleware(logger, middlewareConfig)

  const initializers = context.store().initializers!.initializers
  const { logger: theirLogger, middleware: theirMiddleware } =
    initializers.beforeLogger?.reduce(
      (res, init) => {
        const out = init(res)
        return out || res
      },
      { logger, middleware }
    ) || {}

  // user can replace impl. of colors, but if none
  // given, we want ours.
  if (theirLogger && !theirLogger.colors) {
    theirLogger.colors = createColors({ useColor: !isProduction() })
  }

  const selectedLogger = theirLogger || logger
  const selectedMiddleware = theirMiddleware || middleware

  context.update(setters.logger, {
    logging: {
      middleware: selectedMiddleware,
    },
    logger: selectedLogger,
  })
  return logger
}
