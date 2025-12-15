<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>鋒兄塗哥公關資訊</h1>
        </div>
        <div class="nav-menu">
          <NuxtLink to="/" class="nav-link">首頁</NuxtLink>
          <NuxtLink to="/about" class="nav-link">關於我們</NuxtLink>
          <button @click="showManagement = !showManagement" class="nav-link management-btn">
            {{ showManagement ? '隱藏管理' : '管理系統' }}
          </button>
        </div>
      </div>
    </nav>

    <!-- 管理系统 -->
    <div v-if="showManagement" class="management-system">
      <div class="management-container">
        <!-- 侧边栏 -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <h3>管理功能</h3>
          </div>
          <nav class="sidebar-nav">
            <button 
              v-for="item in managementItems" 
              :key="item.id"
              @click="activeManagement = item.id"
              :class="['sidebar-item', { active: activeManagement === item.id }]"
            >
              {{ item.label }}
            </button>
          </nav>
        </aside>

        <!-- 管理内容 -->
        <main class="management-content">
          <!-- 仪表板 -->
          <div v-if="activeManagement === 'dashboard'" class="content-section">
            <h2>儀表板</h2>
            <div class="dashboard-cards">
              <div class="dashboard-card">
                <h3>訂閱管理</h3>
                <p>管理各種訂閱服務</p>
                <button @click="activeManagement = 'subscriptions'" class="btn btn-primary">
                  進入管理
                </button>
              </div>
              <div class="dashboard-card">
                <h3>食品管理</h3>
                <p>追蹤食品保存期限</p>
                <button @click="activeManagement = 'foods'" class="btn btn-primary">
                  進入管理
                </button>
              </div>
              <div class="dashboard-card">
                <h3>圖片畫廊</h3>
                <p>管理圖片資源</p>
                <button @click="activeManagement = 'gallery'" class="btn btn-primary">
                  進入管理
                </button>
              </div>
            </div>
          </div>

          <!-- 订阅管理 -->
          <div v-else-if="activeManagement === 'subscriptions'" class="content-section">
            <h2>訂閱管理</h2>
            <div class="management-placeholder">
              <p>訂閱管理功能開發中...</p>
              <p>這裡將包含訂閱服務的新增、編輯、刪除功能</p>
            </div>
          </div>

          <!-- 食品管理 -->
          <div v-else-if="activeManagement === 'foods'" class="content-section">
            <h2>食品管理</h2>
            <div class="management-placeholder">
              <p>食品管理功能開發中...</p>
              <p>這裡將包含食品保存期限追蹤功能</p>
            </div>
          </div>

          <!-- 图片画廊 -->
          <div v-else-if="activeManagement === 'gallery'" class="content-section">
            <h2>圖片畫廊</h2>
            <div class="management-placeholder">
              <p>圖片畫廊功能開發中...</p>
              <p>這裡將包含圖片上傳、分類、管理功能</p>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- 页面内容 -->
    <div v-else class="page-content">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup>
// 响应式数据
const showManagement = ref(false)
const activeManagement = ref('dashboard')

// 管理功能菜单
const managementItems = [
  { id: 'dashboard', label: '儀表板' },
  { id: 'subscriptions', label: '訂閱管理' },
  { id: 'foods', label: '食品管理' },
  { id: 'gallery', label: '圖片畫廊' }
]

// 页面配置
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

/* 导航栏 */
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.nav-brand h1 {
  color: #667eea;
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  gap: 30px;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.nav-link:hover {
  color: #667eea;
}

.management-btn {
  background: #667eea;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
}

.management-btn:hover {
  background: #5a6fd8;
  color: white;
}

/* 管理系统 */
.management-system {
  margin-top: 70px;
  min-height: calc(100vh - 70px);
}

.management-container {
  display: flex;
  min-height: calc(100vh - 70px);
}

.sidebar {
  width: 250px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.sidebar-header h3 {
  color: #333;
}

.sidebar-nav {
  padding: 20px 0;
}

.sidebar-item {
  display: block;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #666;
}

.sidebar-item:hover {
  background: #e9ecef;
}

.sidebar-item.active {
  background: #667eea;
  color: white;
}

.management-content {
  flex: 1;
  padding: 30px;
}

.content-section h2 {
  margin-bottom: 30px;
  color: #333;
}

/* 仪表板 */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.dashboard-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
}

.dashboard-card h3 {
  margin-bottom: 15px;
  color: #333;
}

.dashboard-card p {
  margin-bottom: 20px;
  color: #666;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

/* 管理占位符 */
.management-placeholder {
  background: #f8f9fa;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
}

.management-placeholder p {
  margin-bottom: 10px;
  color: #666;
}

/* 页面内容 */
.page-content {
  margin-top: 70px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-menu {
    gap: 15px;
  }
  
  .nav-brand h1 {
    font-size: 1.2rem;
  }
  
  .management-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
}
</style>