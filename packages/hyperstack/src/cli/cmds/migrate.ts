/* eslint-disable @typescript-eslint/no-var-requires */
export default {
  command: 'migrate',
  describe: 'migrate a database',
  aliases: ['m'],
  builder: {},
  async handler(argv: any) {
    const { root } = argv
    const { useApp } = require('../../')
    return useApp({
      root,
      migrationsMode: 'run',
    })
  },
}
