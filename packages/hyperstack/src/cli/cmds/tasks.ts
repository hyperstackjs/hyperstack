/* eslint-disable @typescript-eslint/no-var-requires */
export default {
  command: 'tasks',
  describe: 'run a task',
  aliases: ['t'],
  builder: {
    list: {
      default: false,
      boolean: true,
      describe: 'show task list',
    },
  },
  async handler(argv: any) {
    const { root } = argv
    const { useTasks } = require('../../')
    return useTasks(
      {
        root,
      },
      { ...argv, _: argv._.splice(1) } // remove 'tasks' command
    )
  },
}
