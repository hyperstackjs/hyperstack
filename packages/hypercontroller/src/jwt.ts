import { Bearer } from 'permit'
import { sign, verify } from 'jsonwebtoken'
import type { NextFunction, Request, Response } from './types'
import { ClassMiddleware, Middleware } from './api'
import { HttpResponseUnauthorized } from './http/responses'
const forceHS512 = (jwtOptions: any) =>
  jwtOptions
    ? { ...jwtOptions, algorithm: 'HS512' } // force hard crypto
    : { algorithm: 'HS512' }

// decorator creator
const createAuth = (verify: any, { loader, bearer }: any) => {
  const permit = new Bearer(
    bearer || {
      query: 'access_token',
    }
  )

  return async (req: Request) => {
    const token = permit.check(req)
    if (!token) {
      throw new HttpResponseUnauthorized('no token')
    }

    let payload: any
    try {
      payload = await verify(token)
    } catch (error) {
      throw new HttpResponseUnauthorized('bad token')
    }

    const detail = await loader(payload)
    if (!detail || !detail.user) {
      throw new HttpResponseUnauthorized('no such user')
    }

    return detail
  }
}

const buildAuth = (verify: any, MWare: any, opts: any) => {
  const auth = createAuth(verify, opts)

  return MWare(async (req: Request, res: Response, next: NextFunction) => {
    const { user, ...rest } = await auth(req)
    req.user = user
    req.state = rest
    next()
  })
}

const authWithJWT = ({
  secret,
  jwtOptions,
  loader,
  bearer,
}: {
  secret: string
  loader: any
  jwtOptions?: any
  bearer?: any
}) => {
  if (!secret) {
    throw new Error('no JWT secret set')
  }
  const resolvedOptions = jwtOptions || {
    expiresIn: '14d',
    algorithm: 'HS512',
  }

  const signJWT = (payload: any) =>
    sign(payload, secret, forceHS512(resolvedOptions))

  const verifyJWT = (token: string) =>
    new Promise((resolve, reject) => {
      verify(token, secret, forceHS512(resolvedOptions), (err, value) => {
        if (err) {
          reject(err)
        } else {
          resolve(value)
        }
      })
    })

  return {
    MustAuthWithJWT: buildAuth(verifyJWT, ClassMiddleware, { loader, bearer }),
    MustAuthRouteWithJWT: buildAuth(verifyJWT, Middleware, { loader, bearer }),
    signJWT,
    verifyJWT,
  }
}

export { authWithJWT }
