import { task } from 'hyperstack'
import jsonexport from 'jsonexport'
import { appContext } from '../../app'

export default task('export notes.', async (args) => {
  const { Note, User } = appContext.models()
  const { username } = args
  if (!username) {
    throw new Error('missing username')
  }
  const user = await User.findOne({ where: { username } })
  if (!user) {
    throw new Error('no such user')
  }
  const notes = await Note.allByOwner(user)

  const csv = await jsonexport(
    notes.map((n) => n.toJSON()),
    { rowDelimiter: '|' }
  )
  return csv
})
