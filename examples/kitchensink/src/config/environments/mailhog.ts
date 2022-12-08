export default async () => ({
  logger: {
    level: 'info',
  },
  controllers: {
    jwtSecret: 'sekret',
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
    uri: 'postgres://localhost:5432/tie_test',
    ssl: false,
    native: true,
    dropSchema: true,
    synchronize: true, // this is important for the models
    truncate: true,
    migrate: false, // this is important for e2e testing. there's a migration with no model
    logging: false, // eslint-disable-line no-console
  },
  mailers: {
    send: true,
    delivery: 'smtp', // send to mailhog
    preview: true, // but also local dev preview
    smtpSettings: {
      host: 'localhost',
      port: 1025,
    },
  },
  workers: {
    inprocess: false,
    redis: 'redis://localhost:6379',
    backendOpts: {
      workerOpts: {
        lockDuration: 60000,
      },
    },
  },
})
