import { HttpResponseNotFound } from '../http/responses'
import responseSender from '../http/response-sender'
import type { Request, Response } from '../types'

const notFound = (req: Request, res: Response) => {
  responseSender(res, new HttpResponseNotFound())
}

export default notFound
