import 'reflect-metadata'
import type { IClassMetadata, IMethodMetadata, WrapperFunction } from './types'
import { classMetadataKey } from './types'

export function Wrapper(
  wrapper: WrapperFunction
): MethodDecorator & PropertyDecorator {
  return (target: Object, propertyKey: string | symbol): void => {
    addWrapperToMetadata(target, propertyKey, wrapper)
  }
}

export function ClassWrapper(wrapper: WrapperFunction): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): void => {
    addWrapperToMetadata(target.prototype, classMetadataKey, wrapper)
  }
}

export function addWrapperToMetadata(
  target: Object,
  metadataKey: any,
  wrapper: WrapperFunction
): void {
  let metadata: IClassMetadata | IMethodMetadata | undefined =
    Reflect.getOwnMetadata(metadataKey, target)
  if (!metadata) {
    metadata = {}
  }
  metadata.wrapper = wrapper
  Reflect.defineMetadata(metadataKey, metadata, target)
}
