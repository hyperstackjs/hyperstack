import type {
  ErrorRequestHandler,
  IRouter,
  RequestHandler,
  RouterOptions,
} from 'express'
import type { PathParams } from 'express-serve-static-core'

export type Middleware = RequestHandler
export type ErrorMiddleware = ErrorRequestHandler
export type WrapperFunction = (methodOrProperty: any) => RequestHandler
export type Controller = any
export type RouterLib = (options?: RouterOptions) => IRouter

export interface IMethodMetadata {
  httpRoutes?: IHttpRoute[]
  errorMiddlewares?: ErrorMiddleware[]
  middlewares?: Middleware[]
  wrapper?: WrapperFunction
}

export interface IClassMetadata {
  basePath?: PathParams
  childControllers?: Controller[]
  errorMiddlewares?: ErrorMiddleware[]
  middlewares?: Middleware[]
  options?: RouterOptions
  wrapper?: WrapperFunction
}

export const classMetadataKey = Symbol('Class Metadata Key')

export type HttpDecorator = HttpVerb | 'all'
export interface IHttpRoute {
  httpDecorator: HttpDecorator
  path: string | RegExp
}

export enum HttpVerb {
  CHECKOUT = 'checkout',
  COPY = 'copy',
  DELETE = 'delete',
  GET = 'get',
  HEAD = 'head',
  LOCK = 'lock',
  MERGE = 'merge',
  MKACTIVITY = 'mkactivity',
  MKCOL = 'mkcol',
  MOVE = 'move',
  MSEARCH = 'm-search',
  NOTIFY = 'notify',
  OPTIONS = 'options',
  PATCH = 'patch',
  POST = 'post',
  PURGE = 'purge',
  PUT = 'put',
  REPORT = 'report',
  SEARCH = 'search',
  SUBSCRIBE = 'subscribe',
  TRACE = 'trace',
  UNLOCK = 'unlock',
  UNSUBSCRIBE = 'unsubscribe',
}
