import { task } from 'hyperstack'
import { appContext } from '../../app'
import { AuthMailer } from '../../app/mailers/auth'

export default task('send a reset password email.', async (args) => {
  const { User } = appContext.models()
  const { username } = args
  const user = await User.findOne({ where: { username } })
  if (!user) {
    throw new Error('no such user')
  }
  await AuthMailer.forgotPassword(user).deliverLater()
  return { ok: true }
})
