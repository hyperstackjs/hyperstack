import glob from 'glob'
import { Sequelize } from 'sequelize-typescript'
import L from 'lodash'
import type { ModelsOpts } from './types'
const load = (patt: string) =>
  glob.sync(patt).map((f) => {
    let mod = null
    try {
      mod = require(f)
    } catch (e: any) {
      console.log(`error dynamically loading '${f}'\n${e.toString()}`) // eslint-disable-line no-console
      throw e
    }

    return mod.default || mod
  })
const isTrue = (val: any) => val === true || val === 'true'

const POOL_MAX_DEFAULT = 5
const POOL_MIN_DEFAULT = 1
const POOL_ACQUIRE_DEFAULT = 30000
const POOL_IDLE_DEFAULT = 10000

const createSequelizeConfig = async ({
  logger,
  config,
  modelsRoot,
}: Pick<ModelsOpts, 'logger' | 'config' | 'modelsRoot'>) => {
  const models = L.reduce(load(modelsRoot), L.merge)
  const max_pool_connection = config.pool?.max || POOL_MAX_DEFAULT
  let min_pool_connection = config.pool?.min || POOL_MIN_DEFAULT

  if (min_pool_connection > max_pool_connection) {
    logger.error(
      `max_pool_connection: ${max_pool_connection} is smaller than min_pool_connection: ${min_pool_connection}. setting min=max`
    )
    min_pool_connection = max_pool_connection
  }

  const uri = config.uri
  return {
    uri,
    models,
    sequelizeConfig: {
      logging: config.logging,
      benchmark: isTrue(config.logging),
      native: config.native,
      ssl: config.ssl,
      models: L.values(models), // or [Player, Team],
      pool: {
        max: max_pool_connection,
        min: min_pool_connection,
        acquire: config.pool?.acquire || POOL_ACQUIRE_DEFAULT,
        idle: config.pool?.idle || POOL_IDLE_DEFAULT,
      },
    },
  }
}

const buildModels = async ({
  logger,
  config,
  modelsRoot,
}: Pick<ModelsOpts, 'logger' | 'config' | 'modelsRoot'>) => {
  const { uri, sequelizeConfig, models } = await createSequelizeConfig({
    logger,
    config,
    modelsRoot,
  })
  const connection = new Sequelize(uri, sequelizeConfig)
  return { models, connection }
}

export { buildModels }
