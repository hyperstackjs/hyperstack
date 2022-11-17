import type { Request, RequestHandler, Response } from 'express'
import { OK } from 'http-status-codes'

import { assertRequest } from '../helpers'
import { Controller, ErrorMiddleware, Get } from '../../../src'
import { HttpVerb } from '../../../src/decorators/types'

@Controller('methodErrorMiddleware')
export class MethodErrorMiddlewareController {
  private static errorMiddlewares: string[] = []

  private static errorMiddleware0 = (
    _err: Error,
    _req: Request,
    res: Response
  ): void => {
    MethodErrorMiddlewareController.errorMiddlewares.push('errorMiddleware0')
    res.status(OK).json({
      errorMiddlewares: MethodErrorMiddlewareController.errorMiddlewares,
    })
    MethodErrorMiddlewareController.errorMiddlewares = []
  }

  private static errorMiddleware1 = (
    _err: Error,
    _req: Request,
    _res: Response
  ): void => {
    MethodErrorMiddlewareController.errorMiddlewares.push('errorMiddleware1')
    throw new Error('x')
  }

  private static errorMiddleware2 = (
    _err: Error,
    _req: Request,
    _res: Response
  ): void => {
    MethodErrorMiddlewareController.errorMiddlewares.push('errorMiddleware2')
    throw new Error('x')
  }

  @Get('path1')
  @ErrorMiddleware(MethodErrorMiddlewareController.errorMiddleware0)
  private path1(_req: Request, _res: Response): Response {
    throw new Error('x')
  }

  public static async validateAddSingleErrorMiddleware(): Promise<void> {
    await assertRequest('/methodErrorMiddleware/path1', HttpVerb.GET, {
      body: {
        errorMiddlewares: ['errorMiddleware0'],
      },
      status: OK,
    })
  }

  @Get('path2')
  @ErrorMiddleware([MethodErrorMiddlewareController.errorMiddleware0])
  private path2(_req: Request, _res: Response): Response {
    throw new Error('x')
  }

  public static async validateAddArrayOfErrorMiddlewareOfLength1(): Promise<void> {
    await assertRequest('/methodErrorMiddleware/path2', HttpVerb.GET, {
      body: {
        errorMiddlewares: ['errorMiddleware0'],
      },
      status: OK,
    })
  }

  @Get('path3')
  @ErrorMiddleware([
    MethodErrorMiddlewareController.errorMiddleware2,
    MethodErrorMiddlewareController.errorMiddleware1,
    MethodErrorMiddlewareController.errorMiddleware0,
  ])
  private path3(_req: Request, _res: Response): Response {
    throw new Error('x')
  }

  public static async validateAddArrayOfErrorMiddleware(): Promise<void> {
    await assertRequest('/methodErrorMiddleware/path3', HttpVerb.GET, {
      body: {
        errorMiddlewares: [
          'errorMiddleware2',
          'errorMiddleware1',
          'errorMiddleware0',
        ],
      },
      status: OK,
    })
  }

  @Get('path4')
  @ErrorMiddleware(MethodErrorMiddlewareController.errorMiddleware0)
  private path4: RequestHandler = (_req: Request, _res: Response): Response => {
    throw new Error('x')
  }

  public static async validateErrorMiddlewareOnProperty(): Promise<void> {
    await assertRequest('/methodErrorMiddleware/path4', HttpVerb.GET, {
      body: {
        errorMiddlewares: ['errorMiddleware0'],
      },
      status: OK,
    })
  }

  @Get('path5')
  @ErrorMiddleware(MethodErrorMiddlewareController.errorMiddleware2)
  @ErrorMiddleware(MethodErrorMiddlewareController.errorMiddleware1)
  @ErrorMiddleware(MethodErrorMiddlewareController.errorMiddleware0)
  private path5(_: Request, _res: Response): Response {
    throw new Error('x')
  }

  public static async validateMultipleErrorMiddlewareDecorators(): Promise<void> {
    await assertRequest('/methodErrorMiddleware/path5', HttpVerb.GET, {
      body: {
        errorMiddlewares: [
          'errorMiddleware2',
          'errorMiddleware1',
          'errorMiddleware0',
        ],
      },
      status: OK,
    })
  }
}
