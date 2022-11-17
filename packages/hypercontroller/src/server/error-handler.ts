import createDebug from 'debug'
import type { Logger } from '@hyperstackjs/typings'
import { HttpResponse, HttpResponseBadRequest } from '../http/responses'
import responseSender from '../http/response-sender'
import type { NextFunction, Request, Response } from '../types'
const debug = createDebug('hypercontroller:error-handler')

const errorHandler =
  ({
    logger,
    sendValidationErrors = false,
  }: {
    logger: Logger
    sendValidationErrors: boolean
  }) =>
  async (err: any, req: Request, res: Response, next: NextFunction) => {
    debug('error %o', err)
    debug('sending validation errors out? %o', sendValidationErrors)
    if (err instanceof HttpResponse) {
      responseSender(res, err)
    } else if (err.isValidationError && sendValidationErrors) {
      responseSender(
        res,
        new HttpResponseBadRequest({
          error: 'validation',
          validationErrors: err.errors,
        })
      )
    } else if (err.isModelError) {
      responseSender(res, new HttpResponseBadRequest({ error: err.message }))
    } else if (err) {
      // prefer a request-bound logger because of occasional child loggers & context that's bound to these
      const resolvedLogger = req && req.logger ? req.logger : logger
      if (resolvedLogger) {
        resolvedLogger.error({ err }, `Internal error`)
      }
      responseSender(res, new HttpResponseBadRequest({ error: 'bad request' }))
    } else {
      next()
    }
  }
export default errorHandler
