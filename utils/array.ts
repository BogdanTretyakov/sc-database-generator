import { isNotNil } from './guards';

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

export function sortVersion(items: string[]) {
  return items
    .map((ver) => ver.match(/\d+|\w/g))
    .filter(isNotNil)
    .sort(([a1, a2, a3], [b1, b2, b3]) => {
      if (a1 !== b1) return Number(b1) - Number(a1);
      if (a2 !== b2) return Number(b2) - Number(a2);
      if (a3 || b3) return Number(Boolean(b3)) - Number(Boolean(a3));
      return 0;
    })
    .map((parts) => parts.join('.').replace(/\.(?!\d)/, ''));
}
