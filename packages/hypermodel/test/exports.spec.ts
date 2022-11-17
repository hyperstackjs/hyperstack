import * as API from '../src'

describe('exports', () => {
  it('records api surface area', () => {
    expect(API).toMatchSnapshot()
  })
})
