import path from 'path'
import { context } from '../src/context'
import { getInitializers, tieInitializers } from '../src/initializers'

describe('initializers', () => {
  it('loads', async () => {
    const inits = []
    const creators = getInitializers(
      path.join(__dirname, 'fixtures', 'boot', 'app-1', 'src')
    )
    for (const creator of creators) {
      inits.push(await creator({} as any))
    }
    expect(inits).toEqual([{ first: 1 }, { second: 2 }])
  })
  it('ties', async () => {
    context.clear()
    context.update('test', {
      app: {
        root: path.join(__dirname, 'fixtures', 'boot', 'app-1', 'src'),
        mode: '',
        environmentFile: '',
      },
    })
    await tieInitializers(context)
    expect(context.store().initializers?.initializers).toEqual({
      first: [1],
      second: [2],
    })
  })
})
