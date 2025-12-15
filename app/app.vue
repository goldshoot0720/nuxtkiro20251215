<template>
  <div class="app-container">
    <NuxtRouteAnnouncer />
    <div class="responsive-layout">
      <!-- 側邊選單 -->
      <nav class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
        <div class="sidebar-header">
          <h2>選單</h2>
          <button 
            class="sidebar-toggle mobile-only" 
            @click="toggleSidebar"
            aria-label="關閉選單"
          >
            ✕
          </button>
        </div>
        <ul class="nav-list">
          <li><a href="#" @click="setActiveContent('home')">首頁</a></li>
          <li><a href="#" @click="setActiveContent('about')">關於我們</a></li>
          <li><a href="#" @click="setActiveContent('services')">服務項目</a></li>
          <li><a href="#" @click="setActiveContent('portfolio')">作品集</a></li>
          <li><a href="#" @click="setActiveContent('subscription')">訂閱管理</a></li>
          <li><a href="#" @click="setActiveContent('contact')">聯絡我們</a></li>
        </ul>
      </nav>

      <!-- 主要內容區域 -->
      <main class="main-content">
        <!-- 手機版選單按鈕 -->
        <button 
          class="menu-toggle mobile-only" 
          @click="toggleSidebar"
          aria-label="開啟選單"
        >
          ☰
        </button>
        
        <!-- 內容展示區域 -->
        <div class="content-area">
          <div class="content-display">
            <div v-if="activeContent === 'home'" class="content-section">
              <h1>歡迎來到首頁</h1>
              <p>這是一個響應式UI設計示例，展示了不同裝置上的佈局適應。</p>
              <div class="feature-grid">
                <div class="feature-card">
                  <h3>響應式設計</h3>
                  <p>自動適應不同螢幕尺寸</p>
                </div>
                <div class="feature-card">
                  <h3>現代化介面</h3>
                  <p>簡潔美觀的使用者體驗</p>
                </div>
                <div class="feature-card">
                  <h3>跨平台支援</h3>
                  <p>支援桌面、平板、手機</p>
                </div>
              </div>
            </div>

            <div v-else-if="activeContent === 'about'" class="content-section">
              <h1>關於我們</h1>
              <p>我們是一個專注於響應式網頁設計的團隊。</p>
            </div>

            <div v-else-if="activeContent === 'services'" class="content-section">
              <h1>服務項目</h1>
              <div class="services-grid">
                <div class="service-item">
                  <h3>響應式網頁設計</h3>
                  <p>為不同裝置量身打造的網頁體驗</p>
                </div>
                <div class="service-item">
                  <h3>使用者介面設計</h3>
                  <p>直觀易用的介面設計服務</p>
                </div>
              </div>
            </div>

            <div v-else-if="activeContent === 'portfolio'" class="content-section">
              <h1>作品集</h1>
              <p>展示我們的設計作品</p>
            </div>

            <div v-else-if="activeContent === 'subscription'" class="content-section">
              <h1>個人訂閱管理</h1>
              
              <!-- 訂閱管理 - 無需認證 -->
              <div class="subscription-management">
                <div class="user-info">
                  <h3>訂閱管理系統</h3>
                  <p>管理你的所有訂閱服務</p>
                </div>

                <!-- 新增訂閱 -->
                <div class="add-subscription">
                  <h3>新增訂閱服務</h3>
                  <div class="subscription-form">
                    <div class="form-row">
                      <div class="form-group">
                        <label for="sub-name">服務名稱</label>
                        <input 
                          type="text" 
                          id="sub-name" 
                          v-model="newSubscription.name" 
                          placeholder="例如：Netflix, Spotify"
                          required
                        >
                      </div>
                      <div class="form-group">
                        <label for="sub-site">官方網站</label>
                        <input 
                          type="url" 
                          id="sub-site" 
                          v-model="newSubscription.site" 
                          placeholder="https://example.com"
                        >
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label for="sub-account">帳號/Email</label>
                        <input 
                          type="text" 
                          id="sub-account" 
                          v-model="newSubscription.account" 
                          placeholder="your@email.com"
                        >
                      </div>
                      <div class="form-group">
                        <label for="sub-price">月費 (NT$)</label>
                        <input 
                          type="number" 
                          id="sub-price" 
                          v-model="newSubscription.price" 
                          placeholder="299"
                          min="0"
                        >
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label for="sub-nextdate">下次扣款日期</label>
                        <input 
                          type="date" 
                          id="sub-nextdate" 
                          v-model="newSubscription.nextdate"
                          required
                        >
                      </div>
                      <div class="form-group">
                        <label for="sub-note">備註</label>
                        <input 
                          type="text" 
                          id="sub-note" 
                          v-model="newSubscription.note" 
                          placeholder="家庭方案、學生優惠等"
                        >
                      </div>
                    </div>
                    <div class="form-actions">
                      <button 
                        @click="editingSubscription ? updateSubscription() : addSubscription()"
                        class="auth-btn primary"
                        :disabled="subscriptionLoading || !newSubscription.name"
                      >
                        {{ editingSubscription ? '更新訂閱' : '新增訂閱' }}
                      </button>
                      <button 
                        @click="resetForm"
                        class="auth-btn secondary"
                        type="button"
                      >
                        {{ editingSubscription ? '取消編輯' : '清除' }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 訂閱列表 -->
                <div class="subscription-list">
                  <div class="list-header">
                    <h3>我的訂閱服務</h3>
                    <div class="summary">
                      <span class="total-count">共 {{ subscriptions.length }} 個服務</span>
                      <span class="total-cost">本月總費用：NT$ {{ totalMonthlyCost }}</span>
                    </div>
                  </div>
                  
                  <div v-if="subscriptions.length === 0" class="no-subscriptions">
                    <p>還沒有任何訂閱服務</p>
                    <p>點擊上方表單新增你的第一個訂閱！</p>
                  </div>
                  
                  <div v-else class="subscriptions-grid">
                    <div 
                      v-for="subscription in sortedSubscriptions" 
                      :key="subscription.id"
                      class="subscription-card"
                    >
                      <div class="card-header">
                        <h4>{{ subscription.name }}</h4>
                        <div class="card-actions">
                          <button 
                            @click="editSubscription(subscription)"
                            class="action-btn edit"
                            title="編輯"
                          >
                            ✏️
                          </button>
                          <button 
                            @click="deleteSubscription(subscription.id)"
                            class="action-btn delete"
                            title="刪除"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div class="card-content">
                        <div class="info-row" v-if="subscription.site">
                          <span class="label">網站：</span>
                          <a :href="subscription.site" target="_blank" class="link">
                            {{ subscription.site }}
                          </a>
                        </div>
                        <div class="info-row" v-if="subscription.account">
                          <span class="label">帳號：</span>
                          <span>{{ subscription.account }}</span>
                        </div>
                        <div class="info-row">
                          <span class="label">月費：</span>
                          <span class="price">NT$ {{ subscription.price || 0 }}</span>
                        </div>
                        <div class="info-row">
                          <span class="label">下次扣款：</span>
                          <span :class="getDateClass(subscription.nextdate)">
                            {{ formatDate(subscription.nextdate) }}
                          </span>
                        </div>
                        <div class="info-row" v-if="subscription.note">
                          <span class="label">備註：</span>
                          <span>{{ subscription.note }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeContent === 'contact'" class="content-section">
              <h1>聯絡我們</h1>
              <p>歡迎與我們聯繫</p>
            </div>
          </div>
        </div>
      </main>

      <!-- 遮罩層 (手機版) -->
      <div 
        v-if="isSidebarOpen" 
        class="overlay mobile-only" 
        @click="closeSidebar"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

// 響應式佈局相關
const isSidebarOpen = ref(false)
const activeContent = ref('home')

// Supabase 客戶端
const supabase = ref(null)

// 初始化 Supabase 客戶端
const initSupabase = async () => {
  if (process.client) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const config = useRuntimeConfig()
      
      const supabaseUrl = config.public.supabaseUrl
      const supabaseKey = config.public.supabaseAnonKey
      
      if (supabaseUrl && supabaseKey) {
        supabase.value = createClient(supabaseUrl, supabaseKey)
        console.log('Supabase 客戶端初始化成功')
        return true
      } else {
        console.error('Supabase 配置缺失')
        return false
      }
    } catch (error) {
      console.error('Supabase 初始化失敗:', error)
      return false
    }
  }
  return false
}

// 訂閱相關
const subscriptionLoading = ref(false)
const subscriptions = ref([])
const editingSubscription = ref(null)

// 新增訂閱表單
const newSubscription = ref({
  name: '',
  site: '',
  account: '',
  price: null,
  nextdate: '',
  note: ''
})

// 計算總月費
const totalMonthlyCost = computed(() => {
  return subscriptions.value.reduce((total, sub) => total + (sub.price || 0), 0)
})

// 按日期排序的訂閱列表（日期近的在上面）
const sortedSubscriptions = computed(() => {
  return [...subscriptions.value].sort((a, b) => {
    // 處理沒有日期的情況，放到最後
    if (!a.nextdate && !b.nextdate) return 0
    if (!a.nextdate) return 1
    if (!b.nextdate) return -1
    
    // 比較日期，近的在前
    const dateA = new Date(a.nextdate)
    const dateB = new Date(b.nextdate)
    return dateA - dateB
  })
})

// 響應式佈局方法
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const setActiveContent = (content) => {
  activeContent.value = content
  // 手機版選擇項目後自動關閉選單
  if (process.client && window.innerWidth <= 768) {
    closeSidebar()
  }
}



// 訂閱管理方法 - 使用 Supabase (無認證)
const loadSubscriptionData = async () => {
  if (!supabase.value) return
  
  try {
    const { data, error } = await supabase.value
      .from('subscription')
      .select('*')
    
    if (error) throw error
    
    subscriptions.value = data || []
  } catch (error) {
    console.error('載入訂閱資料錯誤:', error.message)
  }
}

const addSubscription = async () => {
  if (!supabase.value) return
  
  try {
    subscriptionLoading.value = true
    
    const { data, error } = await supabase.value
      .from('subscription')
      .insert({
        name: newSubscription.value.name,
        site: newSubscription.value.site || null,
        account: newSubscription.value.account || null,
        price: newSubscription.value.price || null,
        nextdate: newSubscription.value.nextdate || null,
        note: newSubscription.value.note || null
      })
      .select()
      .single()
    
    if (error) throw error
    
    subscriptions.value.unshift(data)
    resetForm()
    alert('訂閱服務新增成功！')
  } catch (error) {
    console.error('新增訂閱錯誤:', error.message)
    alert('新增訂閱失敗: ' + error.message)
  } finally {
    subscriptionLoading.value = false
  }
}

const editSubscription = (subscription) => {
  editingSubscription.value = subscription
  newSubscription.value = {
    name: subscription.name,
    site: subscription.site || '',
    account: subscription.account || '',
    price: subscription.price,
    nextdate: subscription.nextdate || '',
    note: subscription.note || ''
  }
  
  // 滾動到表單
  if (process.client) {
    document.querySelector('.add-subscription')?.scrollIntoView({ behavior: 'smooth' })
  }
}

const updateSubscription = async () => {
  if (!editingSubscription.value || !supabase.value) return
  
  try {
    subscriptionLoading.value = true
    
    const { data, error } = await supabase.value
      .from('subscription')
      .update({
        name: newSubscription.value.name,
        site: newSubscription.value.site || null,
        account: newSubscription.value.account || null,
        price: newSubscription.value.price || null,
        nextdate: newSubscription.value.nextdate || null,
        note: newSubscription.value.note || null
      })
      .eq('id', editingSubscription.value.id)
      .select()
      .single()
    
    if (error) throw error
    
    // 更新本地資料
    const index = subscriptions.value.findIndex(s => s.id === editingSubscription.value.id)
    if (index !== -1) {
      subscriptions.value[index] = data
    }
    
    resetForm()
    alert('訂閱服務更新成功！')
  } catch (error) {
    console.error('更新訂閱錯誤:', error.message)
    alert('更新訂閱失敗: ' + error.message)
  } finally {
    subscriptionLoading.value = false
  }
}

const deleteSubscription = async (id) => {
  if (!supabase.value) return
  
  if (!confirm('確定要刪除這個訂閱服務嗎？')) return
  
  try {
    subscriptionLoading.value = true
    
    const { error } = await supabase.value
      .from('subscription')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    subscriptions.value = subscriptions.value.filter(s => s.id !== id)
    alert('訂閱服務已刪除')
  } catch (error) {
    console.error('刪除訂閱錯誤:', error.message)
    alert('刪除訂閱失敗: ' + error.message)
  } finally {
    subscriptionLoading.value = false
  }
}

const resetForm = () => {
  newSubscription.value = {
    name: '',
    site: '',
    account: '',
    price: null,
    nextdate: '',
    note: ''
  }
  editingSubscription.value = null
}

// 輔助方法
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-TW')
}

const getDateClass = (dateString) => {
  if (!dateString) return ''
  
  const today = new Date()
  const targetDate = new Date(dateString)
  const diffTime = targetDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'date-overdue'
  if (diffDays <= 7) return 'date-soon'
  return 'date-normal'
}

// 監聽視窗大小變化
const handleResize = () => {
  if (process.client && window.innerWidth > 768) {
    isSidebarOpen.value = false
  }
}

onMounted(async () => {
  if (process.client) {
    window.addEventListener('resize', handleResize)
    // 初始化 Supabase 客戶端
    const initialized = await initSupabase()
    if (initialized) {
      // 載入資料
      loadSubscriptionData()
    }
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleResize)
  }
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
}

.app-container {
  height: 100vh;
  overflow: hidden;
}

.responsive-layout {
  display: flex;
  height: 100vh;
  position: relative;
}

/* 側邊選單樣式 */
.sidebar {
  background: #2c3e50;
  color: white;
  transition: transform 0.3s ease;
  z-index: 1000;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #34495e;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  border-bottom: 1px solid #34495e;
}

.nav-list a {
  display: block;
  padding: 1rem;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
  cursor: pointer;
}

.nav-list a:hover {
  background-color: #34495e;
}

/* 主要內容區域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.menu-toggle {
  display: none;
  background: #3498db;
  color: white;
  border: none;
  padding: 1rem;
  font-size: 1.2rem;
  cursor: pointer;
  position: sticky;
  top: 0;
  z-index: 999;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.content-display {
  max-width: 1200px;
  margin: 0 auto;
}

.content-section {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

h3 {
  color: #34495e;
  margin-bottom: 0.5rem;
}

p {
  line-height: 1.6;
  color: #555;
  margin-bottom: 1rem;
}

/* 功能網格 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

/* 服務項目網格 */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.service-item {
  background: white;
  padding: 2rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.service-item:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.mobile-only {
  display: none;
}

/* 電腦版和平板橫向 (寬度 > 768px) */
@media (min-width: 769px) {
  .sidebar {
    width: 250px;
    position: static;
  }
  
  .responsive-layout {
    flex-direction: row;
  }
}

/* 手機版和平板直向 (寬度 <= 768px) */
@media (max-width: 768px) {
  .responsive-layout {
    flex-direction: column;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    transform: translateX(-100%);
  }
  
  .sidebar-open {
    transform: translateX(0);
  }
  
  .menu-toggle,
  .sidebar-toggle,
  .overlay {
    display: block;
  }
  
  .mobile-only {
    display: block;
  }
  
  .content-area {
    padding: 1rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .feature-grid,
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-card,
  .service-item {
    padding: 1.5rem;
  }
}

/* 平板橫向 (768px - 1024px 且橫向) */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
  .sidebar {
    width: 200px;
  }
}

/* 平板直向 (768px - 1024px 且直向) */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
  .responsive-layout {
    flex-direction: column;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    transform: translateX(-100%);
  }
  
  .sidebar-open {
    transform: translateX(0);
  }
  
  .menu-toggle,
  .sidebar-toggle,
  .overlay {
    display: block;
  }
  
  .mobile-only {
    display: block;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.75rem;
  }
  
  .feature-card,
  .service-item {
    padding: 1rem;
  }
}

/* 訂閱管理樣式 */

.auth-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  text-align: center;
}

.auth-btn.primary {
  background: #3498db;
  color: white;
}

.auth-btn.primary:hover {
  background: #2980b9;
}

.auth-btn.secondary {
  background: #95a5a6;
  color: white;
}

.auth-btn.secondary:hover {
  background: #7f8c8d;
}

.auth-btn.danger {
  background: #e74c3c;
  color: white;
}

.auth-btn.danger:hover {
  background: #c0392b;
}

.auth-btn.link {
  background: transparent;
  color: #3498db;
  text-decoration: underline;
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.email-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subscription-management {
  max-width: 1000px;
  margin: 0 auto;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.subscription-plans {
  margin-bottom: 3rem;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.plan-card {
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  position: relative;
}

.plan-card:hover {
  border-color: #3498db;
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.plan-card.active {
  border-color: #27ae60;
  background: #f8fff9;
}

.plan-card.active::before {
  content: '目前方案';
  position: absolute;
  top: -10px;
  right: 20px;
  background: #27ae60;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.plan-card h4 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.plan-price {
  margin-bottom: 2rem;
}

.plan-price .price {
  font-size: 2.5rem;
  font-weight: bold;
  color: #3498db;
}

.plan-price .period {
  font-size: 1rem;
  color: #7f8c8d;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
  text-align: left;
}

.plan-features li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #ecf0f1;
  position: relative;
  padding-left: 1.5rem;
}

.plan-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #27ae60;
  font-weight: bold;
}

.plan-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.plan-btn.current {
  background: #27ae60;
  color: white;
}

.plan-btn.upgrade {
  background: #3498db;
  color: white;
}

.plan-btn.upgrade:hover {
  background: #2980b9;
}

.current-subscription {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.subscription-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.info-item label {
  font-weight: bold;
  color: #2c3e50;
}

.status-active {
  color: #27ae60;
  font-weight: bold;
}

.status-cancelled {
  color: #e74c3c;
  font-weight: bold;
}

.status-expired {
  color: #f39c12;
  font-weight: bold;
}

.subscription-actions {
  display: flex;
  gap: 1rem;
}

.subscription-history {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 2rem;
}

.no-history {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.plan-name {
  font-weight: bold;
  color: #2c3e50;
}

.date-range {
  font-size: 0.9rem;
  color: #7f8c8d;
}

/* 響應式調整 - 訂閱管理 */
@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .subscription-info {
    grid-template-columns: 1fr;
  }
  
  .subscription-actions {
    flex-direction: column;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .auth-card {
    margin: 1rem;
    padding: 1.5rem;
  }
}

/* 配置警告樣式 */
.config-warning {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.warning-card {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
}

.warning-card h3 {
  color: #856404;
  margin-bottom: 1rem;
}

.warning-card p {
  color: #856404;
  margin-bottom: 1rem;
}

.warning-card ol {
  color: #856404;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.warning-card li {
  margin-bottom: 0.5rem;
}

.warning-card code {
  background: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.warning-card a {
  color: #3498db;
  text-decoration: none;
}

.warning-card a:hover {
  text-decoration: underline;
}

/* 新增訂閱表單樣式 */
.add-subscription {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.subscription-form {
  margin-top: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* 訂閱列表樣式 */
.subscription-list {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 2rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e1e8ed;
}

.summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.total-count {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.total-cost {
  color: #2c3e50;
  font-weight: bold;
  font-size: 1.1rem;
}

.no-subscriptions {
  text-align: center;
  color: #7f8c8d;
  padding: 3rem;
}

.subscriptions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.subscription-card {
  background: #f8f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.subscription-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e1e8ed;
}

.card-header h4 {
  margin: 0;
  color: #2c3e50;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: #e1e8ed;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: bold;
  color: #7f8c8d;
  min-width: 80px;
}

.price {
  color: #e74c3c;
  font-weight: bold;
}

.link {
  color: #3498db;
  text-decoration: none;
  word-break: break-all;
}

.link:hover {
  text-decoration: underline;
}

.date-normal {
  color: #27ae60;
}

.date-soon {
  color: #f39c12;
  font-weight: bold;
}

.date-overdue {
  color: #e74c3c;
  font-weight: bold;
}

/* 響應式調整 - 新版訂閱管理 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .summary {
    align-items: flex-start;
  }
  
  .subscriptions-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .label {
    min-width: auto;
  }
}
</style>
