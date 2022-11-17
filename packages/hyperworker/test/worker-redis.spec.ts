import path from 'path'
// @ts-expect-error 7016
import { interactsWithMail as iwm } from 'nodemailer-stub'
import Redis from 'ioredis'
import { HyperWorker, buildWorkers, queueAs } from '../src'
import type { BullmqBackend } from '../src/backend'
import { WelcomeMailer } from './fixtures/mailers/welcome'
import { logger } from './utils'
import 'email-templates'

jest.setTimeout(10000)
const sleep = (t: number) =>
  new Promise((resolve, _reject) => setTimeout(() => resolve(true), t))

class Overrider extends HyperWorker {
  static get queueName() {
    return 'look-at-me'
  }

  perform(_opts: any) {
    // upload
  }
}

class Uploader extends HyperWorker {
  perform(_opts: any) {
    // upload
  }
}

@queueAs('downloads')
class Downloader extends HyperWorker {
  perform(_opts: any) {
    // download
  }
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

describe('worker', () => {
  beforeEach(async () => {
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
    await redis.del('*')
    await redis.quit()
    await sleep(1000)
  })
  it('api', () => {
    Downloader.reportError = () => {}
    Downloader.enqueue = () => {}
    const enqueue = jest.spyOn(Downloader, 'enqueue')
    Downloader.performLater({})
    expect(enqueue).toBeCalledTimes(1)

    Downloader.enqueue = () => {}
    const enqueue2 = jest.spyOn(Downloader, 'enqueue')
    Downloader.performNow({})
    expect(enqueue2).toBeCalledTimes(0)

    const dl = new Downloader()
    dl.perform({})
    expect(Downloader.queueName).toEqual('downloads')
    expect(Uploader.queueName).toEqual('uploader')
    expect(Overrider.queueName).toEqual('look-at-me')
  })

  it('should build workers', async () => {
    Downloader.reportError = () => {}
    // use initializers: add stub transport, add mock report errors, use a failing worker to induce error
    // verify wiring

    const reportError = jest.fn()
    const { backend } = await buildWorkers(
      {
        isInProcess: false,
        workersGlob: path.join(__dirname, 'backends', 'fixtures', '*.ts'),
        mailersGlob: path.join(__dirname, 'fixtures', 'mailers', '*.ts'),
        mailerTemplatesRoot: path.join(__dirname, 'fixtures', 'mailers'),
        mailerSettings: {
          send: true,
          preview: false,
          delivery: 'test',
        },
        logger,
        redisUrl,
        beforeWorkers: ({ HyperWorker: SomeHW, Mailer: SomeMLR }) => {
          SomeMLR.setTest()
          SomeHW.reportError = reportError
        },
      },
      'duplex'
    )
    expect(WelcomeMailer.queue).toBeTruthy()
    expect(WelcomeMailer.enqueue).toBeTruthy()
    iwm.flushMails()
    WelcomeMailer.sendWelcome({
      username: 'joe@example.com',
      firstName: 'Smithy',
    }).deliverLater()
    await sleep(4000)

    const lastMail = iwm.lastMail()
    expect(lastMail.envelope).toMatchSnapshot()
    expect(reportError).toHaveBeenCalledTimes(0)
    const counts = await WelcomeMailer.jobCounts()
    expect(counts).toMatchSnapshot()

    await (backend as BullmqBackend).stop() // impl. inprocessbackend so we can call stop blindly
  })
  it('should reportError when mailer throws when in queue mode', async () => {
    Downloader.reportError = () => {}

    const reportError = jest.fn()
    const { backend } = await buildWorkers(
      {
        isInProcess: false,
        workersGlob: path.join(__dirname, 'backends', 'fixtures', '*.ts'),
        mailersGlob: path.join(__dirname, 'fixtures', 'mailers', '*.ts'),
        mailerTemplatesRoot: path.join(__dirname, 'fixtures', 'mailers'),
        mailerSettings: {
          send: true,
          preview: false,
          delivery: 'test',
        },
        logger,
        redisUrl,
        beforeWorkers: ({ HyperWorker: SomeHW, Mailer: SomeMLR }) => {
          SomeMLR.setTest()
          SomeHW.reportError = reportError
        },
      },
      'duplex'
    )
    iwm.flushMails()
    WelcomeMailer.badlySendEmail({
      username: 'joe@example.com',
      firstName: 'Smithy',
    }).deliverLater()
    await sleep(1000)
    const lastMail = iwm.lastMail()
    expect(lastMail).toBeUndefined()

    expect(reportError).toHaveBeenCalledTimes(1)

    await (backend as BullmqBackend).stop() // impl. inprocessbackend so we can call stop blindly
  })
})
