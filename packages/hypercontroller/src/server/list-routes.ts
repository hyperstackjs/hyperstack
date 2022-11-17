import path from 'path'

function getPathFromRegex(regexp: RegExp | string) {
  return regexp
    .toString()
    .replace('/^', '')
    .replace('?(?=\\/|$)/i', '')
    .replace(/\\\//g, '/')
}

function combineStacks(acc: any, stack: any) {
  if (stack.handle.stack) {
    const routerPath = getPathFromRegex(stack.regexp)
    return [
      ...acc,
      ...stack.handle.stack.map((stack: any) => ({ routerPath, ...stack })),
    ]
  }
  return [...acc, stack]
}

function getStacks(app: any) {
  // Express 3
  if (app.routes) {
    // convert to express 4
    return Object.keys(app.routes)
      .reduce((acc, method) => [...acc, ...app.routes[method]] as any, [])
      .map((route) => ({ route: { stack: [route] } }))
  }

  // Express 4
  if (app._router && app._router.stack) {
    return app._router.stack.reduce(combineStacks, [])
  }

  // Express 4 Router
  if (app.stack) {
    return app.stack.reduce(combineStacks, [])
  }

  // Express 5
  if (app.router && app.router.stack) {
    return app.router.stack.reduce(combineStacks, [])
  }

  return []
}

function listRoutes(app: any) {
  const stacks = getStacks(app)
  const routes = []

  if (stacks) {
    for (const stack of stacks) {
      if (stack.route) {
        const routeLogged = {}
        for (const route of stack.route.stack) {
          const method = route.method ? route.method.toUpperCase() : null
          if (!(routeLogged as any)[method] && method) {
            const stackPath =
              stack.routerPath || route.path
                ? path.resolve(
                    [stack.routerPath, stack.route.path, route.path]
                      .filter((s) => !!s)
                      .join('')
                  )
                : stack.route.path
            routes.push({ verb: method, path: stackPath })
            ;(routeLogged as any)[method] = true
          }
        }
      }
    }
  }
  return routes
}

export default listRoutes
