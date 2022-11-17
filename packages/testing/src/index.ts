/* eslint-disable @typescript-eslint/no-var-requires */

import type { SuperTest, Test } from 'supertest'
import createDebug from 'debug'
import { Mailer, useControllers, useModels, useWorkers } from 'hyperstack'
import type { App } from 'hyperstack'
import { withRedis } from './with-redis'

import {
  baseMailerSerialize,
  expectRequestWithSnapshot,
  matchDeliveriesWithSnapshot,
  matchRequestWithSnapshot,
  redactAndExpectMatch,
  redactAndExpectMatchInEmails,
} from './matching'

const debug = createDebug('hyperstack:testing')

const TIMEOUT = 60 * 1000
jest.setTimeout(TIMEOUT)

export { expectRequestWithSnapshot }
export type TestKitModelsFn = (app: App) => Promise<void>
export type TestKitModels = (
  desc: string,
  fn: TestKitModelsFn,
  overrides?: any
) => Promise<void>
export type TestKitWorkersFn = (app: App) => Promise<void | any>
export type TestKitWorkers = (
  desc: string,
  fn: TestKitWorkersFn,
  createConfig?: () => Promise<{
    configOverrides: any
    post: () => Promise<void>
  }>
) => Promise<void>
export type TestKitMailers = (
  desc: string,
  fn: TestKitWorkersFn,
  serializer?: (d: any) => any
) => Promise<void>

export interface TestKit {
  models: TestKitModels
  tasks: TestKitModels
  mailers: TestKitMailers
  workers: TestKitWorkers
  requests: (
    desc: string,
    fn: (req: () => SuperTest<Test>, app: App, server: any) => Promise<void>
  ) => Promise<void>
  matchers: {
    // jest-serializes and matches some aspects of http requests
    matchRequestWithSnapshot: typeof matchRequestWithSnapshot

    // jest-serializes and matches some aspects of email delivery
    matchDeliveriesWithSnapshot: typeof matchDeliveriesWithSnapshot
  }
  serializers: {
    // knows how to remove stuff from all aspects of mail serialization
    baseMailerSerialize: typeof baseMailerSerialize

    // can redact but also expect a pattern before redacting
    redactAndExpectMatch: typeof redactAndExpectMatch

    // same thing, but in email serialization
    redactAndExpectMatchInEmails: typeof redactAndExpectMatchInEmails
  }
  containers: {
    withRedis: typeof withRedis
  }
}

export const test = (root: string): TestKit => {
  return {
    // this sets up mailers, clears inbox
    // and snaps emails automatically based on return
    // value from test
    mailers: async (desc, fn, serializer = baseMailerSerialize) => {
      return it(desc, async () => {
        debug('mailers: %o', desc)
        await useWorkers(
          {
            root,
            migrationsMode: 'auto',
            workersMode: 'duplex', // because we want to enqueue in tests
            isTask: true, // because tests don't hang around
          },
          async (app) => {
            Mailer.clearDeliveries()
            const res = await fn(app)
            if (res) {
              // do magic: they gave use a Delivery, let's snap it for them automatically
              expect(serializer(await res.deliver())).toMatchSnapshot()
            }
          }
        )
      })
    },

    // tasks need data and not more, but also ability to produce work,
    // as `useModels` configure workers in 'producer' mode.
    tasks: async (desc, fn) => {
      return it(desc, async () => {
        debug('tasks: %o', desc)
        await useModels(
          {
            root,
            migrationsMode: 'auto',
          },
          async (app) => {
            Mailer.clearDeliveries()
            await fn(app)
          }
        )
      })
    },

    // just add migrations on top here
    models: async (desc, fn) => {
      return it(desc, async () => {
        debug('models: %o', desc)
        await useModels(
          {
            root,
            migrationsMode: 'auto',
          },
          fn
        )
      })
    },

    // this is the most complex set up. the idea is to
    // support full background processing with a live Redis,
    // as well as in-memory.
    // to be able to plug Redis as a middleware-like layer
    // we extend via `createConfig` and teardown like event (post)
    workers: async (desc, fn, createConfig) => {
      jest.setTimeout(TIMEOUT)
      return it(desc, async () => {
        debug('workers: %o', desc)
        let boot = { configOverrides: {}, post: () => {} }
        try {
          if (createConfig) {
            boot = await createConfig()
          }

          debug('workers, boot: %o', boot)
          await useWorkers(
            {
              root,
              migrationsMode: 'auto',
              workersMode: 'duplex',
              isTask: true,
              configOverrides: boot.configOverrides,
            },
            fn
          )
        } finally {
          if (boot.post) {
            await boot.post()
          }
        }
      })
    },

    // after booting, we have a fully set up express app,
    // and we have supertest. why not combine both and give
    // the end user just a `request()` to start with, which
    // boots the app locally with a hidden port etc without
    // them knowing about these details?
    // this is what this infra is doing.
    requests: async (desc, fn) => {
      return it(desc, async () => {
        debug('controllers: %o', desc)
        await useControllers(
          {
            root,
            migrationsMode: 'auto',
            workersMode: 'duplex',
          },
          async (app) => {
            const server = app.context.store().controllers!.app
            const request = require('supertest')

            // because this is a request scope with interaction, do cleanups
            Mailer.clearDeliveries()

            await fn(() => request(server), app, server)
          }
        )
      })
    },
    serializers: {
      baseMailerSerialize,
      redactAndExpectMatch,
      redactAndExpectMatchInEmails,
    },
    matchers: { matchRequestWithSnapshot, matchDeliveriesWithSnapshot },
    containers: { withRedis },
  }
}
