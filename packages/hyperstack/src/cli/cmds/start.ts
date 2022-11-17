import type { App } from '../../types'

/* eslint-disable @typescript-eslint/no-var-requires */
export default {
  command: 'start',
  describe: 'start a server, worker or both (default both)',
  aliases: ['s'],
  builder: {
    worker: {
      default: false,
      boolean: true,
      describe: 'background job processing only',
    },
    stats: {
      default: false,
      boolean: true,
      describe: 'print stats and exit',
    },
    server: {
      default: false,
      boolean: true,
      describe:
        'serve traffic but no background job processing (can enqueue jobs)',
    },
  },
  async handler(argv: any) {
    const { runApp, useWorkers } = require('../../')
    const { worker, server, root, stats } = argv
    if (worker) {
      return useWorkers(
        {
          root,
        },
        async ({ context }: App) => {
          const store = context.store()
          const logger = store.logger
          logger.info('running in worker mode')
          const bg = store.workers?.background
          if (bg === 'inprocess') {
            logger.warn(
              'you are running workers inprocess (workers.inprocess=true), worker runner does not make sense.'
            )
          }
          if (stats) {
            await context.helpers.printJobCounts(context.workers())
            process.exit(0)
          }
        }
      )
    } else {
      return runApp({
        root,
        workersMode: server ? 'producer' : 'duplex',
      })
    }
  },
}
