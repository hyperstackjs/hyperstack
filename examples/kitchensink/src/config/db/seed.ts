import { isDevelopment, isProduction, seed } from 'hyperstack'
import { appContext } from '../../app'

export default seed(async ({ logger }) => {
  if (isDevelopment()) {
    const { User, Note } = appContext.models()
    const alex = await User.createWithPassword({
      username: 'alex@example.com',
      password: 'alex-mighty-password',
      name: 'Alex Van Halen',
    })
    await Note.createWithOwner(alex, {
      content: "you've got to roll with the punches to get what's real",
      title: 'jump',
    })
    const sammy = await User.createWithPassword({
      username: 'sammy@example.com',
      password: 'sammy-mighty-password',
      name: 'Sammy Hagar',
    })
    await Note.createWithOwner(sammy, {
      content: "you got me so I don't know what I'm doin'",
      title: 'you really got me',
    })
    logger.info('seed: done')
  }
  if (isProduction()) {
    logger.info('not seeding production.')
  }
})
