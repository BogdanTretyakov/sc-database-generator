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
      nuxt.hook('build:manifest', (manifest) => {
        for (const key in manifest) {
          manifest[key].dynamicImports = [];
          manifest[key].imports = [];
        }
      });
    },
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
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      titleTemplate: '%s - Survival Chaos Info',
    },
  },
  generate: {
    // routes: versions.map(v => `/${v}/races`),
  },
  css: ['vuetify/styles', '~/assets/styles.css'],
  experimental: {
    treeshakeClientOnly: false,
    renderJsonPayloads: false,
    payloadExtraction: false,

    defaults: {
      nuxtLink: {
        prefetch: false,
        prefetchOn: {
          visibility: false,
          interaction: true,
        },
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

        if (file.prefetch) {
          file.prefetch = false;
        }
      }
    },
  },
});
