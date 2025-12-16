<template>
  <div id="app">
    <!-- 整體應用容器 -->
    <div class="app-container">
      <!-- 側邊欄 -->
      <div class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-header">
          <div class="brand-logo">
            <div class="brand-icon">🏢</div>
            <div class="brand-text">
              <h2 class="brand-title">鋒兄管理系統</h2>
              <p class="brand-subtitle">Professional Management</p>
            </div>
          </div>
          <button @click="toggleSidebar" class="sidebar-toggle">
            <span class="toggle-icon">{{ sidebarOpen ? '✕' : '☰' }}</span>
          </button>
        </div>
        
        <nav class="sidebar-nav">
          <ul>
            <li>
              <button 
                @click="setCurrentPage('dashboard')" 
                :class="{ active: currentPage === 'dashboard' }"
                class="nav-btn"
              >
                <span class="nav-icon">📊</span>
                儀表板
              </button>
            </li>
            <li>
              <button 
                @click="setCurrentPage('subscription')" 
                :class="{ active: currentPage === 'subscription' }"
                class="nav-btn"
              >
                <span class="nav-icon">💳</span>
                訂閱管理
              </button>
            </li>
            <li>
              <button 
                @click="setCurrentPage('food')" 
                :class="{ active: currentPage === 'food' }"
                class="nav-btn"
              >
                <span class="nav-icon">🛒</span>
                食物管理
              </button>
            </li>
            <li>
              <button 
                @click="setCurrentPage('video')" 
                :class="{ active: currentPage === 'video' }"
                class="nav-btn"
              >
                <span class="nav-icon">🎥</span>
                影片庫
              </button>
            </li>
            <li>
              <button 
                @click="setCurrentPage('gallery')" 
                :class="{ active: currentPage === 'gallery' }"
                class="nav-btn"
              >
                <span class="nav-icon">🖼️</span>
                圖片庫
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <!-- 主要內容區 -->
      <div class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
        <!-- 頂部標題 -->
        <header class="top-header">
          <div class="header-left">
            <button @click="toggleSidebar" class="mobile-menu-btn">
              <span class="menu-icon">☰</span>
            </button>
            <h1>{{ getPageTitle() }}</h1>
          </div>
          
          <div class="header-right">
            <!-- 暗黑模式切換按鈕 -->
            <button
              @click="toggleDarkMode"
              class="dark-mode-toggle"
              :title="isDarkMode ? '切換到亮色模式' : '切換到暗黑模式'"
            >
              <span class="dark-mode-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
            </button>
          </div>
        </header>

        <!-- 頁面內容 -->
        <main class="page-content">
          <!-- 儀表板 -->
          <DashboardPage 
            v-if="currentPage === 'dashboard'"
            :subscriptions-count="subscriptionsCount"
            :foods-count="foodsCount"
            :total-monthly-cost="totalMonthlyCost"
            @navigate="setCurrentPage"
          />

          <!-- 訂閱管理 -->
          <SubscriptionPage 
            v-if="currentPage === 'subscription'"
            ref="subscriptionPageRef"
          />

          <!-- 食物管理 -->
          <FoodPage 
            v-if="currentPage === 'food'"
            ref="foodPageRef"
          />

          <!-- 影片管理 -->
          <VideoPage 
            v-if="currentPage === 'video'"
            ref="videoPageRef"
          />

          <!-- 圖片庫 -->
          <GalleryPage 
            v-if="currentPage === 'gallery'"
            ref="galleryPageRef"
          />
        </main>
      </div>
    </div>

    <!-- 手機版遮罩層 -->
    <div 
      v-if="sidebarOpen" 
      class="mobile-overlay"
      @click="closeSidebar"
    ></div>

    <!-- 跳轉按鈕 -->
    <div class="scroll-buttons">
      <!-- 跳轉至頂部 -->
      <button
        v-show="showScrollButtons && showTopButton"
        @click="scrollToTop"
        class="scroll-btn scroll-top"
        title="回到頂部"
      >
        ⬆️
      </button>
      
      <!-- 跳轉至底部 -->
      <button
        v-show="showScrollButtons && showBottomButton"
        @click="scrollToBottom"
        class="scroll-btn scroll-bottom"
        title="跳到底部"
      >
        ⬇️
      </button>
    </div>

    <!-- 開發模式下的滾動狀態指示器 -->
    <div 
      v-if="isDevelopment" 
      class="scroll-debug-info"
      style="position: fixed; top: 100px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 8px; font-size: 12px; z-index: 2000;"
    >
      <div>滾動檢測: {{ showScrollButtons ? '✅' : '❌' }}</div>
      <div>頂部按鈕: {{ showTopButton ? '✅' : '❌' }}</div>
      <div>底部按鈕: {{ showBottomButton ? '✅' : '❌' }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import DashboardPage from '../components/pages/DashboardPage.vue'
import SubscriptionPage from '../components/pages/SubscriptionPage.vue'
import FoodPage from '../components/pages/FoodPage.vue'
import VideoPage from '../components/pages/VideoPage.vue'
import GalleryPage from '../components/pages/GalleryPage.vue'
import { useSubscriptions } from '../composables/useSubscriptions'
import { useFoods } from '../composables/useFoods'

// 頁面狀態
const currentPage = ref('dashboard')
const sidebarOpen = ref(false)

// 滾動按鈕狀態
const showScrollButtons = ref(false)
const showTopButton = ref(false)
const showBottomButton = ref(false)

// 暗黑模式狀態
const isDarkMode = ref(false)

// 組件引用
const subscriptionPageRef = ref(null)
const foodPageRef = ref(null)
const videoPageRef = ref(null)
const galleryPageRef = ref(null)

// 使用 composables 獲取資料
const { subscriptions, totalMonthlyCost, loadSubscriptions } = useSubscriptions()
const { foods, loadFoods } = useFoods()

// 計算屬性
const subscriptionsCount = computed(() => subscriptions.value.length)
const foodsCount = computed(() => foods.value.length)
const isDevelopment = computed(() => false) // Set to true for debugging scroll functionality

// 頁面導航
const setCurrentPage = (page) => {
  currentPage.value = page
  // 在手機版自動關閉側邊欄
  if (import.meta.client && window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}

const getPageTitle = () => {
  const titles = {
    dashboard: '🏢 鋒兄儀表板',
    subscription: '💳 鋒兄訂閱管理',
    food: '🛒 鋒兄食物管理',
    video: '🎥 鋒兄影片庫',
    gallery: '🖼️ 鋒兄圖片庫'
  }
  return titles[currentPage.value] || '🏢 鋒兄管理系統'
}

// 側邊欄控制
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// 暗黑模式切換
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  
  if (import.meta.client) {
    // 切換 HTML 元素的 class
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }
}

// 滾動功能
const scrollToTop = () => {
  const pageContent = document.querySelector('.page-content')
  if (pageContent) {
    // 使用多種方法確保滾動成功
    try {
      pageContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } catch (error) {
      // 備用方法
      pageContent.scrollTop = 0
    }
  }
  
  // 備用：如果頁面內容滾動失敗，嘗試窗口滾動
  try {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  } catch (error) {
    window.scrollTo(0, 0)
  }
}

const scrollToBottom = () => {
  const pageContent = document.querySelector('.page-content')
  if (pageContent) {
    // 使用多種方法確保滾動成功
    try {
      pageContent.scrollTo({
        top: pageContent.scrollHeight,
        behavior: 'smooth'
      })
    } catch (error) {
      // 備用方法
      pageContent.scrollTop = pageContent.scrollHeight
    }
  }
  
  // 備用：如果頁面內容滾動失敗，嘗試窗口滾動
  try {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    })
  } catch (error) {
    window.scrollTo(0, document.body.scrollHeight)
  }
}



// 監聽滾動事件，決定是否顯示按鈕
const handleScroll = () => {
  const pageContent = document.querySelector('.page-content')
  if (pageContent) {
    const scrollTop = pageContent.scrollTop
    const scrollHeight = pageContent.scrollHeight
    const clientHeight = pageContent.clientHeight
    
    // 檢查是否有滾動內容（至少差 10px）
    const hasScroll = scrollHeight > clientHeight + 10
    
    // 頂部按鈕：滾動超過 50px 就顯示
    showTopButton.value = hasScroll && scrollTop > 50
    
    // 底部按鈕：不在底部時顯示（距離底部超過 50px）
    showBottomButton.value = hasScroll && (scrollHeight - scrollTop - clientHeight) > 50
    
    // 基本顯示條件：有滾動內容
    showScrollButtons.value = hasScroll
    
    // 調試信息（僅在需要時啟用）
    // console.log('Scroll Debug:', { scrollTop, scrollHeight, clientHeight, hasScroll })
  }
}

// 響應式處理
const handleResize = () => {
  if (window.innerWidth > 768) {
    sidebarOpen.value = false
  }
  // 重新檢查滾動狀態
  setTimeout(handleScroll, 100)
}

// 生命週期
onMounted(async () => {
  // 載入初始資料
  loadSubscriptions()
  loadFoods()
  
  if (import.meta.client) {
    // 初始化暗黑模式
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode === 'true' || (!savedDarkMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDarkMode.value = true
      document.documentElement.classList.add('dark')
    }
    
    // 監聽視窗大小變化
    window.addEventListener('resize', handleResize)
    
    // 設置滾動監聽
    await nextTick()
    const pageContent = document.querySelector('.page-content')
    if (pageContent) {
      pageContent.addEventListener('scroll', handleScroll, { passive: true })
      // 立即檢查一次滾動狀態
      setTimeout(handleScroll, 100) // 延遲一點確保內容已渲染
    }
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', handleResize)
    
    // 移除滾動監聽
    const pageContent = document.querySelector('.page-content')
    if (pageContent) {
      pageContent.removeEventListener('scroll', handleScroll)
    }
  }
})
</script>

<style scoped>
/* CSS 變數定義 */
:root {
  /* 亮色模式 */
  --bg-primary: #f5f7fa;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f8f9fa;
  --text-primary: #2c3e50;
  --text-secondary: #666666;
  --text-muted: #999999;
  --border-color: #e1e8ed;
  --shadow: rgba(0, 0, 0, 0.1);
  --sidebar-bg: #2c3e50;
  --sidebar-text: #ffffff;
  --header-bg: #ffffff;
}

/* 暗黑模式變數 - 使用 Nuxt UI 的 dark 類別 */
:global(.dark) {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --border-color: #475569;
  --shadow: rgba(0, 0, 0, 0.5);
  --sidebar-bg: #0f172a;
  --sidebar-text: #f1f5f9;
  --header-bg: #1e293b;
}

/* 暗黑模式下的特殊樣式 */
:global(.dark) .stat-card {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
  color: var(--text-primary) !important;
}

:global(.dark) .dashboard-actions {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .action-card {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
  border: 1px solid #64748b !important;
}

:global(.dark) .copyright-info {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6) !important;
}

/* 暗黑模式下的頂部標題 */
:global(.dark) .top-header {
  background: linear-gradient(135deg, var(--header-bg) 0%, rgba(30, 41, 59, 0.95) 100%) !important;
  border-bottom: 1px solid #475569 !important;
}

:global(.dark) .top-header h1 {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  color: #f1f5f9 !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
}

/* 暗黑模式下的側邊欄 */
:global(.dark) .sidebar {
  background: linear-gradient(180deg, var(--sidebar-bg) 0%, #0f172a 100%) !important;
  border-right: 1px solid #475569 !important;
}

:global(.dark) .sidebar-header {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%) !important;
  border-bottom: 1px solid #475569 !important;
}

:global(.dark) .nav-btn:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

:global(.dark) .nav-btn.active {
  background: #60a5fa !important;
  border-right: 4px solid #3b82f6 !important;
}

/* 暗黑模式下的頁面內容 */
:global(.dark) .page-content {
  background: linear-gradient(135deg, var(--bg-primary) 0%, #0f172a 100%) !important;
}

/* 暗黑模式下的文字顏色 */
:global(.dark) .stat-content h3 {
  color: var(--text-secondary) !important;
}

:global(.dark) .stat-label {
  color: var(--text-muted) !important;
}

:global(.dark) .trend-icon {
  color: var(--text-muted) !important;
}

:global(.dark) .actions-title h3 {
  color: var(--text-primary) !important;
}

:global(.dark) .actions-subtitle {
  color: var(--text-secondary) !important;
}

:global(.dark) .action-description {
  color: var(--text-muted) !important;
}

:global(.dark) .title-icon {
  color: #60a5fa !important;
}

/* 暗黑模式下的趨勢背景 */
:global(.dark) .stat-trend {
  background: rgba(255, 255, 255, 0.1) !important;
}

/* 暗黑模式下的滾動條 */
:global(.dark) *::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(203, 213, 225, 0.5) 0%, rgba(148, 163, 184, 0.5) 100%) !important;
}

:global(.dark) *::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(203, 213, 225, 0.8) 0%, rgba(148, 163, 184, 0.8) 100%) !important;
}

/* 全域樣式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--bg-primary);
  min-height: 100vh;
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

/* 側邊欄樣式 */
.sidebar {
  width: 300px;
  background: linear-gradient(180deg, var(--sidebar-bg) 0%, #1a202c 100%);
  color: var(--sidebar-text);
  position: fixed;
  top: 0;
  left: -300px;
  height: 100vh;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar.sidebar-open {
  left: 0;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
}

.sidebar-header {
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
}

/* 品牌標誌樣式 */
.brand-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  animation: brandPulse 3s ease-in-out infinite;
}

@keyframes brandPulse {
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }
  50% { 
    transform: scale(1.08); 
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
  }
}

/* 品牌標題發光效果 */
@keyframes titleGlow {
  0%, 100% { 
    text-shadow: 0 2px 8px rgba(255, 255, 255, 0.4);
  }
  50% { 
    text-shadow: 0 2px 12px rgba(255, 255, 255, 0.7), 0 0 20px rgba(96, 165, 250, 0.3);
  }
}

/* 移除動畫以確保文字清晰 */

.brand-text {
  flex: 1;
}

.brand-title {
  font-size: 1.6rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
  letter-spacing: 0.5px;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.4);
}

.brand-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.sidebar-toggle {
  /* Nuxt UI 按鈕樣式由組件處理 */
}

.sidebar-nav {
  padding: 1.5rem 0;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0 1rem;
}

.sidebar-nav li {
  margin-bottom: 0;
}

.nav-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: var(--sidebar-text);
  text-align: left;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.nav-btn.active {
  background: #3498db;
  border-right: 4px solid #2980b9;
}

.nav-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  display: inline-block;
  width: 1.5rem;
  text-align: center;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.toggle-icon {
  font-size: 1.2rem;
  display: inline-block;
}

.mobile-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-btn:hover {
  background: var(--bg-tertiary);
}

.menu-icon {
  font-size: 1.2rem;
  display: inline-block;
}

.dark-mode-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-mode-toggle:hover {
  background: var(--bg-tertiary);
  transform: rotate(180deg);
}

.dark-mode-icon {
  font-size: 1.2rem;
  display: inline-block;
}

/* 主要內容區樣式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-open {
  margin-left: 0;
}

/* 頂部標題 */
.top-header {
  background: linear-gradient(135deg, var(--header-bg) 0%, rgba(255, 255, 255, 0.95) 100%);
  padding: 1.25rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-menu-btn {
  /* Nuxt UI 按鈕樣式由組件處理 */
}

.top-header h1 {
  color: var(--text-primary);
  font-size: 2.4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  text-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  letter-spacing: 1px;
  text-transform: none;
}

/* Nuxt UI 暗黑模式按鈕自定義樣式 */
.header-right .dark-mode-toggle {
  transition: transform 0.3s ease;
}

.header-right .dark-mode-toggle:hover {
  transform: rotate(180deg);
}

/* 頁面內容 */
.page-content {
  flex: 1;
  padding: 2.5rem;
  overflow-y: auto;
  background: linear-gradient(135deg, var(--bg-primary) 0%, #f8fafc 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: calc(100vh - 80px);
  max-height: calc(100vh - 80px);
}

/* 手機版遮罩層 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

/* ===== 響應式設計優化 ===== */

/* 桌面端 - 標準和高縮放 */
@media (min-width: 1200px) {
  .sidebar {
    position: static;
    left: 0;
    width: 320px;
    box-shadow: none;
  }
  
  .sidebar-toggle {
    display: none;
  }
  
  .mobile-menu-btn {
    display: none;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .page-content {
    padding: 3rem 4rem;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .brand-title {
    font-size: 1.8rem;
  }
  
  .top-header h1 {
    font-size: 2.6rem;
  }
  
  .page-brand-title {
    font-size: 2rem !important;
  }
}

/* 桌面端 150% 縮放優化 */
@media (min-width: 1200px) and (min-resolution: 144dpi) {
  .page-content {
    padding: 2.5rem 3rem;
  }
  
  .brand-title {
    font-size: 1.6rem;
  }
  
  .top-header h1 {
    font-size: 2.2rem;
  }
  
  .page-brand-title {
    font-size: 1.8rem !important;
  }
  
  .sidebar {
    width: 300px;
  }
  
  .nav-btn {
    padding: 0.8rem 1.2rem;
    font-size: 0.95rem;
  }
  
  .scroll-btn {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
}

/* 平板端 - Redmi Pad SE 8.7 (1340x800) */
@media (min-width: 769px) and (max-width: 1199px) {
  .sidebar {
    position: static;
    left: 0;
    width: 280px;
    box-shadow: none;
  }
  
  .sidebar-toggle {
    display: none;
  }
  
  .mobile-menu-btn {
    display: none;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .page-content {
    padding: 2.5rem 3rem;
  }
  
  .brand-title {
    font-size: 1.5rem;
  }
  
  .top-header h1 {
    font-size: 2.2rem;
  }
  
  .page-brand-title {
    font-size: 1.7rem !important;
  }
  
  .nav-btn {
    padding: 0.9rem 1.3rem;
    font-size: 0.95rem;
  }
  
  .scroll-btn {
    width: 48px;
    height: 48px;
    font-size: 1.4rem;
  }
}

/* 平板橫向模式優化 */
@media (min-width: 769px) and (max-width: 1199px) and (orientation: landscape) {
  .sidebar {
    width: 260px;
  }
  
  .page-content {
    padding: 2rem 2.5rem;
  }
  
  .top-header {
    padding: 1rem 2rem;
  }
  
  .brand-title {
    font-size: 1.4rem;
  }
  
  .top-header h1 {
    font-size: 2rem;
  }
}

/* 平板直向模式優化 */
@media (min-width: 769px) and (max-width: 1199px) and (orientation: portrait) {
  .sidebar {
    width: 300px;
  }
  
  .page-content {
    padding: 2.5rem;
  }
  
  .brand-title {
    font-size: 1.6rem;
  }
  
  .top-header h1 {
    font-size: 2.4rem;
  }
}

/* 手機端通用樣式 */
@media (max-width: 768px) {
  .mobile-overlay {
    display: block;
  }
  
  .top-header {
    padding: 1rem 1.5rem;
  }
  
  .page-content {
    padding: 1.5rem;
  }
  
  .sidebar {
    width: 100%;
    left: -100%;
  }
  
  .sidebar.sidebar-open {
    left: 0;
  }
  
  .sidebar-header {
    padding: 1.5rem;
  }
  
  .brand-title {
    font-size: 1.4rem;
  }
  
  .brand-subtitle {
    font-size: 0.7rem;
  }
  
  .nav-btn {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
  
  .scroll-btn {
    width: 45px;
    height: 45px;
    font-size: 1.2rem;
  }
  
  .scroll-buttons {
    right: 1rem;
    bottom: 1rem;
  }
}

/* Samsung Galaxy A53 (412x915) - 直向 */
@media (max-width: 480px) and (orientation: portrait) {
  .top-header {
    padding: 0.8rem 1rem;
  }
  
  .top-header h1 {
    font-size: 1.4rem;
  }
  
  .page-content {
    padding: 1rem;
  }
  
  .brand-title {
    font-size: 1.3rem;
  }
  
  .brand-subtitle {
    font-size: 0.65rem;
  }
  
  .page-brand-title {
    font-size: 1.4rem !important;
  }
  
  .sidebar-header {
    padding: 1.2rem;
  }
  
  .nav-btn {
    padding: 0.9rem 1.2rem;
    font-size: 0.95rem;
  }
  
  .nav-icon {
    font-size: 1.1rem;
  }
  
  .scroll-btn {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
  }
  
  .scroll-buttons {
    right: 0.8rem;
    bottom: 0.8rem;
  }
  
  .dark-mode-toggle,
  .mobile-menu-btn {
    padding: 0.4rem;
  }
  
  .dark-mode-icon,
  .menu-icon {
    font-size: 1.1rem;
  }
}

/* Samsung Galaxy A53 (915x412) - 橫向 */
@media (max-width: 915px) and (max-height: 480px) and (orientation: landscape) {
  .top-header {
    padding: 0.6rem 1rem;
  }
  
  .top-header h1 {
    font-size: 1.2rem;
  }
  
  .page-content {
    padding: 0.8rem;
  }
  
  .brand-title {
    font-size: 1.1rem;
  }
  
  .brand-subtitle {
    font-size: 0.6rem;
  }
  
  .page-brand-title {
    font-size: 1.2rem !important;
  }
  
  .sidebar-header {
    padding: 1rem;
  }
  
  .nav-btn {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }
  
  .nav-icon {
    font-size: 1rem;
  }
  
  .scroll-btn {
    width: 38px;
    height: 38px;
    font-size: 1rem;
  }
  
  .scroll-buttons {
    right: 0.6rem;
    bottom: 0.6rem;
  }
}

/* iPhone SE2 (375x667) - 直向 */
@media (max-width: 375px) and (orientation: portrait) {
  .top-header {
    padding: 0.7rem 0.8rem;
  }
  
  .top-header h1 {
    font-size: 1.2rem;
  }
  
  .page-content {
    padding: 0.8rem;
  }
  
  .brand-title {
    font-size: 1.2rem;
  }
  
  .brand-subtitle {
    font-size: 0.6rem;
  }
  
  .page-brand-title {
    font-size: 1.3rem !important;
  }
  
  .sidebar-header {
    padding: 1rem;
  }
  
  .brand-icon {
    font-size: 2rem;
    padding: 0.4rem;
  }
  
  .nav-btn {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }
  
  .nav-icon {
    font-size: 1rem;
    width: 1.3rem;
  }
  
  .scroll-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .scroll-buttons {
    right: 0.6rem;
    bottom: 0.6rem;
  }
  
  .dark-mode-toggle,
  .mobile-menu-btn {
    padding: 0.3rem;
  }
  
  .dark-mode-icon,
  .menu-icon {
    font-size: 1rem;
  }
}

/* iPhone SE2 (667x375) - 橫向 */
@media (max-width: 667px) and (max-height: 375px) and (orientation: landscape) {
  .top-header {
    padding: 0.5rem 0.8rem;
  }
  
  .top-header h1 {
    font-size: 1rem;
  }
  
  .page-content {
    padding: 0.6rem;
  }
  
  .brand-title {
    font-size: 1rem;
  }
  
  .brand-subtitle {
    font-size: 0.55rem;
  }
  
  .page-brand-title {
    font-size: 1.1rem !important;
  }
  
  .sidebar-header {
    padding: 0.8rem;
  }
  
  .brand-icon {
    font-size: 1.8rem;
    padding: 0.3rem;
  }
  
  .nav-btn {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .nav-icon {
    font-size: 0.9rem;
    width: 1.2rem;
  }
  
  .scroll-btn {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
  
  .scroll-buttons {
    right: 0.5rem;
    bottom: 0.5rem;
  }
}

/* 超小螢幕優化 (320px 以下) */
@media (max-width: 320px) {
  .top-header {
    padding: 0.5rem;
  }
  
  .top-header h1 {
    font-size: 1rem;
  }
  
  .page-content {
    padding: 0.5rem;
  }
  
  .brand-title {
    font-size: 1rem;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .page-brand-title {
    font-size: 1.1rem !important;
  }
  
  .sidebar-header {
    padding: 0.8rem;
  }
  
  .brand-icon {
    font-size: 1.6rem;
    padding: 0.3rem;
  }
  
  .nav-btn {
    padding: 0.7rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .nav-icon {
    font-size: 0.9rem;
    width: 1.1rem;
  }
  
  .scroll-btn {
    width: 34px;
    height: 34px;
    font-size: 0.8rem;
  }
  
  .scroll-buttons {
    right: 0.4rem;
    bottom: 0.4rem;
  }
}

/* 頁面切換動畫 */
.page-content > * {
  animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 全域美化效果 */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

*::-webkit-scrollbar {
  width: 8px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.5) 0%, rgba(107, 114, 128, 0.5) 100%);
  border-radius: 4px;
}

*::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.8) 0%, rgba(107, 114, 128, 0.8) 100%);
}

/* 選擇文字的美化 */
::selection {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

/* 焦點狀態美化 */
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

/* 載入動畫 */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}

/* 微互動效果 */
.interactive-element {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive-element:hover {
  transform: translateY(-2px);
}

.interactive-element:active {
  transform: translateY(0);
}

/* 滾動按鈕樣式 - 配合 Nuxt UI */
.scroll-buttons {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 1500;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}



.scroll-btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.scroll-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
}

.scroll-btn:active {
  transform: translateY(-2px) scale(1.02);
}

.scroll-top {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.scroll-bottom {
  background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
  color: white;
}

/* 按鈕進入/離開動畫 */
.scroll-btn {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 響應式設計 - 手機版調整按鈕位置 */
@media (max-width: 768px) {
  .scroll-buttons {
    right: 1rem;
    bottom: 1rem;
  }
  
  .scroll-btn {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .scroll-buttons {
    right: 0.5rem;
    bottom: 0.5rem;
  }
  
  .scroll-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

/* 當側邊欄開啟時，調整按鈕位置避免重疊 */
@media (min-width: 769px) {
  .scroll-buttons {
    right: 2rem;
  }
}

/* 手機版側邊欄開啟時隱藏按鈕 */
@media (max-width: 768px) {
  .mobile-overlay ~ .scroll-buttons {
    display: none;
  }
}
</style>

<!-- 全域暗黑模式樣式 -->
<style>
/* Nuxt UI 暗黑模式增強樣式 */

/* 自定義 CSS 變數 - 配合 Nuxt UI */
:root {
  --custom-shadow: rgba(0, 0, 0, 0.1);
  --custom-shadow-hover: rgba(0, 0, 0, 0.15);
}

.dark {
  --custom-shadow: rgba(0, 0, 0, 0.3);
  --custom-shadow-hover: rgba(0, 0, 0, 0.4);
}

/* 卡片陰影增強 */
.stat-card,
.subscription-card,
.food-card,
.video-card,
.image-card {
  box-shadow: 0 4px 15px var(--custom-shadow);
  transition: all 0.3s ease;
}

.stat-card:hover,
.subscription-card:hover,
.food-card:hover,
.video-card:hover,
.image-card:hover {
  box-shadow: 0 8px 25px var(--custom-shadow-hover);
}

/* 滾動按鈕增強 */
.scroll-btn {
  box-shadow: 0 4px 15px var(--custom-shadow) !important;
}

.scroll-btn:hover {
  box-shadow: 0 6px 20px var(--custom-shadow-hover) !important;
}

/* 完整暗黑模式樣式 */
:global(.dark) {
  color-scheme: dark;
}

:global(.dark) body {
  background: #0f172a !important;
  color: #f1f5f9 !important;
}

:global(.dark) * {
  border-color: #475569 !important;
}

:global(.dark) input,
:global(.dark) textarea,
:global(.dark) select {
  background: #1e293b !important;
  color: #f1f5f9 !important;
  border: 1px solid #475569 !important;
}

:global(.dark) input:focus,
:global(.dark) textarea:focus,
:global(.dark) select:focus {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1) !important;
}

:global(.dark) button:not(.action-btn-main):not(.scroll-btn) {
  background: #334155 !important;
  color: #f1f5f9 !important;
  border: 1px solid #475569 !important;
}

:global(.dark) button:not(.action-btn-main):not(.scroll-btn):hover {
  background: #475569 !important;
}

:global(.dark) .sidebar-toggle:hover,
:global(.dark) .mobile-menu-btn:hover,
:global(.dark) .dark-mode-toggle:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

:global(.dark) .mobile-overlay {
  background: rgba(0, 0, 0, 0.8) !important;
}

/* 暗黑模式下的選擇文字 */
:global(.dark) ::selection {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%) !important;
  color: white !important;
}

/* 暗黑模式下的焦點狀態 */
:global(.dark) :focus-visible {
  outline: 2px solid #60a5fa !important;
}

/* 暗黑模式下的載入動畫 */
:global(.dark) .loading-shimmer {
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%) !important;
}

/* DashboardPage 暗黑模式樣式 - 強制覆蓋 */
:global(.dark) .dashboard-container h1,
:global(.dark) .dashboard-title {
  color: #f1f5f9 !important;
}

:global(.dark) .stat-card {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
  color: #f1f5f9 !important;
}

:global(.dark) .stat-content h3 {
  color: #cbd5e1 !important;
}

:global(.dark) .stat-label {
  color: #94a3b8 !important;
}

:global(.dark) .trend-icon {
  color: #94a3b8 !important;
}

:global(.dark) .stat-trend {
  background: rgba(255, 255, 255, 0.1) !important;
}

:global(.dark) .dashboard-actions {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .actions-title h3 {
  color: #f1f5f9 !important;
}

:global(.dark) .actions-subtitle {
  color: #cbd5e1 !important;
}

:global(.dark) .title-icon {
  color: #60a5fa !important;
}

:global(.dark) .action-card {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
  border: 1px solid #64748b !important;
}

:global(.dark) .action-card:hover {
  background: linear-gradient(135deg, #475569 0%, #334155 100%) !important;
  box-shadow: 0 8px 25px rgba(0,0,0,0.4) !important;
}

:global(.dark) .action-description {
  color: #94a3b8 !important;
}

:global(.dark) .copyright-info {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6) !important;
}

/* 強制覆蓋所有白色背景和文字顏色 */
:global(.dark) .stat-card,
:global(.dark) .dashboard-actions {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .action-card {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
  border: 1px solid #64748b !important;
}

/* 確保所有文字顏色正確 */
:global(.dark) .stat-card h3,
:global(.dark) .dashboard-actions h3,
:global(.dark) .action-card h3 {
  color: #f1f5f9 !important;
}

:global(.dark) .stat-card p,
:global(.dark) .dashboard-actions p,
:global(.dark) .action-card p {
  color: #cbd5e1 !important;
}

:global(.dark) .stat-card span,
:global(.dark) .dashboard-actions span,
:global(.dark) .action-card span {
  color: inherit !important;
}

/* 確保數字顯示正確 - 暗黑模式下使用純色 */
:global(.dark) .stat-number {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  color: #60a5fa !important;
}

/* 暗黑模式下的懸停效果 */
:global(.dark) .stat-card:hover {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6) !important;
}

:global(.dark) .dashboard-actions:hover {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
}

/* 新增內容的暗黑模式樣式 */
:global(.dark) .additional-content h2 {
  color: #f1f5f9 !important;
}

:global(.dark) .info-card {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .info-card h4 {
  color: #f1f5f9 !important;
}

:global(.dark) .info-card p {
  color: #cbd5e1 !important;
}

:global(.dark) .activity-list {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .activity-item {
  border-bottom: 1px solid #475569 !important;
}

:global(.dark) .activity-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

:global(.dark) .activity-title {
  color: #f1f5f9 !important;
}

:global(.dark) .activity-time {
  color: #94a3b8 !important;
}

/* 修復所有可能的文字顏色問題 */
:global(.dark) .stat-number {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  color: #60a5fa !important;
}

:global(.dark) .copyright-info h2 {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  color: #f1f5f9 !important;
}

:global(.dark) .copyright-text {
  color: #cbd5e1 !important;
  opacity: 1 !important;
}

:global(.dark) .tech-stack {
  color: #94a3b8 !important;
  opacity: 1 !important;
}

:global(.dark) .copyright-content {
  color: #f1f5f9 !important;
}

:global(.dark) .copyright-text-wrapper {
  color: inherit !important;
}

:global(.dark) .copyright-text-wrapper * {
  color: inherit !important;
}

/* 確保品牌標題在暗黑模式下突出顯示 */
:global(.dark) .brand-title {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  color: #ffffff !important;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.9) !important,
    0 2px 4px rgba(0, 0, 0, 0.7) !important,
    0 4px 8px rgba(0, 0, 0, 0.5) !important;
}

:global(.dark) .brand-subtitle {
  color: rgba(255, 255, 255, 0.9) !important;
}

:global(.dark) .brand-icon {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%) !important;
  box-shadow: 0 4px 15px rgba(96, 165, 250, 0.4) !important;
}

/* 額外確保版權資訊文字可見 */
:global(.dark) .copyright-info * {
  -webkit-text-fill-color: unset !important;
}

:global(.dark) .company-name {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  color: #ffffff !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8) !important;
}

:global(.dark) .company-tagline {
  color: rgba(255, 255, 255, 0.95) !important;
}

:global(.dark) .copyright-text {
  color: #e2e8f0 !important;
}

:global(.dark) .tech-stack {
  color: #cbd5e1 !important;
}

/* 最終確保版權資訊完全可見 */
:global(.dark) .copyright-info,
:global(.dark) .copyright-content,
:global(.dark) .copyright-text-wrapper {
  color: #f1f5f9 !important;
}

:global(.dark) .copyright-info h2,
:global(.dark) .copyright-info p,
:global(.dark) .copyright-info span {
  color: inherit !important;
  -webkit-text-fill-color: unset !important;
  background: none !important;
  -webkit-background-clip: unset !important;
  background-clip: unset !important;
}

/* ===== 全部網頁暗黑模式樣式 ===== */

/* 1. SubscriptionPage 暗黑模式 */
:global(.dark) .subscription-management {
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:global(.dark) .subscription-management h1,
:global(.dark) .subscription-management h3 {
  color: #f1f5f9 !important;
}

:global(.dark) .subscription-management p {
  color: #cbd5e1 !important;
}

:global(.dark) .user-info {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .add-subscription,
:global(.dark) .subscription-list {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .subscription-card {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
  border: 1px solid #64748b !important;
}

:global(.dark) .subscription-form input,
:global(.dark) .subscription-form select,
:global(.dark) .subscription-form textarea {
  background: #1e293b !important;
  color: #f1f5f9 !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .subscription-form label {
  color: #cbd5e1 !important;
}

:global(.dark) .form-group button {
  background: #3b82f6 !important;
  color: white !important;
  border: 1px solid #2563eb !important;
}

:global(.dark) .form-group button:hover {
  background: #2563eb !important;
}

/* 2. FoodPage 暗黑模式 */
:global(.dark) .food-management {
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:global(.dark) .food-management h1,
:global(.dark) .food-management h3 {
  color: #f1f5f9 !important;
}

:global(.dark) .food-management p {
  color: #cbd5e1 !important;
}

:global(.dark) .add-food,
:global(.dark) .food-list {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .food-card {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
  border: 1px solid #64748b !important;
}

:global(.dark) .food-form input,
:global(.dark) .food-form select,
:global(.dark) .food-form textarea {
  background: #1e293b !important;
  color: #f1f5f9 !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .food-form label {
  color: #cbd5e1 !important;
}

/* 3. VideoPage 暗黑模式 */
:global(.dark) .video-manager-container {
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:global(.dark) .video-manager-container h1,
:global(.dark) .video-manager-container h3 {
  color: #f1f5f9 !important;
}

:global(.dark) .video-manager-container p {
  color: #cbd5e1 !important;
}

:global(.dark) .video-info,
:global(.dark) .upload-guide,
:global(.dark) .cache-controls {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .video-card {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
  border: 1px solid #64748b !important;
}

:global(.dark) .video-stats .stat-item,
:global(.dark) .video-stats .stat-label,
:global(.dark) .video-stats .stat-value {
  color: #cbd5e1 !important;
}

:global(.dark) .cache-btn,
:global(.dark) .control-buttons button {
  background: #3b82f6 !important;
  color: white !important;
  border: 1px solid #2563eb !important;
}

:global(.dark) .cache-btn:hover {
  background: #2563eb !important;
}

/* 4. GalleryPage 暗黑模式 */
:global(.dark) .image-gallery-container {
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:global(.dark) .image-gallery-container h1 {
  color: #f1f5f9 !important;
}

:global(.dark) .gallery-info,
:global(.dark) .gallery-controls {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .gallery-info p,
:global(.dark) .gallery-stats .stat-item {
  color: #cbd5e1 !important;
}

:global(.dark) .search-input {
  background: #1e293b !important;
  color: #f1f5f9 !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .view-btn,
:global(.dark) .clear-btn {
  background: #334155 !important;
  color: #f1f5f9 !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .view-btn:hover,
:global(.dark) .clear-btn:hover {
  background: #475569 !important;
}

:global(.dark) .view-btn.active {
  background: #3b82f6 !important;
  color: white !important;
}

:global(.dark) .image-card {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
  border: 1px solid #64748b !important;
}

:global(.dark) .image-info {
  color: #cbd5e1 !important;
}

:global(.dark) .lightbox {
  background: rgba(0, 0, 0, 0.9) !important;
}

:global(.dark) .lightbox-close {
  background: #1e293b !important;
  color: #f1f5f9 !important;
  border: 1px solid #475569 !important;
}

/* ===== 通用暗黑模式樣式 ===== */

/* 所有頁面的基本容器 */
:global(.dark) .subscription-management,
:global(.dark) .food-management,
:global(.dark) .video-manager-container,
:global(.dark) .image-gallery-container {
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  min-height: 100vh !important;
}

/* 所有標題 */
:global(.dark) h1,
:global(.dark) h2,
:global(.dark) h3,
:global(.dark) h4,
:global(.dark) h5,
:global(.dark) h6 {
  color: #f1f5f9 !important;
}

/* 所有段落和文字 */
:global(.dark) p,
:global(.dark) span,
:global(.dark) div {
  color: inherit !important;
}

/* 所有表單元素 */
:global(.dark) input,
:global(.dark) textarea,
:global(.dark) select {
  background: #1e293b !important;
  color: #f1f5f9 !important;
  border: 1px solid #475569 !important;
}

:global(.dark) input:focus,
:global(.dark) textarea:focus,
:global(.dark) select:focus {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1) !important;
}

/* 所有標籤 */
:global(.dark) label {
  color: #cbd5e1 !important;
}

/* 所有按鈕 */
:global(.dark) button:not(.action-btn-main):not(.scroll-btn) {
  background: #334155 !important;
  color: #f1f5f9 !important;
  border: 1px solid #475569 !important;
}

:global(.dark) button:not(.action-btn-main):not(.scroll-btn):hover {
  background: #475569 !important;
}

/* 主要按鈕 */
:global(.dark) .btn-primary,
:global(.dark) .cache-btn,
:global(.dark) .form-group button[type="submit"] {
  background: #3b82f6 !important;
  color: white !important;
  border: 1px solid #2563eb !important;
}

:global(.dark) .btn-primary:hover,
:global(.dark) .cache-btn:hover {
  background: #2563eb !important;
}

/* 卡片和容器 */
:global(.dark) .card,
:global(.dark) .info-card,
:global(.dark) .subscription-card,
:global(.dark) .food-card,
:global(.dark) .video-card,
:global(.dark) .image-card {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
  border: 1px solid #64748b !important;
  color: #f1f5f9 !important;
}

/* 主要區域 */
:global(.dark) .user-info,
:global(.dark) .add-subscription,
:global(.dark) .add-food,
:global(.dark) .video-info,
:global(.dark) .upload-guide,
:global(.dark) .cache-controls,
:global(.dark) .gallery-info,
:global(.dark) .gallery-controls {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
  color: #f1f5f9 !important;
}

/* 列表容器 */
:global(.dark) .subscription-list,
:global(.dark) .food-list,
:global(.dark) .video-list,
:global(.dark) .image-grid {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
}

/* 確保所有文字都可見 - 移除所有透明文字效果 */
:global(.dark) * {
  -webkit-text-fill-color: unset !important;
}

/* 修復所有可能的透明文字問題 */
:global(.dark) .stat-number {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  color: #60a5fa !important;
}

:global(.dark) .company-name {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  color: #ffffff !important;
}

:global(.dark) .top-header h1 {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  color: #f1f5f9 !important;
}

/* 全域修復所有使用 background-clip: text 的元素 */
:global(.dark) *[style*="background-clip: text"],
:global(.dark) *[style*="-webkit-background-clip: text"] {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  color: inherit !important;
}

:global(.dark) .top-header h1 {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  color: #f1f5f9 !important;
  text-shadow: 0 2px 8px rgba(241, 245, 249, 0.3) !important;
}

/* 確保所有文字都有正確的顏色 - 移除所有透明文字效果 */
:global(.dark) * {
  -webkit-text-fill-color: unset !important;
}

/* 頁面品牌標題樣式 - 確保在所有模式下都突出顯示 */
.page-brand-title {
  font-size: 1.8rem !important;
  font-weight: 900 !important;
  color: #2c3e50 !important;
  text-shadow: 0 2px 8px rgba(44, 62, 80, 0.3) !important;
  letter-spacing: 0.5px !important;
  margin: 0 !important;
}

:global(.dark) .page-brand-title {
  color: #ffffff !important;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.9) !important,
    0 2px 4px rgba(0, 0, 0, 0.7) !important,
    0 4px 8px rgba(0, 0, 0, 0.5) !important,
    0 0 20px rgba(96, 165, 250, 0.3) !important;
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
}

/* 強制設置所有容器的基礎文字顏色 */
:global(.dark) .stat-card {
  color: #f1f5f9 !important;
}

:global(.dark) .dashboard-actions {
  color: #f1f5f9 !important;
}

:global(.dark) .action-card {
  color: #f1f5f9 !important;
}

:global(.dark) .info-card {
  color: #f1f5f9 !important;
}

:global(.dark) .activity-list {
  color: #f1f5f9 !important;
}

/* 具體的文字元素顏色 */
:global(.dark) .stat-content h3 {
  color: #cbd5e1 !important;
}

:global(.dark) .stat-label {
  color: #94a3b8 !important;
}

:global(.dark) .stat-number {
  color: #60a5fa !important;
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
}

:global(.dark) .actions-title h3 {
  color: #f1f5f9 !important;
}

:global(.dark) .actions-subtitle {
  color: #cbd5e1 !important;
}

:global(.dark) .action-description {
  color: #94a3b8 !important;
}

/* ===== 頁面特定暗黑模式增強 ===== */

/* SubscriptionPage 特定樣式 */
:global(.dark) .subscription-management .user-info h3 {
  color: #ffffff !important;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.9) !important,
    0 2px 4px rgba(0, 0, 0, 0.7) !important,
    0 4px 8px rgba(0, 0, 0, 0.5) !important;
}

:global(.dark) .subscription-card {
  color: #f1f5f9 !important;
}

:global(.dark) .subscription-card .card-header h4 {
  color: #ffffff !important;
  font-weight: bold !important;
}

:global(.dark) .subscription-card .card-content {
  color: #f1f5f9 !important;
}

:global(.dark) .subscription-card .info-row {
  color: #f1f5f9 !important;
}

:global(.dark) .subscription-card .info-row .label {
  color: #94a3b8 !important;
}

:global(.dark) .subscription-card .info-row span:not(.label) {
  color: #f1f5f9 !important;
}

:global(.dark) .subscription-card .price {
  color: #f87171 !important;
}

:global(.dark) .subscription-card .link {
  color: #60a5fa !important;
}

:global(.dark) .subscription-card .date-normal {
  color: #34d399 !important;
}

:global(.dark) .subscription-card .date-soon {
  color: #fbbf24 !important;
}

:global(.dark) .subscription-card .date-overdue {
  color: #f87171 !important;
}

/* 訂閱管理表格和統計樣式 */
:global(.dark) .subscription-management .total-count {
  color: #94a3b8 !important;
}

:global(.dark) .subscription-management .total-cost {
  color: #f1f5f9 !important;
}

:global(.dark) .subscription-management .no-subscriptions {
  color: #94a3b8 !important;
}

/* FoodPage 特定樣式 */
:global(.dark) .food-management .user-info h3 {
  color: #ffffff !important;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.9) !important,
    0 2px 4px rgba(0, 0, 0, 0.7) !important,
    0 4px 8px rgba(0, 0, 0, 0.5) !important;
}

:global(.dark) .food-card {
  color: #f1f5f9 !important;
}

:global(.dark) .food-card .card-header h4 {
  color: #ffffff !important;
  font-weight: bold !important;
}

:global(.dark) .food-card .card-content {
  color: #f1f5f9 !important;
}

:global(.dark) .food-card .info-row {
  color: #f1f5f9 !important;
}

:global(.dark) .food-card .info-row .label {
  color: #94a3b8 !important;
}

:global(.dark) .food-card .info-row span:not(.label) {
  color: #f1f5f9 !important;
}

:global(.dark) .food-card .price {
  color: #f87171 !important;
}

:global(.dark) .food-card .key-info-item {
  color: #f1f5f9 !important;
}

:global(.dark) .food-card .other-info {
  color: #f1f5f9 !important;
}

/* 食物管理統計樣式 */
:global(.dark) .food-management .total-count {
  color: #94a3b8 !important;
}

:global(.dark) .food-management .expiry-warning {
  color: #f87171 !important;
}

:global(.dark) .food-management .no-foods {
  color: #94a3b8 !important;
}

:global(.dark) .food-card.food-expired {
  border-color: #f87171 !important;
  background: rgba(248, 113, 113, 0.1) !important;
}

:global(.dark) .food-card.food-critical {
  border-color: #fbbf24 !important;
  background: rgba(251, 191, 36, 0.1) !important;
}

:global(.dark) .food-card.food-warning {
  border-color: #facc15 !important;
  background: rgba(250, 204, 21, 0.1) !important;
}

:global(.dark) .food-card.food-normal {
  border-color: #34d399 !important;
  background: rgba(52, 211, 153, 0.1) !important;
}

/* VideoPage 特定樣式 */
:global(.dark) .video-manager-container h1 {
  color: #ffffff !important;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.9) !important,
    0 2px 4px rgba(0, 0, 0, 0.7) !important,
    0 4px 8px rgba(0, 0, 0, 0.5) !important;
}

:global(.dark) .video-card {
  color: #f1f5f9 !important;
}

:global(.dark) .video-card .video-header h4 {
  color: #ffffff !important;
  font-weight: bold !important;
}

:global(.dark) .video-card .video-info-panel {
  color: #f1f5f9 !important;
}

:global(.dark) .video-card .detail-row {
  color: #f1f5f9 !important;
}

:global(.dark) .video-card .detail-label {
  color: #94a3b8 !important;
}

:global(.dark) .video-card .detail-value {
  color: #f1f5f9 !important;
}

/* 影片管理統計和控制樣式 */
:global(.dark) .video-info .stat-item {
  color: #f1f5f9 !important;
}

:global(.dark) .video-info .stat-label {
  color: #cbd5e1 !important;
}

:global(.dark) .video-info .stat-value {
  color: #ffffff !important;
}

:global(.dark) .upload-guide {
  color: #f1f5f9 !important;
}

:global(.dark) .upload-guide h3 {
  color: #ffffff !important;
}

:global(.dark) .upload-guide p {
  color: #cbd5e1 !important;
}

:global(.dark) .upload-guide li {
  color: #cbd5e1 !important;
}

:global(.dark) .cache-controls h3 {
  color: #ffffff !important;
}

:global(.dark) .video-list h3 {
  color: #ffffff !important;
}

:global(.dark) .tech-info h3 {
  color: #ffffff !important;
}

:global(.dark) .feature-content h4 {
  color: #f1f5f9 !important;
}

:global(.dark) .feature-content p {
  color: #cbd5e1 !important;
}

/* 暗黑模式下的延遲載入和錯誤處理 */
:global(.dark) .video-lazy-preview {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
}

:global(.dark) .preview-overlay {
  background: rgba(0, 0, 0, 0.8) !important;
  color: #f1f5f9 !important;
}

:global(.dark) .preview-info h4 {
  color: #ffffff !important;
}

:global(.dark) .preview-size,
:global(.dark) .preview-hint {
  color: #cbd5e1 !important;
}

:global(.dark) .video-error-overlay {
  background: rgba(30, 41, 59, 0.95) !important;
  color: #f1f5f9 !important;
}

:global(.dark) .error-content h4 {
  color: #f87171 !important;
}

:global(.dark) .error-message {
  color: #cbd5e1 !important;
}

:global(.dark) .error-details {
  background: rgba(248, 113, 113, 0.1) !important;
  border-color: rgba(248, 113, 113, 0.3) !important;
  color: #f1f5f9 !important;
}

:global(.dark) .progress-bar {
  background: rgba(255, 255, 255, 0.2) !important;
}

:global(.dark) .progress-text {
  color: #cbd5e1 !important;
}

:global(.dark) .blob-status-notification {
  background: #1e293b !important;
  border: 1px solid #475569 !important;
  color: #f1f5f9 !important;
}

:global(.dark) .status-message p {
  color: #f1f5f9 !important;
}

:global(.dark) .status-message small {
  color: #94a3b8 !important;
}

:global(.dark) .status-close {
  color: #94a3b8 !important;
}

:global(.dark) .status-close:hover {
  color: #cbd5e1 !important;
}

/* 暗黑模式下的到期提醒樣式 */
:global(.dark) .alert-summary .alert-critical {
  background: rgba(248, 113, 113, 0.2) !important;
  color: #f87171 !important;
  border-left-color: #f87171 !important;
}

:global(.dark) .alert-summary .alert-warning {
  background: rgba(251, 191, 36, 0.2) !important;
  color: #fbbf24 !important;
  border-left-color: #fbbf24 !important;
}

:global(.dark) .alerts-section {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .alerts-section h2 {
  color: #ffffff !important;
}

:global(.dark) .alert-category h3 {
  color: #f1f5f9 !important;
}

:global(.dark) .alert-group.critical {
  border-color: #f87171 !important;
  background: rgba(248, 113, 113, 0.05) !important;
}

:global(.dark) .alert-group.warning {
  border-color: #fbbf24 !important;
  background: rgba(251, 191, 36, 0.05) !important;
}

:global(.dark) .alert-item {
  background: #334155 !important;
  border-bottom-color: rgba(255, 255, 255, 0.1) !important;
}

:global(.dark) .alert-item:hover {
  background: #475569 !important;
}

:global(.dark) .alert-item.critical .alert-icon {
  background: rgba(248, 113, 113, 0.2) !important;
}

:global(.dark) .alert-item.warning .alert-icon {
  background: rgba(251, 191, 36, 0.2) !important;
}

:global(.dark) .alert-name {
  color: #f1f5f9 !important;
}

:global(.dark) .alert-time {
  color: #cbd5e1 !important;
}

:global(.dark) .alert-amount {
  color: #94a3b8 !important;
}

:global(.dark) .status-badge.cached {
  background: rgba(52, 211, 153, 0.2) !important;
  color: #34d399 !important;
}

:global(.dark) .status-badge.not-cached {
  background: rgba(248, 113, 113, 0.2) !important;
  color: #f87171 !important;
}

:global(.dark) .status-badge.blob-exists {
  background: rgba(96, 165, 250, 0.2) !important;
  color: #60a5fa !important;
}

:global(.dark) .status-badge.blob-missing {
  background: rgba(248, 113, 113, 0.2) !important;
  color: #f87171 !important;
}

/* GalleryPage 特定樣式 */
:global(.dark) .image-gallery-container h1 {
  color: #ffffff !important;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.9) !important,
    0 2px 4px rgba(0, 0, 0, 0.7) !important,
    0 4px 8px rgba(0, 0, 0, 0.5) !important;
}

:global(.dark) .gallery-info p {
  color: #cbd5e1 !important;
}

:global(.dark) .gallery-stats .stat-item {
  color: #94a3b8 !important;
}

:global(.dark) .image-card {
  color: #f1f5f9 !important;
}

:global(.dark) .image-list-item {
  color: #f1f5f9 !important;
}

:global(.dark) .image-list-item .list-image-name {
  color: #ffffff !important;
  font-weight: bold !important;
}

:global(.dark) .image-list-item .list-image-details {
  color: #f1f5f9 !important;
}

:global(.dark) .image-list-item .detail-item {
  color: #94a3b8 !important;
}

:global(.dark) .image-info .image-name {
  color: #ffffff !important;
}

:global(.dark) .image-info .image-size {
  color: #cbd5e1 !important;
}

:global(.dark) .no-images,
:global(.dark) .no-results {
  color: #94a3b8 !important;
}

:global(.dark) .no-images h3,
:global(.dark) .no-results h3 {
  color: #f1f5f9 !important;
}

:global(.dark) .lightbox-content {
  background: #1e293b !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .lightbox-info h3 {
  color: #ffffff !important;
}

:global(.dark) .lightbox-details span {
  color: #94a3b8 !important;
}

/* 通用表單元素增強 */
:global(.dark) .auth-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
  border: 1px solid #2563eb !important;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3) !important;
}

:global(.dark) .auth-btn.primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-2px) !important;
}

:global(.dark) .auth-btn.secondary {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%) !important;
  color: white !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .auth-btn.secondary:hover {
  background: linear-gradient(135deg, #475569 0%, #334155 100%) !important;
  transform: translateY(-2px) !important;
}

/* 通用卡片懸停效果增強 */
:global(.dark) .subscription-card:hover,
:global(.dark) .food-card:hover,
:global(.dark) .video-card:hover,
:global(.dark) .image-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6) !important;
}

/* 通用輸入框增強 */
:global(.dark) input:focus,
:global(.dark) textarea:focus,
:global(.dark) select:focus {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2) !important;
  background: #0f172a !important;
}

/* 通用按鈕增強 */
:global(.dark) .action-btn:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  transform: scale(1.05) !important;
}

/* 確保所有頁面標題都突出顯示 */
:global(.dark) .page-content h1,
:global(.dark) .page-content h2,
:global(.dark) .page-content h3 {
  color: #f1f5f9 !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
}

/* DashboardPage 特定樣式增強 */
:global(.dark) .dashboard-title {
  color: #ffffff !important;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.9) !important,
    0 2px 4px rgba(0, 0, 0, 0.7) !important,
    0 4px 8px rgba(0, 0, 0, 0.5) !important;
}

:global(.dark) .stat-card h3 {
  color: #cbd5e1 !important;
}

:global(.dark) .stat-card .stat-number {
  color: #60a5fa !important;
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
}

:global(.dark) .stat-card .stat-label {
  color: #94a3b8 !important;
}

:global(.dark) .action-card h3 {
  color: #f1f5f9 !important;
}

:global(.dark) .action-card .action-description {
  color: #94a3b8 !important;
}

/* 確保所有表單和輸入框在暗黑模式下可見 */
:global(.dark) .form-group label {
  color: #cbd5e1 !important;
}

:global(.dark) .form-group input,
:global(.dark) .form-group textarea,
:global(.dark) .form-group select {
  background: #1e293b !important;
  color: #f1f5f9 !important;
  border: 1px solid #475569 !important;
}

:global(.dark) .form-group input::placeholder,
:global(.dark) .form-group textarea::placeholder {
  color: #64748b !important;
}

/* 確保所有列表項目文字可見 */
:global(.dark) .list-header h3 {
  color: #ffffff !important;
}

:global(.dark) .summary .total-count,
:global(.dark) .summary .total-cost,
:global(.dark) .summary .expiry-warning {
  color: inherit !important;
}

/* 修復可能的透明文字問題 */
:global(.dark) * {
  -webkit-text-fill-color: unset !important;
}

:global(.dark) *[style*="background-clip: text"],
:global(.dark) *[style*="-webkit-background-clip: text"] {
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  color: inherit !important;
}
</style>