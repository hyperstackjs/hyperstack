/* eslint-disable no-console */
import L from 'lodash'
import type { App } from '../../types'

// const classMetaKey = Symbol('Class Metadata Key')
/* eslint-disable @typescript-eslint/no-var-requires */
export default {
  command: 'routes',
  describe: 'display app routes',
  aliases: ['r'],
  builder: {
    snippets: {
      default: 'shell_curl',
      string: true,
      describe: 'print request snippets',
    },
    spec: {
      boolean: true,
      describe: 'export to OpenAPI',
    },
  },
  async handler(argv: any) {
    const { root, snippets, spec } = argv
    const snips = L.castArray(snippets)
    const { printRoutesV2, exportRoutes } = require('../../utils')
    const { useControllers } = require('../../')
    return useControllers(
      {
        root,
      },
      ({ context }: App) => {
        const controllers = context.controllers()
        printRoutesV2(controllers, snips)
        if (spec) {
          const fname = 'routes.json'
          exportRoutes(controllers, fname)
          console.log(`export: wrote ${fname}`)
        }
      }
    )
  },
}
