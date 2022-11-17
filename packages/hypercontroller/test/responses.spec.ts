import request from 'supertest'

import type { Request, Response } from '../src/index'
import {
  Controller,
  Get,
  HttpResponseOK,
  ValidationError,
  createServer,
} from '../src/index'
import { expectWithSnapshot, logger } from './utils'
@Controller('api')
class Api {
  @Get('foobar')
  async foobar(_req: Request, _res: Response) {
    return new HttpResponseOK({ its: 'alright' })
  }

  @Get('no-reqres')
  async noreqres() {
    return new HttpResponseOK({ its: 'alright' })
  }

  @Get('throw-me')
  async throwme(_req: Request, _res: Response) {
    throw new Error('it cant work')
  }

  @Get('validation-error')
  async validationErrors(_req: Request, _res: Response) {
    throw new ValidationError({ errors: [] })
  }

  @Get('raw-object')
  async rawObject(_req: Request, _res: Response) {
    return { hello: 'ok' }
  }
}

const app = createServer({
  controllers: [Api],
  opts: { logging: { logger }, sendValidationErrors: true },
})
describe('hypercontroller/responses', () => {
  it('requests', async () => {
    await expectWithSnapshot(200, request(app).get('/api/foobar'))
  })
  it('no req res', async () => {
    await expectWithSnapshot(200, request(app).get('/api/no-reqres'))
  })
  it('wraps async erors', async () => {
    await expectWithSnapshot(400, request(app).get('/api/throw-me'))
  })
  it('validation error', async () => {
    await expectWithSnapshot(400, request(app).get('/api/validation-error'))
  })
  it('raw object', async () => {
    await expectWithSnapshot(200, request(app).get('/api/raw-object'))
  })
})
