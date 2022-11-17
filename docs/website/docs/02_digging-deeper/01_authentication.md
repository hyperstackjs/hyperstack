# Authentication

_Hyperstack_ comes with authentication, **and aims to provide the same plug-in authentication experience** as _Devise_ did for Rails.

To narrow down the scope, **Hyperstack offers authentication with _JWT_**. This means clients authenticate, and gets back a JWT token, to use as a Bearer token in following requests.

For that, we have a few components:

* **JWT logic**, verfication, and encryption
* Middleware to **verify and authenticate** a user with a Bearer token
* `currentUser` infra to **identify, authenticate, and load a current user** into the current authenticated request for convenience
* A generic `User` model, `Auth` controller, and `Auth` mailer for login, registration, reset password, and more.

While you get these things **out of the box**, it's nice to see how things work behind the scenes. Down below is a list out of a few of the infrastructure pieces in play.

## Using the JWT initializer


```ts
import jwt from '@hyperstackjs/initializer-jwt'

export default jwt(context => async (payload) => {
  const { User } = context.models()
  const user = await User.findOne({ where: { username: payload.sub } })
  if (!user) {
    return null
  }
  return { user }
})
```

## Controllers

You get decorators that will **stop unauthenticated requests**, and if a request is authenticated, you'll find the current authenticated user in `req.user`.

```ts
import { getProps } from '@hyperstackjs/initializer-jwt'
const { MustAuthRouteWithJWT } = getProps()
@Controller('posts')
export class PostsController {
  @Get()
  @MustAuthRouteWithJWT
  async list(_req: Request, _res) {
    return new HttpResponseOK({ posts: [{ id: 1, title: 'hello world' }] })
  }
  //...
```

## Ad hoc signing

Should you want to **sign various artifacts**, you can use `signJWT` like so:

```ts
import { getProps } from '@hyperstackjs/initializer-jwt'
const { signJWT } = getProps()
```

`signJWT` is already rigged with the secret and algorithm that your app uses, so you can use it freely anywhere


