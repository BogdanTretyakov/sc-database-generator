import type { RouteLocation } from 'vue-router';
import { defaultVersionType } from '~/data';

export const useVersionType = (to?: RouteLocation) => {
  return useCookie('defaultVersion', {
    maxAge: 2147483647,
    default: () => defaultVersionType,
  });
};
