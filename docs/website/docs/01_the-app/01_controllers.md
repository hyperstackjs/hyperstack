# Controllers

Controllers are typescript _classes_, with decorators to handle specific metadata such as routing, HTTP methods, and validation.




For every app, there is a main `AppController` which simply holds a `controllers` array.

We only require that you should have a named export `AppController` from an `index.ts` file.

A recommended controllers folder layout is:

```
src/
  controllers/
    index.ts    <-- AppController is here
    auth.ts  <-- Auth 
    posts.ts  <-- Posts
```

There is no need to suffix `Controller` to every class, unless you feel it is more aesthetical (other than `AppController` which every `controllers` folder should have) or `-controller` for every file name.

## A controller walkthrough

We want to create an **ergonomic balance**: have enough magic but not too much that we overload with abstractions cognitive load, and have plenty of escape hatches for when you reach for power, because we can't ignore the system we're running on.


This is why you specify a route with a `@Post` but have access to plain old Express `Request`, and then still -- have helpers such as `ok` and `unauthorized` to save you some typing.


```ts
const requireLoginParams = requires(
  z.object({
    username: z.string().min(3).email(),
    password: z.string().min(5),
  })
)

const requireRegisterParams = requires(
  requireLoginParams.extend({
    name: z.string().min(2),
  })
)

@Controller('auth')
export default class Auth {
  @Post('login')
  async login(req: Request) {
    const { username, password } = requireLoginParams(req.body)
    const user = await User.findOne({ where: { username } })
    if (!user) {
      throw unauthorized('incorrect username or password')
    }
    if (!(await user.verifyPassword(password))) {
      throw unauthorized('incorrect username or password')
    }

    return ok({ token: user.createAuthenticationToken() })
  }

```

### Controllers and strong params

Using `requires` is how to do _strong parameters_ in Hyperstack. Strong parameters is the practice of explicitly filtering and receiving outside data into your model, which help block a class of attacks: if someone tries to overwrite a property such as `ownerId` with a `POST` update, you'll get an exception. No more _blind updates_.

### Coding strong params

Why do we build _requireParams_ separately and independent of everything else? clearly we could have automatically bound a route to these, and provided the data being posted magically as a statically typed object.

1. You may want to organize all of your require schemas **in a central place**. Being an atomic unit helps with that.
2. You may want to **share schemas** with your frontend, Zod is used there too. A login schema is a login schema both on backend and frontend. Sharing requires a format that's neutral of anything else (e.g. a backend request object)
3. You can **compose** these and use them as a building block.
4. You can generate your Zod schemas **from any format and to any format**. This can only be done if we keep the generated target or source constrained to pure Zod.

Lastly, if you ever want that kind of magic that goes over body data automatically with a schema, we provide it with the `ParseBody` middleware, which at least ensures what ever is in your body, is there safely.

Note that `requires` means the parameters you get back are not optional. If you still get optional fields (e.g. `firstName?`), [configure strict](https://github.com/colinhacks/zod/issues/65).

## Request and Response

We give you the express request right there in `req`. There's no point abstracting it because it's too useful and too much common knowledge is built around it.

However, we do help you build better responses. In _Hyperstack_ there's no need to do this:

```ts
res.json({...})
```

Or fiddle with when to send status codes and terminating a response correctly.

A controller method can return any of:

1. **An object** (it becomes a `200 OK` and JSON serialized out)
2. **A response object**, e.g. `HTTPResponseOK(...)` which turns into JSON and the appropriate status code, and you can throw some of these to signal an error, e.g. `HTTPResponseUnauthorized(..)`. Errors are still response objects so that you can throw or return them as you prefer.
3. **Some ergonomic methods** such as `ok(..)`, `unauthorized(..)` which actually are just a simple way to construct a response object.

Either way, you can reach out for power and grab an express response:

```ts
login(req, res){
  //res is now available
}
```

For reference, here's what `ok` and `unauthorized` are actually doing:

```ts
const ok = (data) => new HttpResponseOK(data)
const unauthorized = (error) =>
  new HttpResponseUnauthorized({
    error,
  })
```

## Accepting data

### Strong params

```
permits(<zod schema>)
```

```ts
import { 
  // ..
  permits,
} from 'hyperstack'

const postParams = permits(<zod schema>)

const post = postParams(req.body)
```

Permits **only the specified schema to pass**, extra fields are filtered and missing fields are OK.

Use to block "id overwrite" attacks, where some endpoints blindly update complete objects and attackers try to fiddle with internal IDs. With strong params, you opt-in to data from the outside world.

### Requiring params

```ts
import { 
  // ..
  requires,
} from 'hyperstack'

const postParams = requires(<zod schema>)

const post = postParams(req.body)
```

Requires exactly the specified schema. 

**Like strong params, but signals that you need all the data that you've declared to continue to operate.**


## Configuration

Here's the most common controller configuration flags, in `environments/[env name].ts`:

```ts
controllers: {
  baseUrl: 'http://localhost:5150',
  cookieSecret: 'shazam',
  jwtSecret: 'sekret',
  forceHttps: true,
  gzip: true,
  indexCatchAll: true, // serve from public/index.html
  serveStatic: true, // serve static content from public/
  authCookieName: 'token', // specify cookie (should be http only cookie) name containes the JWT of the user
  // helmet?: bool | {..}
  // json?: bool | {..}
  // urlencoded?: bool | {..}
},
```

## API Configuration

Controllers come preconfigured with secure defaults. To tweak these you can use:

* `helmet` - specify your custom [helmet](https://www.npmjs.com/package/helmet) secure headers or disable it with `false`. Don't specify it for defaults.
* `json` - specify your custom [json](https://expressjs.com/en/api.html#express.json) middleware configuration or disable it with `false`. Don't specify it for defaults.
* `urlencoded` - specify your custom [url encoding](https://expressjs.com/en/api.html#express.urlencoded) middleware or disable it with `false`. Don't specify it for defaults.

## Testing

The test framework for testing controllers in _Hyperstack_ is an impressive piece of gear. Actually, it's called a _requests_ test, **and the idea is that it tests everything from API down to database**, so think of it more of an integration test.

**We don't bother with isolating** the API layer and testing it separately from the data layer.

A requests test will boot the app, wipe the database and bring it up to date **and also set up a live API app for you**, which is available through `request()`.


Set up data, make a request, and snapshot.

```ts title="test/articles/sanity.spec.ts"
import { test } from '@hyperstackjs/testing'
import { root } from '../../../config/settings'
import { appContext } from '../../../app'

const {
  requests,
  matchers: { matchRequestWithSnapshot },
} = test(root)

describe('requests', () => {
  describe('/articles', () => {
    requests('all', async (request) => {
      const { Article } = appContext.models()
      await Article.create({
        title: 'string',
        content: 'some text',
        deleted: true,
      })

      await matchRequestWithSnapshot(200, request().get(`/articles`))
    })
  })
})
```
