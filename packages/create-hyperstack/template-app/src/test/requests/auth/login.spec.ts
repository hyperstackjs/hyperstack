import { test } from '@hyperstackjs/testing'
import { root } from '../../../config/settings'
import { appContext } from '../../../app'

const {
  requests,
  matchers: { matchRequestWithSnapshot },
  serializers: { redactAndExpectMatch },
} = test(root)

const serializer = redactAndExpectMatch({
  'body.token': /^eyJh.+/,
})

describe('requests', () => {
  describe('/auth/login', () => {
    requests('should login', async (request, _app, _server) => {
      const { User } = appContext.models()
      await User.createWithPassword({
        username: 'evh@example.com',
        password: 'mypass-should-login',
        name: 'Eddie Van Halen',
      })
      await matchRequestWithSnapshot(
        200,
        request().post('/auth/login').send({
          username: 'evh@example.com',
          password: 'mypass-should-login',
        }),
        { serializer }
      )
    })
    requests(
      'should not login on bad credentials',
      async (request, _app, _server) => {
        const { User } = appContext.models()
        await User.createWithPassword({
          username: 'evh@example.com',
          password: 'mypass-should-login',
          name: 'Eddie Van Halen',
        })
        await matchRequestWithSnapshot(
          401,
          request().post('/auth/login').send({
            username: 'evh@example.com',
            password: 'mypass-is-wrong',
          })
        )
      }
    )
    requests('should validate', async (request, _app, _server) => {
      const { User } = appContext.models()
      await User.createWithPassword({
        username: 'evh@example.com',
        password: 'mypass-should-login',
        name: 'Eddie Van Halen',
      })
      await matchRequestWithSnapshot(
        401,
        request().post('/auth/login').send({
          username: 'no-such-user@example.com',
          password: 'mypass-should-login',
        })
      )
      await matchRequestWithSnapshot(
        400,
        request().post('/auth/login').send({
          username: 'this-is-not-email',
          password: 'mypass-should-login',
        })
      )
      await matchRequestWithSnapshot(
        400,
        request().post('/auth/login').send({
          username: 'evh@example.com',
          password: 'boo',
        })
      )
    })
  })
})
