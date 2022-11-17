/* eslint-disable no-console */
import fs from 'fs'
import glob from 'glob'
import {
  bold,
  cyanBright,
  gray,
  green,
  magenta,
  magentaBright,
  red,
  underline,
  white,
  whiteBright,
  yellow,
} from 'colorette'
import L from 'lodash'
import {
  asOpenAPIPath,
  getRouteMap,
  getRouteSnippets,
  routemapToOpenAPI,
} from '@hyperstackjs/hypercontroller'
import asTable from 'as-table'
import { getJobCounts } from '@hyperstackjs/hyperworker'
import type { Context } from './types'

export const sleep = (t: number) =>
  new Promise((resolve, _reject) => setTimeout(() => resolve(true), t))

export const requireModule = (f: string) => {
  let mod = null
  try {
    mod = require(f)
  } catch (e: any) {
    console.log(`error dynamically loading '${f}'\n${e.toString()}`)
    throw e
  }
  return mod.default || mod
}
export const load = (patt: string) =>
  L.sortBy(glob.sync(patt), L.identity).map(requireModule)

export const loadMap = (patt: string) =>
  L.sortBy(glob.sync(patt), L.identity).reduce((acc: any, f: string) => {
    acc[f] = requireModule(f)
    return acc
  }, {})

export const exportRoutes = (controllers: any, toFile: string) => {
  const routemap = getRouteMap(controllers)
  const spec = routemapToOpenAPI(routemap)
  fs.writeFileSync(toFile, JSON.stringify(spec.getSpec(), null, 2))
}

const snipmap: Record<string, string> = {
  wget: 'shell_wget',
  curl: 'shell_curl',
  httpie: 'shell_httpie',
}
const normalizeSnippets = (snip: string) => snipmap[snip] || snip

export const printJobCounts = async (workers: any) => {
  const counts = await getJobCounts(Object.values(workers))
  console.log(
    asTable.configure({
      print: (v, k) => {
        if (k === 'name') {
          return bold(yellow(v)).toString()
        } else if (k === 'failed') {
          return red(v).toString()
        } else if (k === 'active') {
          return yellow(v).toString()
        } else if (k === 'completed') {
          return green(v).toString()
        } else {
          return gray(v).toString()
        }
      },
    })(counts)
  )
}

export const printRoutesV2 = (controllers: any, snippets: string[] = []) => {
  const routemap = getRouteMap(controllers)

  // print the route map
  L.forEach(routemap, (mapping: any, ctl: string) => {
    console.log(`${green(ctl)} ${gray(mapping.path)}`)
    mapping.actions.forEach((action: any) => {
      action.routes.forEach((route: any) => {
        const verb = route.verb
        const path = asOpenAPIPath(route.parsedPath)
        console.log(`  ${yellow(verb.toUpperCase())}\t${whiteBright(path)}`)
        if (snippets && snippets.length > 0) {
          const snips = getRouteSnippets(
            routemap,
            verb,
            path,
            snippets.map(normalizeSnippets)
          )
          snips.snippets.forEach((snip: any) => {
            console.log(``)
            console.log(`${underline(bold(white(snip.title)))}`)
            console.log(`${gray(snip.content)}`)
            console.log(``)
          })
        }
      })
    })
    console.log('\n')
  })
}
export const printBanner = (context: Context, print: (s: string) => void) => {
  const logger = context.logger()
  const { bold, green, cyan, underline } = logger.colors
  const stat = (s: any) => underline(bold(green(s)))
  const setting = (s: any) => bold(cyan(s))
  const store = context.store()
  const port = store.controllers?.port
  const displayOn = (cfg: any) =>
    Object.keys(L.omitBy(cfg, (v) => !v))
      .map((v) => setting(v))
      .join(', ')
  const banner = `

  ${cyanBright(`▄                             ▄             ▄ ▄`)}
  ${cyan(`█─▄  ▄ ▄  ▄─▄  ▄─▄  ▄─▄  ▄──  █─   ─▄  ▄──  █─▄`)}
  ${magentaBright(`▀ ▀  ▀─█  █─▀  ▀──  ▀    ──▀  ▀─  ▀─▀  ▀──  ▀ ▀`)}
  ${magentaBright(`     └─▀${gray(`              https://hyperstackjs.io`)}`)}


🚀 App is running on port ${stat(port)}, in ${stat(store.app?.mode)} mode. 
🤘 Loaded ${stat(store.controllers?.numControllers)} controllers, ${stat(
    store.workers?.numWorkers
  )} workers, ${stat(store.workers?.numMailers)} mailers in ${magenta(
    parseInt(store.stats?.bootTime as any)
  )}ms.

🧰 Environment is environments/${stat(store.app?.environmentFile)}
   · logger: ${setting(logger.level)}
   · controllers: ${displayOn(context.config().controllers)}
   · workers: ${setting(store.workers?.background)}, ${setting(
    store.workers?.mode
  )}
   · models:  ${displayOn(context.config().database)}
   · mailers: ${displayOn(
     L.omit(context.config().mailers, 'delivery')
   )} delivery=${setting(context.config().mailers?.delivery || 'none')}
`
  print(banner)
}
