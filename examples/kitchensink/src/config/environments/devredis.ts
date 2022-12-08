export default async () => ({
  logger: {
    level: 'info',
  },
  controllers: {
    cookieSecret: 'shazam',
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
    uri: 'sqlite::memory:',
    ssl: false,
    native: false,
    dropSchema: true,
    synchronize: true, // this is important for the models
    truncate: false,
    migrate: true, // this is important for e2e testing. there's a migration with no model
    logging: false,
  },
  mailers: {
    send: true,
    delivery: 'test',
    preview: false,
  },
  workers: {
    inprocess: false,
    redis: 'redis://localhost:6379',
  },
})
