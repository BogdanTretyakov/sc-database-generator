export const useHashValue = (defaultValue?: string) => {
  const route = useRoute();
  const value = ref<string | undefined>(
    route.hash?.replace('#', '') ?? defaultValue
  );

  watch(
    () => value.value,
    (value, oldValue) => {
      if (value === oldValue) return;
      if (!value) {
        return navigateTo({ hash: '' }, { replace: true });
      }
      navigateTo({ hash: `#${value}` }, { replace: true });
    }
  );

  return value;
};
