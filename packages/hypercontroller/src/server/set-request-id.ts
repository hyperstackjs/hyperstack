import { v4 as uuidv4 } from 'uuid'
import type { NextFunction, Request, RequestIdOpts, Response } from '../types'

const resolveId = (req: Request, opts: RequestIdOpts) => {
  switch (opts.mode) {
    case 'generate': {
      return uuidv4()
    }
    case 'passthrough': {
      return req.id || req.get('x-request-id')
    }
    case 'passthrough-or-generate': {
      return req.id || req.get('x-request-id') || uuidv4()
    }
    case 'none': {
      return null
    }
  }
}
const setRequestId =
  (opts: RequestIdOpts) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.id = resolveId(req, opts)
    if (req.id) {
      res.set('x-request-id', req.id)
    }

    next()
  }

export default setRequestId
