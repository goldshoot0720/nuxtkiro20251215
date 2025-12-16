// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // SSR模式 (服务器端渲染)
  ssr: true,
  
  // 模組
  modules: [],
  
  // 全域 CSS
  css: [],
  
  // Netlify部署配置
  nitro: {
    preset: 'netlify'
  },
  
  components: [
    {
      path: '~/components',
      global: true,
      pathPrefix: false
    }
  ],
  
  runtimeConfig: {
    // Private keys (only available on server-side)
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    // Public keys (exposed to client-side)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  }
})
