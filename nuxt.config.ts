import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins?.push(vuetify({ autoImport: true }));
      });
    },
    '@nuxtjs/sitemap',
    '@zadigetvoltaire/nuxt-gtm',
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const match = id.match(
              /data[\/\\](?<version>.+)[\/\\](?<name>[^\\\/]+?)\..+?$/
            );
            if (!match) return 'all';
            // let { version, name } = match.groups ?? {};
            // if (['race', 'artifacts', 'ultimates'].includes(name)) {
            //   name = 'common';
            // }
            // return `${version}-${name}`;
          },
        },
      },
    },
  },
  pages: true,
  features: {
    inlineStyles: false,
  },

  app: {
    head: {
      title: 'Loading',
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
      titleTemplate: '%s | Survival Chaos Wiki',
    },
  },
  generate: {
    routes: [
      '/',
      ...['w3c', 'oz']
        .map((key) => {
          const routes = ['races', 'artifacts', 'ultimates', 'misc'];
          if (key === 'w3c') {
            key = '';
          } else {
            key = '/' + key;
          }
          return routes.map((route) => [key, route].join('/'));
        })
        .flat(),
    ],
  },
  css: ['vuetify/styles', '~/assets/styles.css'],
  experimental: {
    renderJsonPayloads: false,
    payloadExtraction: false,

    defaults: {
      nuxtLink: {
        prefetch: false,
        prefetchOn: {
          visibility: false,
          interaction: true,
        },
        trailingSlash: 'append',
      },
    },
  },
  router: {
    options: {},
  },
  hooks: {
    'build:manifest'(manifest) {
      for (const key in manifest) {
        const file = manifest[key];
        file.dynamicImports = [];
        file.imports = [];

        if (file.prefetch) {
          file.prefetch = false;
        }
      }
    },
  },

  site: {
    url: 'https://sc-helper.github.io',
    name: 'Survival Chaos Database',
    indexable: true,
  },

  gtm: {
    id: 'GTM-83J73GNQHC',
    trackOnNextTick: true,
    devtools: false,
  },
});
