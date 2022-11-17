import H, {
  Controller,
  Get,
  HttpResponseOK,
  ParseBody,
  Post,
  ValidationError,
  requires,
} from '@hyperstackjs/hypercontroller'

import { z } from 'zod'

@Controller('api')
export class Api {
  @Get('foobar')
  async foobar(_req: Request, _res) {
    return new HttpResponseOK({ its: 'alright' })
  }

  @Get('no-reqres')
  async noreqres() {
    return new HttpResponseOK({ its: 'alright' })
  }

  @Get('throw-me')
  async throwme(_req, _res) {
    throw new Error('it cant work')
  }

  @Post('post/create')
  @ParseBody(
    z.object({ post: z.object({ title: z.string(), body: z.string() }) })
  )
  async createPost(req, _res) {
    return { ok: req.body.post.title }
  }

  postparams = requires(
    z.object({
      post: z.object({ title: z.string(), body: z.string() }),
    })
  )

  @Post('post/update')
  async updatePost(req, _res) {
    const {
      post: { title },
    } = this.postparams(req.body)
    return { ok: title }
  }

  @Get('validation-error')
  async validationErrors(_req, _res) {
    throw new ValidationError({ errors: [] })
  }

  @Get('raw-object')
  async rawObject(_req, _res) {
    return { hello: 'ok' }
  }
}
