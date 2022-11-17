import * as st from 'sequelize-typescript'
import { UUIDPK } from './hypermodel'

export const Schema = { ...st, UUIDPK } as typeof st & { UUIDPK: typeof UUIDPK }

export { HyperModel, HyperModelError, ModelAssertionError } from './hypermodel'
export * from './utils'
export { buildModels } from './models'
export * from './migrate'
export * from './converge'
export * from './types'
