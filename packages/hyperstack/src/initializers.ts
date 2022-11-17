import path from 'path'
import L from 'lodash'
import createDebug from 'debug'
import { load } from './utils'
import type {
  Context,
  InitializerCreator,
  LifecycleHooks,
  LifecycleMap,
} from './types'
import { setters } from './keys'
const debug = createDebug('hyperstack:initializers')

export const initializer = (fn: InitializerCreator) => {
  return fn
}

export const getInitializers = (appRoot: string): InitializerCreator[] => {
  const initpath = path.join(appRoot, 'config/initializers/*.[tj]s')
  return (load(initpath) as InitializerCreator[]) || []
}

export const tieInitializers = async (context: Context) => {
  const appRoot = context.store().app!.root
  const initializerCreators = getInitializers(appRoot)
  const initializers: LifecycleHooks[] = []
  for (const initializerCreator of initializerCreators) {
    initializers.push(await initializerCreator(context))
  }

  // into initializermap, array initializers per lifecycle hook:
  // [{beforeApp:}, {beforeApp:}] -> { beforeApp: [..], ... afterApp: [..]}
  const inits = L.mergeWith({}, ...initializers, (v1: any, v2: any) =>
    L.isUndefined(v1) ? [v2] : [...v1, v2]
  ) as LifecycleMap

  inits.beforeApp && inits.beforeApp.forEach((init) => init())

  const props = {}
  inits.provideProps &&
    inits.provideProps.forEach((provide) => {
      const p = provide()
      debug('providing props: %o', p)
      L.merge(props, p)
    })

  context.update(setters.initializers, {
    initializers: { initializers: inits, props },
  })
}
