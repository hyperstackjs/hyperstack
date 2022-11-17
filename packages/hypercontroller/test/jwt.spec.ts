import request from 'supertest'
import { sign } from 'jsonwebtoken'

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
    expiresIn: '1h',
  })

const { MustAuthWithJWT } = authWithJWT({
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

const app = createServer({
  controllers: [Api],
  opts: { logging: { logger } },
})
describe('hypercontroller/jwt', () => {
  it('passes auth', async () => {
    const key = signJWT({ email: 'joe@ericsson.com' })
    await expectWithSnapshot(
      200,
      request(app)
        .get('/api/foobar')
        .set({ Authorization: `Bearer ${key}` })
    )
  })
  it('fails auth', async () => {
    await expectWithSnapshot(
      401,
      request(app).get('/api/foobar').set({ Authorization: 'Bearer bad-token' })
    )
    await expectWithSnapshot(401, request(app).get('/api/foobar'))
  })
})
