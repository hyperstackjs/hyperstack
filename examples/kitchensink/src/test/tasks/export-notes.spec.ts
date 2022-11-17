import { test } from '@hyperstackjs/testing'
import ExportNotes from '../../lib/tasks/export-notes'
import { appContext } from '../../app'

import { root } from '../../config/settings'

const { tasks } = test(root)

const pid = /\|.+-.+-.+-.+-.+/

describe('tasks', () => {
  describe('export-notes', () => {
    tasks('should work', async (app) => {
      const { User, Note } = appContext.models()
      const user = await User.createWithPassword({
        username: 'evh@example.com',
        password: 'mypass-should-login',
        name: 'Eddie Van Halen',
      })
      await Note.createWithOwner(user, {
        content: 'interesting note',
        title: 'this is the title',
      })
      expect(
        (await ExportNotes.exec({ username: user.username }, app)).replace(
          pid,
          'test-redacted'
        )
      ).toMatchSnapshot()
    })
  })
})
