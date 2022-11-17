const banner = (port: number | string) => `listening on port: ${port}`
const listen = (app: any, opts: any = {}) => {
  const { port, bannerfn, log } = opts
  const logfn = log || console.log // eslint-disable-line no-console
  const resolvedPort = port || process.env.PORT || 5150
  logfn((bannerfn || banner)(resolvedPort))
  app.listen(resolvedPort)
}

export default listen
