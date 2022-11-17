export const sleep = (t: number) =>
  new Promise((resolve, _reject) => setTimeout(() => resolve(true), t))
