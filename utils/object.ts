export const mapObject = <const Obj extends Record<string, unknown>, K extends Obj[keyof Obj], Q>(
  data: Obj,
  mapFn: (value: K, key: string) => Q
) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    acc[key as keyof Obj] = mapFn(value as K, key)
    return acc;
  }, {} as Record<keyof Obj, Q>)
};
