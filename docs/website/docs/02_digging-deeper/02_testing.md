# Testing

Testing in _Hyperstack_ is core to the framework. **Imagine that first the testing experience was sketched out, and then _Hyperstack_ was built around that**. This is way booting a _Hyperstack_ app and tearing it down is very easy, and it has different booting modes for every use case.

For example, to run a full app, _Hyperstack_ boots with all pieces: controllers, models, workers, and more. But, for example, to run a workers test, _Hyperstack_ boots without controllers.


## General concept and idea

Core app testing pillars:

* Unit - **discrete pieces of logic**
* Models - **most logic here**
* Requests - **integration and interaction**

And then supporting pillars:

* Workers
* Mailers
* Tasks

Each of these **can be tested separately** and has its own test framework helper so you can write as little set up / teardown code as possible.


## Models

A few notes here:

* Located in `tests/models/{model-name}.spec.ts`
* **Use snapshots liberally**, and assist with redaction util

```ts
import { PopBand } from '../../app/models/pop-band'
import { test } from 'hyperstack'
import { root } from '../../config/settings'

const { models } = test(root)
describe('models', () => {
  describe('pop-band', () => {
    models('should find', async (_app) => {
      await PopBand.create({
        frontman: 'bill steer',
        email: 'bill@example.com',
      })
      const c = await PopBand.count()
      expect(c).toEqual(1)
    })
    //:
    //:
  })
})
```
And the supporting configuration, annotated:

```js
  database: {
    uri: 'postgres://localhost:5432/tie_test',
    ssl: false,
    native: true,

    synchronize: true, // sync the schema to latest
    truncate: true, // clean up and reset DB pk counting

    dropSchema: false, // no need to drop unless you want to test that
    migrate: false, // no need for migration unless you want to test that
    logging: console.log, // set to 'false' if you don't want to see what the DB is doing during tests.
  },
```

Taken care for you:

* **Booting the app**
* **Setting up the DB** and connections for testing
* Truncate, **sync for DB schema**
* Teardown: **closing connections** and shutting down the app cleanly for next tests.

## Fixtures

Fixtures are plain typescript files, imported normally into test code.
It is recommended to write those in `__fixtures__/index.ts`.

If you want to **split fixtures to separate files**, do that, but have the root `index.ts` re-export as needed so you can just say `from './__fixtures__'` everywhere.

Because of this best practice, **the _actual_ fixture can be data loaded from JSON**, hardcoded entities, a central database, `faker.js` based fixtures, or hand-rolled logic.

Use the following convention:

```ts
async <create><Model><For><UseCase>
```

E.g.

```ts
import { createUsersForRegistration } from './__fixtures__'
```

Also, **have each fixture creator be async**. A fixture is to be used inside a test kit, and so it can assume that all entities and app are initialized.

```ts
models('some test', async () => {
    await createUsersForRegistration() // uses Users.create safely
    // :
    // :
    // test is tearing down all data here automatically.
})
```

## Requests

A few pointers here:

* Located in `tests/requests/{controller-name}/{scenario}.spec.ts`
* These are **integration tests**, playing out various scenarios, and it's OK to stage data in models, and other side effects; or to verify those if needed whilst testing.
* **Use snapshots liberally**, specifically `requestWithSnapshot` which redacts some ever-changing fields like dates, etags and such, creating a stable snapshot between tests.
* You have a **convenience helper** `request` which binds `supertest` to the current app for you. You can perform multiple requests during a given scenario: each `request()` will bind an app again.
* When you **need more power**, `app` is a central access point to the entire app objects which includes context, express app, and logger, and `server` is the currently configured Express app.


An example test:

```ts
import { test } from 'hyperstack'
import { PopBand } from '../../../app/models/pop-band'
import { root } from '../../../config/settings'

const {
  requests,
  matchers: { requestWithSnapshot },
} = test(root)

describe('requests', () => {
  describe('/auth', () => {
    requests('should send reset with email', async (_app, request, _server) => {
      await PopBand.create({
        email: 'bill@example.com',
        frontman: 'bill steer',
      })
      await requestWithSnapshot(
        200,
        request().post('/auth/reset?email=bill@example.com')
      )
    })
  })
})
```

Often **endpoints perform several other tasks other than saving data**, such as sending email. Registration is often done with sending a welcome email for verification. This is still steamlined for your testing experience. See below:


```ts
requests(
  'should register and send welcome email',
  async (request) => {
    const { User } = appContext.models()
    await matchRequestWithSnapshot(
      200,
      request().post('/auth/register').send({
        username: 'evh@example.com',
        password: 'mypass-should-login',
        name: 'Eddie Van Halen',
      }),
      serialize
    )
    const user = await User.findOne({
      where: { username: 'evh@example.com' },
    })

    expect(serializeUser(user)).toMatchSnapshot()

    matchDeliveriesWithSnapshot(1)
  }
)
```

Highlights:

* Emails **are captured inmemory for validation**
* Before each test, inbox is emptied
* `request` is a **fully rigged app request**. You don't need to know or understand which app, which host or port this calls
* `matchDeliveriesWithSnapshot` **covers all your bases** when it comes to email testing: email count and shape for this test, look at your snapshots for the outgoing emails and approve those.
 

## Testing workers

Conceptually there are 3 types of workers:

1. **Just an async caller of a method on a model**. This worker contains no logic at all, just hustles data from the queue, and calls `User.updateStuff(data)`. Because of that, there's nothing really to test here, which is a Good Thing. You can test this worker **as a pure unit**.
2. A **workflow orchestrator of models and data**: for example, generate daily reports and insert into a reports table for a dashboard controller.
3. An **"elbow grease worker"**: grabbing models, getting data, uploading it to S3, downloading some material, parsing it, cleaning up disk, performing Vaccum / maintenance on data store and more. This requires a full on integration test, bringing up containers, staging some things on disk and more.


Notes:

* Located at `tests/workers/{worker-name}/{scenario}.spec.ts` - use `{scenario}` to separate between the various types, where for example type (3) requires some heavy machinery, bringing up containers and such.
* These are **integration tests, playing out various scenarios**, and it's OK to stage data in models, and other side effects; or to verify those if needed whilst testing.
* **Use snapshots liberally**


## Testing workers in-process

This is fastest testing strategy for workers, **because workers perform the job in process**. In addition, **workers can be viewed as just units** if you test with `performNow` instead of `performLater`, and this simplifies or removes completely the need for full integration tests.

Here's an example:

```ts
import { test } from 'hyperstack'
const {
  workers,
} = test(root)
// ...
  describe('calculator', () => {
    workers('should calculate, inprocess', async (_app) => {
      const res = await Calculator.performNow({ number: 30 })
      expect(res).toMatchSnapshot()

      // this is not different, because the 'later' part is immediate
      const res2 = await Calculator.performLater({ number: 30 })
      expect(res2).toMatchSnapshot()
    })
// ...
```

## Testing workers with Redis

The best way to test with Redis is that you'd **have a live instance of it locally**. Most CI systems support that these days. In this mode, you can activate the `truncate` flag which will automatically truncate the current Redis database before each test (as well as truncating the Postgres database).


## Testing workers using 'testcontainers'

This technique inclues all moving parts **as close to real life as possible**, and brings up a full blown Redis containers for each test, and is slower. Use this when you really need to bring up some heavy duty infrastructure around the tests.

Here's an example:

```ts
import { test } from 'hyperstack'
const {
  workers,
  containers: { withRedis },
} = test(root)

// compose on top of the workers helper
const workersWithRedis = withRedis(workers, {})

// ...
  describe('downloader', () => {
    workersWithRedis('should download', async (_app) => {
      const magicNumber = Math.random().toString()
      Downloader.magicNumber = magicNumber
      Downloader.performLater('foobar')
      await sleep(1000)
      expect(await Downloader.backend.connection.get('downloaded')).toEqual(
        magicNumber
      )
    })
// ...
```

Since testing at scale can challenge Docker, it's really better to just have a live Redis instance and not use `testcontainers`. But, if you have some sort of fancy configuration, `testcontainers` might be the only choice for you.
