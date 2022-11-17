import type { Context } from 'hyperstack'
import { context } from 'hyperstack'
import type * as Models from './models'
import type * as Mailers from './mailers'

export const appContext = context as Context<typeof Models, typeof Mailers>
