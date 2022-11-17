/* eslint-disable @typescript-eslint/no-var-requires */
import { BOOLEAN, DATE, INTEGER, JSON, STRING, TEXT } from 'sequelize'

import L from 'lodash'
import createDebug from 'debug'
import type { ModelsOpts } from './types'
const debug = createDebug('hypermodel:migrate')

const tableBuilder = {
  build: (...args: any) => L.reduce(args, L.merge, {}),
  uniqueConstraint: (name: string, fields: any, opts?: any) => ({
    fields,
    type: 'unique',
    name,
    ...opts,
  }),
  intFK: (name: string, toTable: any, toKey: any, opts?: any) => ({
    [name]: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: toTable,
        key: toKey,
      },
      ...opts,
    },
  }),
  intPK: (name: string, opts?: any) => ({
    [name]: {
      type: INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      ...opts,
    },
  }),
  json: (name: string, opts?: any) => ({
    [name]: {
      type: JSON,
      ...opts,
    },
  }),
  text: (name: string, opts?: any) => ({
    [name]: {
      type: TEXT,
      ...opts,
    },
  }),
  string: (name: string, opts?: any) => ({
    [name]: {
      type: STRING,
      ...opts,
    },
  }),
  nonNullString: (name: string, opts?: any) => ({
    [name]: {
      type: STRING,
      allowNull: false,
      ...opts,
    },
  }),
  uniqueString: (name: string, opts?: any) => ({
    [name]: {
      type: STRING,
      allowNull: false,
      unique: true,
      ...opts,
    },
  }),
  date: (name: string, opts?: any) => ({
    [name]: {
      type: DATE,
      ...opts,
    },
  }),
  nonNullDate: (name: string, opts?: any) => ({
    [name]: {
      type: DATE,
      allowNull: false,
      ...opts,
    },
  }),
  bool: (name: string, opts?: any) => ({
    [name]: {
      type: BOOLEAN,
      ...opts,
    },
  }),
  int: (name: string, opts?: any) => ({
    [name]: {
      type: INTEGER,
      ...opts,
    },
  }),
  nonNullInt: (name: string, opts?: any) => ({
    [name]: {
      type: INTEGER,
      allowNull: false,
      ...opts,
    },
  }),
  timestamps: (opts?: any) => ({
    createdAt: {
      type: DATE,
      allowNull: false,
      ...opts,
    },
    updatedAt: {
      type: DATE,
      allowNull: false,
      ...opts,
    },
  }),
}

// NOTE: 'auto' is the only operational value, the rest are there for future implementation
// commands which are not 'auto' are assumed to be run from CLI, 'auto' is part of
// auto migration, and is always in process when the app is starting
// the opposite of auto is 'pending'. might want to change it to 'invoke' or something

const logTransform = ({
  event,
  name,
  durationSeconds,
}: {
  event?: string
  name?: string
  durationSeconds?: number
  path?: string
}) => {
  if (event === 'migrating') {
    return `===>    up   | ${name}`
  } else if (event === 'migrated') {
    return `             | ${name} (in ${durationSeconds}s)`
  } else if (event === 'reverting') {
    return `===>    down | ${name}`
  } else if (event === 'reverted') {
    return `             | ${name} (in ${durationSeconds}s)`
  } else {
    return `${event}: ${name} (tbd)`
  }
}
const migrate =
  (cmd: 'auto' | 'pending' | 'reset' | 'to', _id?: string) =>
  async ({
    migrationsRoot,
    logger,
    connection,
  }: Pick<ModelsOpts, 'migrationsRoot' | 'logger' | 'connection'>) => {
    const { Umzug, SequelizeStorage } = require('umzug')
    const migrationsPath = migrationsRoot
    debug('migration root is:', migrationsPath)
    const storage = new SequelizeStorage({
      sequelize: connection,
    })

    const umzug = new Umzug({
      storage,
      logger: { ...logger, info: (msg: any) => logger.info(logTransform(msg)) },
      migrations: {
        glob: migrationsPath,
        resolve: ({ name, path, context }: any) => {
          // Adjust the migration from the new signature to the v2 signature, making easier to upgrade to v3
          const migration = require(path!)
          const newContext = {
            ...context,
            query: connection.getQueryInterface(),
            t: tableBuilder,
          }
          return {
            name,
            up: async () => await migration.up(newContext),
            down: async () => await migration.down(newContext),
          }
        },
      },
    })

    const { yellow, bold } = logger.colors
    const pref = bold(yellow('models:'))

    // Checks migrations and run them if they are not already applied. To keep
    // track of the executed migrations, a table (and sequelize model) called SequelizeMeta
    // will be automatically created (if it doesn't exist already) and parsed.
    logger.info(`${pref} === migrations: start ===`)
    await umzug.up()
    logger.info(`${pref} === migrations: done  ===`)
    if (cmd !== 'auto') {
      // we are running this from CLI, other
      // wise keep the connection because it runs inprocess as part
      // of auto migration
      await connection.close()
    }
  }

export { migrate, tableBuilder }
