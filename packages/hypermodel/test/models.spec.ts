import path from 'path'
import { buildModels, migrate } from '../src/index'
import { converge } from '../src/converge'

const config = {
  uri: 'sqlite::memory:',
  ssl: false,
  native: false,
  dropSchema: true,
  synchronize: false,
  truncate: false,
  migrate: false,
  logging: false,
}
const log = (...args: any[]) => {
  console.log(...args) // eslint-disable-line no-console
}
const logger = {
  error: log,
  info: log,
  warn: log,
  trace: log,
  colors: {
    yellow: () => {},
    bold: () => {},
  },
}

describe('models', () => {
  it('buildModels', async () => {
    const root = path.join(__dirname, 'fixtures', 'sequelize-base')
    const modelsRoot = path.join(root, 'app', 'models/*.ts')
    const { models, connection } = await buildModels({
      logger,
      config,
      modelsRoot,
    } as any)
    expect(models).toMatchSnapshot()
    expect(connection).toBeTruthy()
    await connection.sync({ force: true })

    const { PopBand } = models
    try {
      await PopBand.create({
        frontman: 'slash',
        email: 'not an email',
      })
      fail('should have thrown')
    } catch (e: any) {
      expect(e.toString()).toMatch(/on email failed/)
    }
    const p = await PopBand.create({
      frontman: 'slash',
      email: 'slash@gnr.com',
    })
    const d = p.get()
    expect(d.createdAt).toBeTruthy()
    expect(d.updatedAt).toBeTruthy()

    d.createdAt = new Date(1981)
    d.updatedAt = new Date(1981)
    expect(d).toMatchSnapshot()
    expect(p.toJSON()).toMatchSnapshot()

    const b = PopBand.build({
      frontman: 'bruce',
      email: 'dickens@ironmaiden.com',
    })
    expect(b.toJSON()).toMatchSnapshot()
  })
  it('migrates', async () => {
    const root = path.join(__dirname, 'fixtures', 'sequelize-base')
    const modelsRoot = path.join(root, 'app', 'models/*.ts')
    const migrationsRoot = path.join(root, 'config', 'db', 'migrate', '*.js')
    const { connection } = await buildModels({
      logger,
      config,
      modelsRoot,
    } as any)
    await migrate('auto')({ migrationsRoot, logger, connection } as any)
    await connection.query(
      `
      INSERT INTO Users (pid, username, password, firstName, lastName, createdAt, updatedAt)
       VALUES ('pid', 'jo', 'pas1', 'jo', 'kash', date(), date());
      `
    )
    expect(
      JSON.stringify(
        await connection.query(
          `
      SELECT * from Users
      `
        )
      )
    ).toMatch(/jo.*kash/)

    await connection.close()
  })

  it('can converge', async () => {
    const config = {
      uri: 'sqlite::memory:',
      ssl: false,
      native: false,
      dropSchema: true, // notice
      synchronize: false, // notice
      truncate: false,
      migrate: true, // notice
      logging: false,
    }
    const root = path.join(__dirname, 'fixtures', 'sequelize-base')
    const modelsRoot = path.join(root, 'app', 'models/*.ts')
    const migrationsRoot = path.join(root, 'config', 'db', 'migrate', '*.js')
    const { connection, models } = await buildModels({
      logger,
      config,
      modelsRoot,
    } as any)
    expect(
      JSON.stringify(
        await connection.query(
          `
      SELECT 
      name
  FROM 
      sqlite_schema
  WHERE 
      type ='table' 
      `
        )
      )
    ).toMatch(/\[\[\],{}]/)
    await converge({
      migrationsRoot,
      models,
      config,
      connection,
      logger,
    } as any)

    expect(connection).toBeTruthy()

    expect(
      JSON.stringify(
        await connection.query(
          `
      SELECT 
      name
  FROM 
      sqlite_schema
  WHERE 
      type ='table' 
      `
        )
      )
    ).toMatch(/Users/)
    await connection.close()
  })
})
