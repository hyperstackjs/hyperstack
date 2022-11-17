import type { Request, Response } from 'express'
import { CREATED, OK } from 'http-status-codes'

import { assertRequest } from '../helpers'
import { Controller, Get, Head } from '../../../src'
import { HttpVerb } from '../../../src/decorators/types'

@Controller('head')
export class HeadController {
  @Get('path1')
  public get1(req: Request, res: Response): Response {
    return res.status(CREATED).json({
      message: '',
    })
  }

  @Head('path1')
  public head1(req: Request, res: Response): Response {
    return res.status(OK).json()
  }

  public static async validateGetBeforeHead(): Promise<void> {
    await assertRequest('/head/path1', HttpVerb.HEAD, {
      body: null,
      status: CREATED,
    })
    await assertRequest('/head/path1', HttpVerb.GET, {
      body: {
        message: '',
      },
      status: CREATED,
    })
  }

  @Head('path2')
  public head(req: Request, res: Response): Response {
    return res.status(OK).json()
  }

  @Get('path2')
  public get(req: Request, res: Response): Response {
    return res.status(CREATED).json({
      message: '',
    })
  }

  public static async validateHeadBeforeGet(): Promise<void> {
    await assertRequest('/head/path2', HttpVerb.HEAD, {
      body: null,
      status: OK,
    })
    await assertRequest('/head/path2', HttpVerb.GET, {
      body: {
        message: '',
      },
      status: CREATED,
    })
  }
}
