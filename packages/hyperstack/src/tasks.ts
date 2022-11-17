import path from 'path'
import L from 'lodash'
import { bold, underline, white, yellow } from 'colorette'
import { loadMap } from './utils'
import type { Context, Task, TaskFn, TaskMap } from './types'
import { setters } from './keys'

export const task = (desc: string, fn: TaskFn): Task => {
  return {
    description: desc,
    exec: fn,
  }
}

export const taskmapTable = (tasksRoot: string, taskmap: TaskMap) => {
  return `\n${bold(white('Tasks'))}\n\n${L.map(
    taskmap,
    (v, k) => `${underline(yellow(k))}: ${v.description}`
  ).join('\n')}`
}
export const printTasks = (
  tasksRoot: string,
  taskmap: TaskMap,
  printfn = console.log // eslint-disable-line no-console
) => {
  printfn(taskmapTable(tasksRoot, taskmap))
}
export const loadTasks = (tasksPath: string) => {
  const tasks = path.join(tasksPath, '**/*.[tj]s')
  return loadMap(tasks) || {}
}
export const taskfileToName = (tasksRoot: string, k: string) =>
  path
    .normalize(k)
    .replace(tasksRoot, '')
    .replace(/^[\\/]/, '')
    .replace(/\.[tj]s$/, '')

export const createTasks = (tasksRoot: string): Record<string, Task> => {
  const m = loadTasks(tasksRoot)
  const taskmap = L.mapKeys(m, (_v, k) => taskfileToName(tasksRoot, k))
  return taskmap
}

export const getTasks = (context: Context) => {
  const store = context.store()
  return {
    root: store.tasks!.root,
    map: store.tasks!.map,
  }
}

export const getTaskmap = (context: Context) => {
  return getTasks(context).map
}

export const tieTasks = (context: Context) => {
  const appPath = context.store().app!.root
  const customTasksRoot = context.config().tasks?.root
  const tasksRoot = customTasksRoot
    ? path.join(appPath, customTasksRoot)
    : path.join(appPath, 'lib', 'tasks')
  const taskMap = createTasks(tasksRoot)
  context.update(setters.tasks, {
    tasks: {
      root: tasksRoot,
      map: taskMap,
    },
  })
}
