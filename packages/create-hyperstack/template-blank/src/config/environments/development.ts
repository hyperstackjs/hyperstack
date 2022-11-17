/* eslint-disable no-console */

export default async () => ({
  logger: {
    level: 'info',
    middleware: {
      // customProps: (req,res)=>{}
    },
  },
  controllers: {
    baseUrl: 'http://localhost:5150',
    cookieSecret: 'shazam',
    jwtSecret: 'sekret',
    forceHttps: true,
    gzip: true,
    indexCatchAll: true,
    sendValidationErrors: true,
    serveStatic: true,
  },
  database: {
    // you can use sqlite for swift development, but recommended to use a real postgres
    // recommended to use real postgres in development
    // uri: process.env.DATABASE_URL || `postgres://localhost:5432/${pkg.name}_development`,
    uri: 'sqlite://src/config/db/app_development.sqlite',
    ssl: false,
    native: true,
    synchronize: false, // we're syncing schema in dev. but should do migrations for real-life
    migrate: true,
    dropSchema: false,
    truncate: false,
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
