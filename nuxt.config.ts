// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  pages: true,

  modules: [
    '@invictus.codes/nuxt-vuetify',
    '@pinia/nuxt',
    '@nuxtjs/google-fonts'
  ],

  vuetify: {
    /* vuetify options */
    vuetifyOptions: {
    },

    moduleOptions: {
      /* nuxt-vuetify module options */
      treeshaking: true,
      useIconCDN: true,

      /* vite-plugin-vuetify options */
      styles: true,
      autoImport: true,
      useVuetifyLabs: false, 
    }
  },

  devtools: { enabled: true },
  target: 'static',

  googleFonts: {
    families: {
      'Source+Serif+Pro': [400, 600, 700]
    },
    display: 'swap'
  },

  generate: {
    dir: 'dist'
  }
})
