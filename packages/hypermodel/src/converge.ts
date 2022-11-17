import createDebug from 'debug'
import { migrate } from './migrate'
import type { ModelsOpts } from './types'
const debug = createDebug('hypermodel:converge')

export const dropSchema = async ({
  logger,
  connection,
}: Pick<ModelsOpts, 'logger' | 'connection'>) => {
  const { yellow, bold } = logger.colors
  logger.info(`${bold(yellow('models:'))} dropping schema`)
  await connection.query(`DROP TABLE IF EXISTS "SequelizeMeta";`)
  await connection.drop()
}
export const syncSchema = async ({
  logger,
  connection,
}: Pick<ModelsOpts, 'logger' | 'connection'>) => {
  const { yellow, bold } = logger.colors
  logger.info(`${bold(yellow('models:'))} syncing schema`)
  await connection.sync({ force: false })
}
export const truncate = async ({
  logger,
  connection,
  models,
}: Pick<ModelsOpts, 'logger' | 'connection' | 'models'>) => {
  const { yellow, bold } = logger.colors
  logger.info(`${bold(yellow('models:'))} truncating tables`)
  for (const model of Object.values(models)) {
    const m = model as any

    await m.truncate({ restartIdentity: true, cascade: true, force: true })
    // https://github.com/sequelize/sequelize/issues/11152
    if (connection.getDialect() === 'sqlite') {
      await connection.query('PRAGMA foreign_keys = OFF;')
      await connection.query(`DELETE FROM ${m.tableName};`)
      await connection.query(`DELETE FROM sqlite_sequence;`)
    }
  }
}

export const converge = async ({
  migrationsRoot,
  models,
  config,
  connection,
  logger,
}: Omit<ModelsOpts, 'modelsRoot'>) => {
  debug('configuration %o', config)
  if (config.dropSchema) {
    await dropSchema({ logger, connection })
  }
  if (config.synchronize) {
    await syncSchema({ logger, connection })
  }
  if (config.migrate) {
    const mig = migrate('auto')
    await mig({ migrationsRoot, connection, logger })
  }
  if (config.truncate) {
    await truncate({ logger, connection, models })
  }
}
