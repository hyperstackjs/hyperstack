/* eslint-disable @typescript-eslint/no-var-requires */
import yargs from 'yargs'

export const cli = async (root: string, argv: string[]) => {
  return await yargs(argv.slice(2))
    .config({ root })
    .command(require('./cmds/migrate').default)
    .command(require('./cmds/generate').default)
    .command(require('./cmds/seed').default)
    .command(require('./cmds/routes').default)
    .command(require('./cmds/start').default)
    .command(require('./cmds/portal').default)
    .command(require('./cmds/tasks').default)
    .demandCommand()
    .help().argv
}
