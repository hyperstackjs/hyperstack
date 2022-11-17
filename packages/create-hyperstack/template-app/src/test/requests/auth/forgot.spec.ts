import { test } from '@hyperstackjs/testing'
import { root } from '../../../config/settings'
import { appContext } from '../../../app'
const {
  requests,
  matchers: { matchRequestWithSnapshot, matchDeliveriesWithSnapshot },
  serializers: { redactAndExpectMatch, redactAndExpectMatchInEmails },
} = test(root)

const serializer = redactAndExpectMatch({
  'body.token': /^eyJh.+/,
})

const serializeTokenEmails = redactAndExpectMatchInEmails(
  /resetToken=[a-z0-9]{64}/g
)

const serializeUser = redactAndExpectMatch({
  pid: /.+-.+-.+-.+-.+/,
})

describe('requests', () => {
  describe('/auth/forgot', () => {
    requests(
      'should start forgot password flow and send email',
      async (request) => {
        const { User } = appContext.models()
        const user = await User.createWithPassword({
          username: 'evh@example.com',
          password: 'mypass-should-login',
          name: 'Eddie Van Halen',
        })
        await matchRequestWithSnapshot(
          200,
          request().post('/auth/forgot').send({
            username: 'evh@example.com',
          })
        )
        await user.reload()

        expect(user.resetToken).toMatch(/.{3,}/)
        expect(user.resetSentAt).toBeTruthy()
        expect(new Date().getTime() - user.resetSentAt!.getTime()).toBeWithin(
          0,
          30 * 1000
        )

        matchDeliveriesWithSnapshot(1, { serializer: serializeTokenEmails })
      }
    )
    requests(
      'should finish forgot password flow and reset password',
      async (request) => {
        const { User } = appContext.models()
        const user = await User.createWithPassword({
          username: 'evh@example.com',
          password: 'mypass-should-login',
          name: 'Eddie Van Halen',
        })
        await user.forgotPassword()

        const resetToken = user.resetToken

        await matchRequestWithSnapshot(
          400,
          request().post(`/auth/reset`).send({ password: 'short', resetToken }),
          { serializer, snapshotName: 'dont bypass our validation' }
        )

        await matchRequestWithSnapshot(
          400,
          request().post(`/auth/reset`).send({ resetToken: user.resetToken }),
          { serializer, snapshotName: 'you have to have a password' }
        )

        const newPassword = 'this-is-a-new-password'
        await matchRequestWithSnapshot(
          200,
          request()
            .post(`/auth/reset`)
            .send({ password: newPassword, resetToken }),
          { serializer, snapshotName: 'ok lets go' }
        )
        await user.reload()
        expect(user.resetToken).toBeNull()
        expect(user.resetSentAt).toBeNull()
        expect(await user.verifyPassword('mypass-should-login')).toBeFalse()
        expect(await user.verifyPassword('this-is-a-new-password')).toBeTrue()

        // and you cannot reuse this token
        await matchRequestWithSnapshot(
          400,
          request().post(`/auth/reset`).send({
            password: 'some-other-password',
            resetToken,
          }),
          { serializer, snapshotName: 'cannot reuse token' }
        )

        expect(serializeUser(user)).toMatchSnapshot()
        matchDeliveriesWithSnapshot(0)
      }
    )

    requests('should validate', async (request) => {
      const { User } = appContext.models()
      await User.createWithPassword({
        username: 'evh@example.com',
        password: 'mypass-should-login',
        name: 'Eddie Van Halen',
      })
      await matchRequestWithSnapshot(
        401,
        request().post('/auth/forgot').send({
          username: 'no-such-user@example.com',
        }),
        { snapshotName: 'no such user' }
      )
      await matchRequestWithSnapshot(
        400,
        request().post('/auth/forgot').send({
          username: 'this-is-not-email',
        }),
        { snapshotName: 'not an email' }
      )
      // no user
      await matchRequestWithSnapshot(
        400,
        request().post('/auth/forgot').send({}),
        { snapshotName: 'no user field' }
      )

      // no token
      await matchRequestWithSnapshot(
        400,
        request().post('/auth/reset').send({}),
        { snapshotName: 'no reset token field' }
      )

      // bad token
      await matchRequestWithSnapshot(
        400,
        request().post('/auth/reset').send({
          resetToken: 'foobarbaz',
        }),
        { snapshotName: 'bad reset token' }
      )
    })
  })
})
