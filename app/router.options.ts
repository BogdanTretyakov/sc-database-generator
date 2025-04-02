import type { RouterConfig } from '@nuxt/schema';

export default {
  routes: () => [
    {
      path: '/:versionType/:version?',
      children: [
        {
          name: 'RaceIndex',
          path: 'races/:race',
          component: () => import('~/pages/versionData/racePage.vue'),
        },
        {
          name: 'RaceSelection',
          path: 'races',
          component: () => import('~/pages/versionData/raceSelection.vue'),
        },
        {
          name: 'UltimatesIndex',
          path: 'ultimates',
          component: () => import('~/pages/versionData/ultimates.vue'),
        },
        {
          name: 'ArtifactsIndex',
          path: 'artifacts',
          component: () => import('~/pages/versionData/artifacts.vue'),
        },
        {
          name: 'MiscIndex',
          path: 'misc',
          component: () => import('~/pages/versionData/misc.vue'),
        },
      ],
    },
    {
      name: 'Home',
      path: '/',
      component: () => import('~/pages/home.vue'),
    },
    {
      name: 'CreditsPage',
      path: '/credits',
      component: () => import('~/pages/credits.vue'),
    },
  ],
} satisfies RouterConfig;
