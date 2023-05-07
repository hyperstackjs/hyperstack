import request from 'supertest'
import { sign } from 'jsonwebtoken'
import { resolveAuthCookieName } from '../../initializer-jwt/src/index'
import {
  Controller,
  Get,
  HttpResponseOK,
  authWithJWT,
  createServer,
} from '../src/index'
import { expectWithSnapshot, logger } from './utils'

const signJWT = (payload: any) =>
  sign(payload, 'testing-secret', {
    algorithm: 'HS512',
    expiresIn: '1h',
  })

const createApp = (
  shouldSetCookie: boolean,
  authCookieNameValue?: string | boolean
) => {
  const { MustAuthWithJWT } = shouldSetCookie
    ? authWithJWT({
        secret: 'testing-secret',
        loader: async (payload: any) => ({
          user: { name: 'joe', email: payload.email },
        }),
        authCookieName: resolveAuthCookieName(authCookieNameValue),
      })
    : authWithJWT({
        secret: 'testing-secret',
        loader: async (payload: any) => ({
          user: { name: 'joe', email: payload.email },
        }),
      })

  @MustAuthWithJWT
  @Controller('api')
  class Api {
    @Get('foobar')
    async foobar(_req: any, _res: any) {
      return new HttpResponseOK({ its: 'alright' })
    }
  }

  return createServer({
    controllers: [Api],
    opts: { logging: { logger }, cookieSecret: 'auth-cookie-secret' },
  })
}

describe('hypercontroller/jwt', () => {
  describe('bearer auth', () => {
    const app = createApp(false)

    it('passes auth', async () => {
      const key = signJWT({ email: 'joe@ericsson.com' })
      await expectWithSnapshot(
        200,
        request(app)
          .get('/api/foobar')
          .set({ Authorization: `Bearer ${key}` })
      )
    })
    it('fails - JWT should only accept HS512', async () => {
      const key = sign({ email: 'joe@ericsson.com' }, 'testing-secret', {
        expiresIn: '1h',
      })
      await expectWithSnapshot(
        401,
        request(app)
          .get('/api/foobar')
          .set({ Authorization: `Bearer ${key}` })
      )
    })
    it('fails auth', async () => {
      await expectWithSnapshot(
        401,
        request(app)
          .get('/api/foobar')
          .set({ Authorization: 'Bearer bad-token' })
      )

      await expectWithSnapshot(401, request(app).get('/api/foobar'))
    })
  })

  describe('cookie authentication', () => {
    describe('authCookieName contains string value', () => {
      const app = createApp(true, 'my_cookie')

      it('should pass auth via auth cookie', async () => {
        const key = signJWT({ email: 'joe@ericsson.com' })
        await expectWithSnapshot(
          200,
          request(app)
            .get('/api/foobar')
            .set('Cookie', [`my_cookie=${key}`])
        )
      })

      it('should not pass auth - invaild jwt', async () => {
        await expectWithSnapshot(
          401,
          request(app).get('/api/foobar').set('Cookie', [`my_cookie=123`])
        )
      })
    })

    describe('authCookieName is true - user uses default cookie name', () => {
      const app = createApp(true, true)

      it('should pass auth via auth cookie', async () => {
        const key = signJWT({ email: 'joe@ericsson.com' })
        await expectWithSnapshot(
          200,
          request(app)
            .get('/api/foobar')
            .set('Cookie', [`HS_AUTH=${key}`])
        )
      })
    })

    describe('authCookieName is false - no cookie auth', () => {
      const app = createApp(true, false)

      it('should pass auth via bearer token', async () => {
        const key = signJWT({ email: 'joe@ericsson.com' })
        await expectWithSnapshot(
          200,
          request(app)
            .get('/api/foobar')
            .set({ Authorization: `Bearer ${key}` })
        )
      })
    })

    describe('authCookieName is not set - no cookie auth', () => {
      const app = createApp(false)

      it('should pass auth via bearer token', async () => {
        const key = signJWT({ email: 'joe@ericsson.com' })
        await expectWithSnapshot(
          200,
          request(app)
            .get('/api/foobar')
            .set({ Authorization: `Bearer ${key}` })
        )
      })
    })
  })
})
