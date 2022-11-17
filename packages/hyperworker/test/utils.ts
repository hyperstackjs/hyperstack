import L from 'lodash'
const log = console.log // eslint-disable-line no-console
export const logger = {
  error: log,
  info: log,
  warn: log,
  trace: log,
  colors: { bold: L.identity, cyan: L.identity, magenta: L.identity },
}
