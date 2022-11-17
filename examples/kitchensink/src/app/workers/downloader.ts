import { HyperWorker, queueAs } from 'hyperstack'

@queueAs('downloads')
class Downloader extends HyperWorker {
  static redis: any = null

  static magicNumber: string = null

  async perform(_opts: any) {
    await Downloader.backend.connection.set(
      'downloaded',
      Downloader.magicNumber
    )
    // eslint-disable-next-line no-console
    console.log(
      `hello from downloader worker!\nyour magic number is ${Downloader.magicNumber}`
    )
  }
}

export { Downloader }
