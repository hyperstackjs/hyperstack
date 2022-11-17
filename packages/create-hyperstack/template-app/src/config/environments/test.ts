/* eslint-disable no-console */
import pkg from '../../../package.json' // eslint-disable-line @typescript-eslint/no-unused-vars

export default async () => ({
  logger: {
    level: 'error',
  },
  controllers: {
    baseUrl: 'http://example.com',
    jwtSecret: 'test-secret',
    cookieSecret: 'shazam',
    forceHttps: true,
    gzip: true,
    indexCatchAll: true,
    serveStatic: true,
    sendValidationErrors: true,
  },
  database: {
    // recommended to use real postgres in your tests.
    // uri: process.env.DATABASE_URL || `postgres://localhost:5432/${pkg.name}_test`,
    uri: 'sqlite://src/config/db/app_test.sqlite',
    ssl: false,
    native: true,
    synchronize: true, // align with same settings as dev. turn off when moving to using migrations
    migrate: false, // when you move to using migrations, turn this on
    dropSchema: false,
    truncate: true, // every test deletes all
    logging: false,
  },
  mailers: {
    send: true,
    delivery: 'test',
    preview: false,
  },
  workers: {
    inprocess: true,
    redis: 'overridden-from-test',
    truncate: true,
  },
})
