import type { Request, Response } from 'express'
import { OK } from 'http-status-codes'

import { assertRequest } from '../helpers'
import { All, Controller } from '../../../src'
import { HttpVerb } from '../../../src/decorators/types'

@Controller('allVerb')
export class AllVerbController {
  @All()
  public all(req: Request, res: Response): any {
    return res.status(OK).json({
      message: 'allVerb',
    })
  }

  public static async validateAll(): Promise<void> {
    const assertRequestPromises: Array<Promise<void>> = []
    for (const verb of Object.values(HttpVerb)) {
      if (verb === HttpVerb.HEAD) {
        // Ignore HEAD
        continue
      }
      assertRequestPromises.push(
        assertRequest('/allVerb', verb as HttpVerb, {
          body: {
            message: 'allVerb',
          },
          status: OK,
        })
      )
    }
    assertRequestPromises.push(
      assertRequest('/allVerb', HttpVerb.HEAD, {
        body: null,
        status: OK,
      })
    )
    await Promise.all(assertRequestPromises)
  }
}
