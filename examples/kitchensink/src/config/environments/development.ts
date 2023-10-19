/* eslint-disable no-console */
import type { Config } from 'hyperstack'

export default async (): Promise<Config> => ({
  logger: {
    level: 'info',
    middleware: {
      // customProps: (req,res)=>{}
    },
    redact: {
      paths: ['res.headers["content-security-policy"]'],
    },
  },
  controllers: {
    baseUrl: 'http://localhost:5150',
    cookieSecret: 'shazam',
    jwtSecret: 'sekret',
    forceHttps: true,
    gzip: true,
    indexCatchAll: true,
    serveStatic: true,
    bearer: {
      header: 'x-access-token',
      query: 'access_token',
    },
  },
  database: {
    uri: 'postgres://localhost:5432/tie_development',
    // uri: 'sqlite::memory:',
    ssl: false,
    native: false,
    dropSchema: false,
    synchronize: true, // we're syncing schema in dev. but should do migrations for real-life
    truncate: false,
    migrate: false,
    logging: console.log,
  },
  mailers: {
    send: true,
    delivery: 'test',
    preview: true,
  },
  workers: {
    inprocess: true,
    redis: 'overridden-from-test',
  },
})
