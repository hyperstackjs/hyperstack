import { test } from '@hyperstackjs/testing'
import L from 'lodash'
import { root } from '../../../config/settings'
import { appContext } from '../../../app'

const {
  requests,
  matchers: { matchRequestWithSnapshot },
} = test(root)

const pid = /.+-.+-.+-.+-.+/
const serializeNote = (note: any) => {
  expect(note.pid).toMatch(pid)
  note.pid = 'test-redacted'
  return note
}
const serializeOneNote = (res: any) => {
  res.body.note = serializeNote(res.body.note)
  return res
}
const serializeNotes = (res: any) => {
  res.body.notes = L.map(res.body.notes, serializeNote)
  return res
}

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })
describe('requests', () => {
  describe('/notes', () => {
    const getToken = async () => {
      const { User } = appContext.models()
      const user = await User.createWithPassword({
        username: 'evh@example.com',
        password: 'mypass-should-login',
        name: 'Eddie Van Halen',
      })
      return { token: user.createAuthenticationToken(), user }
    }
    requests('should list', async (request, _app, _server) => {
      const { token, user } = await getToken()
      const { Note } = appContext.models()
      await Note.createWithOwner(user, {
        content: 'interesting note',
        title: 'this is the title',
      })

      await matchRequestWithSnapshot(
        200,
        request().get('/notes').set(auth(token)),
        { serializer: serializeNotes }
      )
    })
    requests('should get one', async (request, _app, _server) => {
      const { token, user } = await getToken()
      const { Note } = appContext.models()
      const note = await Note.createWithOwner(user, {
        content: 'interesting note',
        title: 'this is the title',
      })

      await matchRequestWithSnapshot(
        200,
        request().get(`/notes/${note.pid}`).set(auth(token)),
        { serializer: serializeOneNote }
      )
    })
    requests('should create', async (request) => {
      const { token } = await getToken()
      await matchRequestWithSnapshot(
        200,
        request()
          .post(`/notes`)
          .set(auth(token))
          .send({ title: 'new note', content: 'dont ask dont know' }),
        { serializer: serializeOneNote }
      )
    })
    requests('should update', async (request) => {
      const { token, user } = await getToken()
      const { Note } = appContext.models()
      const note = await Note.createWithOwner(user, {
        content: 'interesting note',
        title: 'this is the title',
      })

      await matchRequestWithSnapshot(
        200,
        request()
          .post(`/notes/${note.pid}`)
          .set(auth(token))
          .send({ title: 'boring note', content: 'boring content' }),
        { serializer: serializeOneNote }
      )
    })
    requests('should be secure', async (request, _app, _server) => {
      const { user } = await getToken()
      const { Note, User } = appContext.models()
      const mallory = await User.createWithPassword({
        username: 'mallory@example.com',
        password: 'give-me-all-your-stuff',
        name: 'Mallory Vicious',
      })
      const note = await Note.createWithOwner(user, {
        content: 'interesting note',
        title: 'this is the title',
      })

      // no auth
      await matchRequestWithSnapshot(401, request().get(`/notes`))

      // mallory snoops another user's note
      await matchRequestWithSnapshot(
        404,
        request()
          .get(`/notes/${note.pid}`)
          .set(auth(mallory.createAuthenticationToken()))
      )

      // mallory updates another user's note
      await matchRequestWithSnapshot(
        404,
        request()
          .post(`/notes/${note.pid}`)
          .set(auth(mallory.createAuthenticationToken()))
      )
    })
  })
})
