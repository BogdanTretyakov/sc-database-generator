import { defaultVersionType, versionIndexes } from '~/data';

export default defineNuxtRouteMiddleware((to) => {
  const userVersion = useVersionType(to);
  // const userVersion = useCookie('defaultVersion', { maxAge: 2147483647 });
  const [routeVersionType] = [to.params.versionType].flat();

  if (to.name === 'CreditsPage') return;

  if (userVersion.value && !(userVersion.value in versionIndexes)) {
    userVersion.value = defaultVersionType;
  }

  if (
    routeVersionType === defaultVersionType &&
    to.fullPath.includes(`/${defaultVersionType}`)
  ) {
    return navigateTo(to.fullPath.replace(`/${defaultVersionType}`, ''));
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
