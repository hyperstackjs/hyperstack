import { HyperWorker, queueAs } from 'hyperstack'

@queueAs('calculator')
class Calculator extends HyperWorker {
  async perform({ number }: { number: number }) {
    return Promise.resolve({ number: number * 4 })
  }
}

export { Calculator }
