import { createLogger } from '../src/logger'
describe('logger', () => {
  it('logs pretty', () => {
    const logger = createLogger({ level: 'warn' })
    logger.error({ foo: 1 }, 'testing logger')
    // uncomment to view
    // throw new Error('foo')
  })
})
