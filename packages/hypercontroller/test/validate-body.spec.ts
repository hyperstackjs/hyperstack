import request from 'supertest'
import type { Request, Response } from '../src/types'

import {
  Controller,
  HttpResponseOK,
  Post,
  ValidateBody,
  createServer,
} from '../src/index'

import { expectWithSnapshot } from './utils'

const credentialsSchema = {
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
  },
  required: ['email', 'password'],
  type: 'object',
}

@Controller('api')
class Api {
  @ValidateBody(credentialsSchema)
  @Post('foobar')
  async foobar(_req: Request, _res: Response) {
    return new HttpResponseOK({ its: 'alright' })
  }
}

const app = createServer({
  controllers: [Api],
  opts: { sendValidationErrors: true },
})
describe('hypercontroller/validate-body', () => {
  it('fails validation', async () => {
    await expectWithSnapshot(
      400,
      request(app).post('/api/foobar').send({ whacky_field: 'hello' })
    )
    await expectWithSnapshot(
      400,
      request(app)
        .post('/api/foobar')
        .send({ email: 'not-email', password: 'foobar' })
    )
  })
  it('passes validation', async () => {
    await expectWithSnapshot(
      200,
      request(app)
        .post('/api/foobar')
        .send({ email: 'foo@bar.com', password: 'shazam' })
    )
  })
})
