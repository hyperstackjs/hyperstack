import Redis from 'ioredis'
import { HyperWorker } from '../../src'
import { BullmqBackend } from '../../src/backend'
import { logger } from '../utils'
import { Downloader } from './fixtures/downloader'
import 'email-templates'

jest.setTimeout(60000)
const sleep = (t: number) =>
  new Promise((resolve, _reject) => setTimeout(() => resolve(true), t))

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

describe('bullmq', () => {
  it('should work', async () => {
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
    await redis.del('downloaded')

    const magicNumber = Math.random().toString()
    Downloader.magicNumber = magicNumber
    Downloader.redis = redis
    HyperWorker.logger = logger as any
    const b = new BullmqBackend([Downloader], redis, {})
    await b.processJobs()
    Downloader.performLater('foobar')
    await sleep(4000) // give the worker time to work

    expect(await redis.get('downloaded')).toEqual(magicNumber)
    await b.stop()
  })
})
