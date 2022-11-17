/* eslint-disable @typescript-eslint/no-var-requires */
import L from 'lodash'
import createDebug from 'debug'
import { sleep } from './utils'
import type { TestKitWorkers } from '.'
const debug = createDebug('hyperstack:testing')

// this is made a bit like a middleware, compose on top of the existing
// it's ugly and clunky but that's e2e tests in general.
// some times users will prefer having a live redis already working, as
// oppposed to starting containers, in which case don't use this and
// set up a redis URI in test environment configuration
// test helper:
//
// const workersWithRedis = withRedis(workers, {})
//
export const withRedis =
  (fn: TestKitWorkers, overrides = {}): TestKitWorkers =>
  async (desc, testfn) => {
    debug('withRedis: %o', desc)
    jest.setTimeout(5000)
    return await fn(desc, testfn, async () => {
      // test containers perform side effects on import.
      const { GenericContainer } = require('testcontainers')
      let redisContainer = await new GenericContainer('redis')
        .withExposedPorts(6379)
        .start()

      const configOverrides = {
        workers: {
          inprocess: false,
          redis: `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(
            6379
          )}`,
        },
      }
      const post = async () => {
        // https://github.com/testcontainers/testcontainers-node/issues/346
        const l = await redisContainer.logs()
        l.destroy()
        await sleep(500)
        await redisContainer.stop()
        redisContainer = null
      }
      return { configOverrides: L.merge({}, configOverrides, overrides), post }
    })
  }
