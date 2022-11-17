import createDebug from 'debug'
import { task } from '../../../../../src'
const debug = createDebug('weekly-emails')

export default task('send a weekly email.', async ({ context }) => {
  console.log('running task') // eslint-disable-line no-console
  debug('from task: %o', context.store().tasks.root)
  return 'result for weekly email'
})
