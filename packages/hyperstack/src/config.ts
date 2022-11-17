import path from 'path'
import L from 'lodash'
import createDebug from 'debug'
import type { Config } from '@hyperstackjs/typings'
import { getAppEnvironment } from './context'
import { requireModule } from './utils'
import type { ConfigPaths, Context } from './types'
const debug = createDebug('hyperstack:config')

export const resolveConfig = ({ exactPath, appPath }: ConfigPaths) => {
  if (exactPath) {
    return exactPath
  }
  if (!appPath) {
    throw new Error('app path is empty')
  }
  return path.join(appPath, `config/environments/${getAppEnvironment()}`)
}
export const loadConfig = async (paths: ConfigPaths) => {
  const resolved = resolveConfig(paths)

  const mod = requireModule(resolved)

  // configs are function providing a dict.
  // it's a function because merging modifies the provided dict, and we
  // don't want to fiddle with module cache in case we want live reloads or tests to work
  const config = (await mod()) as Config

  debug('config before overrides is %o', config)
  if (paths.configOverrides) {
    L.merge(config, paths.configOverrides)
  }
  return { config, resolvedConfigPath: resolved }
}

export const tieConfig = async (
  context: Context,
  { exactPath, configOverrides }: ConfigPaths = {}
) => {
  const appPath = context.store().app!.root
  const { config, resolvedConfigPath } = await loadConfig({
    configOverrides,
    exactPath,
    appPath,
  })
  debug('loaded from %o', resolvedConfigPath)
  debug('config is %o', config)
  debug('overrides %o', configOverrides)
  context.setConfig(config)
}
