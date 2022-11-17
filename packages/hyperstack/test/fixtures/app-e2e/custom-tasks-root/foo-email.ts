import { task } from '../../../../src'

export default task('custom task', async ({ context }) => {
  console.log('custom task', context.store().tasks.root) // eslint-disable-line no-console
})
