import path from 'path'
import { globSync } from 'glob'
const load = (patt: string, cwd = process.cwd()) =>
  globSync(path.join(cwd, patt)).map((f) => {
    let mod = null
    try {
      mod = require(f)
    } catch (e: any) {
      console.log(`error dynamically loading '${f}'\n${e.toString()}`) // eslint-disable-line no-console
      throw e
    }

    return mod.default || mod
  })

export default load
