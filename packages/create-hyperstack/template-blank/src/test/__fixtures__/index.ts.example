import { appContext } from '../../app'
export const baseFixture = async () => {
  const { User, Note } = appContext.models()
  const alex = await User.createWithPassword({
    username: 'alex@example.com',
    password: 'alex-mighty-password',
    name: 'Alex Van Halen',
  })
  const youGotToRoll = await Note.createWithOwner(alex, {
    content: "you've got to roll with the punches to get what's real",
    title: 'jump',
  })

  const sammy = await User.createWithPassword({
    username: 'sammy@example.com',
    password: 'sammy-mighty-password',
    name: 'Sammy Hagar',
  })
  const youReallyGotMe = await Note.createWithOwner(sammy, {
    content: "you got me so I don't know what I'm doin'",
    title: 'you really got me',
  })
  return { alex, sammy, youReallyGotMe, youGotToRoll }
}
