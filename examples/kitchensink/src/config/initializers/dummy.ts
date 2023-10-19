import { initializer } from 'hyperstack'

export default initializer(async (_context) => ({
  beforeControllers(_app) {
    if (process.env.NODE_ENV !== 'test') {
      console.log('dummy initializer: before controllers hook') // eslint-disable-line no-console
    }
  },
  afterControllers(_app) {
    if (process.env.NODE_ENV !== 'test') {
      console.log('dummy initializer: after controllers hook') // eslint-disable-line no-console
    }
  },
}))
