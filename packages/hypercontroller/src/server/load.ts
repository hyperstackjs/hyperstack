import path from 'path'
import glob from 'glob'
const load = (patt: string, cwd = process.cwd()) =>
  glob.sync(path.join(cwd, patt)).map((f) => {
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
