import type { HyperWorker } from './worker'

export const getJobCounts = async (workers: typeof HyperWorker[]) => {
  const counts = []
  for (const W of workers) {
    const wc = await W.jobCounts()
    counts.push({ name: W.name, queue: W.queueName, ...wc })
  }
  return counts
}
