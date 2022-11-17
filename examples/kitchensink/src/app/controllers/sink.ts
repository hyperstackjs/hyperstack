import {
  Controller,
  Get,
  HttpResponseOK,
  ParseBody,
  Post,
  ValidationError,
  requires,
} from 'hyperstack'
import type { Request, Response } from 'hyperstack'

import { z } from 'zod'

@Controller('sink')
export default class Sink {
  @Get('foobar')
  async foobar(req: Request, _res: Response) {
    ;(req as any).log.info('some logger from pino')
    req.logger.info('some logger from pino')
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

  @Post('create')
  @ParseBody(
    z.object({ post: z.object({ title: z.string(), body: z.string() }) })
  )
  async createDemo(req: Request, _res: Response) {
    return { ok: req.body.post.title }
  }

  postparams = requires(
    z.object({
      post: z.object({ title: z.string(), body: z.string() }),
    })
  )

  @Get('update_2')
  @Get('update')
  @Post('update')
  async updateDemo(req: Request, _res: Response) {
    const {
      post: { title },
    } = this.postparams(req.body)
    return { ok: title }
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
