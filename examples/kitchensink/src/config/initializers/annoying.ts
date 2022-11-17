import { initializer } from 'hyperstack'

export default initializer(async (_context: any) => ({
  beforeMiddleware(app: any) {
    // eslint-disable-next-line no-console
    console.log(
      "I'm an annoying middleware top of stack. find me in annoying.ts"
    )
    app.use((_req: any, _res: any, next: any) => {
      // eslint-disable-next-line no-console
      console.log(
        "I'm an annoying middleware top of stack. find me in annoying.ts"
      )
      next()
    })
  },
}))
