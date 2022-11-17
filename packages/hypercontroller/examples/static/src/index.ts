import path from 'path'
import { createServer, listen, printRoutes } from '@hyperstackjs/hypercontroller'
import { Api } from './api'

const app = createServer({
  controllers: [Api],
  opts: { staticFolder: path.join(__dirname, '../public') },
})
printRoutes(app)
listen(app)
