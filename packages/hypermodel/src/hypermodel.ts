/*
eslint-disable max-classes-per-file
*/

import {
  AllowNull,
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
} from 'sequelize-typescript'
import type { CountOptions } from 'sequelize/types'

class HyperModel<T> extends Model<T> {
  static async exists(options?: CountOptions) {
    const c = await this.count(options)
    return c !== 0
  }
}
class HyperModelError extends Error {
  readonly isModelError = true

  constructor(message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
class ModelAssertionError extends Error {
  readonly isAssertionError = true

  constructor(message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export { HyperModel, HyperModelError, ModelAssertionError }

export function UUIDPK(t: any, prop: string) {
  Column(t, prop)
  PrimaryKey(t, prop)
  IsUUID(4)(t, prop)
  AllowNull(false)(t, prop)
  Default(DataType.UUIDV4)(t, prop)
}
