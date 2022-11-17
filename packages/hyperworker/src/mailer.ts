/* eslint-disable @typescript-eslint/no-var-requires */
import nodemailer from 'nodemailer'
import createDebug from 'debug'
// @ts-expect-error 7016
import { interactsWithMail, stubTransport } from 'nodemailer-stub'
import { HyperWorker, queueAs } from './worker'
import type { MailerSettings } from './types'
const debug = createDebug('hyperworker:mailer')

/*
1. renderer (takes template path, then render takes params)
2. transport (nodemailer)
*/

class MailDelivery {
  constructor(private MailerType: typeof Mailer, private details: any) {}

  async deliver() {
    if (!HyperWorker.logger) {
      throw new Error('Logger is not configured. Did the app boot correctly?')
    }

    const { cyan, bold } = HyperWorker.logger.colors
    const pref = bold(cyan('mailers:'))
    HyperWorker.logger.info(
      `${pref} ${this.MailerType.name} delivering`,
      this.details
    )
    return this.MailerType.performNow(this.details)
  }

  async deliverLater() {
    if (!HyperWorker.logger) {
      throw new Error('Logger is not configured. Did the app boot correctly?')
    }
    const { cyan, bold } = HyperWorker.logger.colors
    const pref = bold(cyan('mailers:'))
    HyperWorker.logger.info(
      `${pref} ${this.MailerType.name} delivering later`,
      this.details
    )
    return this.MailerType.performLater(this.details)
  }
}

@queueAs('mails')
class Mailer extends HyperWorker {
  static transport: any | null = null

  static send = false

  static preview = false

  static templatesRoot: string | null = null

  // <testing> mailer stub only convenience
  static clearDeliveries() {
    interactsWithMail.flushMails()
  }

  static deliveries() {
    return interactsWithMail.mails
  }

  static lastMail() {
    return interactsWithMail.lastMail()
  }
  // </testing>

  static clear(): void {
    this.transport = null
    this.send = false
    this.preview = false
    this.templatesRoot = null
  }

  static defaults = {
    from: 'Joe <mailer@example.com>',
  }

  static initMailer({
    templatesRoot,
    settings,
  }: {
    templatesRoot: string
    settings: MailerSettings
  }) {
    this.templatesRoot = templatesRoot
    if (settings) {
      this.send = !!settings.send
      this.preview = !!settings.preview
      if (settings.delivery === 'test') {
        this.transport = stubTransport
      } else if (settings.delivery === 'smtp') {
        this.transport = nodemailer.createTransport(settings.smtpSettings)
      }
    }
  }

  static setNone() {
    this.send = false
    this.preview = false
    this.transport = null
  }

  static setTest() {
    this.send = true
    this.preview = false
    this.transport = stubTransport
  }

  static setDevelopment() {
    this.send = false
    this.preview = true
    this.transport = null
  }

  static setProduction() {
    this.send = true
    this.preview = false
  }

  async perform({ data }: any) {
    if (!HyperWorker.logger) {
      throw new Error('Logger is not configured. Did the app boot correctly?')
    }
    if (!Mailer.templatesRoot) {
      throw new Error('please set Mailer.templatesRoot')
    }
    // lazy because it takes lots of time to load eagerly
    const Email = require('email-templates')
    debug(`mailer: send settings '%o'`, {
      send: Mailer.send,
      preview: Mailer.preview,
    })
    const tmpl = new Email({
      views: { root: Mailer.templatesRoot, options: { extension: 'ejs' } },
      transport: Mailer.transport || { jsonTransport: true },
      send: Mailer.send,
      preview: Mailer.preview,
      juice: false,
    })

    try {
      debug(`mailer: perform '%o'`, data)
      const res = await tmpl.send(data)

      const { cyan, bold } = HyperWorker.logger.colors
      const pref = bold(cyan('mailers:'))
      HyperWorker.logger.info(
        `${pref} delivered email to: ${data.message.to}`,
        res
      )
      return res
    } catch (e: any) {
      HyperWorker.logger.error(e)
      HyperWorker.reportError(e)
    }
  }

  static mail(details: any, _opts: any = {}) {
    details.message = { ...this.defaults, ...details.message }
    return new MailDelivery(this, details)
  }

  get logger() {
    return HyperWorker.logger
  }
}

export { Mailer, MailDelivery }
