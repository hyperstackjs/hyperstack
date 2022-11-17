# Deploying

We will use _Heroku_ for this walkthrough (which we have no affiliation with). It's a great platform for the solo entrepreneur, developer, or lean team trying to get stuff done. 

_Heroku_ is GitOps since before GitOps was a thing, which is smooth sailing because you need to learn nothing new other than working with Git.

Go ahead and create your _Heroku_ app following [their Node.js tutorial](https://devcenter.heroku.com/articles/getting-started-with-nodejs). You don't have to actually do the tutorial, just follow the parts until you get to setting up the CLI and created a _Heroku_ app (for free). 

By the way, if you like to kick the tires and have the time, it wouldn't hurt to go ahead and do the complete tutorial to see how to deploy a Node.js app there generically.

## Docker

When you create a new app you get two Docker build files for free:

* `Dockerfile` - an optimized build, compiling the project and running Javascript in production
* `Dockerfile.dev` - this image stays within Typescript. It will install all dependencies and run Typescript in production


Build your docker image:

```
$ docker build -t my-hyperstack-app .
```

You can use this in combination with the sample `docker-compose.yaml.example` file that's included, to wire in your database and state.

 
## Fly.io

After you created your _Hyperstack_ app, you can use `flyctl` to build and deploy. `flyctl` will pick up a **Docker build** rather than a Node.js build (this is a good thing).

If you're working with the free Fly.io tier, Go for the `Dockerfile` version (not the `Dockerfile.dev` version) so we will build and run Javascript in production which requires less RAM and will fit.

Set up you app, but don't deploy yet.

```bash
$ flyctl launch
```

Now, deploy with:

```
$ flyctl deploy
```

You should see the build process kicking off:

```bash
 :
 :
 => extracting sha256:55371e6747e8e4327c7a293b77a6b46632f2249d0c89c79f830c4f565c53880  1.3s
 => => extracting sha256:694d6b1b2d1b452b735d925ef7912fe264d4f03c7ef77effed89d76a086dafd  0.1s
 => => extracting sha256:71f41f5ff77d8eca2e4800eb9001495106991811e45a005c4e59d967d6f4033  0.0s
 => [base 2/2] RUN npm i -g pnpm                                                          3.6s
 => [dependencies 1/3] WORKDIR /app                                                       0.0s
 => [build 2/5] COPY . .                                                                  0.0s
 => [dependencies 2/3] COPY package.json pnpm-lock.yaml ./                                0.0s
 => [dependencies 3/3] RUN pnpm install                                                  22.9s
 => [build 3/5] COPY --from=dependencies /app/node_modules ./node_modules                 5.1s
 => [build 4/5] RUN pnpm build                                                            5.5s
 => [build 5/5] RUN pnpm prune --prod                                                     4.4s
 => [deploy 2/4] COPY --from=build /app/dist ./dist                                       0.0s
 => [deploy 3/4] COPY --from=build /app/node_modules ./node_modules                       2.4s
 => [deploy 4/4] WORKDIR /app/dist                                                        0.0s
 => exporting to image
 :
 :
 
 ==> Creating release
--> release v4 created

--> You can detach the terminal anytime without stopping the deployment
==> Monitoring deployment

 1 desired, 1 placed, 1 healthy, 0 unhealthy [health checks: 1 total, 1 passing]
--> v4 deployed successfully
```


After finishing, it should look like this:

```
$ flyctl apps list
NAME                         	OWNER   	STATUS   	PLATFORM	LATEST DEPLOY
billowing-bird-xxxx          	personal	running  	nomad   	20h39m ago
fly-builder-black-sunset-xxxx	personal	running 	machines
frosty-frog-xxxx-db           	personal	deployed 	machines
```

**Your app should be live now!**

You can use `ssh` to operate your app. **First wire up against the machine**:

```
$ flyctl ssh issue --agent
```

And connect

```
$ flyctl ssh console
```

See what's there
```
Connecting to fdaa:0:xxxx:a7b:abc:xxxx:xxxx:2... complete
/ # cd app/
/app # ls
dist          node_modules
```

And you can run `hyperstack` **on the machine itself**:

```
$ cd /app/dist
$ bin/hyperstack
hyperstack.ts <command>

Commands:
  hyperstack.ts migrate   migrate a database                        [aliases: m]
  hyperstack.ts generate  generate code                             [aliases: g]
  hyperstack.ts seed      seed a database                           [aliases: d]
  hyperstack.ts routes    display app routes                        [aliases: r]
  hyperstack.ts start     start a server, worker or both (default both)
                                                                    [aliases: s]
  hyperstack.ts portal    open a portal to your app as a REPL       [aliases: p]
  hyperstack.ts tasks     run a task                                [aliases: t]

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]

```

### Preparing for production

What you just did is to deploy _Hyperstack_ **in its development configuration**. It worked out of the box even if you did not have a Postgres database because it uses a local sqlite3 database.

We can move the app towards a _production_ set up and wire a Postgres database into it.

As always, have a quick review of your `src/config/environments` folder, where your various configurations sit.

* `development.ts` - your development configration optimized for DX, and uses a local sqlite database
* `production.ts` - your production configuration which wires in a Postgres database and sets default configuration suitable for a production scenario (such as not automatically running any kind of database migration)


To make a quick point, go over your `src/config/environments/production.ts` and set it to this:

```ts
const getPostresURI = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }
  throw new Error(
    'please set your production Postgres connection in environments/production.ts'
  )
}

export default async () => ({
  logger: {
    level: 'info',
  },
  controllers: {
    baseUrl: 'http://example.com',
    jwtSecret: 'foobar',
    cookieSecret: 'foobaz',
    forceHttps: true,
    gzip: true,
    indexCatchAll: true,
    serveStatic: true,
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
    send: false,
  },
  workers: {
    inprocess: true, // we want to go out to the real redis instance. if you're low budget, set to true and remove redis connection.
    redis: '',
  },
})
```

And install Postgres support:


```
$ pnpm add pg pg-native
```

You can now deploy again using `flyctl deploy`. After deployment finishes, you'll have to run migrations:

```
$ flyctl ssh console
Logging in...
# bin/hyperstack migrate
{"level":30,"time":1668282093504,"pid":544,"hostname":"93123b53","msg":"models: === migrations: start ==="}
:
:
# 
```

**You're done!**. Your app should now serve requests and save data to Postgres:

```bash
$ xh -j -b https://dry-butterfly-xxxx.fly.dev/articles title="hello hyperstack" body="EVH rocks"
{
    "article": {
        "id": 1,
        "title": "hello hyperstack",
        "body": "EVH rocks"
    }
}
```

## Heroku

After you've created your _Hyperstack_ app, it should have a `Procfile` which contains:

```
web: bin/hyperstack start --server
worker: bin/hyperstack start --worker
```

Now, go to your _Heroku_ dashboard, to [the 'Elements' marketplace](https://elements.heroku.com/), and add the _Postgres_, and _Redis_ addons (choose free). We also recommend to set up _Mailgun_ for emails; add it through the same interface as well.

To make sure test emails will get to your inbox, you need **to let mailgun know** which mailboxes it is allowed to deliver to -- [read here how to do that](https://help.mailgun.com/hc/en-us/articles/217531258-Authorized-Recipients).

If you haven't moved your app to postgres, do that now:

```
$ pnpm add pg pg-native
```

And commit all changes. In production, _Postgres_ is the default so no need to re-configure anything.


## Deploy!

This is how _Heroku_ will know what to run for you. Assuming your app is in a Git repo, and everything is committed, and you have `heroku` as the origin, this will deploy your app:

```
$ git push heroku main
```

You'll now see _Heroku_'s own output as it deploys your app. When it's finished **you'll have a unique URL for your app to play with**. Your app is now ready to:

* **Use _Postgres_** as its main database
* **Use _Redis_** as a queue for background jobs (real background jobs that can scale)
* **Send emails** such as registration and reset password emails

## Database Operations

By default **your database is configured to sync its structure based on your models**. In production, **you should use explicit migrations** to bring your database structure up to date, [read more here](./02_development.md).

### Migrations

To run migrations in _Heroku_ you use `heroku run`:

```
$ heroku run bin/hyperstack migrate
```

This will spin up a custom _Heroku_ dyno, which **will run this over your code that already exists there**. It will bring your database up to date.

### Looking at Data

You can actually "connect to production" using _Portal_:

```
$ heroku run bin/hyperstack portal
```

With a fast enough internet connection, **this will feel like you're running stuff on your own machine**. It works with colors and everything, but remember: it runs on the remote Heroku dyno.

Now you can query your production data. Try `await User.findOne()`.


## View Logs


To view logs, the simplest way is to run:

```
$ heroku logs -t
```

Which will also tail it for you in real-time. In addition, you can add a log indexing service addon from the Elements marketplace (for example, _Coralogix_ has a seamless integration and a free tier -- again, no affiliation).

When you add a log indexing service in _Heroku_ you need to do nothing more. It integrates with _Heroku_'s Logplex, and after a few minutes your logs are there!.




 

