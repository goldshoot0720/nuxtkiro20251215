<template>
  <div id="app">
    <div class="app-container">
      <!-- 側邊欄 -->
      <AppSidebar 
        :is-open="sidebarOpen" 
        :current-page="currentPage"
        @toggle="sidebarOpen = !sidebarOpen"
        @navigate="setCurrentPage"
      />

      <!-- 主內容區 -->
      <main class="main-content" :class="{ 'sidebar-active': sidebarOpen }">
        <!-- 頂部導航 -->
        <header class="top-header">
          <button @click="sidebarOpen = !sidebarOpen" class="menu-btn">☰</button>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </header>

        <!-- 頁面內容 -->
        <div class="page-content">
          <DashboardPage v-if="currentPage === 'dashboard'" />
          <SubscriptionPage v-else-if="currentPage === 'subscription'" />
          <FoodPage v-else-if="currentPage === 'food'" />
          <VideoPage v-else-if="currentPage === 'video'" />
        </div>
      </main>

      <!-- 遮罩層 -->
      <div v-if="sidebarOpen" class="overlay" @click="sidebarOpen = false"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import DashboardPage from '../components/DashboardPage.vue'
import SubscriptionPage from '../components/SubscriptionPage.vue'
import FoodPage from '../components/FoodPage.vue'
import VideoPage from '../components/VideoPage.vue'

const sidebarOpen = ref(false)
const currentPage = ref('dashboard')

const pageTitles = {
  dashboard: '📊 儀表板',
  subscription: '💳 訂閱管理',
  food: '🍎 食品管理',
  video: '🎬 影片介紹'
}

const pageTitle = computed(() => pageTitles[currentPage.value] || '管理系統')

const setCurrentPage = (page) => {
  currentPage.value = page
  sidebarOpen.value = false
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-active {
  margin-left: 250px;
}

.top-header {
  background: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background 0.2s;
}

.menu-btn:hover {
  background: #f0f0f0;
}

.page-title {
  font-size: 20px;
  color: #333;
}

.page-content {
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 999;
}

@media (max-width: 768px) {
  .main-content.sidebar-active {
    margin-left: 0;
  }
}
</style>