import L from 'lodash'
import { OpenApiBuilder } from 'openapi3-ts'

// @ts-expect-error 7016
import OpenAPISnippet from 'openapi-snippet'

import { parse as parsePath } from 'path-to-regexp'
import { generateSchema } from '@anatine/zod-openapi'
import 'reflect-metadata'

export const getRouteMap = (controllers: any[]) => {
  const routemap = controllers
    .map((Cnt: any) => {
      const classKey = Reflect.getOwnMetadataKeys(Cnt.prototype).find((k) =>
        k.toString().match(/Class Metadata/)
      )
      const path = classKey
        ? Reflect.getOwnMetadata(classKey, Cnt.prototype).basePath
        : ''

      return {
        [Cnt.name]: {
          path,
          actions: Object.getOwnPropertyNames(Cnt.prototype)
            .filter((p) => p !== 'constructor')
            .map((p) => ({
              meta: Reflect.getOwnMetadata(p, Cnt.prototype),
              action: p,
            }))
            .filter((desc) => desc.meta)
            .map(({ meta, action }) => ({
              action,
              // decide and find the first schema around.
              // each middleware, which is a function,
              // can have a standardized 'params' field
              schema: meta?.middlewares
                ?.map((m: any) => m.params?.schema)
                .find((s: any) => s),
              routes: meta.httpRoutes.map((r: any) => ({
                parsedPath: parsePath(path + r.path),
                verb: r.httpDecorator,
                path: r.path,
              })),
            })),
        },
      }
    })
    .reduce((acc: any, m: any) => ({ ...acc, ...m }), {})

  return routemap
}

export const asOpenAPIPath = (parsedPath: any[]) => {
  return parsedPath
    .map((part: any) => (L.isString(part) ? part : `/{${part.name}}`))
    .join('')
}

export const asOpenAPIPathParams = (parsedPath: any[]) => {
  return parsedPath
    .filter((part: any) => !L.isString(part))
    .map(({ name }) => ({
      name,
      schema: { type: 'string' },
      required: true,
      in: 'path',
    }))
}

export const routemapToOpenAPI = (
  routemap: any,
  url = 'http://localhost:5150'
) => {
  const builder = OpenApiBuilder.create({
    openapi: '3.0.0',
    servers: [{ url }],
    info: {
      title: '',
      version: '',
    },
    paths: {},
  })

  L.forEach(routemap, (controller: any, _name: string) => {
    controller.actions.forEach((action: any) => {
      action.routes.forEach((route: any) => {
        /*
        ## parameter handling:
        * parse best effort from path (/foo/bar/:someId) -> 'someId' is a path param
        * if we have a schema for the action, translate from zod to OpenAPI and drop it inside
          the params array as 'body'
        Note: action --*> route (there can be many routes on an action, but
              there can be a single schema on an action)
        */

        const path = asOpenAPIPath(route.parsedPath)
        const pathmap = builder.rootDoc.paths[path] || {}
        builder.addPath(path, {
          ...pathmap,
          ...{
            [route.verb.toString()]: {
              responses: {
                '200': {
                  description: 'OK',
                },
              },
              ...(action.schema?.zod && {
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: generateSchema(action.schema.zod),
                    },
                  },
                },
              }),
              parameters: asOpenAPIPathParams(route.parsedPath),
            },
          },
        })
      })
    })
  })

  return builder
}

export const getRouteSnippets = (
  routemap: any,
  verb: string,
  path: string,
  snippets = ['shell_curl'],
  url = 'http://localhost:5150'
) => {
  const api = routemapToOpenAPI(routemap, url)
  const results = OpenAPISnippet.getEndpointSnippets(
    api.rootDoc,
    path,
    verb,
    snippets,
    {
      short: true,
    }
  )
  return results
}
