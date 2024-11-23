import { versions, lastVersion } from "~/data"

export default defineNuxtRouteMiddleware((to) => {
  const [routeVersion] = [to.params.version].flat()

  if (to.path === '/') {
    return navigateTo({ name: 'RaceSelection', params: { version: lastVersion } })
  }

  if (routeVersion && !(routeVersion in versions)) {
    return navigateTo({ params: { version: lastVersion } })
  }
})