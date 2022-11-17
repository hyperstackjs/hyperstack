# Touring Hyperstack

Like Rails, all Hyperstack apps look the same; largely due to an opinionated, chef's-menu design. Let's take a stroll around the main parts of every _Hyperstack_ app and see that design.

## Your environment configuration

```
config/
  db/
  environments/
  initializers/
```
### Environments: config/environments

_Hyperstack_ codifies environments into Typescript files that look like configuration, but if you need - can do more. Often some pieces of configuration need to be fetched dynamically, which is why it is an async _function_ returning a plain Javascript object. An environment is loaded from a `NODE_ENV` or `HST_ENV` environment variables.

You also have _initializers_ which is how extensibility is done in _Hyperstack_, we'll get to that later.

### Database: config/db

This place stores your migrations and seeds. Things that belong exclusively to your database layer.


## Your app
```
app/
  models/
  controllers/
  workers/
  mailers/
lib/
  tasks/
test/
```
**This is _very_ similar to Rails**. Each folder contains entities, and an `index.ts` file. Although early versions of _Hyperstack_ auto-loaded these, we've come to conclusion that explicit is better than implicit so you have to explicitly `import` every file you add. 

This give you the ability to control how to load files, order of loading, and more.


### Test first development

**A special note for testing**. In Rails, you had to assemble an array of libraries to set up your database, clean stuff out, and more. With _Hyperstack_ all these best practices **are built-in** and every test is super clean.

We also advocate the use of **snapshot testing for the backend**. This makes your tests even cleaner and easy to maintain.

## Your tools

```
src/
jest.config.js
.eslintrc.js
package.json
```
### Test, linting & jest.config.js

Testing configuration. Powered by Jest and [Stylomatic](https://github.com/jondot/stylomatic). Stylomatic is a one-stop-shop configuration for all _Hyperstack_ projects that deal with styling, linting, and dev tooling configuration.

### Dependencies: package.json

Great to check what's in there. Basically some _Hyperstack_ deps and a few dev oriented libs.

## Your run scripts

You can use `bin/hyperstack` to drive your day-to-day workflow.

### Generators

Now that you're done reviewing the app structure, why not run a generator, see what it does?

Generate a model:

```
$ bin/hyperstack g model Tweet title:string
```

And a controller (always singular `tweet`, we'll pluralize where needed):

```
$ bin/hyperstack g controller tweet
```

Or a full CRUD scaffold:

```
bin/hyperstack g scaffold todo title:string content:text
```

It's fun to use these as starting points and work on your own stuff from there.

### Portal

Run a _portal_ to get an access to a running app:

```
$bin/hyperstack portal
```


### Tasks

You don't have to have a full on admin. Just codify your errand **as a task**, and run it from your terminal.

```ts
//lib/tasks/forgot-password.ts
import { task } from 'hyperstack'
import { appContext } from '../../app'
import { AuthMailer } from '../../app/mailers/auth'

export default task('send a reset password email.', async (args) => {
  const { User } = appContext.models()
  const { username } = args
  const user = await User.findOne({ where: { username } })
  if (!user) {
    throw new Error('no such user')
  }
  await AuthMailer.forgotPassword(user).deliverLater()
  return { ok: true }
})
```

List your available tasks:

```
$ bin/hyperstack tasks

Tasks

export-notes: export notes.
forgot-password: send a reset password email.
```

And run them:

```
$ bin/hyperstack tasks forgot-password --username foobar@example.com
```

### Database productivity

You can manage your database from your terminal.

#### Seeding

Use `config/db/seed.ts` to write scripts that **inserts seed data into your database**. Usually stuff you always want in development, like a fake user or some ad-hoc data.

Then:

```
$ bin/hyperstack seed
```

Will take care of inserting.

### Migrations

_Hyperstack_ uses a **migration framework to bring a database up** to date and perform only the necessary DDL needed for it.

You write migrations in `config/db/migrate` much like in Rails or many other frameworks that adopted the same idea from Rails. The files are simple javascript files and **uses our `Builder` interface to ease up on typing**.

Then:

```
$ bin/hyperstack migrate
```

Sets up the database. You can also control if you want these kind of migrations (safe and better for production), or prefer and automatic sync (more of a dev thing, saves writing migrations) of entities via configuration.

## Accessing your app from code

### 'app' argument

In some cases where you're building infrastructure or using infra and you're filling up a function (seed, tests, etc.), **we give you an `app` object which contains**:

```ts
{
  app, // express app
  logger,
  context
}
```

This is strictly for convenience, so you could just "grab and go", for example:

```ts
task('my task', async(args, {logger} /* this is an app object*/)=>{
  logger.info('foobar')
})
```
But, you can also do this (see `appContext` below)

```ts
import {appContext} from ...
task('my task', async(args)=>{
  const logger = appContext.logger()
})
```
## Using 'appContext'

The recommended way to **type dynamically loaded assets** such as controllers, models, and workers, is to build one `appContext` that you will get these from.

You get an `appContext` for free when you use the app generator (`yarn create hyperstack`).


### Why context?
The reason for using context, is that the app has a certain loading order and some loading order dependency. For example some controllers may rely on initializers providing them props, and these controllers might use these props in compile time. 


For this to work - the app has to have been booted and initializers would have to have done their job already -- before loading any controller.

If you `import { SomeController } from './<some-controller>'` you will be reaching out for a controller ignoring all of the booting order of the app.

This is why `context.models()` or `context.controllers()` is how you need to get your app types.

### Where is your 'appContext'? 

To support static typing of dynamically loading material, we had to create an explicit mapping. This is very similar to how `Redux` has its own `AppDispatch` for example.

```
app/
  controllers/
  mailers/
  models/
  ../
  index.ts <-- have your `appContext` here

```


And a usage example:

```ts
const { User } = appContext.models()
```

## Hurray!

This rounds up your tour around a _Hyperstack_ app. Now let's understand a bit more about your dependencies: `sqlite`, `Redis` and `Postgres`.
