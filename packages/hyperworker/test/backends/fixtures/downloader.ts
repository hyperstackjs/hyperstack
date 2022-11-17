import { HyperWorker, queueAs } from '../../../src/index'

@queueAs('downloads')
class Downloader extends HyperWorker {
  static redis: any | null = null

  static magicNumber: string | null = null

  async perform(_opts: any) {
    await Downloader.redis.set('downloaded', Downloader.magicNumber)
    console.log('hello from downloader worker!') // eslint-disable-line no-console
    // download
  }
}

export { Downloader }
