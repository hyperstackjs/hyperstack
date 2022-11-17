import path from 'path'
import L from 'lodash'
import { context } from '../src/context'
import { getTasks, taskfileToName, taskmapTable, tieTasks } from '../src/tasks'
describe('tasks', () => {
  it('converts to name', () => {
    ;[
      ['/usr/bin/foo/bar/lib', '/usr/bin/foo/bar/lib/my/task.ts', 'my/task'],
      ['/usr/bin/foo/bar/lib', '/usr/bin/foo/bar/lib/task.ts', 'task'],
      ['/app/lib', '/app/lib/task.js', 'task'],
      [
        '/usr/bin/foo/bar/lib',
        '/usr/bin/foo/bar/lib/my//foo/bar/task.ts',
        'my/foo/bar/task',
      ],
    ].forEach((p) => {
      expect(taskfileToName(p[0], p[1])).toEqual(p[2])
    })
  })
  it('ties tasks', () => {
    context.clear()
    const appRoot = path.join(__dirname, 'fixtures', 'app-e2e')
    context.update('test', {
      app: {
        root: appRoot,
        mode: '',
        environmentFile: '',
      },
    })

    context.setConfig({})
    tieTasks(context)
    const tasks = getTasks(context)
    tasks.root = tasks.root.replace(appRoot, '')
    expect(tasks).toMatchSnapshot()

    context.clear()
    context.update('test', {
      app: {
        root: appRoot,
        mode: '',
        environmentFile: '',
      },
    })
    context.setConfig({})

    L.set(context.config(), 'tasks.root', 'custom-tasks-root')
    tieTasks(context)
    const tasks2 = getTasks(context)
    tasks2.root = tasks2.root.replace(appRoot, '')
    expect(tasks2).toMatchSnapshot()
    expect(taskmapTable(tasks2.root, tasks.map)).toMatchSnapshot()
  })
})
