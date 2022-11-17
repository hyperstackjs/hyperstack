import { test } from '@hyperstackjs/testing'
import { root } from '../../../config/settings'
import { appContext } from '../../../app'
const {
  requests,
  matchers: { matchRequestWithSnapshot, matchDeliveriesWithSnapshot },
  serializers: { redactAndExpectMatch, baseMailerSerialize },
} = test(root)

const serializer = redactAndExpectMatch({
  'body.token': /^eyJh.+/,
})

const verifyTokenExpr = /verifyToken=[a-z0-9]{64}/g
const serializeVerifyEmails = redactAndExpectMatch(
  {
    'contents.1': verifyTokenExpr,
    'contents.2': verifyTokenExpr,
    'originalMessage.html': verifyTokenExpr,
    'originalMessage.text': verifyTokenExpr,
  },
  baseMailerSerialize
)

const serializeUser = redactAndExpectMatch({
  pid: /.+-.+-.+-.+-.+/,
})
jest.setTimeout(10000)
describe('requests', () => {
  describe('/auth/register', () => {
    requests('should register and send welcome email', async (request) => {
      const { User } = appContext.models()
      await matchRequestWithSnapshot(
        200,
        request().post('/auth/register').send({
          username: 'evh@example.com',
          password: 'mypass-should-login',
          name: 'Eddie Van Halen',
        }),
        { serializer }
      )
      const user = await User.findOne({
        where: { username: 'evh@example.com' },
      })
      if (!user) {
        throw new Error('user is null')
      }
      expect(user.emailVerificationToken).toMatch(/.{3,}/)
      expect(user.emailVerificationSentAt).toBeTruthy()

      expect(
        new Date().getTime() - user.emailVerificationSentAt!.getTime()
      ).toBeWithin(0, 5000)

      expect(serializeUser(user)).toMatchSnapshot()
      matchDeliveriesWithSnapshot(1, { serializer: serializeVerifyEmails })
    })

    requests('should validate', async (request) => {
      const { User } = appContext.models()
      await User.createWithPassword({
        username: 'evh@example.com',
        password: 'mypass-should-login',
        name: 'Eddie Van Halen',
      })
      await matchRequestWithSnapshot(
        400,
        request().post('/auth/register').send({
          username: 'no-such-user@example.com',
          password: 'mypass-should-login',
        })
      )
      await matchRequestWithSnapshot(
        400,
        request().post('/auth/register').send({
          username: 'this-is-not-email',
          password: 'mypass-should-login',
          name: 'Eddie Van Halen',
        })
      )
      // password too short
      await matchRequestWithSnapshot(
        400,
        request().post('/auth/register').send({
          username: 'evh@example.com',
          password: 'boo',
          name: 'Eddie Van Halen',
        })
      )
      // user exists
      await matchRequestWithSnapshot(
        400,
        request().post('/auth/register').send({
          username: 'evh@example.com',
          password: 'mypass-should-login',
          name: 'Eddie Van Halen',
        })
      )
    })

    requests('should verify with secret token', async (request) => {
      const { User } = appContext.models()
      const user = await User.createWithPassword({
        username: 'evh@example.com',
        password: 'mypass-should-login',
        name: 'Eddie Van Halen',
      })
      const verifyToken = user.emailVerificationToken

      await matchRequestWithSnapshot(
        200,
        request().get(`/auth/verify?verifyToken=${verifyToken}`),
        { serializer }
      )
      await user.reload()
      expect(new Date().getTime() - user.emailVerifiedAt!.getTime()).toBeWithin(
        0,
        500
      )
      expect(user.emailVerificationToken).toBeNull()
      expect(user.emailVerificationSentAt).toBeNull()

      // no email bloopers
      matchDeliveriesWithSnapshot(0)
    })
  })
})
