import type { NextFunction, Request, Response } from '../types'
import { HttpResponse, HttpResponseOK } from './responses'
import responseSender from './response-sender'

const responseHandler = (
  fn: (r: Request, rs: Response, n: NextFunction) => any
) =>
  function asyncUtilWrap(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const fnReturn = fn(request, response, next)
    Promise.resolve(fnReturn)
      .then((result) => {
        if (result instanceof HttpResponse) {
          responseSender(response, result)
        } else {
          responseSender(response, new HttpResponseOK(result))
        }
      })
      .catch(next)
  }

export default responseHandler
