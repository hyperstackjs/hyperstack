/* eslint-disable @typescript-eslint/no-var-requires */
export default {
  command: 'seed',
  describe: 'seed a database',
  aliases: ['d'],
  builder: {},
  async handler(argv: any) {
    const { root } = argv
    const { useSeed } = require('../../')
    return useSeed({
      root,
    })
  },
}
