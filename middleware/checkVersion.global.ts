import { defaultVersionType, versionIndexes } from '~/data';

export default defineNuxtRouteMiddleware((to) => {
  const userVersion = useCookie('defaultVersion', { maxAge: 2147483647 });
  const [routeVersionType] = [to.params.versionType].flat();

  if (userVersion.value && !(userVersion.value in versionIndexes)) {
    userVersion.value = defaultVersionType;
  }

  if (
    !routeVersionType &&
    userVersion.value &&
    userVersion.value !== defaultVersionType
  ) {
    return navigateTo({ params: { versionType: userVersion.value } });
  }

  if (routeVersionType && !(routeVersionType in versionIndexes)) {
    return navigateTo({
      name: to.name,
      params: {
        ...to.params,
        versionType: userVersion.value || defaultVersionType,
      },
    });
  }
});
