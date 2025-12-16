<template>
  <div id="app">
    <!-- 整體應用容器 -->
    <div class="app-container">
      <!-- 側邊欄 -->
      <div class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-header">
          <h2>管理系統</h2>
          <button @click="toggleSidebar" class="sidebar-toggle">
            {{ sidebarOpen ? '✕' : '☰' }}
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
                📊 儀表板
              </button>
            </li>
            <li>
              <button 
                @click="setCurrentPage('subscription')" 
                :class="{ active: currentPage === 'subscription' }"
                class="nav-btn"
              >
                💳 訂閱管理
              </button>
            </li>
            <li>
              <button 
                @click="setCurrentPage('food')" 
                :class="{ active: currentPage === 'food' }"
                class="nav-btn"
              >
                🍔 食物管理
              </button>
            </li>
            <li>
              <button 
                @click="setCurrentPage('video')" 
                :class="{ active: currentPage === 'video' }"
                class="nav-btn"
              >
                🎬 影片庫
              </button>
            </li>
            <li>
              <button 
                @click="setCurrentPage('gallery')" 
                :class="{ active: currentPage === 'gallery' }"
                class="nav-btn"
              >
                🖼️ 圖片庫
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <!-- 主要內容區 -->
      <div class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
        <!-- 頂部標題 -->
        <header class="top-header">
          <button @click="toggleSidebar" class="mobile-menu-btn">
            ☰
          </button>
          <h1>{{ getPageTitle() }}</h1>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// 頁面導航
const setCurrentPage = (page) => {
  currentPage.value = page
  // 在手機版自動關閉側邊欄
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}

const getPageTitle = () => {
  const titles = {
    dashboard: '儀表板',
    subscription: '訂閱管理',
    food: '食物管理',
    video: '影片庫',
    gallery: '圖片庫'
  }
  return titles[currentPage.value] || '管理系統'
}

// 側邊欄控制
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// 響應式處理
const handleResize = () => {
  if (window.innerWidth > 768) {
    sidebarOpen.value = false
  }
}

// 生命週期
onMounted(() => {
  // 載入初始資料
  loadSubscriptions()
  loadFoods()
  
  // 監聽視窗大小變化
  if (process.client) {
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style scoped>
/* 全域樣式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f5f7fa;
  min-height: 100vh;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

/* 側邊欄樣式 */
.sidebar {
  width: 280px;
  background: #2c3e50;
  color: white;
  position: fixed;
  top: 0;
  left: -280px;
  height: 100vh;
  transition: left 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
}

.sidebar.sidebar-open {
  left: 0;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #34495e;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-nav ul {
  list-style: none;
  padding: 1rem 0;
}

.sidebar-nav li {
  margin-bottom: 0.5rem;
}

.nav-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-btn.active {
  background: #3498db;
  border-right: 4px solid #2980b9;
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
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.mobile-menu-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.mobile-menu-btn:hover {
  background: #f8f9fa;
}

.top-header h1 {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
}

/* 頁面內容 */
.page-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
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

/* 響應式設計 */
@media (min-width: 769px) {
  .sidebar {
    position: static;
    left: 0;
    width: 280px;
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
}

@media (max-width: 768px) {
  .mobile-overlay {
    display: block;
  }
  
  .top-header {
    padding: 1rem;
  }
  
  .top-header h1 {
    font-size: 1.5rem;
  }
  
  .page-content {
    padding: 1rem;
  }
  
  .sidebar {
    width: 100%;
    left: -100%;
  }
  
  .sidebar.sidebar-open {
    left: 0;
  }
}

@media (max-width: 480px) {
  .top-header h1 {
    font-size: 1.3rem;
  }
  
  .page-content {
    padding: 0.5rem;
  }
}

/* 頁面切換動畫 */
.page-content > * {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
