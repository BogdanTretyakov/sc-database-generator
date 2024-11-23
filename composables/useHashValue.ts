export const useHashValue = (defaultValue?: string) => {
  const route = useRoute()
  const value = ref(route.hash.replace('#', '') ?? defaultValue)

  watch(
    () => value.value,
    (value, oldValue) => {
      if (value === oldValue) return
      navigateTo({ hash: `#${value}` })
    }
  )

  return value
}
