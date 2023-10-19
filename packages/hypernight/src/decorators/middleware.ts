import 'reflect-metadata'
import type {
  IClassMetadata,
  IMethodMetadata,
  ErrorMiddleware as TErrorMiddleware,
  Middleware as TMiddleware,
} from './types'
import { classMetadataKey } from './types'

export function Middleware(
  middleware: TMiddleware | TMiddleware[]
): MethodDecorator & PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    addMiddlewareToMetadata(target, propertyKey, middleware)
  }
}

// tslint:disable-next-line:max-line-length
export function ErrorMiddleware(
  errorMiddleware: TErrorMiddleware | TErrorMiddleware[]
): MethodDecorator & PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    addErrorMiddlewareToMetadata(target, propertyKey, errorMiddleware)
  }
}

export function ClassMiddleware(
  middleware: TMiddleware | TMiddleware[]
): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): void => {
    addMiddlewareToMetadata(target.prototype, classMetadataKey, middleware)
  }
}

export function ClassErrorMiddleware(
  errorMiddleware: TErrorMiddleware | TErrorMiddleware[]
): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): void => {
    addErrorMiddlewareToMetadata(
      target.prototype,
      classMetadataKey,
      errorMiddleware
    )
  }
}

// tslint:disable-next-line:max-line-length
export function addMiddlewareToMetadata(
  target: Object,
  metadataKey: any,
  middlewares: TMiddleware | TMiddleware[]
): void {
  let metadata: IClassMetadata | IMethodMetadata | undefined =
    Reflect.getOwnMetadata(metadataKey, target)
  if (!metadata) {
    metadata = {}
  }
  if (!metadata.middlewares) {
    metadata.middlewares = []
  }
  let newArr: TMiddleware[]
  if (middlewares instanceof Array) {
    newArr = middlewares.slice()
  } else {
    newArr = [middlewares]
  }
  newArr.push(...metadata.middlewares)
  metadata.middlewares = newArr
  Reflect.defineMetadata(metadataKey, metadata, target)
}

// tslint:disable-next-line:max-line-length
export function addErrorMiddlewareToMetadata(
  target: Object,
  metadataKey: any,
  errorMiddlewares: TErrorMiddleware | TErrorMiddleware[]
): void {
  let metadata: IClassMetadata | IMethodMetadata | undefined =
    Reflect.getOwnMetadata(metadataKey, target)
  if (!metadata) {
    metadata = {}
  }
  if (!metadata.errorMiddlewares) {
    metadata.errorMiddlewares = []
  }
  let newArr: TErrorMiddleware[]
  if (errorMiddlewares instanceof Array) {
    newArr = errorMiddlewares.slice()
  } else {
    newArr = [errorMiddlewares]
  }
  newArr.push(...metadata.errorMiddlewares)
  metadata.errorMiddlewares = newArr
  Reflect.defineMetadata(metadataKey, metadata, target)
}
