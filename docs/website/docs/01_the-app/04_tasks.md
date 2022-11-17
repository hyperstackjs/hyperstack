# Tasks

Tasks are a piece of functionality you create ad-hoc to **manage a certain aspect of your app**.

**Need to fix data, send emails, delete a user or replace a customer order?** create a task for each. Even though it's manual to run, it's a great investment because:

* You **automate a piece of manual work**
* You're **already using stuff you know**: your app's models, libraries and logic
* **No need** for building UIs
* If needed, you can always automate this with a UI, you just **need something that runs jobs and can take parameters** (hint: Jenkins)

Each task will parse the command line arguments into flags in `args`. These are the yargs parsed output of your CLI.

## Running tasks

This will output a list of available tasks:

```
$ bin/hyperstack tasks
```

And this will run one of those

```
$ bin/hyperstack tasks forgot-password --username foo@example.com
```

## Creating a task

Here's an example task:

```ts title="lib/tasks/forgot-password.ts"
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
You fetch everything you need from `appContext`, which, at the point of calling, has been wired with your models, workers, and others for you to work with.


## Testing

As with every other aspect of _Hyperstack_, you have a dedicated test framework for tasks, too.

Set up the data, call the task directly, and snapshot. _Hyperstack_ takes care of everything else, such as database cleaning, tear down, etc.

Here's how to test a forgot password task:

```ts title="test/tasks/forgot-password.spec.ts"
import { test } from '@hyperstackjs/testing'
import ForgotPassword from '../../lib/tasks/forgot-password'
import { appContext } from '../../app'
import { root } from '../../config/settings'
const { tasks } = test(root)

describe('tasks', () => {
  describe('forgot-password', () => {
    tasks('should work', async (app) => {
      const { User } = appContext.models()
      const user = await User.createWithPassword({
        username: 'evh@example.com',
        password: 'mypass-should-login',
        name: 'Eddie Van Halen',
      })
      expect(
        await ForgotPassword.exec({ username: user.username }, app)
      ).toMatchSnapshot()
    })
  })
})
```
