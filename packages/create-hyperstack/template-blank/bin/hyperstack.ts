/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path'

if (process.env.HST_LOAD_BENCH) {
  require('time-require')
}
require('tsconfig-paths/register')

const { cli } = require('hyperstack')

cli(path.join(__dirname, '..', 'src'), process.argv).catch((e: Error) => {
  console.log('error', e.toString())
  process.exit(1)
})
