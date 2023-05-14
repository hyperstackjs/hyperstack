# Development

## Choose Your Workflow

By now, you've managed to create your first app, run it, and kick the tires. 


The app you've generated **is configured to be as automatic as possible** out of the box, however, for production use cases and working with teams - you some times want more control, and less magic.


For this reason, it makes sense to choose your workflow now. It's down to two major decisions:

1. **How to run your app** - coding, running the app from source
2. How you want to configure and **work with your database** - which database system, and how to update DB structure


Out of the box, your app runs with `sqlite`, and **is synchronizing the database structure automatically** from your Model definitions.



## Running Your App

There are two modes in which you can run your _Hyperstack_ app in development or production.


### Typescript-first

In this workflow you're editing Typescript and your process runs typescript.

```bash
$ bin/hyperstack start
```


### Javascript-first

In this mode you're editing Typescript, which kicks off a series of watcher processes, because you're running Javascript.

1. `pnpm build:watch` - a watching build process for when you edit code
2. `pnpm build:dev` - a convenient `hyperstack start` runner which restarts when new code was built, using `node-dev`. It runs the compiled javascript bundle

These work off your `dist/` folder.


### Which to choose?

Running compiled Javascript in production will create a tighter footprint. If you care about that, use the **Javascript-first** workflow when you code.

Otherwise, running Typescript in production (this happens via `ts-node`) means that on startup your code transpiles on the fly and then runs. Use the **Typescript-first** workflow, where you can always build and deploy as Javascript or Typescript.



## Database Configuration

By default your app is using `sqlite` and automatic database structure sync inferred from your models. This set up is cool, fast, and sophisticated because it's automatic and has zero friction.

To prepare for real-life production use cases, we recommended to move to `postgres` and explicit migrations when you can.

### Moving to Postgres

Though sqlite is nicer for your development experience and speed, we recommend moving to from `sqlite` to `postgres`, for all environments (development, test, production). This means:


```
$ yarn add pg pg-native
```

You can create a database for development and test with [Postgres.app](https://postgres.app/) or a similar alternative. For production, the database will be what ever is provisioned by your production vendor.

In each of the `environments/` configuration file, **you have a comment waiting for you for configuring Postgres**.



### Moving From Sync to Migrations

**Why use migrations?**  If you're just sketching out a solo project or MVP, it's OK to use `synchronize` to move faster and iterate. Otherwise, always use `migrations`, as they're safer because they are more explicit about database changes, and offer more power.

To use migrations, move your app configuration from this:

```ts
synchronize: true,
migrate: false,
```

To this in dev and test, which will pick up your migrations and **run them automatically every time the app starts**:

```ts
synchronize: false,
migrate: true,   // use 'true' for dev and test, for automatically applying migrations
```

And to this in production:


```ts
// both false. migration in production is explicit and not automatic!
synchronize: false,
migrate: false,
```

Running migrations in production **is not automatic**. To migrate in production, you need to run this (in production):

```
$ bin/hyperstack migrate
```
