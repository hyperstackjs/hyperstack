import L from 'lodash'
export const logger = {
  error: () => {},
  info: () => {},
  warn: () => {},
  child: () => logger,
}

export const expectWithSnapshot = async (
  status: number,
  req: any,
  matcher: any = L.identity
) => {
  const res = await req
  expect(res.statusCode).toEqual(status)
  expect(matcher(res)).toBeTruthy()
  expect({
    status: res.statusCode,
    body: res.body,
    headers: L.omit(res.headers, 'date', 'etag', 'x-request-id'),
  }).toMatchSnapshot()
}
