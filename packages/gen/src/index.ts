import path from 'path'
import { Logger, runner } from 'hygen'
import execa from 'execa'
import { parseAttrs } from './parse-attrs'
const defaultTemplates = path.join(__dirname, 'templates')

export const gen = (argv: string[]) => {
  runner(argv, {
    templates: defaultTemplates,
    cwd: process.cwd(),
    logger: new Logger(console.log.bind(console)), // eslint-disable-line no-console
    debug: !!process.env.DEBUG,
    exec: async (action, _body) => {
      // const opts = body && body.length > 0 ? { input: body } : {}
      const res = await execa(action, {
        shell: true,
      })
      return res
    },
    createPrompter: () => require('enquirer'),
    helpers: {
      parseAttrs,
    },
  }).then(({ success }) => process.exit(success ? 0 : 1))
}
