import type { Request as XRequest } from 'express'
import { NextFunction, Response } from 'express'

interface Request extends XRequest {
  id: any
  user?: any
  state?: any
  logger?: any
}

export { Request, Response, NextFunction }

export interface RequestIdOpts {
  mode: 'none' | 'passthrough' | 'passthrough-or-generate' | 'generate'
}

export interface ServerOptions {
  logging?: { logger?: boolean | any; middleware?: boolean | any } // true | {logger, opts}
  staticFolder?: string
  indexCatchAll?: boolean
  forceHttps?: boolean
  cookieSecret?: string
  sendValidationErrors?: boolean
  gzip?: boolean | any
  helmet?: boolean | any
  json?: boolean | any
  requestId?: boolean | RequestIdOpts
  urlencoded?: boolean | any
  beforeControllers?: any
  afterControllers?: any
  beforeMiddleware?: any
  afterMiddleware?: any
}

export interface CreateServerOptions {
  controllers: any[]
  opts?: ServerOptions
}
