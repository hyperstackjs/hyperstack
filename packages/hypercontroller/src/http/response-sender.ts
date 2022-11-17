import type { Response } from '../types'

const responseSender = (response: Response, result: any) => {
  response.status(result.statusCode)
  response.set(result.getHeaders())
  if (typeof result.body === 'number') {
    result.body = result.body.toString()
  }

  response.send(result.body)
}
export default responseSender
