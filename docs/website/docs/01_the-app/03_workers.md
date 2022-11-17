# Workers

_Hyperstack_ workers are modeled after Rails workers. It means you get a **great developer experience by default**, and if you reach out for power, we can do that too.

_Hyperworker_, the _Hyperstack_ framework for background jobs, is backed by `bullmq`, which is a Redis based queue abstraction for Node.js.

It has two modes:

* **in-process**: where all jobs are queued in the same Node process. You can use that to effectively use Node.js as a poor-man's queue system. **It's OK for small-scale use cases** and for starting out without dependencies. In _Hyperstack_ we use this mode always for testing workers.
* **standard**: all jobs are queued in a dedicated Redis instance, and **executed by a stand-alone Node process** (as many as you want). This is scalable and reliable, and doesn't need more than a small Redis instance that costs just a few bucks.
 


## Using workers

You can `import` your worker class and use it from anywhere. This will enqueue a job:

```ts
// in Rails this is calculator.perform_later(..)
await Calculator.performLater({number: 42})
```

We `await` just **the scheduling of the job**, which takes just the time it takes to place a value in Redis.

In `in-process` mode, this `await` will wait right there until the actual job finishes. 

You can always use `await Calculator.performNow(..)` to perform the job right then and there.

```ts
import { HyperWorker, queueAs } from 'hyperstack'

@queueAs('calculator') // creates a dedicated queue on Redis named 'calculator'
class Calculator extends HyperWorker {
  async perform({ number }: { number: number }) {
    return Promise.resolve({ number: number * 4 })
  }
}

export { Calculator }
```

## Checking jobs

You can check the current status of all jobs though the CLI using the `--stats` flag:


```
$ bin/hyperstack start --worker --stats
name        queue       active  completed  delayed  failed  paused  waiting  waiting-children
---------------------------------------------------------------------------------------------
Calculator  calculator  0       0          0        0       0       0        0
Downloader  downloads   0       0          0        5       0       0        0
```

Or with the interactive [_portal_](../02_digging-deeper/03_portal.md) with the `.jobs` command.


## Configuration

There are **two main configuration points** to note. `inprocess` which decides if you want to use Redis or not (set to `true` if you don't want Redis).

And, a Redis URL (`redis://..`) for the framework to point to.


```ts
workers: {
  inprocess: true,
  redis: '<some url>',
  truncate: true, // use this only for testing
},
```

You can use `truncate: true` for your tests. It means that before each test, **the entire Redis contents is deleted**, so your tests don't contaminate each other's environment.


## Testing

We also include a **dedicated test framework for workers**. You just say what you want to test and we boot up the app, and take care of the rest:

```ts
const {
  workers,
} = test(root)

describe('workers', () => {
  describe('Downloader', () => {
    workers('should calculate, inprocess', async (_app) => {
      const res = await Calculator.performNow({ number: 30 })
      expect(res).toMatchSnapshot()

      const res2 = await Calculator.performLater({ number: 30 })
      expect(res2).toMatchSnapshot()
    })
  })
})
```
