<template>
  <div id="app">
    <NuxtPage />
  </div>
</template>

<script setup>
// 基本的应用配置
useHead({
  title: '鋒兄塗哥公關資訊',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: '鋒兄塗哥公關資訊 - 專業公關服務平台' }
  ]
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
}
</style>