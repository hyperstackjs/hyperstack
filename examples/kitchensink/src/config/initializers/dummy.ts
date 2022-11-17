import { initializer } from 'hyperstack'

export default initializer(async (_context) => ({
  beforeControllers(_app) {
    console.log('dummy initializer: before controllers hook') // eslint-disable-line no-console
  },
  afterControllers(_app) {
    console.log('dummy initializer: after controllers hook') // eslint-disable-line no-console
  },
}))
