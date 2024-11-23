
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: 'dark',
      themes: {
        dark: {
          colors: {
            'surface-variant': '#333',
            'on-surface-variant': '#eee'
          }
        }
      }
    }
  })
  app.vueApp.use(vuetify)
})
