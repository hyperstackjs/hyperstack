import path from 'path'
import fs from 'fs'
import type { Request, Response } from '../types'

const indexSender = (indexFolder: string) => {
  const indexFile = path.resolve(indexFolder, 'index.html')
  if (!fs.existsSync(indexFile)) {
    throw new Error(
      `controllers: index file redirect is on, but no such file: ${indexFile}`
    )
  }

  return (_req: Request, res: Response) => {
    res.sendFile(indexFile)
  }
}

export default indexSender
