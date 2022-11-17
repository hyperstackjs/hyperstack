import type {
  App,
  Config,
  ConfigPaths,
  Context,
  LifecycleHooks,
  LifecycleMap,
  Logger,
  Task,
  TaskFn,
  TaskMap,
} from '@hyperstackjs/typings'
import type { WorkerTypes, WorkersMode } from '@hyperstackjs/hyperworker'
export {
  Context,
  App,
  WorkersMode,
  WorkerTypes,
  Logger,
  ConfigPaths,
  Config,
  LifecycleHooks,
  LifecycleMap,
  Task,
  TaskFn,
  TaskMap,
}

export type ControllersMode = 'auto' | 'none'
export type MigrationsMode = 'auto' | 'none'

export interface AppOptions {
  root: string
  configFile?: string
  configOverrides?: any
  workersMode?: WorkersMode
  migrationsMode?: MigrationsMode
  showBanner?: boolean
  isTask?: boolean
}

export type Initializer = (context: Context) => Promise<void | LifecycleHooks>

export type InitializerCreator = (context: Context) => Promise<LifecycleHooks>
