import { parseAttrs } from '../src/parse-attrs'

describe('parseAttrs', () => {
  it('parses', () => {
    expect(
      parseAttrs(
        'g model Foobar title:string content:text count:number settings:json createdAt:date isDeleted:bool'
      )
    ).toMatchSnapshot()
    expect(
      parseAttrs(['g', 'model', 'title:string', 'content:text'])
    ).toMatchSnapshot()
    expect(() => parseAttrs(undefined as any)).toThrowError(/no attributes/)
    expect(() => parseAttrs('title:')).toThrowError(/not a valid/)
    expect(() => parseAttrs('title:footype')).toThrowError(
      /type 'footype' not found/
    )
    expect(() => parseAttrs('title:foo:bar')).toThrowError(/format/)
    expect(() => parseAttrs('ti-tle:string')).toThrowError(/not a valid/)
  })
  it('model but no attributes', () => {
    expect(parseAttrs('g model foobar')).toMatchSnapshot()
    expect(parseAttrs('model foobar')).toMatchSnapshot()
    expect(parseAttrs('foobar')).toMatchSnapshot()
  })
  it('typo testing', () => {
    expect(() => parseAttrs('title :string')).toThrowError(/not a valid/)
    expect(parseAttrs('title;string')).toEqual([])
    expect(() => parseAttrs('title: string')).toThrowError(/not a valid/)
    expect(() => parseAttrs('title:stringcontent :string')).toThrowError(
      /not found/
    )
    expect(() => parseAttrs('deleted:boolean')).toThrowError(/not found/)
    expect(() => parseAttrs('title.:string')).toThrowError(/not a valid/)
    expect(() => parseAttrs('title::string')).toThrowError(/format/)
  })
})
