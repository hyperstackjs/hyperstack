export default async () => ({
  logger: {
    level: 'info',
    redact: {
      paths: ['res.headers["content-security-policy"]'],
    },
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
    authCookieName: 'token',
  },
  database: {
    uri: `${process.env.POSTGRES_URL || 'postgres://localhost:5432/tie_test'}`,
    ssl: false,
    native: true,
    dropSchema: false,
    synchronize: true, // this is important for the models
    truncate: true,
    migrate: false, // this is important for e2e testing. there's a migration with no model
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
