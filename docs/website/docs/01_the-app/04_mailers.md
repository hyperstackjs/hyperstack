# Mailers

Mailers in _Hyperstack_ takes care of **every aspect of email sending**. 

That means **building emails using templates that are safe for many email clients, sending mutiple formats such as text and HTML, choosing the sending service, and testing emails** -- which is notoriously hard.


## Using mailers

Like workers, you can `import` your mailer class and use it from anywhere. Mailers in _Hyperstack_ **use the same framework as workers**, so when you send them, they'll enqueue:

```ts
// in Rails this is AuthMailer.with(user).send_welcome.deliver_later
await AuthMailer.sendWelcome(user).deliverLater()
```

We `await` just **the scheduling of the email sending**, which takes just the time it takes to place a value in Redis.

In `in-process` mode, this `await` will wait right there until the actual job finishes. 

You can always use `await AuthMailer.sendWelcome(user).deliverNow()` to perform the sending right then and there.

## Building mailers

A mailer **is a Typescript _class_** and a folder that contains templates. Every mailer looks like this:

```
  ,---- you can pick your folder name
auth/
  welcome/    <---- always contains the following file names:
    html.ejs
    subject.ejs
    text.ejs 
auth.ts       <---- will use `auth/welcome` as the template name.
```


And a mailer looks like this:

```ts title="mailers/auth.ts"
import { Mailer } from 'hyperstack'
import type { User } from '../models/user'

class AuthMailer extends Mailer {
  static defaults = {
    from: `Elle Postage <no-reply@elle-postage.example.com>`,
  }
  static sendWelcome(user: Partial<User>) {
    return this.mail({
      template: 'auth/welcome',
      message: {
        to: user.username,
      },
      locals: {
        verifyToken: user.emailVerificationToken,
        name: user.name,
      },
    })
  }
}

export { AuthMailer }
```

While a template, is an `EJS` template, and looks like this:

```ts title="auth/welcome/html.ejs"
<html>
<body>
  You can <a href="https://example.com/verify?verifyToken=<%= verifyToken %>">verify your account</a>
</body>
</html>
```

Lastly, export your mailer in the `index.ts` file:


```ts title="mailers/index.ts"
export { AuthMailer } from './auth'
```

## Configuration

In addition to the standard worker configuration, which determines how to enqueue jobs (in this case email sending jobs), **you have a few more options for mailers** specifically:

```ts
mailers: {
  send: true,
  delivery: 'test',
  preview: true,
  /*
  smtpSettings: {
    host: 'localhost',
    port: 1025,
  },
  */
},
```

Combining these you can create various run modes:

* **For production**: `send: true`, `delivery: 'smtp'`, `preview: false` and populate the `smtpSettings` section.
* **For development**: if you use _MailHog_, then same settings as production, just point to `localhost`. Otherwise, `send: true`, `preview: true` will open up the sent email in your browser for review.
* **For test**: same as development, just `preview: false`.



## Testing

Testing mailer has a special construct in _Hyperstack_. Sending emails **goes to an in-memory** mailbox, which you can later assert on.

You set up data, `deliver()` (which delivers immediately), and follow up assertions and snapshotting on `deliveries()`, which contains all of the deliveries for the test run up to now.


There's an even shorter way to test, which is just to return a delivery to the testing framework (here: we're returning it with `sendWelcome(...)`).


```ts title="test/mailers/auth.spec.ts"
import { test } from '@hyperstackjs/testing'
import { AuthMailer } from '../../app/mailers'
import { root } from '../../config/settings'
import { appContext } from '../../app'

const {
  mailers,
  serializers: { baseMailerSerialize },
} = test(root)
describe('mailers', () => {
  describe('welcome', () => {

    // a 'returns delivery' mailer test
    mailers('should send welcome', async () =>
      AuthMailer.sendWelcome({
        username: 'joe@example.com',
        name: 'joe',
      })
    )

    // a more elaborate mailer test
    mailers('should send welcome: manual', async () => {
      // can also grab a mailer from app context
      const { AuthMailer } = appContext.mailers()
      AuthMailer.clearDeliveries()
      await AuthMailer.sendWelcome({
        username: 'joe@example.com',
        name: 'joe',
      }).deliver()
      expect(AuthMailer.deliveries().map(baseMailerSerialize)).toMatchSnapshot()
    })
  })
})
```
