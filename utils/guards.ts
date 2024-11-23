export function isNotNil<T>(val: T|null|undefined): val is Exclude<T, null|undefined> {
  return !!val
}