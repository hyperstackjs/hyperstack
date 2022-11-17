import { HyperWorker, queueAs } from '../../../../../src'

@queueAs('downloads')
class Downloader extends HyperWorker {
  static redis = null

  static magicNumber = null

  async perform(_opts) {
    await (Downloader.redis as any).set('downloaded', Downloader.magicNumber)
    console.log('hello from downloader worker!') // eslint-disable-line no-console
    // download
  }
}

export { Downloader }
