export async function run<T>(
  callback: () => T | Promise<T>
): Promise<[T, number]> {
  const t0 = performance.now()

  const result = await callback()

  const t1 = performance.now()

  return [result, t1 - t0]
}
