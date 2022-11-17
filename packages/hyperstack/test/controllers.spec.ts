import path from 'path'
import { context, tieApp } from '../src/context'
import { getControllerConfig, tieControllers } from '../src/controllers'
import { tieConfig } from '../src/config'
import { tieInitializers } from '../src/initializers'
import { tieLogger } from '../src/logger'

describe('controllers', () => {
  it('configures tie', async () => {
    const prev = process.env.NODE_ENV
    for (const env of ['development', 'developmentnullish']) {
      process.env.NODE_ENV = env
      context.clear()
      const appRoot = path.join(__dirname, 'fixtures', 'app-e2e')
      tieApp(context, appRoot)
      tieConfig(context, {})
      await tieInitializers(context)
      tieLogger(context)

      const cfg = getControllerConfig(context)
      expect(cfg.logging).toBeTruthy()
      expect(
        cfg.initializers?.initializers.beforeControllers!.length
      ).toBeGreaterThan(0)
      expect(
        cfg.initializers?.initializers.afterControllers!.length
      ).toBeGreaterThan(0)

      cfg.logging.logger = 'test-was-ok'
      if (cfg.staticFolder) {
        cfg.staticFolder = cfg.staticFolder.toString().replace(/^.*hyperstack/, '')
      }

      expect(cfg).toMatchSnapshot(`controllers-snap-${env}`)
    }
    process.env.NODE_ENV = prev
  })
  it('ties', async () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    // want to see an app controller in context
    context.clear()
    const appRoot = path.join(__dirname, 'fixtures', 'app-e2e')
    tieApp(context, appRoot)
    tieConfig(context, {})
    await tieInitializers(context)
    tieLogger(context)
    await tieControllers(context)
    const app = context.store().controllers?.app

    // shape feels like an express app
    expect(Object.keys(app)).toMatchSnapshot()

    process.env.NODE_ENV = prev
  })
})
