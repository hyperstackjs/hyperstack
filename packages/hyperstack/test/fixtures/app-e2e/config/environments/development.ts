export default async () => ({
  controllers: {
    cookieSecret: 'shazam',
    forceHttps: true,
    gzip: true,
    indexCatchAll: true,
    serveStatic: true,
    baseUrl: 'http://example.com',
  },
  tasks: {
    // root: '',
  },
  database: {
    uri: 'sqlite::memory:',
    ssl: false,
    native: false,
    dropSchema: true,
    synchronize: true, // this is important for the models
    truncate: true,
    migrate: true, // this is important for e2e testing. there's a migration with no model
  },
  mailers: {
    send: true,
    delivery: 'test',
    preview: false,
  },
  workers: {
    inprocess: false,
    redis: 'overridden-from-test',
  },
})
