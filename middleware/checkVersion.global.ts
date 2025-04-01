import { dataFiles } from '~/data';

export default defineNuxtRouteMiddleware((to) => {
  const [toVersionType] = [to.params.versionType].flat();
  const [toVersion] = [to.params.version].flat();

  if (!toVersionType) return;

  if (!(toVersionType in dataFiles)) {
    return navigateTo('/');
  }

  if (toVersion && !(toVersion in dataFiles[toVersionType])) {
    return navigateTo({
      name: to.name,
      hash: to.hash,
      params: {
        ...to.params,
        version: undefined,
      },
    });
  }
});
