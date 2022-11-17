// @ts-expect-error 7016
import OpenAPISnippet from 'openapi-snippet'
import { getRouteMap, routemapToOpenAPI } from '../src'

import Api from './fixtures/api'
describe('routes', () => {
  it('exports', () => {
    expect(getRouteMap([Api])).toMatchSnapshot()
  })
  it('exports to open api', () => {
    const routemap = getRouteMap([Api])
    const api = routemapToOpenAPI(routemap)
    expect(api.getSpec()).toMatchSnapshot()
  })
  it('exports snippets', () => {
    const routemap = getRouteMap([Api])
    const api = routemapToOpenAPI(routemap)
    const results = OpenAPISnippet.getSnippets(
      api.rootDoc,
      ['shell_curl', 'shell_httpie', 'shell_wget'],
      { short: true }
    ) // results is now array of snippets, see "Output" below.
    expect(results).toMatchSnapshot()
  })
})
