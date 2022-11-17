import path from 'path'
import { loadConfig, resolveConfig } from '../src/config'

describe('config', () => {
  it('resolve', async () => {
    expect(
      resolveConfig({ exactPath: 'path/to/file.js', appPath: 'app/path' })
    ).toEqual('path/to/file.js')
    expect(resolveConfig({ appPath: 'app/path' })).toEqual(
      'app/path/config/environments/test'
    )
  })
  it('load', async () => {
    expect(
      (
        await loadConfig({
          exactPath: path.join(__dirname, 'fixtures/config/development.js'),
        })
      ).config
    ).toEqual({ some: 'value' })
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    expect(
      (
        await loadConfig({
          appPath: path.join(__dirname, 'fixtures/boot/app-1/src'),
        })
      ).resolvedConfigPath
    ).toMatch(/\/config\/environments\/production/)
    process.env.NODE_ENV = prev
  })
})
