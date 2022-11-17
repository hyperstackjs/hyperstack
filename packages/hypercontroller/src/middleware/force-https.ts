import type { NextFunction, Request, Response } from '../types'

export default (req: Request, res: Response, next: NextFunction) => {
  if (
    req.headers['x-forwarded-proto'] &&
    req.headers['x-forwarded-proto'] !== 'https'
  ) {
    res.redirect(`https://${req.hostname}${req.originalUrl}`)
  } else {
    next()
  }
}
