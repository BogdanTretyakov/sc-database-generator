import { until } from '@vueuse/core';

export const useRouteRace = async () => {
  const route = useRoute();
  await until(() => route.params.race).toBeTruthy();
  return route.params.race as string;
};
