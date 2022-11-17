# You've got a new app going! :metal:

Use this readme to provide information around how to set up, run, test, and deploy your app.

## Getting  Started


1. Install dependencies:

```
$ yarn
```

2. Run a full-on app:

```
$ yarn dev
```

3. Run tests:

```
$ yarn test
```

It's recommended to use Postgres, for both your development and test environments. If this sounds good to you, add the following dependencies:

```
$ yarn add pg pg-native
```

And uncomment the Postgres `uri` configuration from each environment:

```ts
// recommended to use real postgres in development
// uri: process.env.POSTGRES_URL || `postgres://localhost:5432/${pkg.name}_development`,
uri: 'sqlite://src/config/db/app_development.sqlite'
```

Remember to create a postgres database in the name of your package (`pkg.name`), or with another name you prefer.


## Touring Hyperstack

Let's take a stroll around the main parts of your new app.

### 1. Your environment configuration

Take a look at:

* [ ] Environments: [src/config/environments](src/config/environments)
* [ ] Database: [src/config/db](src/config/db)
* [ ] Test: [jest.config.js](jest.config.js)
* [ ] Dependencies and scripts: [package.json](package.json)

### 2. Your app

Take a look at:

* [ ] Models: [src/app/models](src/app/models/)
* [ ] Controllers: [src/app/controllers](src/app/controllers/)
* [ ] Workers and Tasks: [src/app/models](src/app/models/), [src/app/tasks](src/app/tasks/)
* [ ] Tests: [src/test](src/test/)

Now that you're done, why not run a generator, see what it does?

Generate a model:

```
bin/hyperstack g model Post
```

And a controller:

```
bin/hyperstack g controller posts
```


### 3. Set up your own Postgres and Redis

You start with Hyperstack immediately in development because the development environment is configured to use `sqlite`. You should, after feeling comfortable (or immediately), move to Postgres.


Although `Hypermodel` supports what ever database `sequelize` supports, we think a good all-arounder is just Postgres so we officially just support that. Redis is used for background jobs.

For development, you can use [postgres.app](https://postgresapp.com/) or a postgres [container](https://hub.docker.com/_/postgres), and a local Redis (`brew install redis`) or a Redis [container](https://hub.docker.com/_/redis).

Of course, you can always wrap both your Postgres and Redis in a docker compose, you [can start from this one](docker-compose.yaml.example)

Your direct point of interest should be [config/environments/test.ts](src/config/environments/test.ts) because testing on a real Postgres is better than a toy sqlite db in development.

## Happy hacking!

Your app is ready to run. Go to the Hyperstack [website](https://hyperstackjs.io) for docs and more.
