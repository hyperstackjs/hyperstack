import Ajv from 'ajv'
import L from 'lodash'
import { Middleware } from '@hyperstackjs/hypernight'
import type { ZodRawShape, z } from 'zod'
import { ValidationError } from './errors'
import type { NextFunction, Request, Response } from './types'
// strong params, permit only what's in schema
const permits = <T extends ZodRawShape>(schema: z.ZodObject<T>) =>
  schema.parse.bind(schema)

// actionparams, permit and require all that's in schema
const requires = <T extends ZodRawShape>(schema: z.ZodObject<T>) => {
  const s = schema.strict()
  return (d: any) => {
    const result = s.safeParse(d)
    if (!result.success) {
      throw new ValidationError((result as any).error.issues)
    }
    return result.data
  }
}

// decorator, powered by zod. validates + parses and assigns parsed data to body
function ParseBody(schema: any) {
  function parseBody(req: Request, res: Response, next: NextFunction) {
    const { success, data, error } = schema.safeParse(req.body)
    if (!success) {
      throw new ValidationError(error.issues)
    } else {
      req.body = data
    }

    next()
  }

  parseBody.params = { schema: { zod: schema } }

  return Middleware(parseBody)
}

// decorator, powered by ajv, only validates.
function ValidateBody(schema: any, customValidations = {}) {
  const ajv = new Ajv()
  L.toPairs(customValidations).forEach(([validationName, validationSchema]) => {
    ajv.addKeyword(validationName, validationSchema as any)
  })
  function validateBody(req: Request, res: Response, next: NextFunction) {
    const validator = ajv.compile(schema) // pay compilation because we dont want to share instance
    if (!validator(req.body)) {
      throw new ValidationError(validator.errors)
    }

    next()
  }

  return Middleware(validateBody)
}

export { ValidateBody, ParseBody, permits, requires }
