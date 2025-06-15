export const sleep = async (s: number) => {
  return new Promise<void>(res => {
    setTimeout(() => res(), s * 1000)
  })
}