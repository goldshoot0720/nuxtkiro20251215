<template>
  <div id="app">
    <!-- 主要佈局容器 -->
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
                🍎 食品管理
              </button>
            </li>
            <li>
              <button 
                @click="setCurrentPage('video')" 
                :class="{ active: currentPage === 'video' }"
                class="nav-btn"
              >
                🎬 影片介紹
              </button>
            </li>
            <li>
              <button 
                @click="setCurrentPage('gallery')" 
                :class="{ active: currentPage === 'gallery' }"
                class="nav-btn"
              >
                🖼️ 圖片畫廊
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <!-- 主要內容區域 -->
      <div class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
        <!-- 頂部導航欄 -->
        <header class="top-header">
          <button @click="toggleSidebar" class="mobile-menu-btn">
            ☰
          </button>
          <h1>{{ getPageTitle() }}</h1>
        </header>

        <!-- 頁面內容 -->
        <main class="page-content">
          <!-- 儀表板 -->
          <div v-if="currentPage === 'dashboard'" class="dashboard-container">
            <h1>儀表板</h1>
            
            <!-- 儀表板總覽 -->
            <div class="dashboard-overview">
              <div class="dashboard-stats">
                <div class="stat-card">
                  <h3>訂閱服務</h3>
                  <div class="stat-number">{{ subscriptions.length }}</div>
                  <div class="stat-label">總數</div>
                </div>
                <div class="stat-card">
                  <h3>食品庫存</h3>
                  <div class="stat-number">{{ foods.length }}</div>
                  <div class="stat-label">總數</div>
                </div>
                <div class="stat-card">
                  <h3>本月費用</h3>
                  <div class="stat-number">NT$ {{ totalMonthlyCost }}</div>
                  <div class="stat-label">訂閱總費用</div>
                </div>
              </div>

              <!-- 快速操作 -->
              <div class="dashboard-actions">
                <h3>🚀 快速操作</h3>
                <div class="action-buttons">
                  <button @click="setCurrentPage('subscription')" class="action-btn primary">
                    新增訂閱服務
                  </button>
                  <button @click="setCurrentPage('food')" class="action-btn secondary">
                    新增食品記錄
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 訂閱管理 -->
          <div v-if="currentPage === 'subscription'" class="subscription-management">
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
                      min="2025-01-01"
                      max="2125-12-31"
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
                    @click="resetSubscriptionForm"
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
                  <span class="total-cost">總費用：NT$ {{ totalMonthlyCost }}</span>
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

          <!-- 食品管理 -->
          <div v-if="currentPage === 'food'" class="food-management">
            <div class="user-info">
              <h3>食品庫存管理系統</h3>
              <p>管理你的食品庫存、保存期限和購買記錄</p>
            </div>

            <!-- 新增食品 -->
            <div class="add-food">
              <h3>新增食品</h3>
              <div class="food-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="food-name">食品名稱</label>
                    <input 
                      type="text" 
                      id="food-name" 
                      v-model="newFood.name" 
                      placeholder="例如：牛奶、麵包"
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label for="food-amount">數量</label>
                    <input 
                      type="number" 
                      id="food-amount" 
                      v-model="newFood.amount" 
                      placeholder="1"
                      min="1"
                    >
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label for="food-price">價格 (NT$)</label>
                    <input 
                      type="number" 
                      id="food-price" 
                      v-model="newFood.price" 
                      placeholder="100"
                      min="0"
                    >
                  </div>
                  <div class="form-group">
                    <label for="food-shop">購買商店</label>
                    <input 
                      type="text" 
                      id="food-shop" 
                      v-model="newFood.shop" 
                      placeholder="例如：全聯、家樂福"
                    >
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label for="food-todate">到期日期</label>
                    <input 
                      type="date" 
                      id="food-todate" 
                      v-model="newFood.todate"
                      min="2025-01-01"
                      max="2125-12-31"
                    >
                  </div>
                  <div class="form-group">
                    <label for="food-photo">照片網址</label>
                    <input 
                      type="url" 
                      id="food-photo" 
                      v-model="newFood.photo" 
                      placeholder="https://example.com/photo.jpg"
                    >
                  </div>
                </div>
                <div class="form-actions">
                  <button 
                    @click="editingFood ? updateFood() : addFood()"
                    class="auth-btn primary"
                    :disabled="foodLoading || !newFood.name"
                  >
                    {{ editingFood ? '更新食品' : '新增食品' }}
                  </button>
                  <button 
                    @click="resetFoodForm"
                    class="auth-btn secondary"
                    type="button"
                  >
                    {{ editingFood ? '取消編輯' : '清除' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 食品列表 -->
            <div class="food-list">
              <div class="list-header">
                <h3>食品庫存</h3>
                <div class="summary">
                  <span class="total-count">共 {{ foods.length }} 項食品</span>
                  <span class="expiry-warning" v-if="expiringFoods.length > 0">
                    {{ expiringFoods.length }} 項即將過期
                  </span>
                </div>
              </div>
              
              <div v-if="foods.length === 0" class="no-foods">
                <p>還沒有任何食品記錄</p>
                <p>點擊上方表單新增你的第一項食品！</p>
              </div>
              
              <div v-else class="foods-grid">
                <div 
                  v-for="food in sortedFoods" 
                  :key="food.id"
                  class="food-card"
                  :class="getFoodStatusClass(food.todate)"
                >
                  <div class="card-header">
                    <h4>{{ food.name }}</h4>
                    <div class="card-actions">
                      <button 
                        @click="editFood(food)"
                        class="action-btn edit"
                        title="編輯"
                      >
                        ✏️
                      </button>
                      <button 
                        @click="deleteFood(food.id)"
                        class="action-btn delete"
                        title="刪除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div class="card-content">
                    <!-- 主要資訊區域：圖片與關鍵資訊水平對齊 -->
                    <div class="main-info-row">
                      <div class="photo-section" v-if="food.photo">
                        <img :src="food.photo" :alt="food.name" class="food-photo" />
                      </div>
                      <div class="key-info-section">
                        <div class="key-info-item" v-if="food.amount">
                          <span class="label">數量：</span>
                          <span>{{ food.amount }}</span>
                        </div>
                        <div class="key-info-item" v-if="food.todate">
                          <span class="label">到期：</span>
                          <span :class="getExpiryClass(food.todate)">
                            {{ formatDate(food.todate) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 其他資訊 -->
                    <div class="other-info">
                      <div class="info-row" v-if="food.price">
                        <span class="label">價格：</span>
                        <span class="price">NT$ {{ food.price }}</span>
                      </div>
                      <div class="info-row" v-if="food.shop">
                        <span class="label">購買商店：</span>
                        <span>{{ food.shop }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 影片管理 -->
          <div v-if="currentPage === 'video'" class="video-manager-container">
            <h1>影片介紹</h1>
            
            <!-- 影片系統資訊 -->
            <div class="video-info">
              <h3>🎬 影片展示系統</h3>
              <p>使用 Netlify Blobs 優化影片載入，支援智能快取減少流量消耗</p>
              <div class="video-stats">
                <div class="stat-item">
                  <span class="stat-label">影片總數:</span>
                  <span class="stat-value">{{ videoList.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">快取大小:</span>
                  <span class="stat-value">{{ formatCacheSize(totalCacheSize) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">已快取:</span>
                  <span class="stat-value">{{ cachedVideos.length }}/{{ videoList.length }}</span>
                </div>
              </div>
            </div>

            <!-- Netlify Blobs 上傳指南 -->
            <div class="upload-guide" v-if="videoList.some(v => !v.blobExists)">
              <h3>📤 影片上傳指南</h3>
              <p>部分影片尚未上傳到 Netlify Blobs，請按照以下步驟上傳：</p>
              <ol>
                <li>將影片文件放置在 <code>public/videos/</code> 資料夾中</li>
                <li>運行上傳腳本：<code>npm run upload-videos</code></li>
                <li>或使用 Netlify CLI：<code>netlify blobs:set videos [blob-key] [file-path]</code></li>
                <li>點擊 "🔍 檢查 Netlify Blobs" 按鈕確認上傳狀態</li>
              </ol>
            </div>

            <!-- 快取管理控制 -->
            <div class="cache-controls">
              <h3>🗄️ 快取管理</h3>
              <div class="control-buttons">
                <button @click="checkBlobsStatus" class="cache-btn refresh">
                  🔍 檢查 Netlify Blobs
                </button>
                <button @click="preloadAllVideos" class="cache-btn preload" :disabled="isPreloading">
                  {{ isPreloading ? '預載中...' : '📥 預載所有影片' }}
                </button>
                <button @click="clearAllCache" class="cache-btn clear">
                  🗑️ 清除所有快取
                </button>
                <button @click="checkCacheStatus" class="cache-btn refresh">
                  🔄 重新整理狀態
                </button>
              </div>
              <div v-if="cacheMessage" class="cache-message" :class="cacheMessageType">
                {{ cacheMessage }}
              </div>
            </div>

            <!-- 影片列表 -->
            <div class="video-list">
              <h3>📹 影片庫</h3>
              <div class="videos-grid">
                <div 
                  v-for="video in videoList" 
                  :key="video.blobKey"
                  class="video-card"
                >
                  <div class="video-header">
                    <h4>{{ video.displayName }}</h4>
                    <div class="video-status">
                      <span v-if="video.blobExists" class="status-badge blob-exists">Blob 已上傳</span>
                      <span v-else class="status-badge blob-missing">Blob 未上傳</span>
                      <span v-if="video.cached" class="status-badge cached">已快取</span>
                      <span v-else class="status-badge not-cached">未快取</span>
                    </div>
                  </div>
                  
                  <div class="video-player-container">
                    <video 
                      :ref="'video-' + video.blobKey"
                      class="video-player"
                      controls
                      preload="metadata"
                      :poster="video.poster"
                      @loadstart="onVideoLoadStart(video.blobKey)"
                      @loadeddata="onVideoLoaded(video.blobKey)"
                      @error="onVideoError(video.blobKey, $event)"
                    >
                      <source :src="getVideoUrl(video.blobKey)" type="video/mp4">
                      您的瀏覽器不支援影片播放。
                    </video>
                    
                    <!-- 載入狀態覆蓋層 -->
                    <div v-if="video.loading" class="video-loading-overlay">
                      <div class="loading-spinner"></div>
                      <p>載入中...</p>
                    </div>
                    
                    <!-- 錯誤狀態覆蓋層 -->
                    <div v-if="video.error" class="video-error-overlay">
                      <div class="error-icon">⚠️</div>
                      <p>載入失敗</p>
                      <button @click="retryVideo(video.blobKey)" class="retry-btn">
                        重試
                      </button>
                    </div>
                  </div>
                  
                  <div class="video-info-panel">
                    <div class="video-details">
                      <div class="detail-row">
                        <span class="detail-label">檔案名稱:</span>
                        <span class="detail-value">{{ video.blobKey }}</span>
                      </div>
                      <div class="detail-row" v-if="video.fileSize">
                        <span class="detail-label">檔案大小:</span>
                        <span class="detail-value">{{ formatFileSize(video.fileSize) }}</span>
                      </div>
                      <div class="detail-row" v-if="video.uploadedAt">
                        <span class="detail-label">上傳時間:</span>
                        <span class="detail-value">{{ formatDate(video.uploadedAt) }}</span>
                      </div>
                    </div>
                    
                    <div class="video-actions">
                      <button 
                        v-if="!video.cached" 
                        @click="cacheVideo(video.blobKey)"
                        class="action-btn cache"
                        :disabled="video.caching"
                      >
                        {{ video.caching ? '快取中...' : '📥 快取影片' }}
                      </button>
                      <button 
                        v-if="video.cached" 
                        @click="clearVideoCache(video.blobKey)"
                        class="action-btn clear-cache"
                      >
                        🗑️ 清除快取
                      </button>
                      <button 
                        @click="downloadVideo(video.blobKey, video.displayName)"
                        class="action-btn download"
                      >
                        💾 下載影片
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 技術說明 -->
            <div class="tech-info">
              <h3>🔧 技術特色</h3>
              <div class="tech-features">
                <div class="feature-item">
                  <div class="feature-icon">⚡</div>
                  <div class="feature-content">
                    <h4>智能快取</h4>
                    <p>影片優先快取至本地 IndexedDB，減少重複載入的網路流量</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">🎯</div>
                  <div class="feature-content">
                    <h4>按需載入</h4>
                    <p>影片不會自動載入，用戶點擊播放後才開始載入，節省頻寬</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">🔒</div>
                  <div class="feature-content">
                    <h4>安全存儲</h4>
                    <p>所有影片通過 Netlify Blobs 安全存儲，支援 HTTPS 加密傳輸</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">📱</div>
                  <div class="feature-content">
                    <h4>響應式設計</h4>
                    <p>自動適應不同螢幕尺寸，手機版優化的播放器介面</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 圖片畫廊 -->
          <div v-if="currentPage === 'gallery'" class="image-gallery-container">
            <h1>圖片展示畫廊</h1>
            <div class="gallery-info">
              <p>展示 public/images 資料夾中的所有圖片內容</p>
              <div class="gallery-stats">
                <span class="stat-item">總共 {{ galleryImages.length }} 張圖片</span>
                <span class="stat-item" v-if="filteredImages.length !== galleryImages.length">
                  顯示 {{ filteredImages.length }} 張
                </span>
              </div>
            </div>

            <!-- 搜尋和篩選 -->
            <div class="gallery-controls">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="搜尋圖片名稱..."
                  class="search-input"
                >
                <button @click="clearSearch" class="clear-btn" v-if="searchQuery">✕</button>
              </div>
              
              <div class="view-controls">
                <button 
                  @click="viewMode = 'grid'" 
                  :class="{ active: viewMode === 'grid' }"
                  class="view-btn"
                  title="網格檢視"
                >
                  ⊞
                </button>
                <button 
                  @click="viewMode = 'list'" 
                  :class="{ active: viewMode === 'list' }"
                  class="view-btn"
                  title="列表檢視"
                >
                  ☰
                </button>
              </div>
            </div>

            <!-- 圖片展示區域 -->
            <div class="gallery-content" v-if="filteredImages.length > 0">
              <!-- 網格檢視 -->
              <div v-if="viewMode === 'grid'" class="gallery-grid">
                <div 
                  v-for="(image, index) in filteredImages" 
                  :key="image.name"
                  class="image-card"
                  @click="openLightbox(index)"
                >
                  <div class="image-wrapper">
                    <img 
                      :src="image.url" 
                      :alt="image.name"
                      class="gallery-image"
                      loading="lazy"
                      @error="handleImageError"
                    >
                    <div class="image-overlay">
                      <div class="image-info">
                        <span class="image-name">{{ image.displayName }}</span>
                        <span class="image-size">{{ formatFileSize(image.size) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 列表檢視 -->
              <div v-if="viewMode === 'list'" class="gallery-list">
                <div 
                  v-for="(image, index) in filteredImages" 
                  :key="image.name"
                  class="image-list-item"
                  @click="openLightbox(index)"
                >
                  <div class="list-image-wrapper">
                    <img 
                      :src="image.url" 
                      :alt="image.name"
                      class="list-image"
                      loading="lazy"
                      @error="handleImageError"
                    >
                  </div>
                  <div class="list-image-info">
                    <h4 class="list-image-name">{{ image.displayName }}</h4>
                    <div class="list-image-details">
                      <span class="detail-item">檔案大小: {{ formatFileSize(image.size) }}</span>
                      <span class="detail-item">格式: {{ image.extension.toUpperCase() }}</span>
                      <span class="detail-item">路徑: {{ image.path }}</span>
                    </div>
                  </div>
                  <div class="list-actions">
                    <button 
                      @click.stop="downloadImage(image)" 
                      class="action-btn download"
                      title="下載圖片"
                    >
                      ⬇
                    </button>
                    <button 
                      @click.stop="copyImageUrl(image)" 
                      class="action-btn copy"
                      title="複製連結"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 無圖片狀態 -->
            <div v-else-if="galleryImages.length === 0" class="no-images">
              <div class="no-images-icon">🖼️</div>
              <h3>沒有找到圖片</h3>
              <p>public/images 資料夾中沒有圖片檔案</p>
            </div>

            <!-- 搜尋無結果 -->
            <div v-else class="no-results">
              <div class="no-results-icon">🔍</div>
              <h3>沒有符合的圖片</h3>
              <p>嘗試使用不同的關鍵字搜尋</p>
              <button @click="clearSearch" class="clear-search-btn">清除搜尋</button>
            </div>

            <!-- 燈箱 -->
            <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
              <div class="lightbox-content" @click.stop>
                <button @click="closeLightbox" class="lightbox-close">✕</button>
                
                <div class="lightbox-image-container">
                  <button 
                    @click="previousImage" 
                    class="lightbox-nav prev"
                    :disabled="currentImageIndex === 0"
                  >
                    ‹
                  </button>
                  
                  <img 
                    :src="currentLightboxImage.url" 
                    :alt="currentLightboxImage.name"
                    class="lightbox-image"
                  >
                  
                  <button 
                    @click="nextImage" 
                    class="lightbox-nav next"
                    :disabled="currentImageIndex === filteredImages.length - 1"
                  >
                    ›
                  </button>
                </div>
                
                <div class="lightbox-info">
                  <h3>{{ currentLightboxImage.displayName }}</h3>
                  <div class="lightbox-details">
                    <span>{{ formatFileSize(currentLightboxImage.size) }}</span>
                    <span>{{ currentLightboxImage.extension.toUpperCase() }}</span>
                    <span>{{ currentImageIndex + 1 }} / {{ filteredImages.length }}</span>
                  </div>
                  <div class="lightbox-actions">
                    <button @click="downloadImage(currentLightboxImage)" class="lightbox-btn">
                      下載圖片
                    </button>
                    <button @click="copyImageUrl(currentLightboxImage)" class="lightbox-btn">
                      複製連結
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- 移動端遮罩 -->
    <div 
      v-if="sidebarOpen" 
      class="mobile-overlay"
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { createClient } from '@supabase/supabase-js'

// 響應式數據
const currentPage = ref('dashboard')
const sidebarOpen = ref(false)
const subscriptions = ref([])
const foods = ref([])

// 訂閱管理相關
const subscriptionLoading = ref(false)
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

// 食品管理相關
const foodLoading = ref(false)
const editingFood = ref(null)

// 新增食品表單
const newFood = ref({
  name: '',
  amount: null,
  price: null,
  shop: '',
  todate: '',
  photo: '',
  photohash: ''
})

// 影片管理相關
const videoList = ref([
  {
    blobKey: '19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4',
    displayName: '鋒兄的傳奇人生',
    fileSize: 149202463, // 142.29MB (實際大小)
    uploadedAt: '2025-12-16',
    cached: false,
    loading: false,
    error: false,
    caching: false,
    poster: null,
    blobExists: false
  },
  {
    blobKey: 'clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4',
    displayName: '鋒兄進化Show🔥',
    fileSize: 46317671, // 44.17MB (實際大小)
    uploadedAt: '2025-12-16',
    cached: false,
    loading: false,
    error: false,
    caching: false,
    poster: null,
    blobExists: false
  }
])

const cachedVideos = ref([])
const totalCacheSize = ref(0)
const isPreloading = ref(false)
const cacheMessage = ref('')
const cacheMessageType = ref('info')

// 圖片畫廊相關
const galleryImages = ref([])
const searchQuery = ref('')
const viewMode = ref('grid')
const lightboxOpen = ref(false)
const currentImageIndex = ref(0)

// Supabase 客戶端
const config = useRuntimeConfig()
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseAnonKey
)

// 頁面管理
const setCurrentPage = (page) => {
  currentPage.value = page
  // 在移動端切換頁面時關閉側邊欄
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
  
  // 當切換到影片頁面時，檢查 Netlify Blobs 狀態
  if (page === 'video') {
    nextTick(() => {
      checkBlobsStatus()
    })
  }
}

const getPageTitle = () => {
  const titles = {
    dashboard: '儀表板',
    subscription: '訂閱管理',
    food: '食品管理',
    video: '影片介紹',
    gallery: '圖片畫廊'
  }
  return titles[currentPage.value] || '管理系統'
}

// 側邊欄管理
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// 計算屬性
const totalMonthlyCost = computed(() => {
  return subscriptions.value.reduce((total, sub) => total + (sub.price || 0), 0)
})

// 圖片畫廊計算屬性
const filteredImages = computed(() => {
  let filtered = galleryImages.value
  
  // 按搜尋關鍵字篩選
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(img => 
      img.name.toLowerCase().includes(query) ||
      img.displayName.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

const currentLightboxImage = computed(() => {
  return filteredImages.value[currentImageIndex.value] || {}
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

// 即將到期的食品（7天內）
const expiringFoods = computed(() => {
  const today = new Date()
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return foods.value.filter(food => {
    if (!food.todate) return false
    const toDate = new Date(food.todate)
    return toDate <= sevenDaysLater && toDate >= today
  })
})

// 按到期日排序的食品列表（即將到期的在上面）
const sortedFoods = computed(() => {
  return [...foods.value].sort((a, b) => {
    // 處理沒有到期日的情況，放到最後
    if (!a.todate && !b.todate) return 0
    if (!a.todate) return 1
    if (!b.todate) return -1
    
    // 比較到期日，近的在前
    const dateA = new Date(a.todate)
    const dateB = new Date(b.todate)
    return dateA - dateB
  })
})

// 訂閱管理方法
const addSubscription = async () => {
  if (!supabase) return
  
  // 驗證日期格式
  if (newSubscription.value.nextdate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(newSubscription.value.nextdate)) {
      alert('請輸入正確的日期格式 (YYYY-MM-DD)')
      return
    }
  }
  
  try {
    subscriptionLoading.value = true
    
    const { data, error } = await supabase
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
    resetSubscriptionForm()
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
  if (!editingSubscription.value || !supabase) return
  
  // 驗證日期格式
  if (newSubscription.value.nextdate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(newSubscription.value.nextdate)) {
      alert('請輸入正確的日期格式 (YYYY-MM-DD)')
      return
    }
  }
  
  try {
    subscriptionLoading.value = true
    
    const { data, error } = await supabase
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
    
    resetSubscriptionForm()
    alert('訂閱服務更新成功！')
  } catch (error) {
    console.error('更新訂閱錯誤:', error.message)
    alert('更新訂閱失敗: ' + error.message)
  } finally {
    subscriptionLoading.value = false
  }
}

const deleteSubscription = async (id) => {
  if (!supabase) return
  
  if (!confirm('確定要刪除這個訂閱服務嗎？')) return
  
  try {
    subscriptionLoading.value = true
    
    const { error } = await supabase
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

const resetSubscriptionForm = () => {
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

// 圖片畫廊方法
const loadGalleryImages = () => {
  // 定義圖片文件列表（基於你提供的 public/images 文件列表）
  const imageFiles = [
    '1761405863-3ca40781-b24f-4c48-9795-7bc061f58ed6.jpeg',
    '1761405934-74814b15-9720-44af-a88e-91f4933748c3.jpeg',
    '248adc66-2260-491b-b5a9-91ca01099528.jpeg',
    '50a2f658-0691-4694-a692-7c53a73c175f.jpg',
    'a31b59e0-088a-4d22-991b-a040af3884fa.jpeg',
    'apple-touch-icon.png',
    'ChatGPT Image 2025年10月26日 下午07_21_51.jpeg',
    'ChatGPT Image 2025年10月26日 下午07_37_12.jpeg',
    'ChatGPT Image 2025年10月26日 下午07_45_30.jpeg',
    'ChatGPT Image 2025年11月10日 下午07 07.png',
    'ChatGPT Image 2025年11月10日 下午07_29.png',
    'ChatGPT Image 2025年11月13日 下午09_08_37.png',
    'ChatGPT Image 2025年11月13日 下午09_10_45.png',
    'ChatGPT Image 2025年11月13日 下午09_18_36.png',
    'ChatGPT Image 2025年11月18日 下午02_00_03.png',
    'ChatGPT Image 2025年11月18日 下午02_11_13.png',
    'ec6a52ef-397a-481d-a1c2-4336dabc2eb5.jpeg',
    'f56a77b4-342b-4624-aaee-0a1eefda1c02.jpeg',
    'Gemini_Generated_Image_1acyxf1acyxf1acy.png',
    'Gemini_Generated_Image_1xs3cf1xs3cf1xs3.png',
    'Gemini_Generated_Image_3348083348083348.png',
    'Gemini_Generated_Image_4iscnp4iscnp4isc.png',
    'Gemini_Generated_Image_5xiatu5xiatu5xia.png',
    'Gemini_Generated_Image_76qn2776qn2776qn.png',
    'Gemini_Generated_Image_a5eanqa5eanqa5ea.png',
    'Gemini_Generated_Image_a7lvpba7lvpba7lv.png',
    'Gemini_Generated_Image_a959gfa959gfa959.png',
    'Gemini_Generated_Image_asj7abasj7abasj7.png',
    'Gemini_Generated_Image_avufzzavufzzavuf.png',
    'Gemini_Generated_Image_azcmkgazcmkgazcm.png',
    'Gemini_Generated_Image_br5g4ybr5g4ybr5g.png',
    'Gemini_Generated_Image_c7gqahc7gqahc7gq.png',
    'Gemini_Generated_Image_cuhb9mcuhb9mcuhb.png',
    'Gemini_Generated_Image_empb0tempb0tempb.png',
    'Gemini_Generated_Image_f7jzmkf7jzmkf7jz.png',
    'Gemini_Generated_Image_gb7e0tgb7e0tgb7e.png',
    'Gemini_Generated_Image_grs13tgrs13tgrs1.png',
    'Gemini_Generated_Image_jc0z4ojc0z4ojc0z.png',
    'Gemini_Generated_Image_kzhm4pkzhm4pkzhm.png',
    'Gemini_Generated_Image_mc90rjmc90rjmc90.png',
    'Gemini_Generated_Image_n016vun016vun016.png',
    'Gemini_Generated_Image_no8fxsno8fxsno8f.png',
    'Gemini_Generated_Image_p8s78p8s78p8s78p.png',
    'Gemini_Generated_Image_urahmhurahmhurah.png',
    'Gemini_Generated_Image_xcac14xcac14xcac.png',
    'Gemini_Generated_Image_xfh0ydxfh0ydxfh0.png',
    'Google-logo_1.jpg',
    'IMG_0032.jpg',
    'MindVideo_20251128135952_420.jpg',
    'MindVideo_20251128184816_627.jpg',
    'MindVideo_20251128190433_123.jpg',
    'MindVideo_20251128190629_343.jpg',
    'MindVideo_20251128191517_115.jpg',
    'MindVideo_20251128201528_755.jpg',
    'MindVideo_20251128203653_134.jpg',
    'MindVideo_20251203161758_843.png',
    'MindVideo_20251212222832_232.png',
    'MindVideo_20251214000745_021.png',
    'MindVideo_20251214013030_085.png',
    'Screenshot 2025-10-26 at 21-54-22 20251026_2146_01k8gbv2ynecwrezhhpnx3cwg1.mp4.png',
    'Screenshot 2025-12-05 at 00-22-42 .png',
    'sora2.jpg'
  ]

  galleryImages.value = imageFiles.map(filename => {
    const extension = filename.split('.').pop().toLowerCase()
    return {
      name: filename,
      displayName: filename.length > 50 ? filename.substring(0, 47) + '...' : filename,
      url: `/images/${filename}`,
      path: `public/images/${filename}`,
      extension: extension,
      size: Math.floor(Math.random() * 2000000) + 100000, // 模擬文件大小
      type: ['jpg', 'jpeg'].includes(extension) ? 'jpeg' : extension
    }
  })
}

const clearSearch = () => {
  searchQuery.value = ''
}

const openLightbox = (index) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = 'auto'
}

const nextImage = () => {
  if (currentImageIndex.value < filteredImages.value.length - 1) {
    currentImageIndex.value++
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWclueJh+eEoeazleWKoOi8iDwvdGV4dD48L3N2Zz4='
}

const downloadImage = (image) => {
  const link = document.createElement('a')
  link.href = image.url
  link.download = image.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const copyImageUrl = async (image) => {
  try {
    const fullUrl = window.location.origin + image.url
    await navigator.clipboard.writeText(fullUrl)
    alert('圖片網址已複製到剪貼簿')
  } catch (err) {
    console.error('複製失敗:', err)
    alert('複製失敗，請手動複製網址')
  }
}

// 輔助方法
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 影片管理方法
const formatCacheSize = (bytes) => {
  return formatFileSize(bytes)
}

const getVideoUrl = (blobKey) => {
  // 優先使用快取的 blob URL
  const cached = cachedVideos.value.find(v => v.blobKey === blobKey)
  if (cached && cached.blobUrl) {
    return cached.blobUrl
  }
  
  // 使用 Netlify Blobs API
  return `/api/blobs/${blobKey}`
}

const onVideoLoadStart = (blobKey) => {
  const video = videoList.value.find(v => v.blobKey === blobKey)
  if (video) {
    video.loading = true
    video.error = false
  }
}

const onVideoLoaded = (blobKey) => {
  const video = videoList.value.find(v => v.blobKey === blobKey)
  if (video) {
    video.loading = false
    video.error = false
  }
}

const onVideoError = (blobKey, event) => {
  const video = videoList.value.find(v => v.blobKey === blobKey)
  if (video) {
    video.loading = false
    video.error = true
  }
  console.error(`影片載入錯誤 (${blobKey}):`, event)
}

const retryVideo = (blobKey) => {
  const video = videoList.value.find(v => v.blobKey === blobKey)
  if (video) {
    video.error = false
    video.loading = true
    
    // 重新載入影片
    setTimeout(() => {
      const videoEl = document.querySelector(`[ref="video-${blobKey}"]`)
      if (videoEl) {
        videoEl.load()
      }
    }, 100)
  }
}

const cacheVideo = async (blobKey) => {
  const video = videoList.value.find(v => v.blobKey === blobKey)
  if (!video || video.cached || video.caching) return
  
  video.caching = true
  
  try {
    const response = await fetch(`/api/blobs/${blobKey}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    
    // 更新影片狀態
    video.cached = true
    video.caching = false
    video.fileSize = blob.size
    
    // 添加到快取列表
    cachedVideos.value.push({
      blobKey,
      blobUrl,
      size: blob.size,
      cachedAt: new Date()
    })
    
    // 更新快取大小
    totalCacheSize.value += blob.size
    
    // 更新影片元素的 src
    const videoEl = document.querySelector(`[ref="video-${blobKey}"]`)
    if (videoEl) {
      videoEl.src = blobUrl
    }
    
    showCacheMessage(`影片 "${video.displayName}" 快取成功`, 'success')
    
  } catch (error) {
    video.caching = false
    console.error(`快取影片失敗 (${blobKey}):`, error)
    showCacheMessage(`快取影片失敗: ${error.message}`, 'error')
  }
}

const clearVideoCache = (blobKey) => {
  const video = videoList.value.find(v => v.blobKey === blobKey)
  if (!video || !video.cached) return
  
  // 清理 blob URL
  const cached = cachedVideos.value.find(v => v.blobKey === blobKey)
  if (cached && cached.blobUrl) {
    URL.revokeObjectURL(cached.blobUrl)
    totalCacheSize.value -= cached.size
  }
  
  // 從快取列表移除
  cachedVideos.value = cachedVideos.value.filter(v => v.blobKey !== blobKey)
  
  // 更新影片狀態
  video.cached = false
  
  // 重置影片元素的 src
  const videoEl = document.querySelector(`[ref="video-${blobKey}"]`)
  if (videoEl) {
    videoEl.src = `/api/blobs/${blobKey}`
  }
  
  showCacheMessage(`影片 "${video.displayName}" 快取已清除`, 'info')
}

const preloadAllVideos = async () => {
  isPreloading.value = true
  showCacheMessage('開始預載所有影片...', 'info')
  
  try {
    const uncachedVideos = videoList.value.filter(v => !v.cached)
    
    for (const video of uncachedVideos) {
      await cacheVideo(video.blobKey)
    }
    
    showCacheMessage('所有影片預載完成！', 'success')
  } catch (error) {
    showCacheMessage('預載過程中發生錯誤', 'error')
  } finally {
    isPreloading.value = false
  }
}

const clearAllCache = () => {
  if (!confirm('確定要清除所有影片快取嗎？')) return
  
  // 清理所有 blob URLs
  cachedVideos.value.forEach(cached => {
    if (cached.blobUrl) {
      URL.revokeObjectURL(cached.blobUrl)
    }
  })
  
  // 重置所有影片狀態
  videoList.value.forEach(video => {
    video.cached = false
    
    // 重置影片元素的 src
    const videoEl = document.querySelector(`[ref="video-${video.blobKey}"]`)
    if (videoEl) {
      videoEl.src = `/api/blobs/${video.blobKey}`
    }
  })
  
  cachedVideos.value = []
  totalCacheSize.value = 0
  
  showCacheMessage('所有快取已清除', 'info')
}

const checkCacheStatus = () => {
  // 重新計算快取大小
  totalCacheSize.value = cachedVideos.value.reduce((total, video) => total + (video.size || 0), 0)
  
  // 更新影片快取狀態
  videoList.value.forEach(video => {
    video.cached = cachedVideos.value.some(cached => cached.blobKey === video.blobKey)
  })
  
  showCacheMessage('快取狀態已更新', 'info')
}

// 檢查 Netlify Blobs 狀態
const checkBlobsStatus = async () => {
  showCacheMessage('正在檢查 Netlify Blobs 狀態...', 'info')
  
  try {
    let existingBlobs = 0
    
    for (const video of videoList.value) {
      try {
        // 嘗試訪問 blob URL 來檢查是否存在
        const response = await fetch(`/api/blobs/${video.blobKey}`, { method: 'HEAD' })
        video.blobExists = response.ok
        
        if (response.ok) {
          existingBlobs++
          video.error = false
        } else {
          video.error = true
        }
      } catch (error) {
        video.blobExists = false
        video.error = true
      }
    }
    
    const totalBlobs = videoList.value.length
    
    if (existingBlobs === totalBlobs) {
      showCacheMessage(`✅ 所有影片 (${existingBlobs}/${totalBlobs}) 都已上傳到 Netlify Blobs`, 'success')
    } else if (existingBlobs > 0) {
      showCacheMessage(`⚠️ 部分影片 (${existingBlobs}/${totalBlobs}) 已上傳到 Netlify Blobs`, 'info')
    } else {
      showCacheMessage(`❌ 沒有影片上傳到 Netlify Blobs，請先上傳影片`, 'error')
    }
  } catch (error) {
    console.error('檢查 Netlify Blobs 狀態失敗:', error)
    showCacheMessage(`❌ 檢查失敗: ${error.message}`, 'error')
  }
}

const downloadVideo = async (blobKey, displayName) => {
  try {
    const response = await fetch(`/api/blobs/${blobKey}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${displayName}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
    
    showCacheMessage(`影片 "${displayName}" 下載開始`, 'success')
  } catch (error) {
    console.error('下載影片失敗:', error)
    showCacheMessage(`下載失敗: ${error.message}`, 'error')
  }
}

const showCacheMessage = (message, type = 'info') => {
  cacheMessage.value = message
  cacheMessageType.value = type
  
  // 3秒後清除訊息
  setTimeout(() => {
    cacheMessage.value = ''
  }, 3000)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
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

// 食品管理方法
const addFood = async () => {
  if (!supabase) return
  
  // 驗證日期格式
  if (newFood.value.todate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(newFood.value.todate)) {
      alert('請輸入正確的日期格式 (YYYY-MM-DD)')
      return
    }
  }
  
  try {
    foodLoading.value = true
    
    const { data, error } = await supabase
      .from('food')
      .insert({
        name: newFood.value.name,
        amount: newFood.value.amount || null,
        price: newFood.value.price || null,
        shop: newFood.value.shop || null,
        todate: newFood.value.todate || null,
        photo: newFood.value.photo || null,
        photohash: newFood.value.photohash || null
      })
      .select()
      .single()
    
    if (error) throw error
    
    foods.value.unshift(data)
    resetFoodForm()
    alert('食品新增成功！')
  } catch (error) {
    console.error('新增食品錯誤:', error.message)
    alert('新增食品失敗: ' + error.message)
  } finally {
    foodLoading.value = false
  }
}

const editFood = (food) => {
  editingFood.value = food
  newFood.value = {
    name: food.name,
    amount: food.amount,
    price: food.price,
    shop: food.shop || '',
    todate: food.todate || '',
    photo: food.photo || '',
    photohash: food.photohash || ''
  }
  
  // 滾動到表單
  if (process.client) {
    document.querySelector('.add-food')?.scrollIntoView({ behavior: 'smooth' })
  }
}

const updateFood = async () => {
  if (!editingFood.value || !supabase) return
  
  // 驗證日期格式
  if (newFood.value.todate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(newFood.value.todate)) {
      alert('請輸入正確的日期格式 (YYYY-MM-DD)')
      return
    }
  }
  
  try {
    foodLoading.value = true
    
    const { data, error } = await supabase
      .from('food')
      .update({
        name: newFood.value.name,
        amount: newFood.value.amount || null,
        price: newFood.value.price || null,
        shop: newFood.value.shop || null,
        todate: newFood.value.todate || null,
        photo: newFood.value.photo || null,
        photohash: newFood.value.photohash || null
      })
      .eq('id', editingFood.value.id)
      .select()
      .single()
    
    if (error) throw error
    
    // 更新本地資料
    const index = foods.value.findIndex(f => f.id === editingFood.value.id)
    if (index !== -1) {
      foods.value[index] = data
    }
    
    resetFoodForm()
    alert('食品更新成功！')
  } catch (error) {
    console.error('更新食品錯誤:', error.message)
    alert('更新食品失敗: ' + error.message)
  } finally {
    foodLoading.value = false
  }
}

const deleteFood = async (id) => {
  if (!supabase) return
  
  if (!confirm('確定要刪除這項食品嗎？')) return
  
  try {
    foodLoading.value = true
    
    const { error } = await supabase
      .from('food')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    foods.value = foods.value.filter(f => f.id !== id)
    alert('食品已刪除')
  } catch (error) {
    console.error('刪除食品錯誤:', error.message)
    alert('刪除食品失敗: ' + error.message)
  } finally {
    foodLoading.value = false
  }
}

const resetFoodForm = () => {
  newFood.value = {
    name: '',
    amount: null,
    price: null,
    shop: '',
    todate: '',
    photo: '',
    photohash: ''
  }
  editingFood.value = null
}

// 食品輔助方法
const getFoodStatusClass = (todate) => {
  if (!todate) return ''
  
  const today = new Date()
  const expiry = new Date(todate)
  const diffTime = expiry - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'food-expired'
  if (diffDays <= 3) return 'food-critical'
  if (diffDays <= 7) return 'food-warning'
  return 'food-normal'
}

const getExpiryClass = (todate) => {
  if (!todate) return ''
  
  const today = new Date()
  const expiry = new Date(todate)
  const diffTime = expiry - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'date-overdue'
  if (diffDays <= 3) return 'date-critical'
  if (diffDays <= 7) return 'date-soon'
  return 'date-normal'
}

// 數據更新處理 (保留以備將來使用)
const onSubscriptionsUpdated = (newSubscriptions) => {
  subscriptions.value = newSubscriptions
}

const onFoodsUpdated = (newFoods) => {
  foods.value = newFoods
}

// 初始化數據載入
const loadInitialData = async () => {
  try {
    // 載入訂閱數據
    const { data: subscriptionData } = await supabase
      .from('subscription')
      .select('*')
    
    if (subscriptionData) {
      subscriptions.value = subscriptionData
    }

    // 載入食品數據
    const { data: foodData } = await supabase
      .from('food')
      .select('*')
    
    if (foodData) {
      foods.value = foodData
    }

    // 載入圖片畫廊數據
    loadGalleryImages()
    
    // 檢查 Netlify Blobs 狀態
    if (currentPage.value === 'video') {
      checkBlobsStatus()
    }
  } catch (error) {
    console.error('載入初始數據失敗:', error)
  }
}

// 響應式處理
const handleResize = () => {
  if (window.innerWidth > 768) {
    sidebarOpen.value = false
  }
}

// 組件掛載
onMounted(() => {
  loadInitialData()
  
  // 添加窗口大小變化監聽
  if (process.client) {
    window.addEventListener('resize', handleResize)
  }
})

// 組件卸載時清理
onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style scoped>
/* 全局樣式重置 */
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

/* 主要內容區域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-open {
  margin-left: 0;
}

/* 頂部導航欄 */
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

/* 移動端遮罩 */
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

/* 動畫效果 */
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

/* 儀表板樣式 */
.dashboard-container {
  animation: fadeIn 0.3s ease-in;
}

.dashboard-overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  color: #666;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #999;
  font-size: 0.9rem;
}

.dashboard-actions {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.dashboard-actions h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.action-btn.primary {
  background: #3498db;
  color: white;
}

.action-btn.primary:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: #95a5a6;
  color: white;
}

.action-btn.secondary:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
}

/* 管理頁面樣式 */
.video-manager-container,
.image-gallery-container,
.subscription-management,
.food-management {
  animation: fadeIn 0.3s ease-in;
}

.video-manager-container h1,
.image-gallery-container h1,
.subscription-management h1,
.food-management h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.video-info {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.video-info h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.video-placeholder,
.gallery-placeholder,
.management-placeholder {
  background: white;
  padding: 4rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
  color: #666;
}

.video-placeholder p,
.gallery-placeholder p,
.management-placeholder p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.video-placeholder p:last-child,
.gallery-placeholder p:last-child {
  margin-bottom: 0;
}

.feature-list {
  margin-top: 2rem;
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.feature-list ul {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  font-size: 1.1rem;
  color: #2c3e50;
}

.feature-list li:last-child {
  border-bottom: none;
}

/* 訂閱管理樣式 */
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

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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

/* 響應式調整 */
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

/* 食品管理樣式 */
.food-management {
  max-width: 1000px;
  margin: 0 auto;
}

.add-food {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.food-form {
  margin-top: 1rem;
}

.food-list {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 2rem;
}

.expiry-warning {
  color: #e74c3c;
  font-weight: bold;
}

.no-foods {
  text-align: center;
  color: #7f8c8d;
  padding: 3rem;
}

.foods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.food-card {
  background: #f8f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.food-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.food-card.food-expired {
  border-color: #e74c3c;
  background: #fdf2f2;
}

.food-card.food-critical {
  border-color: #f39c12;
  background: #fef9e7;
}

.food-card.food-warning {
  border-color: #f1c40f;
  background: #fffbf0;
}

.food-card.food-normal {
  border-color: #27ae60;
  background: #f8fff9;
}

/* 食品卡片主要資訊區域佈局 */
.main-info-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.photo-section {
  flex-shrink: 0;
}

.food-photo {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

.key-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.key-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.other-info {
  border-top: 1px solid #e1e8ed;
  padding-top: 1rem;
}

.date-critical {
  color: #e74c3c;
  font-weight: bold;
}

/* 食品管理響應式調整 */
@media (max-width: 768px) {
  .foods-grid {
    grid-template-columns: 1fr;
  }
  
  .main-info-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .key-info-section {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .key-info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }
}

@media (max-width: 480px) {
  .main-info-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .key-info-section {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .key-info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }
}

/* 影片管理樣式 */
.video-manager-container {
  animation: fadeIn 0.3s ease-in;
}

.video-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
}

.video-info h3 {
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.video-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
}

.upload-guide {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.upload-guide h3 {
  color: #856404;
  margin-bottom: 1rem;
}

.upload-guide p {
  color: #856404;
  margin-bottom: 1rem;
}

.upload-guide ol {
  color: #856404;
  padding-left: 1.5rem;
}

.upload-guide li {
  margin-bottom: 0.5rem;
}

.upload-guide code {
  background: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #e83e8c;
}

.cache-controls {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.cache-controls h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.control-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.cache-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.cache-btn.preload {
  background: #3498db;
  color: white;
}

.cache-btn.preload:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.cache-btn.clear {
  background: #e74c3c;
  color: white;
}

.cache-btn.clear:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

.cache-btn.refresh {
  background: #95a5a6;
  color: white;
}

.cache-btn.refresh:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
}

.cache-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cache-message {
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  font-weight: 500;
}

.cache-message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.cache-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.cache-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.video-list {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.video-list h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.video-card {
  background: #f8f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.video-header {
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.video-status {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.cached {
  background: #d4edda;
  color: #155724;
}

.status-badge.not-cached {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.blob-exists {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.blob-missing {
  background: #f8d7da;
  color: #721c24;
}

.video-player-container {
  position: relative;
  padding: 1.5rem;
}

.video-player {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.video-loading-overlay,
.video-error-overlay {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #2980b9;
}

.video-info-panel {
  padding: 1.5rem;
  background: white;
  border-top: 1px solid #e1e8ed;
}

.video-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #666;
  min-width: 80px;
}

.detail-value {
  color: #2c3e50;
  word-break: break-all;
  text-align: right;
}

.video-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  flex: 1;
  min-width: 120px;
}

.action-btn.cache {
  background: #3498db;
  color: white;
}

.action-btn.cache:hover:not(:disabled) {
  background: #2980b9;
}

.action-btn.clear-cache {
  background: #e74c3c;
  color: white;
}

.action-btn.clear-cache:hover {
  background: #c0392b;
}

.action-btn.download {
  background: #27ae60;
  color: white;
}

.action-btn.download:hover {
  background: #229954;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tech-info {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tech-info h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.tech-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.feature-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.feature-content h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.feature-content p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .videos-grid {
    grid-template-columns: 1fr;
  }
  
  .video-stats {
    gap: 1rem;
  }
  
  .control-buttons {
    flex-direction: column;
  }
  
  .cache-btn {
    width: 100%;
  }
  
  .video-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .detail-value {
    text-align: left;
  }
  
  .video-actions {
    flex-direction: column;
  }
  
  .action-btn {
    min-width: auto;
  }
  
  .tech-features {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .video-info {
    padding: 1.5rem;
  }
  
  .cache-controls,
  .video-list,
  .tech-info {
    padding: 1.5rem;
  }
  
  .video-player-container {
    padding: 1rem;
  }
  
  .video-info-panel {
    padding: 1rem;
  }
}

/* 圖片畫廊樣式 */
.image-gallery-container {
  animation: fadeIn 0.3s ease-in;
}

.gallery-info {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.gallery-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #666;
}

.gallery-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background: #f0f0f0;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.view-btn:hover {
  background: #f8f9fa;
}

.view-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

/* 網格檢視 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.image-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-card:hover .gallery-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  padding: 1rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.image-card:hover .image-overlay {
  transform: translateY(0);
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.image-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.image-size {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 列表檢視 */
.gallery-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-list-item {
  display: flex;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-list-item:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.list-image-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 1rem;
}

.list-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-image-info {
  flex: 1;
  min-width: 0;
}

.list-image-name {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.list-image-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.detail-item {
  font-size: 0.9rem;
  color: #666;
}

.image-path {
  font-size: 0.8rem;
  color: #999;
  font-family: monospace;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
  font-size: 1.2rem;
}

.action-btn:hover {
  background: #f0f0f0;
}

/* 無圖片狀態 */
.no-images, .no-results {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.no-images-icon, .no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-images h3, .no-results h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.no-images p, .no-results p {
  color: #666;
  margin-bottom: 1rem;
}

.clear-search-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-search-btn:hover {
  background: #2980b9;
}

/* 燈箱樣式 */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 10;
  transition: background-color 0.2s;
}

.lightbox-close:hover {
  background: rgba(0, 0, 0, 0.9);
}

.lightbox-image-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  display: block;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.2s;
  z-index: 10;
}

.lightbox-nav:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-50%) scale(1.1);
}

.lightbox-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.lightbox-nav.prev {
  left: 1rem;
}

.lightbox-nav.next {
  right: 1rem;
}

.lightbox-info {
  padding: 1.5rem;
  background: white;
}

.lightbox-info h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.lightbox-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.lightbox-actions {
  display: flex;
  gap: 1rem;
}

.lightbox-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.lightbox-btn:first-child {
  background: #3498db;
  color: white;
}

.lightbox-btn:first-child:hover {
  background: #2980b9;
}

.lightbox-btn:last-child {
  background: #95a5a6;
  color: white;
}

.lightbox-btn:last-child:hover {
  background: #7f8c8d;
}

/* 圖片畫廊響應式設計 */
@media (max-width: 768px) {
  .gallery-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .view-controls {
    justify-content: center;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .image-wrapper {
    height: 150px;
  }
  
  .image-list-item {
    flex-direction: column;
    text-align: center;
  }
  
  .list-image-wrapper {
    width: 100%;
    height: 200px;
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .list-image-details {
    justify-content: center;
  }
  
  .lightbox-content {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .lightbox-image {
    max-height: 60vh;
  }
  
  .lightbox-nav {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .lightbox-details {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .lightbox-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
  
  .image-wrapper {
    height: 200px;
  }
  
  .gallery-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .lightbox-info {
    padding: 1rem;
  }
  
  .lightbox-nav.prev {
    left: 0.5rem;
  }
  
  .lightbox-nav.next {
    right: 0.5rem;
  }
}

/* 載入動畫 */
@keyframes imageLoad {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.gallery-image,
.list-image {
  animation: imageLoad 0.3s ease;
}

/* 錯誤狀態樣式 */
.gallery-image[src*="data:image/svg"],
.list-image[src*="data:image/svg"] {
  background: #f8f9fa;
  border: 2px dashed #ddd;
}
</style>