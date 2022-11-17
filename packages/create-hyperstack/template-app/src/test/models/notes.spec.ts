import { test } from '@hyperstackjs/testing'
import L from 'lodash'
import { root } from '../../config/settings'
import { appContext } from '../../app'
import { baseFixture } from '../__fixtures__'

const { models } = test(root)

const serializeModel = (m: any) => {
  return L.omit(m.toJSON(), ['pid', 'ownerId'])
}

describe('models', () => {
  describe('note', () => {
    models('should create with owner', async (_app) => {
      const { alex } = await baseFixture()
      const { Note } = appContext.models()
      const note = await Note.createWithOwner(alex, {
        title: 'a note',
        content: 'this and that',
      })
      expect(note.ownerId).toEqual(alex.id)
      expect(serializeModel(note)).toMatchSnapshot()
    })
    models('should list by owner', async (_app) => {
      const { alex } = await baseFixture()
      const { Note } = appContext.models()
      const notes = await Note.allByOwner(alex)
      expect(notes.map(serializeModel)).toMatchSnapshot()
    })
    models('should find by owner', async (_app) => {
      const { alex, sammy, youReallyGotMe } = await baseFixture()
      const { Note } = appContext.models()
      const note = await Note.oneByOwner(sammy, { pid: youReallyGotMe.pid })
      expect(
        await Note.oneByOwner(alex, { pid: youReallyGotMe.pid })
      ).toBeNull()
      expect(serializeModel(note)).toMatchSnapshot()
    })
  })
})
