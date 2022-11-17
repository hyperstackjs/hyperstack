/* eslint-disable no-console */

const getJWTSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET
  }
  throw new Error(
    'please set your production JWT secret in environments/production.ts'
  )
}

const getCookieSecret = () => {
  if (process.env.COOKIE_SECRET) {
    return process.env.COOKIE_SECRET
  }
  throw new Error(
    'please set your production cookies secret in environments/production.ts'
  )
}

const getPostresURI = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }
  throw new Error(
    'please set your production Postgres connection in environments/production.ts'
  )
}
const getRedisURI = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL
  }
  throw new Error(
    'please set your Redis connection in environments/production.ts'
  )
}

const getSMTPSettings = () => {
  if (process.env.MAILGUN_SMTP_PASSWORD) {
    // this uses Mailgun, but you can replace with anything else.
    return {
      host: process.env.MAILGUN_SMTP_SERVER,
      port: process.env.MAILGUN_SMTP_PORT,
      auth: {
        type: 'login',
        user: process.env.MAILGUN_SMTP_LOGIN,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
    }
  }
  throw new Error('please set your SMTP settings in environments/production.ts')
}

export default async () => ({
  logger: {
    level: 'info',
  },
  controllers: {
    baseUrl: 'http://example.com',
    jwtSecret: getJWTSecret(),
    cookieSecret: getCookieSecret(),
    forceHttps: true,
    gzip: true,
    indexCatchAll: true,
    serveStatic: true,

    // in production we're being paranoid by default. We don't give out hints to anyone. turn on if you think otherwise.
    sendValidationErrors: false,
  },
  database: {
    // recommended to use real postgres in your tests.
    uri: getPostresURI(),
    ssl: true,
    native: true,
    synchronize: false, // for a real-world project, turn this off
    migrate: false, // off in production, you call migrations explicitely
    dropSchema: false, // obviously don't drop our schema
    truncate: false, // never truncate
    logging: false,
  },
  mailers: {
    send: true,
    delivery: 'smtp',
    preview: false,
    smtpSettings: getSMTPSettings(),
  },
  workers: {
    inprocess: false, // we want to go out to the real redis instance. if you're low budget, set to true and remove redis connection.
    redis: getRedisURI(),
    truncate: false, // never truncate
  },
})
