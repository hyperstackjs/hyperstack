import { Mailer } from '../../../../../src'

class WelcomeMailer extends Mailer {
  static defaults = {
    from: `Elle Postage <no-reply@elle-postage.example.com>`,
  }

  static badlySendEmail(_user) {
    return this.mail({ template: 'foobar' })
  }

  static sendWelcome(user) {
    return this.mail({
      template: 'welcome',
      message: {
        to: user.username,
      },
      locals: {
        user,
      },
    })
  }
}

export { WelcomeMailer }
