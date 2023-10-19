/* eslint-disable no-console */
import { initializer } from 'hyperstack'

export default initializer(async (_context: any) => ({
  beforeMiddleware(app: any) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(
        "I'm an annoying middleware top of stack. find me in annoying.ts"
      )
      app.use((_req: any, _res: any, next: any) => {
        console.log(
          "I'm an annoying middleware top of stack. find me in annoying.ts"
        )
        next()
      })
    }
  },
}))
