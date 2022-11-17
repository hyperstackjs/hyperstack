import { test } from '@hyperstackjs/testing'
import L from 'lodash'
import { getProps } from '@hyperstackjs/initializer-jwt'
import { root } from '../../config/settings'
import { appContext } from '../../app'
import { baseFixture } from '../__fixtures__'

const { models } = test(root)

const serializeModel = (m: any) => {
  return L.omit(m.toJSON(), ['pid'])
}

describe('models', () => {
  describe('user', () => {
    models('should create and login', async (_app) => {
      const { verifyJWT } = getProps()
      const { User } = appContext.models()
      const u = await User.createWithPassword({
        username: 'evh@example.com',
        name: 'Eddie Van Halen',
        password: 'jump!$',
      })
      expect(serializeModel(u)).toMatchSnapshot()
      expect(await u.verifyPassword('jump!$')).toEqual(true)
      expect(u.pid).toMatch(/.+-.+-.+-.+-.+/)
      expect(u.password).toMatch(/^pbkdf2_sha256/)
      expect(u.createAuthenticationToken()).toMatch(/^eyJh/)
      expect((await verifyJWT(u.createAuthenticationToken())).sub).toEqual(
        'evh@example.com'
      )
    })
    models('should reset password', async () => {
      await baseFixture()
      const { User } = appContext.models()
      const alex = await User.findOne({
        where: { username: 'alex@example.com' },
      })
      if (!alex) {
        throw new Error('user is null')
      }
      expect(alex.resetPassword('')).rejects.toThrow(/too short/)
      await alex.resetPassword('some-other-password')
      await alex.reload()
      expect(await alex.verifyPassword('alex-might-password')).toBeFalse()
      expect(await alex.verifyPassword('some-other-password')).toBeTrue()
    })
    models('should set forgot token', async () => {
      await baseFixture()
      const { User } = appContext.models()
      const alex = await User.findOne({
        where: { username: 'alex@example.com' },
      })
      if (!alex) {
        throw new Error('user is null')
      }
      expect(alex.resetToken).toBeNull()
      expect(alex.resetSentAt).toBeNull()
      await alex.forgotPassword()
      expect(alex.resetToken).toBeTruthy()
      expect(alex.resetSentAt).toBeTruthy()
    })
    models('should verify account', async () => {
      await baseFixture()
      const { User } = appContext.models()
      const alex = await User.findOne({
        where: { username: 'alex@example.com' },
      })
      if (!alex) {
        throw new Error('user is null')
      }
      expect(alex.emailVerificationToken).toBeTruthy()
      expect(alex.emailVerificationSentAt).toBeTruthy()
      expect(alex.emailVerifiedAt).toBeNull()
      await alex.verified()
      expect(alex.emailVerificationToken).toBeNull()
      expect(alex.emailVerificationSentAt).toBeNull()
      expect(alex.emailVerifiedAt).toBeTruthy()
    })
  })
})
