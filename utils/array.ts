export function uniq<T>(item: T, index: number, array: T[]): boolean {
  return array.indexOf(item) === index;
}

export function uniqById<T extends { id: number | string }>(
  { id }: T,
  index: number,
  array: T[]
): boolean {
  return array.findIndex((item) => item.id === id) === index;
}
