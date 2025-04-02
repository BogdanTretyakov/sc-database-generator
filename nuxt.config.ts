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
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    build: {
      cssCodeSplit: false,
    },
  },
  pages: true,
  features: {
    inlineStyles: false,
  },

  app: {
    head: {
      title: '',
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
      titleTemplate: '%s | Survival Chaos Wiki',
    },
  },
  generate: {
    routes: [
      '/',
      ...['og', 'oz']
        .map((key) => {
          const routes = ['races', 'artifacts', 'ultimates', 'misc'];
          return routes.map((route) => `/${key}/${route}/`);
        })
        .flat(),
    ],
  },
  css: ['vuetify/styles', '~/assets/styles.css'],
  experimental: {
    renderJsonPayloads: false,
    payloadExtraction: false,
    asyncContext: true,

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
});
