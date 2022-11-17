import nodemailer from 'nodemailer'
import { initializer } from 'hyperstack'

export default initializer(async (_context) => ({
  beforeWorkers({ Mailer }) {
    if (process.env.USE_MAILHOG) {
      Mailer.transport = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
      })

      // eslint-disable-next-line no-console
      console.log(
        'Mailer swapping transport to mailhog (find me in initializers/mailer.ts)'
      )
    }
  },
}))
