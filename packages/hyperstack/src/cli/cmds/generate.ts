/* eslint-disable @typescript-eslint/no-var-requires */
export default {
  command: 'generate',
  describe: 'generate code',
  aliases: ['g'],
  builder: {},
  async handler(argv: any) {
    const { gen } = require('@hyperstackjs/gen')
    gen(argv._.slice(1))
  },
}
