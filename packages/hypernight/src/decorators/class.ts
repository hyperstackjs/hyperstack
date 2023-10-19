import 'reflect-metadata'
import type { RouterOptions } from 'express'
import type { IClassMetadata, Controller as TController } from './types'
import { classMetadataKey } from './types'

export function Controller(path: string): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): void => {
    addBasePathToClassMetadata(target.prototype, `/${path}`)
  }
}

export function ClassOptions(options: RouterOptions): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): void => {
    addClassOptionsToClassMetadata(target.prototype, options)
  }
}

export function Children(
  children: TController | TController[]
): ClassDecorator {
  // eslint-disable-next-line no-console
  console.log(
    'Warning: @Children decorator is deprecated. Use ChildControllers instead.'
  )
  return <TFunction extends Function>(target: TFunction): void => {
    addChildControllersToClassMetadata(target.prototype, children)
  }
}

export function ChildControllers(
  children: TController | TController[]
): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): void => {
    addChildControllersToClassMetadata(target.prototype, children)
  }
}

export function addBasePathToClassMetadata(
  target: Object,
  basePath: string
): void {
  let metadata: IClassMetadata | undefined = Reflect.getOwnMetadata(
    classMetadataKey,
    target
  )
  if (!metadata) {
    metadata = {}
  }
  metadata.basePath = basePath
  Reflect.defineMetadata(classMetadataKey, metadata, target)
}

export function addClassOptionsToClassMetadata(
  target: Object,
  options: RouterOptions
): void {
  let metadata: IClassMetadata | undefined = Reflect.getOwnMetadata(
    classMetadataKey,
    target
  )
  if (!metadata) {
    metadata = {}
  }
  metadata.options = options
  Reflect.defineMetadata(classMetadataKey, metadata, target)
}

export function addChildControllersToClassMetadata(
  target: Object,
  childControllers: TController | TController[]
): void {
  let metadata: IClassMetadata | undefined = Reflect.getOwnMetadata(
    classMetadataKey,
    target
  )
  if (!metadata) {
    metadata = {}
  }
  if (!metadata.childControllers) {
    metadata.childControllers = []
  }
  let newArr: TController[]

  if (childControllers instanceof Array) {
    newArr = childControllers.slice()
  } else {
    newArr = [childControllers]
  }
  newArr.push(...metadata.childControllers)
  metadata.childControllers = newArr
  Reflect.defineMetadata(classMetadataKey, metadata, target)
}
