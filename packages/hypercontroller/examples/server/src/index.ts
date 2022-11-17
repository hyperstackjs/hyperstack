/* eslint-disable no-console */
import { createServer, printRoutes } from '@hyperstackjs/hypercontroller'
import { Api } from './api'
const app = createServer({
  controllers: [Api],
})
printRoutes(app)

const port = process.env.PORT || '3000'
console.log(`listening on ${port}`)
app.listen(port)
