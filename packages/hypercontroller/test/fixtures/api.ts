import { z } from 'zod'
import {
  Controller,
  Get,
  HttpResponseOK,
  ParseBody,
  Post,
  ValidationError,
  requires,
} from '../../src'
import type { Request, Response } from '../../src'

const postparams = requires(
  z.object({
    post: z.object({ title: z.string(), body: z.string() }),
  })
)
@Controller('api')
export default class Api {
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

  @Post('post/create')
  @ParseBody(
    z.object({ post: z.object({ title: z.string(), body: z.string() }) })
  )
  async createPost(req: Request, _res: Response) {
    return { ok: req.body.post.title }
  }

  @Get('post/update')
  @Post('post/update')
  async updatePost(req: Request, _res: Response) {
    const {
      post: { title },
    } = postparams(req.body)
    return { ok: title }
  }

  @Get('validation-error')
  async validationErrors(_req: Request, _res: Response) {
    throw new ValidationError({ errors: [] })
  }

  @Get('raw-object/:id')
  async rawObject(_req: Request, _res: Response) {
    return { hello: 'ok' }
  }

  @Get('users/:uid/posts/:pid')
  async postforuser(_req: Request, _res: Response) {
    return { hello: 'ok' }
  }
}
