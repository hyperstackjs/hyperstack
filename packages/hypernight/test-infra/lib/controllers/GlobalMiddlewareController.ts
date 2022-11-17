import type { Request, Response } from 'express'
import { OK } from 'http-status-codes'

import { assertRequest } from '../helpers'
import { Controller, Get } from '../../../src'
import { HttpVerb } from '../../../src/decorators/types'

@Controller('globalMiddleware')
export class GlobalMiddlewareController {
  public static middlewares: string[]

  @Get('path1')
  private path1(_: Request, res: Response): Response {
    return res.status(OK).json({
      message: 'path1',
      middlewares: GlobalMiddlewareController.middlewares,
    })
  }

  public static async validateGlobalMiddleware(): Promise<void> {
    await assertRequest('/globalMiddleware/path1', HttpVerb.GET, {
      body: {
        message: 'path1',
        middlewares: ['globalMiddleware'],
      },
      status: OK,
    })
  }
}
