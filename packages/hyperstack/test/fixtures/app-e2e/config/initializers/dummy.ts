const hooks = {
  beforeControllers(_app: any) {
    console.log('before controllers hook') // eslint-disable-line no-console
  },
  afterControllers(_app: any) {
    console.log('after controllers hook') // eslint-disable-line no-console
  },
}

export default (_context: any) => hooks
