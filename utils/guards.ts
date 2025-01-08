export function isNotNil<T>(
  val: T | null | undefined
): val is Exclude<T, null | undefined> {
  return typeof val === 'number' || val === false || !!val;
}
