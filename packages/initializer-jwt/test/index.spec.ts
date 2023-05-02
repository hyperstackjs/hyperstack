import { DEFAULT_AUTH_COOKIE_NAME, resolveAuthCookieName } from '../src/index'

describe('resolveAuthCookieName', () => {
  it('should resolve the given cookie name (cookie auth is on using given cookie name)', () => {
    const expectedCookieName = 'token'
    const actualCookieName = resolveAuthCookieName(expectedCookieName)

    expect(actualCookieName).toEqual(expectedCookieName)
  })

  it('should resolve default auth cookie name when input is true (cookie auth is on using default cookie name)', () => {
    const expectedCookieName = DEFAULT_AUTH_COOKIE_NAME
    const actualCookieName = resolveAuthCookieName(true)

    expect(actualCookieName).toEqual(expectedCookieName)
  })

  it('should return null when cookie name value is false (cookie auth is off)', () => {
    const actualCookieName = resolveAuthCookieName(false)

    expect(actualCookieName).toEqual(null)
  })

  it('should return null when no name sent (cookie auth is off)', () => {
    const actualCookieName = resolveAuthCookieName(null)

    expect(actualCookieName).toEqual(null)
  })

  it('should return null when no name sent (cookie auth is off)', () => {
    const actualCookieName = resolveAuthCookieName('')

    expect(actualCookieName).toEqual(null)
  })
})
