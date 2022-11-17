import path from 'path'
import { buildWorkers } from '../src'
import type { MailerSettings } from '../src/types'
import { WelcomeMailer } from './fixtures/mailers/welcome'
import { logger } from './utils'
import 'email-templates'

const sleep = (t: number) =>
  new Promise((resolve, _reject) => setTimeout(() => resolve(true), t))
const tieWorkers = async ({
  reportError,
  mailerSettings = undefined,
  beforeWorkers = null,
}: {
  reportError: any
  mailerSettings?: MailerSettings
  beforeWorkers: any
}) => {
  const workersGlob = path.join(__dirname, 'backends', 'fixtures', '*.ts')
  const mailersGlob = path.join(__dirname, 'fixtures', 'mailers', '*.ts')
  const mailerTemplatesRoot = path.join(__dirname, 'fixtures', 'mailers')
  const bw =
    beforeWorkers ||
    (({
      HyperWorker: SomeHW,
      Mailer: SomeMLR,
    }: {
      HyperWorker: any
      Mailer: any
    }) => {
      SomeMLR.setTest()
      SomeHW.setTest(reportError)
    })
  return buildWorkers(
    {
      isInProcess: true,
      workersGlob,
      mailersGlob,
      mailerTemplatesRoot,
      mailerSettings,
      logger,
      beforeWorkers: bw,
    },
    'duplex'
  )
}

describe('worker: inprocess', () => {
  it('should build workers', async () => {
    WelcomeMailer.clearDeliveries()
    const reportError = jest.fn()
    await tieWorkers({ reportError } as any)
    WelcomeMailer.sendWelcome({
      username: 'joe@example.com',
      firstName: 'Smithy',
    }).deliverLater()

    // give template file reading some time, done instead of await'ing the delivery, because in real life controllers we won't be awaiting that.
    // we also lazy load email sending so...
    await sleep(1000)
    expect(WelcomeMailer.deliveries().length).toEqual(1)
    const lastMail = WelcomeMailer.deliveries()[0]

    expect(lastMail.envelope).toMatchSnapshot()
    expect(reportError).toHaveBeenCalledTimes(0)
  })
  it('should not send if send=false', async () => {
    WelcomeMailer.clearDeliveries()
    const reportError = jest.fn()
    await tieWorkers({
      reportError,
      beforeWorkers: () => {}, // avoids setting up test mode
      mailerSettings: { preview: false, send: false },
    })
    WelcomeMailer.sendWelcome({
      username: 'joe@example.com',
      firstName: 'Smithy',
    }).deliverLater()

    // give template file reading some time, done instead of await'ing the delivery, because in real life controllers we won't be awaiting that.
    await sleep(1000)

    expect(WelcomeMailer.deliveries().length).toEqual(0)
    expect(reportError).toHaveBeenCalledTimes(0)
  })
  it('should throw error from mailer direct, when inprocess', async () => {
    WelcomeMailer.clearDeliveries()
    const reportError = jest.fn()
    await tieWorkers({
      reportError,
    } as any)
    WelcomeMailer.badlySendEmail({
      username: 'joe@example.com',
      firstName: 'Smithy',
    }).deliverLater()

    await sleep(300)

    expect(WelcomeMailer.deliveries().length).toEqual(0)
    expect(reportError).toHaveBeenCalledTimes(1)
  })
})
