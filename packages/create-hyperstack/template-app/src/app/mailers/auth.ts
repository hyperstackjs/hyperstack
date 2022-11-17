import { Mailer } from 'hyperstack'
import type { User } from '../models/user'

class AuthMailer extends Mailer {
  static defaults = {
    from: `Elle Postage <no-reply@elle-postage.example.com>`,
  }

  static forgotPassword(user: Partial<User>) {
    return this.mail({
      template: 'auth/forgot',
      message: {
        to: user.username,
      },
      locals: {
        resetToken: user.resetToken,
        name: user.name,
      },
    })
  }

  static sendWelcome(user: Partial<User>) {
    return this.mail({
      template: 'auth/welcome',
      message: {
        to: user.username,
      },
      locals: {
        verifyToken: user.emailVerificationToken,
        name: user.name,
      },
    })
  }
}

export { AuthMailer }
