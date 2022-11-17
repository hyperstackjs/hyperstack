import { green, red, yellow } from 'colorette'
import listRoutes from './list-routes'

const spacer = (verb: string, space = 8) => {
  const delta = space - verb.length
  return verb + ' '.repeat(delta)
}
const verbcolor = (verb: string) => {
  if (verb.startsWith('GET')) {
    return green(verb)
  } else if (verb.startsWith('DELETE')) {
    return red(verb)
  } else {
    return yellow(verb)
  }
}
// eslint-disable-next-line no-console
const printRoutes = (app: any, log = console.log) => {
  const routes = listRoutes(app)
  for (const route of routes) {
    log(`${verbcolor(spacer(route.verb))} ${route.path}`)
  }
}
export default printRoutes
