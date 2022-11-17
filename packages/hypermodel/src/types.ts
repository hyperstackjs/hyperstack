import type { Sequelize } from 'sequelize-typescript'
import type { DatabaseOptions, Logger } from '@hyperstackjs/typings'
export { OrderItem } from 'sequelize'
export interface ModelsConvergeConfig {
  dropSchema: boolean
  synchronize: boolean
  migrate: boolean
  truncate: boolean
}
export interface ModelsOpts {
  logger: Logger
  connection: Sequelize
  models: ArrayLike<any>
  config: DatabaseOptions
  migrationsRoot: string
  modelsRoot: string
}
