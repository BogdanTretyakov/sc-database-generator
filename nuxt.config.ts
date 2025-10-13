import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },

  build: {
    transpile: ['vuetify'],
  },

  modules: ['@nuxtjs/sitemap'],
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

  runtimeConfig: {
    public: {
      backendUrl:
        process.env.NUXT_PUBLIC_BACKEND_URL || 'https://85.28.47.144.nip.io/',
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      title: '',
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
      titleTemplate: '%s | Survival Chaos Wiki',
      script: [
        {
          async: true,
          src: 'https://www.googletagmanager.com/gtag/js?id=G-KW4BMH97RN',
        },
      ],
    },
  },
  generate: {
    routes: [
      '/',
      '/stats',
      ...['og', 'oz']
        .map((key) => {
          const routes = ['races', 'artifacts', 'ultimates', 'misc'];
          return routes.map((route) => `/${key}/${route}`);
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
      },
    },
  },
  router: {
    options: {},
  },
  hooks: {
    'vite:extendConfig'(config) {
      config.plugins?.push(vuetify({ autoImport: true }));
    },
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

  nitro: {
    prerender: {
      autoSubfolderIndex: false,
      ignore: ['/changelog'],
    },
  },

  site: {
    url: 'https://sc-helper.github.io',
    name: 'Survival Chaos Database',
    indexable: true,
  },
  sitemap: {
    excludeAppSources: ['nuxt:pages'],
    autoLastmod: true,
    exclude: ['/200.html', '/404.html'],
  },
});
