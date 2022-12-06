import { authWithJWT, err } from '@hyperstackjs/hypercontroller'
import type { Context } from '@hyperstackjs/typings'
import { context } from 'hyperstack'
import createDebug from 'debug'

import type { Request } from '@hyperstackjs/hypercontroller'
const debug = createDebug('hyperstack:init-jwt')

export interface JWTProps {
  MustAuthWithJWT: any
  MustAuthRouteWithJWT: any
  signJWT: any
  verifyJWT: any
  currentUser: (req: any) => any
}
const key = 'jwt'
export const getProps = () => context.initializerProps<JWTProps>(key)

export default (
    createLoader: (context: Context) => (payload: any) => Promise<any | null>
  ) =>
  async (context: Context) => {
    const loader = createLoader(context)
    const config = context.config()
    const jwtSecretOrPublicKey = config.controllers!.jwtSecret
    if (!jwtSecretOrPublicKey) {
      throw new Error('No JWT secret is set in configuration')
    }
    const bearer = config.controllers!.bearer || undefined

    const { MustAuthWithJWT, MustAuthRouteWithJWT, signJWT, verifyJWT } =
      authWithJWT({
        secret: jwtSecretOrPublicKey,
        loader,
        bearer,
        jwtOptions: {
          expiresIn: config.controllers!.jwtExpiry || '14d',
          algorithm: config.controllers!.jwtAlgorithm || 'HS512',
        },
      })

    return {
      provideProps() {
        return {
          [key]: {
            MustAuthWithJWT,
            MustAuthRouteWithJWT,
            signJWT,
            verifyJWT,
            currentUser(req: Request) {
              if (!req.user) {
                debug('no user in request')
                throw err('no user')
              }
              return req.user
            },
          },
        }
      },
    }
  }
