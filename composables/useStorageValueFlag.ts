export const useStorageValueFlag = <T extends string|number = string>(
  storageKey: string,
  flag: MaybeRef<boolean>,
  defaultValue: [T, T],
) => {
  const key = computed(
    () => `${storageKey}-${toValue(flag) ? 'flagged' : 'default'}`,
  );
  return useStorageValue(
    key,
    toValue(flag) ? defaultValue[1] : defaultValue[0],
  );
};
