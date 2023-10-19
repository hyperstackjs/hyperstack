import { Mailer } from 'hyperstack'
import L from 'lodash'
const TEST_REDACTED = 'test-redacted'

export const expectRequestWithSnapshot = async (
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
    headers: L.omit(
      res.headers,
      'date',
      'etag',
      'x-request-id',
      'last-modified'
    ),
  }).toMatchSnapshot()
}

export const baseMailerSerialize = (msg: any) => {
  L.set(msg, 'messageId', TEST_REDACTED)
  L.set(msg, 'response', TEST_REDACTED)
  return msg
}

export const redactAndExpectMatch =
  (redactionmap: any, baseSerializer?: (d: any) => any | null) =>
  (data: any) => {
    let result = data
    if (baseSerializer) {
      result = baseSerializer(data)
    }

    L.forEach(redactionmap, (v, k) => {
      const val = L.get(result, k)
      if (val) {
        expect(val).toMatch(v)
        L.set(result, k, val.toString().replace(v, TEST_REDACTED))
      }
    })
    return result
  }

export const redactAndExpectMatchInEmails = (regex: string | RegExp) =>
  redactAndExpectMatch(
    {
      'contents.1': regex,
      'contents.2': regex,
      'originalMessage.html': regex,
      'originalMessage.text': regex,
    },
    baseMailerSerialize
  )

export const matchRequestWithSnapshot = async (
  status: number,
  req: any,
  {
    serializer = undefined,
    snapshotName = null,
  }: { serializer?: (d: any) => any; snapshotName?: string | null } = {}
) => {
  let res = await req
  if (serializer) {
    res = serializer(res)
  }
  expect({
    status: res.statusCode,
    body: res.body,
    headers: L.omit(
      res.headers,
      'date',
      'etag',
      'x-request-id',
      'last-modified'
    ),
  }).toMatchSnapshot.apply(expect, snapshotName ? [snapshotName] : [])
  expect(res.statusCode).toEqual(status)
}
export const matchDeliveriesWithSnapshot = async (
  count: number,
  { serializer = baseMailerSerialize, snapshotName = null } = {}
) => {
  let res = Mailer.deliveries() || []
  if (serializer) {
    res = res.map(serializer)
  }
  expect(res).toMatchSnapshot.apply(expect, snapshotName ? [snapshotName] : [])
  expect(res.length).toEqual(count)
}
