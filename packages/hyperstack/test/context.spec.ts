import {
  context,
  getEnvironment,
  isDevelopment,
  isProduction,
  isTest,
} from '../src/context'

describe('context', () => {
  it('updates & clears', async () => {
    context.update('test', {
      app: { root: 'foobar', mode: 'baz', environmentFile: 'bar' },
    })
    expect(context.store().app?.environmentFile).toBeTruthy()
    context.clear()
    expect(context.store().app?.environmentFile).toBeUndefined()
  })
  it('get env', async () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    expect(getEnvironment()).toEqual('development')
    process.env.NODE_ENV = 'illegal/stuff-and.that'
    expect(getEnvironment()).toEqual('illegalstuff-andthat')
    process.env.NODE_ENV = prev
  })
  it('environments', async () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    expect(isDevelopment()).toEqual(true)
    expect(isProduction()).toEqual(false)
    expect(isTest()).toEqual(false)
    process.env.NODE_ENV = 'nothing-meaningful'
    expect(isDevelopment()).toEqual(true)

    process.env.NODE_ENV = 'test'
    expect(isTest()).toEqual(true)
    expect(isDevelopment()).toEqual(false)
    expect(isProduction()).toEqual(false)
    process.env.NODE_ENV = 'test_'
    expect(isTest()).toEqual(false)

    process.env.NODE_ENV = 'production'
    expect(isProduction()).toEqual(true)
    expect(isTest()).toEqual(false)
    expect(isDevelopment()).toEqual(false)
    process.env.NODE_ENV = 'production_'
    expect(isProduction()).toEqual(false)

    process.env.NODE_ENV = prev
  })
})
