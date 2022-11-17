# Workflow & Tricks

Some of the workflow, configuration, and tricks baked into a _Hyperstack_ app for reference.

## Coding

For zero-config dev experience and **avoiding Javascript tooling fatigue**, we use [stylomatic](https://github.com/jondot/stylomatic), which is a super-package that curates a bunch of Node.js, Javascript, and Typescript development tools as well as linting rules and best practices.

When you're coding, _stylomatic_ will already be in-play through eslint and `tsc`, so there's nothing special to do.




## In Depth: Typescript Native

For development just run:

```
$ bin/hyperstack start
```

You can edit your code and restart the app as you wish or use `yarn dev` for automatic restarts.

For production, no need to run a `build`. Disable the build script and run this:

```
$ bin/hyperstack start
```

Just like in development.  

A nice benefit for keeping things simple and reducing cognitive load is to run in development just what you run in production.

Because of this, `yarn create hyperstack` will create an app that includes **some dependencies** that helps node run your code with no build, like `ts-node` and `typescript`. Although these are already part of `stylomatic` which is a `devDependency`, we are **including them again** in `dependencies` in case you prune your devdeps in production (_Heroku_ will do that) or while building production-grade containers (`npm prune --production`).

For reference, the extra dependencies that are duplicated from the gut of `stylomatic` (which, remember, is a `devDependency`) are:

```json
"typescript": "4.7.3",
"tsconfig-paths": "^4.0.0", // does import path fixups (e.g. @/app into a real path)
"ts-node": "^10.8.0",
```

## In Depth: Build & Run

Use this strategy **if you believe in running a compiled output in production** (makes sense to do the same in dev, for parity). It makes running the code have **less moving parts, smaller memory footprint, and faster start up times**. As mentioned, most of these benefits don't matter for most small-medium use cases.


**For development** run this in a background window, which will spin up compilation at all times:

```
$ yarn build:watch
```

You can now edit code and it will be built in the background.

For runnin your app, get used to `cd`'ing into `dist/` and work from there, use the `hyperstack.js` script as your entry point:

```
$ cd dist/
$ bin/hyperstack.js start
```

For production, you already have a `build` script set up, so every production workflow will have:

```
$ yarn build
```
And running your app will be just using a `node` process:

```
$ cd dist && node bin/hyperstack.js start
```

For running your code, this has the advantage of requiring just Node.js, start up will be faster and more lightweight. 


Since you're using just Node, another benefit would be to kill the dev dependencies, and any other Typescript related dependencies mentioned earlier (`typescript`, `ts-node`, `tsconfig-paths`) in your `package.json` that's used for production.

## Custom require / alias

We use `@/<path>` to **map directly into the app root**, starting with `src`.
This require some trickery:

* `paths` setting in `tsconfig.json`
* module name resolution in `jest.config.js`
* `-r tsconfig-paths/register` **when starting any binary** with `node`, because if we have any relative require in a _compiled_ module, which can be any of the infra component, it'll not resolve.

## NODE_ENV

`NODE_ENV` is used to signal `development`, `test` or `production` and many node libraries use it. Some components here use it too exclusively to optimize running.


## HST_ENV 

`HST_ENV` is used to signal which environment to load from `config/environments/` which affects various app settings.

**If `HST_ENV` is not given, `NODE_ENV` is used**. So, for example, `NODE_ENV=production` will point to `config/environment/production.ts` as well as indicate `production` to various node libraries for them to optimize for.

Use `HST_ENV` when you want to **map the way of running crossed with settings** of running, and they're different. For example, `staging` is considered `production` but has a few settings that are different:

`HST_ENV=staging NODE_ENV=production bin/hyperstack`

Will load the `environment/staging.ts` file but will optimize all libraries to run with `production` per the node.js convention.


## Logger

Logging infrastructure exists in a few places:


Anywhere you have a `context`:

```ts
logger = context.logger()
```

In `Request` objects:

```ts
req.logger.info(...)
```

In models, workers, mailers use the `Type.logger` static property, or, for example, grab the base class `HyperWorker` and use `HyperWorker.logger`.

## Request ID

You can create a custom request Id and set, via your own middleware:

```ts
req.id = `${req.user.id}/${uuid()}`
```

By default your request logger will log a uuidv4 generated id.

## Tracing and correlating requests

A `req.id` is used to **correlate separate log traces**. Every `req.logger` call is enriched with it, as well as the general error middleware (activated upon exceptions and errors).

`req.id` is set by **the logging middleware**, so if you bring your own you need to populate it early in the request lifecycle.

In addition, **for each request completion** (success or failure), an array of user-identifying fields **are added to the final log line** for better correlation of a request to a user account. We try to fetch common fields from a user: `email, id, username` and more.

Finally, **a `req.id` is sent back to clients** via a `x-request-id` header so that
they can call you up and give you an opaque identifier that you can use and view the internal actions and logs that happened in that request.


## General logger configuration

The logger schema in your environment configuration is as follows:

```ts
    logger: z.object({
      level: z.string(),
      file: z.string(),
      redact: z.array(z.string()),
      middleware: z.any(),
    }),
```

## Service middleware configuration

Use the `logger.middleware` configuration point, and you can add any [express-pino-logger](https://github.com/pinojs/express-pino-logger) configuration there.

## Completely replacing logger

You can opt-in to completely replacing the logger instances with a logger of your own with an initializer.

```ts title="config/initializers/my-logger.ts"
import { createInitializer } from 'hyperstack'

export default createInitializer(async (_context) => ({
  beforeLogger({logger, middleware}){
    // swap logger and middleware and return it
    // return {logger: myLogger, middleware: myMiddleware}

    // or customize existing instance, and return nothing.
    logger.foo = 'bar'
  }
}))
```


# Typescript

When you're using:

```json
"strict": true
```

Need to disable strict property initialization:

```json
"strictPropertyInitialization": false
```

## Typescript and Models


Typescript needs to do some heavy lifting to infer models. This is due to Sequelize legacy, see:

https://github.com/RobinBuschmann/sequelize-typescript/issues/936

If you get missing inference using this:

```ts
class User extends HyperModel<Partial<User>> {
  :
  :
```

Then try this, which offer less strictness but does not impose anything on you:

```ts
class User extends HyperModel<any> {
  :
  :
```


## Typescript target

Use `target: es6`. Otherwise you'll get some compatibility problems from Sequelize.

