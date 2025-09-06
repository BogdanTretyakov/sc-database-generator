import type { RouterConfig } from '@nuxt/schema';
import oz from '~/data/changelogs/oz';
import og from '~/data/changelogs/og';
import { sortVersion } from '~/utils/array';

const changelogs = {
  oz: oz.data,
  og: og.data,
};

export default {
  routes: () => [
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
    {
      name: 'Changelog',
      path: '/changelog/:clVersionType?/:clVersion?',
      component: () => import('~/pages/changelog.vue'),
      beforeEnter: (to, from) => {
        const savedPrefVersion = storage.get('preferredVersion');
        const versionType = from.params.versionType || savedPrefVersion || 'og';
        const versions =
          changelogs[versionType as keyof typeof changelogs] ?? {};
        const [version] =
          String(to.params.clVersion) in versions
            ? [to.params.clVersion]
            : sortVersion(Object.keys(versions));

        if (
          !to.params.clVersionType ||
          !to.params.clVersion ||
          !(String(to.params.clVersion) in versions)
        ) {
          return {
            name: to.name,
            hash: to.hash,
            params: {
              ...to.params,
              clVersionType: versionType,
              clVersion: version,
            },
          };
        }
      },
    },
    {
      path: '/:versionType/:version?',
      component: () => import('~/pages/versionData/index.vue'),
      children: [
        {
          name: 'RaceSelection',
          path: 'races',
          component: () => import('~/pages/versionData/raceSelection.vue'),
        },
        {
          name: 'RaceIndex',
          path: 'races/:race',
          component: () => import('~/pages/versionData/racePage.vue'),
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
  ],
} satisfies RouterConfig;
