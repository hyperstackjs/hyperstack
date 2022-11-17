import { test } from '@hyperstackjs/testing'
import { root } from '../../config/settings'
import { Downloader } from '../../app/workers/downloader'
import { Calculator } from '../../app/workers/calculator'

const {
  workers,
  containers: { withRedis },
} = test(root)

const sleep = (t: any) =>
  new Promise((resolve, _reject) => setTimeout(() => resolve(true), t))

const workersWithRedis = withRedis(workers, {})

describe('workers', () => {
  describe('downloader', () => {
    workersWithRedis('should download', async (_app) => {
      const magicNumber = Math.random().toString()
      Downloader.magicNumber = magicNumber
      Downloader.performLater('foobar')
      await sleep(1000)
      expect(await Downloader.backend!.connection.get('downloaded')).toEqual(
        magicNumber
      )
    })
    workers('should calculate, inprocess', async (_app) => {
      const res = await Calculator.performNow({ number: 30 })
      expect(res).toMatchSnapshot()

      const res2 = await Calculator.performLater({ number: 30 })
      expect(res2).toMatchSnapshot()
    })
  })
})
