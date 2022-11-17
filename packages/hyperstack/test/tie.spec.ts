import path from 'path'
import { createApp, shutDown, useApp, useModels, useWorkers } from '../src'
jest.setTimeout(60000)

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
describe('tie', () => {
  it('createApp', async () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const { context, app } = await createApp({
      root: path.join(__dirname, 'fixtures', 'app-e2e'),
      configOverrides: {
        workers: {
          redis: redisUrl,
        },
      },
    })
    expect(app).toBeTruthy()
    const store = context.store()
    expect(store.models?.connection).toBeTruthy()
    expect(store.models?.connection.query('SELECT 1')).toBeTruthy()
    expect(store.models?.models.PopBand).toBeTruthy()
    expect(store.models?.connection.query('SELECT * from Users')).toBeTruthy()
    expect(store.workers?.background).toEqual('queue') // opp: inprocess
    expect(store.workers?.connection).toBeTruthy()
    expect(store.workers?.backend).toBeTruthy()
    expect(store.workers?.mailerTemplatesRoot).toMatch(/app[\/\\]mailers/)
    expect(store.workers?.mode).toEqual('duplex') // opp: duplex | consumer | producer
    expect(context.baseUrl()).toEqual('http://example.com')
    await shutDown(context)

    await expect(
      store.models?.connection.query('SELECT * from Users')
    ).rejects.toThrow(/closed/)

    process.env.NODE_ENV = prev
  })

  it('useWorkers', async () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const act = jest.fn()

    const { context } = await useWorkers(
      {
        root: path.join(__dirname, 'fixtures', 'app-e2e'),
        configOverrides: {
          workers: {
            redis: redisUrl,
          },
        },
      },
      ({ context }) => {
        const store = context.store()
        expect(store.workers?.background).toEqual('queue')
        expect(store.workers?.backend).toBeTruthy()
        expect(store.workers?.didTieWorkers).toBeTruthy()
        expect(store.models?.didTieModels).toBeTruthy()
        expect(store.models?.didTieMigrations).toBeFalsy()
        expect(store.controllers?.didTieControllers).toBeFalsy()
        act()
      }
    )

    expect(act).toBeCalledTimes(1)

    await shutDown(context)
    process.env.NODE_ENV = prev
  })

  it('useModels', async () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const act = jest.fn()

    const { context } = await useModels(
      {
        root: path.join(__dirname, 'fixtures', 'app-e2e'),
        configOverrides: {
          workers: {
            redis: redisUrl,
          },
        },
      },
      ({ context }) => {
        const store = context.store()
        expect(store.workers?.mode).toEqual('producer')
        expect(store.workers?.backend).toBeTruthy()
        expect(store.workers?.didTieWorkers).toBeTruthy()
        expect(store.models?.didTieModels).toBeTruthy()
        expect(store.models?.didTieMigrations).toBeFalsy()
        expect(store.controllers?.didTieControllers).toBeFalsy()
        act()
      }
    )

    expect(act).toBeCalledTimes(1)
    const store = context.store()
    await expect(
      store.models?.connection.query('SELECT * from Users')
    ).rejects.toThrow(/closed/)

    process.env.NODE_ENV = prev
  })
  it('useApp', async () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const act = jest.fn()

    const { context } = await useApp(
      {
        root: path.join(__dirname, 'fixtures', 'app-e2e'),
        configOverrides: {
          workers: {
            redis: redisUrl,
          },
        },
      },
      ({ context }) => {
        const store = context.store()
        expect(store.workers?.mode).toBeFalsy()
        expect(store.workers?.backend).toBeFalsy()
        expect(store.workers?.didTieWorkers).toBeFalsy()
        expect(store.models?.didTieModels).toBeTruthy()
        expect(store.models?.didTieMigrations).toBeFalsy()
        expect(store.controllers?.didTieControllers).toBeFalsy()
        act()
      }
    )

    expect(act).toBeCalledTimes(1)
    const store = context.store()
    await expect(
      store.models?.connection.query('SELECT * from Users')
    ).rejects.toThrow(/closed/)

    process.env.NODE_ENV = prev
  })
})
