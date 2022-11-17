import type { App } from '../../types'

/* eslint-disable @typescript-eslint/no-var-requires */
export default {
  command: 'portal',
  describe: 'open a portal to your app as a REPL',
  aliases: ['p'],
  builder: {},
  async handler(argv: any) {
    const { usePortal } = require('../../')
    const { startPortal } = require('@hyperstackjs/hyperportal')
    const { root } = argv
    return usePortal(
      {
        root,
      },
      async ({ context }: App) => {
        await startPortal(context)
      }
    )
  },
}
