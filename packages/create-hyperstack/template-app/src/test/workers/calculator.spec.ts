import { test } from '@hyperstackjs/testing'
import { root } from '../../config/settings'
import { Calculator } from '../../app/workers/calculator'

const { workers } = test(root)

describe('workers', () => {
  describe('downloader', () => {
    workers('should calculate, inprocess', async (_app) => {
      const res = await Calculator.performNow({ number: 30 })
      expect(res).toMatchSnapshot()

      const res2 = await Calculator.performLater({ number: 30 })
      expect(res2).toMatchSnapshot()
    })
  })
})
