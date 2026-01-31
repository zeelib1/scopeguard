// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api'
    }
  },

  app: {
    head: {
      title: 'ScopeGuard - Stop Scope Creep',
      meta: [
        { name: 'description', content: 'Professional scope management for freelancers' }
      ]
    }
  }
})
