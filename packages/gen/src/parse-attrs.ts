interface Attr {
  name: string
  as: As
}

interface As {
  fixtureAlt: string[]
  fixture: string[]
  model: string[]
  migration: string[]
  zod: string[]
}

type Conversion = (name: string) => string[]
interface TypeConversions {
  string: Conversion
  text: Conversion
  number: Conversion
  date: Conversion
  bool: Conversion
  json: Conversion
}

type Mappings = Record<keyof As, TypeConversions>

// XXX validate that 'name' is a valid symbol
// XXX validate that 'value' is a valid type, or that it has a translator
// XXX add a default | todo type for each area

const lines = (...lns: string[]) => lns

const mappings: Mappings = {
  // faker: {},
  fixtureAlt: {
    string: (_name) => ["'updated'"],
    text: (_name) => ["'a different text'"],
    number: (_name) => ['1337'],
    date: (_name) => ["new Date('1981-09-08')"],
    bool: (_name) => ['false'],
    json: (_name) => ['{"hello": "crewl world"}'],
  },
  fixture: {
    string: (_name) => ["'string'"],
    text: (_name) => ["'some text'"],
    number: (_name) => ['5150'],
    date: (_name) => ["new Date('1986-03-24')"],
    bool: (_name) => ['true'],
    json: (_name) => ['{"hello": "world"}'],
  },
  model: {
    string: (name) => lines('@Column', `${name}: string`),
    text: (name) => lines('@Column(DataType.TEXT)', `${name}: string`),
    number: (name) => lines('@Column', `${name}: number`),
    date: (name) => lines('@Column', `${name}: Date`),
    bool: (name) => lines('@Column', `${name}: boolean`),
    json: (name) => lines('@Column(DataType.JSON)', `${name}: any`),
  },
  migration: {
    string: (name) => lines(`t.string('${name}')`),
    text: (name) => lines(`t.text('${name}')`),
    number: (name) => lines(`t.int('${name}')`),
    date: (name) => lines(`t.date('${name}')`),
    bool: (name) => lines(`t.bool('${name}')`),
    json: (name) => lines(`t.json('${name}')`),
  },
  zod: {
    string: (name) => lines(`${name}: z.string()`),
    text: (name) => lines(`${name}: z.string()`),
    number: (name) => lines(`${name}: z.number()`),
    date: (name) => lines(`${name}: z.date()`),
    bool: (name) => lines(`${name}: z.boolean()`),
    json: (name) => lines(`${name}: z.any()`),
  },
}

const getMapping = (el: string, value: string) => {
  const f = mappings[el as keyof Mappings]?.[value as keyof TypeConversions]
  if (!f) {
    throw new Error(
      `type '${value}' not found. trying to convert '${value}' as '${el}'`
    )
  }
  return f
}
const parseAttr = (attr: string): Attr => {
  const props = attr.split(':')
  if (props.length !== 2) {
    throw new Error(
      `attribute: '${attr}' should be in the format [name]:[type]`
    )
  }
  const [name, value] = props

  // a somewhat conservative variable name. I know there's unicode and wild stuff _officially_
  // allowed, but let's be reasonable. This name will make its way into DB tables and other places.
  if (!value.match(/^[a-z]{1,}$/)) {
    throw new Error(`'${value}' is not a valid type name`)
  }
  if (!name.match(/^[a-zA-Z0-9_$]+$/)) {
    throw new Error(`'${name}' is not a valid variable name`)
  }

  return {
    name,
    as: Object.keys(mappings).reduce(
      (acc, el) => ({
        ...acc,
        [el]: getMapping(el, value)(name),
      }),
      {}
    ) as As,
  }
}
export const parseAttrs = (attrs: string | string[]): Attr[] => {
  if (!attrs) {
    throw new Error('no attributes to parse')
  }

  const parts = (attrs as string).split
    ? (attrs as string).split(/\s+/)
    : (attrs as string[])
  // 6 because that's the smallest type name (bool) + ':' + 1 char for the symbol name:
  // a:bool
  return parts.filter((p) => p.length >= 6 && p.includes(':')).map(parseAttr)
}
