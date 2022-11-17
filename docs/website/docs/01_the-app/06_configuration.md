# Configuration

Your environment is codified in `src/config/environments`. In this folder, you can place configuration files, which your app will load according to:

* `NODE_ENV`, or:
* `HST_ENV`

## Pointing to environments

With these two environment variables you can control what kind of settings to load for your app.

For example `NODE_ENV=test` and an empty `HST_ENV` will load `environments/test.ts`, while `NODE_ENV=production` and `HST_ENV=staging` will load `environments/staging.ts`, but the various Node.js components will still benefit from being in a `production` profile.

## Structure

Each environment file is a **plain old Typescript file** and not a JSON/YAML config.

We want you to specify simple configuration values like JSON, in which case you just build a hash with keys and values **but when you need, reach out for power** and build logic for fetching or creating your configuration.

For example, you could build a configuration that pulls certain values such as JWT encryption secrets from a digital vaults in real time when the app loads.

Here's a full development-mode environment. In it, we're using development practices such as previewing emails, resetting database, in-process jobs, and other convenience settings.

**Note that configuration is _provided_ via a function, which is also an async function.**


```ts title="environments/development.ts"
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
    serveStatic: true,
  },
  database: {
    uri: 'postgres://localhost:5432/tie_development',
    ssl: false,
    native: true,
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
```
