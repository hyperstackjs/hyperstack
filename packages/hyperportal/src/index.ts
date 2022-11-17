/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
import type { Context } from '@hyperstackjs/typings'
import asTable from 'as-table'
import L from 'lodash'
import { bold, gray, green, white } from 'colorette'
const repl = require('node:repl')

const table = asTable.configure({
  title: (x: any) => bold(green(x)),
  delimiter: gray(' | '),
  dash: gray('-'),
})

const serialize = (c: any, serializer: any) => {
  if (L.isArray(c)) {
    return L.map(c, serializer)
  } else {
    return serializer(c)
  }
}
const to = (c: any) => console.log(table(serialize(c, (v: any) => v.toJSON())))
const tr = (c: any) => console.log(table(serialize(c, (v: any) => v.get())))
const oo = (c: any) => console.log(serialize(c, (v: any) => v.toJSON()))
const ro = (c: any) => console.log(serialize(c, (v: any) => v.get()))

export const startPortal = (context: Context) => {
  const models = context.models()
  const controllers = context.controllers()
  const environment = context.environment()
  const printRoutes = context.helpers.printRoutes
  const printJobCounts = context.helpers.printJobCounts
  const replServer = repl.start({
    prompt: `⚡[${bold(green(environment))}] ${bold(white('>'))} `,
  })
  Object.assign(replServer.context, models)
  Object.assign(replServer.context, { to, tr, oo, ro })

  replServer.defineCommand('jobs', {
    help: 'show job counts',
    async action() {
      this.clearBufferedCommand()
      await printJobCounts(context.workers())
      this.displayPrompt()
    },
  })
  replServer.defineCommand('models', {
    help: 'show models',
    action() {
      this.clearBufferedCommand()
      console.log(`${Object.keys(models).join('\n')}`)
      this.displayPrompt()
    },
  })
  replServer.defineCommand('routes', {
    help: 'show routes',
    action(snippets: string) {
      this.clearBufferedCommand()
      printRoutes(controllers, snippets ? [snippets] : undefined)
      this.displayPrompt()
    },
  })
  replServer.defineCommand('saybye', function saybye() {
    console.log('Goodbye!')

    // @ts-expect-error 2683
    this.close()
  })
}
