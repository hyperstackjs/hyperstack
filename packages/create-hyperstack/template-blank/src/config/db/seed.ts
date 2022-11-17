/* eslint-disable @typescript-eslint/no-unused-vars */
import { isDevelopment, isProduction, seed } from 'hyperstack'
import { appContext } from '../../app'

export default seed(async ({ logger }) => {
  if (isDevelopment()) {
    // your dev time seeds
  }
  if (isProduction()) {
    // your production time seeds
  }
})
