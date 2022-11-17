import { test } from '@hyperstackjs/testing'
import { AuthMailer } from '../../app/mailers'
import { root } from '../../config/settings'
import { appContext } from '../../app'

const {
  mailers,
  serializers: { baseMailerSerialize },
} = test(root)
describe('mailers', () => {
  describe('welcome', () => {
    // a 'returns delivery' mailer test
    mailers('should send welcome', async () =>
      AuthMailer.sendWelcome({
        username: 'joe@example.com',
        name: 'joe',
      })
    )
    // a manual mailer test
    mailers('should send welcome: manual', async () => {
      // can grab from app context
      const { AuthMailer } = appContext.mailers()
      AuthMailer.clearDeliveries()
      await AuthMailer.sendWelcome({
        username: 'joe@example.com',
        name: 'joe',
      }).deliver()
      expect(AuthMailer.deliveries().map(baseMailerSerialize)).toMatchSnapshot()
    })
  })
})
