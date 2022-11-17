import path from 'path'
// @ts-expect-error ts(7016)
import { interactsWithMail as iwm } from 'nodemailer-stub'
import { HyperWorker, Mailer } from '../src'
import { WelcomeMailer } from './fixtures/mailers/welcome'
import { logger } from './utils'
import 'email-templates'

describe('mailer', () => {
  beforeEach(() => {
    iwm.flushMails()
  })
  afterEach(() => {
    iwm.flushMails()
  })
  it('should email', async () => {
    HyperWorker.logger = logger as any
    Mailer.templatesRoot = path.join(__dirname, 'fixtures', 'mailers')
    const res = await WelcomeMailer.sendWelcome({
      username: 'juan@fangio.example.com',
      firstName: 'Juan',
    }).deliver()
    res.message = res.message.replace(res.messageId, 'msg-id')
    res.messageId = 'msg-id'
    expect(res).toMatchSnapshot()
  })
  it('should use a transport', async () => {
    Mailer.setTest()
    Mailer.templatesRoot = path.join(__dirname, 'fixtures', 'mailers')
    await WelcomeMailer.sendWelcome({
      username: 'juan@fangio.example.com',
      firstName: 'Juan',
    }).deliver()
  })
})
