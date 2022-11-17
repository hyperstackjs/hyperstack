import request from 'supertest'

import type { Request, Response, ServerOptions } from '../src/index'
import { Controller, Get, HttpResponseOK, createServer } from '../src/index'
import { expectWithSnapshot, logger } from './utils'

@Controller('api')
class Api {
  @Get('foobar')
  async foobar(_req: Request, _res: Response) {
    return new HttpResponseOK({ its: 'alright' })
  }
}

const createMiddlewareServer = (opts: Partial<ServerOptions>) =>
  createServer({
    controllers: [Api],
    opts: { logging: { logger }, sendValidationErrors: true, ...opts },
  })
const matchUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe('middleware/set-request-ids', () => {
  it('none', async () => {
    const app = createMiddlewareServer({ requestId: { mode: 'none' } })
    await expectWithSnapshot(
      200,
      request(app)
        .get('/api/foobar')
        .set({ 'x-request-id': '00000000-bf22-4b1d-be68-b3a4156635c2' }),
      (res: any) => res.headers['x-request-id'] === undefined
    )
    await expectWithSnapshot(
      200,
      request(app).get('/api/foobar'),
      (res: any) => res.headers['x-request-id'] === undefined
    )
  })
  it('passthrough', async () => {
    const app = createMiddlewareServer({ requestId: { mode: 'passthrough' } })
    await expectWithSnapshot(
      200,
      request(app)
        .get('/api/foobar')
        .set({ 'x-request-id': '00000000-bf22-4b1d-be68-b3a4156635c2' }),
      (res: any) => res.headers['x-request-id'].match(/^00000000-.*/)
    )
    await expectWithSnapshot(
      200,
      request(app).get('/api/foobar'),
      (res: any) => res.headers['x-request-id'] === undefined
    )
  })
  it('passthrough-or-generate', async () => {
    const app = createMiddlewareServer({
      requestId: { mode: 'passthrough-or-generate' },
    })
    await expectWithSnapshot(
      200,
      request(app).get('/api/foobar'),
      (res: any) =>
        !res.headers['x-request-id'].match(/^00000000-.*/) &&
        res.headers['x-request-id'].match(matchUuid)
    )
    await expectWithSnapshot(
      200,
      request(app)
        .get('/api/foobar')
        .set({ 'x-request-id': '00000000-bf22-4b1d-be68-b3a4156635c2' }),
      (res: any) => res.headers['x-request-id'].match(/^00000000-.*/)
    )
  })
  it('generate', async () => {
    const app = createMiddlewareServer({ requestId: { mode: 'generate' } })
    await expectWithSnapshot(
      200,
      request(app)
        .get('/api/foobar')
        .set({ 'x-request-id': '00000000-bf22-4b1d-be68-b3a4156635c2' }),
      (res: any) =>
        !res.headers['x-request-id'].match(/^00000000-.*/) &&
        res.headers['x-request-id'].match(matchUuid)
    )
  })
  it('default', async () => {
    const app = createMiddlewareServer({})
    // passthrough - or generate
    await expectWithSnapshot(
      200,
      request(app).get('/api/foobar'),
      (res: any) =>
        !res.headers['x-request-id'].match(/^00000000-.*/) &&
        res.headers['x-request-id'].match(matchUuid)
    )
    await expectWithSnapshot(
      200,
      request(app)
        .get('/api/foobar')
        .set({ 'x-request-id': '00000000-bf22-4b1d-be68-b3a4156635c2' }),
      (res: any) => res.headers['x-request-id'].match(/^00000000-.*/)
    )
  })
})
