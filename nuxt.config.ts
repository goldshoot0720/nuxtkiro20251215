// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // 静态站点生成配置
  nitro: {
    output: {
      dir: '.output'
    },
    prerender: {
      routes: ['/', '/about']
    }
  },
  
  // SSG模式
  ssr: true,
  
  components: {
    global: true,
    dirs: ['~/components']
  },
  
  runtimeConfig: {
    // Public keys (exposed to client-side)
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    }
  }
})
