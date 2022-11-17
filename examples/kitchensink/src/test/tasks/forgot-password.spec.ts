import { test } from '@hyperstackjs/testing'
import ForgotPassword from '../../lib/tasks/forgot-password'
import { appContext } from '../../app'

import { root } from '../../config/settings'

const { tasks } = test(root)

describe('tasks', () => {
  describe('forgot-password', () => {
    tasks('should work', async (app) => {
      const { User } = appContext.models()
      const user = await User.createWithPassword({
        username: 'evh@example.com',
        password: 'mypass-should-login',
        name: 'Eddie Van Halen',
      })
      expect(
        await ForgotPassword.exec({ username: user.username }, app)
      ).toMatchSnapshot()
    })
  })
})
