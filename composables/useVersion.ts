import { lastVersion, versions } from "~/data";

export const useVersion = () => {
  const version = inject('version', ref(lastVersion))

  const switchVersion = (version: string) => {
    navigateTo({ params: { version } })
  }

  watch(
    () => version.value,
    (value, oldValue) => {
      if (value === oldValue) return
      if (!(value in versions)) {
        version.value = oldValue
        return
      }
      switchVersion(value)
    }
  )

  return version
}
