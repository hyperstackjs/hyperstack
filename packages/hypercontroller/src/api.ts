import {
  ClassWrapper,
  ClassErrorMiddleware as OVClassErrorMiddleware,
  ClassMiddleware as OVClassMiddleware,
  Controller as OVController,
  ErrorMiddleware as OVErrorMiddleware,
  Middleware as OVMiddleware,
} from '@hyperstackjs/hypernight'
import asyncWrap from 'async-express-mw'
import L from 'lodash'
import {
  HttpResponseBadRequest,
  HttpResponseNotFound,
  HttpResponseOK,
  HttpResponseUnauthorized,
} from './http/responses'

import responseHandler from './http/response-handler'
import { createServer, listRoutes, listen, load, printRoutes } from './server'

export const ok = (data: any) => new HttpResponseOK(data)
export const unauthorized = (error: any) =>
  new HttpResponseUnauthorized({
    error,
  })
export const err = (error: any) =>
  new HttpResponseBadRequest({
    error,
  })
export const notfound = (error: any) =>
  new HttpResponseNotFound({
    error,
  })
// safe async wrap middleware decorators
const Middleware = (mware: any) =>
  OVMiddleware(L.castArray(mware).map((m) => asyncWrap(m)))

const ClassMiddleware = (mware: any) =>
  OVClassMiddleware(L.castArray(mware).map((m) => asyncWrap(m)))

const ErrorMiddleware = (mware: any) =>
  OVErrorMiddleware(L.castArray(mware).map((m) => asyncWrap(m)))

const ClassErrorMiddleware = (mware: any) =>
  OVClassErrorMiddleware(L.castArray(mware).map((m) => asyncWrap(m)))
// </end safe async decorators>

// decorator
const Controller = (path: string) => (target: any) => {
  const k = OVController(path)(target)
  ClassWrapper(responseHandler)(target)
  return k
}

export {
  load,
  listen,
  listRoutes,
  printRoutes,
  createServer,
  Middleware,
  ClassMiddleware,
  ErrorMiddleware,
  ClassErrorMiddleware,
  Controller,
}

// api decorators
export { Delete, Get, Patch, Post, Put } from '@hyperstackjs/hypernight'
