export const useStorageValue = (storageKey: string, defaultValue?: string) => {
  const value = ref(defaultValue);

  onNuxtReady(() => {
    value.value = storage.get(storageKey) ?? defaultValue;
  });

  watch(
    () => value.value,
    (value, oldValue) => {
      if (value === oldValue) return;
      if (!value) {
        return storage.remove(storageKey);
      }
      storage.set(storageKey, value);
    }
  );

  return value;
};
