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
          <li><a href="#" @click="setActiveContent('dashboard')">儀表板</a></li>
          <li><a href="#" @click="setActiveContent('subscription')">訂閱管理</a></li>
          <li><a href="#" @click="setActiveContent('food')">食品管理</a></li>
          <li><a href="#" @click="setActiveContent('services')">服務項目</a></li>
          <li><a href="#" @click="setActiveContent('portfolio')">作品集</a></li>
          <li><a href="#" @click="setActiveContent('videos')">影片介紹</a></li>
          <li><a href="#" @click="setActiveContent('about')">關於我們</a></li>
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
              <h1>圖片展示畫廊</h1>
              <p>展示 public 資料夾中的所有圖片內容</p>
              
              <!-- 圖片統計 -->
              <div class="gallery-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ imageFiles.length }}</span>
                  <span class="stat-label">張圖片</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ categoryCount }}</span>
                  <span class="stat-label">個分類</span>
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
                </div>
                <div class="filter-buttons">
                  <button 
                    @click="selectedCategory = 'all'"
                    :class="{ active: selectedCategory === 'all' }"
                    class="filter-btn"
                  >
                    全部
                  </button>
                  <button 
                    v-for="category in imageCategories" 
                    :key="category"
                    @click="selectedCategory = category"
                    :class="{ active: selectedCategory === category }"
                    class="filter-btn"
                  >
                    {{ getCategoryDisplayName(category) }}
                  </button>
                </div>
              </div>

              <!-- 圖片畫廊 -->
              <div class="image-gallery">
                <div 
                  v-for="image in filteredImages" 
                  :key="image.name"
                  class="image-card"
                  @click="openImageModal(image)"
                >
                  <div class="image-container">
                    <img 
                      :src="image.url" 
                      :alt="image.name"
                      class="gallery-image"
                      loading="lazy"
                      @error="onImageError"
                    >
                    <div class="image-actions-overlay">
                      <button class="action-btn view" title="查看大圖">
                        🔍
                      </button>
                      <button class="action-btn download" title="下載" @click.stop="downloadImage(image)">
                        📥
                      </button>
                    </div>
                  </div>
                  <div class="image-info">
                    <h4 class="image-title">{{ getImageDisplayName(image.name) }}</h4>
                    <p class="image-category">{{ getCategoryDisplayName(image.category) }}</p>
                  </div>
                </div>
              </div>

              <!-- 載入更多 -->
              <div v-if="hasMoreImages" class="load-more">
                <button @click="loadMoreImages" class="load-more-btn">
                  載入更多圖片
                </button>
              </div>

              <!-- 圖片模態框 -->
              <div v-if="selectedImage" class="image-modal" @click="closeImageModal">
                <div class="modal-content" @click.stop>
                  <button class="modal-close" @click="closeImageModal">✕</button>
                  <img 
                    :src="selectedImage.url" 
                    :alt="selectedImage.name"
                    class="modal-image"
                  >
                  <div class="modal-info">
                    <h3>{{ getImageDisplayName(selectedImage.name) }}</h3>
                    <p>分類：{{ getCategoryDisplayName(selectedImage.category) }}</p>
                    <p>檔案名稱：{{ selectedImage.name }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeContent === 'dashboard'" class="content-section">
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

                <!-- 警告區域 -->
                <div class="dashboard-alerts">
                  <h3>⚠️ 重要提醒</h3>
                  
                  <!-- 訂閱到期提醒 -->
                  <div class="alert-section">
                    <h4>📅 訂閱到期提醒</h4>
                    <div class="alert-grid">
                      <div class="alert-card critical" v-if="subscriptionsExpiring3Days.length > 0">
                        <div class="alert-header">
                          <span class="alert-icon">🚨</span>
                          <span class="alert-title">3天內到期</span>
                          <span class="alert-count">{{ subscriptionsExpiring3Days.length }}</span>
                        </div>
                        <div class="alert-items">
                          <div v-for="sub in subscriptionsExpiring3Days" :key="sub.id" class="alert-item">
                            {{ sub.name }} - {{ formatDate(sub.nextdate) }}
                          </div>
                        </div>
                      </div>
                      
                      <div class="alert-card warning" v-if="subscriptionsExpiring7Days.length > 0">
                        <div class="alert-header">
                          <span class="alert-icon">⚠️</span>
                          <span class="alert-title">7天內到期</span>
                          <span class="alert-count">{{ subscriptionsExpiring7Days.length }}</span>
                        </div>
                        <div class="alert-items">
                          <div v-for="sub in subscriptionsExpiring7Days" :key="sub.id" class="alert-item">
                            {{ sub.name }} - {{ formatDate(sub.nextdate) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 食品過期提醒 -->
                  <div class="alert-section">
                    <h4>🍎 食品過期提醒</h4>
                    <div class="alert-grid">
                      <div class="alert-card critical" v-if="foodsExpiring7Days.length > 0">
                        <div class="alert-header">
                          <span class="alert-icon">🚨</span>
                          <span class="alert-title">7天內過期</span>
                          <span class="alert-count">{{ foodsExpiring7Days.length }}</span>
                        </div>
                        <div class="alert-items">
                          <div v-for="food in foodsExpiring7Days" :key="food.id" class="alert-item">
                            {{ food.name }} - {{ formatDate(food.todate) }}
                          </div>
                        </div>
                      </div>
                      
                      <div class="alert-card warning" v-if="foodsExpiring30Days.length > 0">
                        <div class="alert-header">
                          <span class="alert-icon">⚠️</span>
                          <span class="alert-title">30天內過期</span>
                          <span class="alert-count">{{ foodsExpiring30Days.length }}</span>
                        </div>
                        <div class="alert-items">
                          <div v-for="food in foodsExpiring30Days" :key="food.id" class="alert-item">
                            {{ food.name }} - {{ formatDate(food.todate) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 快速操作 -->
                <div class="dashboard-actions">
                  <h3>🚀 快速操作</h3>
                  <div class="action-buttons">
                    <button @click="setActiveContent('subscription')" class="action-btn primary">
                      新增訂閱服務
                    </button>
                    <button @click="setActiveContent('food')" class="action-btn secondary">
                      新增食品記錄
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeContent === 'about'" class="content-section">
              <h1>關於我們</h1>
              
              <!-- 關於我們內容 -->
              <div class="about-content">
                <div class="about-intro">
                  <h2>鋒兄塗哥公關資訊</h2>
                  <p>歡迎來到鋒兄塗哥的官方平台！我們致力於提供最優質的內容和服務。</p>
                </div>

                <div class="about-sections">
                  <div class="about-section">
                    <h3>🎬 關於鋒兄</h3>
                    <p>鋒兄是一位充滿創意和熱情的內容創作者，以其獨特的視角和精彩的表演贏得了廣大觀眾的喜愛。從傳奇人生到進化Show，每一個作品都展現了他的專業態度和創新精神。</p>
                  </div>

                  <div class="about-section">
                    <h3>🎨 關於塗哥</h3>
                    <p>塗哥是團隊中的技術專家和創意總監，負責平台的技術開發和視覺設計。憑藉豐富的經驗和敏銳的洞察力，為用戶提供最佳的使用體驗。</p>
                  </div>

                  <div class="about-section">
                    <h3>🚀 我們的使命</h3>
                    <p>透過創新的技術和優質的內容，為用戶創造價值，建立一個充滿活力和創意的數位生態系統。我們相信每個人都有無限的潛能，而我們的目標就是幫助大家發揮這些潛能。</p>
                  </div>

                  <div class="about-section">
                    <h3>📞 公關聯絡</h3>
                    <div class="contact-info">
                      <div class="contact-item">
                        <span class="contact-label">媒體合作：</span>
                        <span class="contact-value">media@fengge-tuge.com</span>
                      </div>
                      <div class="contact-item">
                        <span class="contact-label">商業合作：</span>
                        <span class="contact-value">business@fengge-tuge.com</span>
                      </div>
                      <div class="contact-item">
                        <span class="contact-label">技術支援：</span>
                        <span class="contact-value">support@fengge-tuge.com</span>
                      </div>
                    </div>
                  </div>

                  <div class="about-section">
                    <h3>🌟 平台特色</h3>
                    <div class="features-grid">
                      <div class="feature-item">
                        <div class="feature-icon">📊</div>
                        <h4>智能儀表板</h4>
                        <p>一目了然的數據統計和提醒功能</p>
                      </div>
                      <div class="feature-item">
                        <div class="feature-icon">💳</div>
                        <h4>訂閱管理</h4>
                        <p>輕鬆管理所有訂閱服務和費用</p>
                      </div>
                      <div class="feature-item">
                        <div class="feature-icon">🍎</div>
                        <h4>食品管理</h4>
                        <p>智能追蹤食品保存期限</p>
                      </div>
                      <div class="feature-item">
                        <div class="feature-icon">🎬</div>
                        <h4>影片展示</h4>
                        <p>高效的影片載入和快取系統</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 版權聲明 -->
                <div class="copyright-section">
                  <div class="copyright-content">
                    <div class="copyright-main">
                      <h3>版權聲明</h3>
                      <p class="copyright-text">
                        <span class="copyright-symbol">©</span> 
                        <span class="copyright-years">2025～2125</span> 
                        <span class="copyright-owner">鋒兄塗哥公關資訊</span>
                      </p>
                      <p class="copyright-description">
                        版權所有，保留一切權利。本網站所有內容，包括但不限於文字、圖片、影片、音頻、軟體、程式碼等，均受到著作權法保護。
                      </p>
                    </div>
                    
                    <div class="copyright-details">
                      <div class="copyright-item">
                        <strong>使用條款：</strong>
                        <span>未經書面許可，不得複製、分發或修改本網站內容</span>
                      </div>
                      <div class="copyright-item">
                        <strong>技術支援：</strong>
                        <span>基於 Nuxt 4 + Supabase + Netlify 技術架構</span>
                      </div>
                      <div class="copyright-item">
                        <strong>最後更新：</strong>
                        <span>{{ new Date().getFullYear() }}年{{ new Date().getMonth() + 1 }}月</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

            <div v-else-if="activeContent === 'videos'" class="content-section">
              <h1>影片介紹</h1>
              
              <!-- 影片管理系統 -->
              <div class="video-management">
                <div class="video-info">
                  <h3>影片展示系統</h3>
                  <p>使用 Netlify Blobs 優化影片載入，減少流量消耗</p>
                </div>

                <!-- 影片列表 -->
                <div class="video-gallery">
                  <div class="video-grid">
                    <!-- 鋒兄的傳奇人生 -->
                    <div class="video-card">
                      <div class="video-header">
                        <h4>鋒兄的傳奇人生</h4>
                        <div class="video-meta">
                          <span class="video-date">2024</span>
                          <span class="video-status" :class="getVideoStatus('legend')">
                            {{ videoStatuses.legend }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="video-container">
                        <video 
                          v-if="videoUrls.legend"
                          :src="videoUrls.legend"
                          controls
                          preload="metadata"
                          class="video-player"
                          ref="legendVideo"
                          @loadstart="onVideoLoadStart('legend')"
                          @canplay="onVideoCanPlay('legend')"
                          @error="onVideoError('legend')"
                          @timeupdate="onTimeUpdate('legend')"
                          @loadedmetadata="onLoadedMetadata('legend')"
                        >
                          您的瀏覽器不支援影片播放。
                        </video>
                        
                        <!-- 自定義時間軸 -->
                        <div v-if="videoUrls.legend" class="custom-timeline">
                          <div class="timeline-info">
                            <span class="current-time">{{ formatTime(videoTimes.legend.current) }}</span>
                            <span class="duration">{{ formatTime(videoTimes.legend.duration) }}</span>
                          </div>
                          <div class="timeline-container" @click="seekVideo('legend', $event)">
                            <div class="timeline-track">
                              <div 
                                class="timeline-progress" 
                                :style="{ width: videoProgress.legend + '%' }"
                              ></div>
                              <div 
                                class="timeline-handle" 
                                :style="{ left: videoProgress.legend + '%' }"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div v-else class="video-placeholder">
                          <div class="placeholder-content">
                            <span class="placeholder-icon">🎬</span>
                            <p>影片載入中...</p>
                            <button @click="loadVideo('legend')" class="load-btn">
                              載入影片
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div class="video-info">
                        <p class="video-description">
                          記錄鋒兄人生中的重要時刻與成就
                        </p>
                        <div class="video-actions">
                          <button 
                            @click="toggleVideo('legend')" 
                            class="action-btn"
                            :disabled="videoLoading.legend"
                          >
                            {{ videoUrls.legend ? '重新載入' : '載入影片' }}
                          </button>
                          <button 
                            @click="clearVideoCache('legend')" 
                            class="action-btn secondary"
                            v-if="videoUrls.legend"
                          >
                            清除快取
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- 鋒兄進化Show -->
                    <div class="video-card">
                      <div class="video-header">
                        <h4>鋒兄進化Show🔥</h4>
                        <div class="video-meta">
                          <span class="video-date">2024</span>
                          <span class="video-status" :class="getVideoStatus('evolution')">
                            {{ videoStatuses.evolution }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="video-container">
                        <video 
                          v-if="videoUrls.evolution"
                          :src="videoUrls.evolution"
                          controls
                          preload="metadata"
                          class="video-player"
                          ref="evolutionVideo"
                          @loadstart="onVideoLoadStart('evolution')"
                          @canplay="onVideoCanPlay('evolution')"
                          @error="onVideoError('evolution')"
                          @timeupdate="onTimeUpdate('evolution')"
                          @loadedmetadata="onLoadedMetadata('evolution')"
                        >
                          您的瀏覽器不支援影片播放。
                        </video>
                        
                        <!-- 自定義時間軸 -->
                        <div v-if="videoUrls.evolution" class="custom-timeline">
                          <div class="timeline-info">
                            <span class="current-time">{{ formatTime(videoTimes.evolution.current) }}</span>
                            <span class="duration">{{ formatTime(videoTimes.evolution.duration) }}</span>
                          </div>
                          <div class="timeline-container" @click="seekVideo('evolution', $event)">
                            <div class="timeline-track">
                              <div 
                                class="timeline-progress" 
                                :style="{ width: videoProgress.evolution + '%' }"
                              ></div>
                              <div 
                                class="timeline-handle" 
                                :style="{ left: videoProgress.evolution + '%' }"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div v-else class="video-placeholder">
                          <div class="placeholder-content">
                            <span class="placeholder-icon">🎬</span>
                            <p>影片載入中...</p>
                            <button @click="loadVideo('evolution')" class="load-btn">
                              載入影片
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div class="video-info">
                        <p class="video-description">
                          展示鋒兄的成長歷程與精彩演出
                        </p>
                        <div class="video-actions">
                          <button 
                            @click="toggleVideo('evolution')" 
                            class="action-btn"
                            :disabled="videoLoading.evolution"
                          >
                            {{ videoUrls.evolution ? '重新載入' : '載入影片' }}
                          </button>
                          <button 
                            @click="clearVideoCache('evolution')" 
                            class="action-btn secondary"
                            v-if="videoUrls.evolution"
                          >
                            清除快取
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 快取資訊 -->
                <div class="cache-info">
                  <h3>📊 快取狀態</h3>
                  <div class="cache-stats">
                    <div class="cache-item">
                      <span class="cache-label">本地快取大小：</span>
                      <span class="cache-value">{{ formatCacheSize(totalCacheSize) }}</span>
                    </div>
                    <div class="cache-item">
                      <span class="cache-label">已快取影片：</span>
                      <span class="cache-value">{{ cachedVideosCount }} / 2</span>
                    </div>
                    <div class="cache-actions">
                      <button @click="clearAllCache" class="action-btn danger">
                        清除所有快取
                      </button>
                      <button @click="preloadAllVideos" class="action-btn primary">
                        預載所有影片
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeContent === 'subscription'" class="content-section">
              <h1>個人訂閱管理</h1>
              <SubscriptionManager 
                :supabase="supabase" 
                @subscriptions-updated="onSubscriptionsUpdated"
                ref="subscriptionManager"
              />
              
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
                          min="2025-01-01"
                          max="2125-12-31"
                          pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
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
            </div>

            <div v-else-if="activeContent === 'food'" class="content-section">
              <h1>食品管理</h1>
              <FoodManager 
                :supabase="supabase" 
                @foods-updated="onFoodsUpdated"
                ref="foodManager"
              />
              
              <!-- 食品管理系統 -->
              <div class="food-management">
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
                            <img :src="food.photo" :alt="food.name" class="food-photo" width="10%" />
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
            </div>

            <div v-else-if="activeContent === 'contact'" class="content-section">
              <h1>聯絡我們</h1>
              <p>歡迎與我們聯繫</p>
            </div>
          </div>
        </div>
      </main>

      <!-- 跳轉按鈕 -->
      <div class="scroll-buttons" v-show="showScrollButtons">
        <button 
          class="scroll-btn scroll-to-top" 
          @click="scrollToTop"
          title="回到頂部"
        >
          ↑
        </button>
        <button 
          class="scroll-btn scroll-to-bottom" 
          @click="scrollToBottom"
          title="跳到底部"
        >
          ↓
        </button>
      </div>

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
import SubscriptionManager from '~/components/SubscriptionManager.vue'
import FoodManager from '~/components/FoodManager.vue'

// 響應式佈局相關
const isSidebarOpen = ref(false)
const activeContent = ref('home')
const showScrollButtons = ref(false)

// 組件引用
const subscriptionManager = ref(null)
const foodManager = ref(null)

// 組件資料
const subscriptions = ref([])
const foods = ref([])

// 圖片畫廊相關
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedImage = ref(null)
const displayedImageCount = ref(20)

// 圖片文件列表
const imageFiles = ref([
  // ChatGPT 生成圖片
  { name: 'ChatGPT Image 2025年10月26日 下午07_21_51.jpeg', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年10月26日 下午07_37_12.jpeg', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年10月26日 下午07_45_30.jpeg', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月10日 下午07 07.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月10日 下午07_29.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月13日 下午09_08_37.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月13日 下午09_10_45.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月13日 下午09_18_36.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月13日 下午10_19_22@.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月13日 下午10_19_22@@.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月18日 下午02_00_03.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月18日 下午02_11_13.png', category: 'chatgpt' },
  
  // Gemini 生成圖片
  { name: 'Gemini_Generated_Image_1acyxf1acyxf1acy.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_1xs3cf1xs3cf1xs3.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_3348083348083348.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_4iscnp4iscnp4isc.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_5xiatu5xiatu5xia.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_76qn2776qn2776qn.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_a5eanqa5eanqa5ea.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_a7lvpba7lvpba7lv.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_a959gfa959gfa959.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_asj7abasj7abasj7.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_avufzzavufzzavuf.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_azcmkgazcmkgazcm.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_br5g4ybr5g4ybr5g.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_c7gqahc7gqahc7gq.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_cuhb9mcuhb9mcuhb.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_empb0tempb0tempb.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_f7jzmkf7jzmkf7jz.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_gb7e0tgb7e0tgb7e.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_grs13tgrs13tgrs1.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_jc0z4ojc0z4ojc0z.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_kzhm4pkzhm4pkzhm.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_mc90rjmc90rjmc90.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_n016vun016vun016.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_no8fxsno8fxsno8f.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_p8s78p8s78p8s78p.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_urahmhurahmhurah.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_xcac14xcac14xcac.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_xfh0ydxfh0ydxfh0.png', category: 'gemini' },
  
  // MindVideo 圖片
  { name: 'MindVideo_20251128135952_420.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128184816_627.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128190433_123.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128190629_343.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128191517_115.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128192530_578.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128201528_755.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128203653_134.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251203161758_843.png', category: 'mindvideo' },
  { name: 'MindVideo_20251212222832_232.png', category: 'mindvideo' },
  { name: 'MindVideo_20251214000745_021.png', category: 'mindvideo' },
  { name: 'MindVideo_20251214013030_085.png', category: 'mindvideo' },
  
  // 其他圖片
  { name: '11114-product-photo-20231130-54-17pt55y_71998305c2be38bf7096.jpg', category: 'other' },
  { name: '1761405863-3ca40781-b24f-4c48-9795-7bc061f58ed6.jpeg', category: 'other' },
  { name: '1761405934-74814b15-9720-44af-a88e-91f4933748c3.jpeg', category: 'other' },
  { name: '20251104_134814.jpg', category: 'photo' },
  { name: '248adc66-2260-491b-b5a9-91ca01099528.jpeg', category: 'other' },
  { name: '41debbc7-e26c-402d-8d29-7fa1b06441b7.jpeg', category: 'other' },
  { name: '50a2f658-0691-4694-a692-7c53a73c175f.jpg', category: 'other' },
  { name: '6ca6f5cd3a4e4525aeff15d3b43cd8c0.jpeg', category: 'other' },
  { name: '9ed35a46-9d95-4376-bd47-a267b49a22c0.jpeg', category: 'other' },
  { name: 'a31b59e0-088a-4d22-991b-a040af3884fa.jpeg', category: 'other' },
  { name: 'BackTshirtBack.jpeg', category: 'product' },
  { name: 'ec6a52ef-397a-481d-a1c2-4336dabc2eb5.jpeg', category: 'other' },
  { name: 'f56a77b4-342b-4624-aaee-0a1eefda1c02.jpeg', category: 'other' },
  { name: 'Google-logo_1.jpg', category: 'logo' },
  { name: 'IMG_0032.jpg', category: 'photo' },
  { name: 'Screenshot 2025-10-26 at 21-54-22 20251026_2146_01k8gbv2ynecwrezhhpnx3cwg1.mp4.png', category: 'screenshot' },
  { name: 'Screenshot 2025-12-05 at 00-22-42 .png', category: 'screenshot' },
  { name: 'sora2.jpg', category: 'ai' }
]
.filter(img => {
  // 只保留 JPG/JPEG/PNG 格式的圖片
  const extension = img.name.toLowerCase().split('.').pop()
  return ['jpg', 'jpeg', 'png'].includes(extension)
})
.map(img => ({
  ...img,
  url: `/images/${img.name}`
})))

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

// 食品管理相關
const foodLoading = ref(false)
const foods = ref([])
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
const videoLoading = ref({
  legend: false,
  evolution: false
})

const videoUrls = ref({
  legend: null,
  evolution: null
})

const videoStatuses = ref({
  legend: '未載入',
  evolution: '未載入'
})

// 影片時間和進度追蹤
const videoTimes = ref({
  legend: { current: 0, duration: 0 },
  evolution: { current: 0, duration: 0 }
})

const videoProgress = ref({
  legend: 0,
  evolution: 0
})

// 影片元素引用
const legendVideo = ref(null)
const evolutionVideo = ref(null)

const totalCacheSize = ref(0)

// 影片快取大小計算
const cachedVideosCount = computed(() => {
  return Object.values(videoUrls.value).filter(url => url !== null).length
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

// 儀表板相關計算屬性
// 3天內到期的訂閱
const subscriptionsExpiring3Days = computed(() => {
  const today = new Date()
  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
  
  return subscriptions.value.filter(sub => {
    if (!sub.nextdate) return false
    const nextDate = new Date(sub.nextdate)
    return nextDate <= threeDaysLater && nextDate >= today
  })
})

// 7天內到期的訂閱
const subscriptionsExpiring7Days = computed(() => {
  const today = new Date()
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
  
  return subscriptions.value.filter(sub => {
    if (!sub.nextdate) return false
    const nextDate = new Date(sub.nextdate)
    return nextDate <= sevenDaysLater && nextDate > threeDaysLater
  })
})

// 7天內過期的食品
const foodsExpiring7Days = computed(() => {
  const today = new Date()
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return foods.value.filter(food => {
    if (!food.todate) return false
    const toDate = new Date(food.todate)
    return toDate <= sevenDaysLater && toDate >= today
  })
})

// 30天內過期的食品（排除7天內的）
const foodsExpiring30Days = computed(() => {
  const today = new Date()
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return foods.value.filter(food => {
    if (!food.todate) return false
    const toDate = new Date(food.todate)
    return toDate <= thirtyDaysLater && toDate > sevenDaysLater
  })
})

// 組件事件處理
const onSubscriptionsUpdated = (updatedSubscriptions) => {
  subscriptions.value = updatedSubscriptions
}

const onFoodsUpdated = (updatedFoods) => {
  foods.value = updatedFoods
}

// 計算屬性 - 儀表板需要的統計資料
const totalMonthlyCost = computed(() => {
  return subscriptions.value.reduce((total, sub) => total + (sub.price || 0), 0)
})

// 儀表板相關計算屬性
// 3天內到期的訂閱
const subscriptionsExpiring3Days = computed(() => {
  const today = new Date()
  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
  
  return subscriptions.value.filter(sub => {
    if (!sub.nextdate) return false
    const nextDate = new Date(sub.nextdate)
    return nextDate <= threeDaysLater && nextDate >= today
  })
})

// 7天內到期的訂閱
const subscriptionsExpiring7Days = computed(() => {
  const today = new Date()
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
  
  return subscriptions.value.filter(sub => {
    if (!sub.nextdate) return false
    const nextDate = new Date(sub.nextdate)
    return nextDate <= sevenDaysLater && nextDate > threeDaysLater
  })
})

// 7天內過期的食品
const foodsExpiring7Days = computed(() => {
  const today = new Date()
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return foods.value.filter(food => {
    if (!food.todate) return false
    const toDate = new Date(food.todate)
    return toDate <= sevenDaysLater && toDate >= today
  })
})

// 30天內過期的食品（排除7天內的）
const foodsExpiring30Days = computed(() => {
  const today = new Date()
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return foods.value.filter(food => {
    if (!food.todate) return false
    const toDate = new Date(food.todate)
    return toDate <= thirtyDaysLater && toDate > sevenDaysLater
  })
})

// 圖片畫廊計算屬性
const imageCategories = computed(() => {
  const categories = [...new Set(imageFiles.value.map(img => img.category))]
  return categories.sort()
})

const categoryCount = computed(() => {
  return imageCategories.value.length
})

const filteredImages = computed(() => {
  let filtered = imageFiles.value

  // 按分類篩選
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(img => img.category === selectedCategory.value)
  }

  // 按搜尋關鍵字篩選
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(img => 
      img.name.toLowerCase().includes(query) ||
      getCategoryDisplayName(img.category).toLowerCase().includes(query)
    )
  }

  // 限制顯示數量
  return filtered.slice(0, displayedImageCount.value)
})

const hasMoreImages = computed(() => {
  let totalFiltered = imageFiles.value

  if (selectedCategory.value !== 'all') {
    totalFiltered = totalFiltered.filter(img => img.category === selectedCategory.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    totalFiltered = totalFiltered.filter(img => 
      img.name.toLowerCase().includes(query) ||
      getCategoryDisplayName(img.category).toLowerCase().includes(query)
    )
  }

  return totalFiltered.length > displayedImageCount.value
})

// 圖片畫廊方法
const getCategoryDisplayName = (category) => {
  const categoryNames = {
    'chatgpt': 'ChatGPT',
    'gemini': 'Gemini',
    'mindvideo': 'MindVideo',
    'photo': '照片',
    'screenshot': '截圖',
    'product': '產品',
    'logo': '標誌',
    'ai': 'AI生成',
    'other': '其他'
  }
  return categoryNames[category] || category
}

const getImageDisplayName = (filename) => {
  // 移除副檔名並簡化顯示名稱（只處理支援的圖片格式）
  return filename.replace(/\.(jpg|jpeg|png)$/i, '')
}

const openImageModal = (image) => {
  selectedImage.value = image
}

const closeImageModal = () => {
  selectedImage.value = null
}

const downloadImage = (image) => {
  const link = document.createElement('a')
  link.href = image.url
  link.download = image.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const loadMoreImages = () => {
  displayedImageCount.value += 20
}

const onImageError = (event) => {
  console.error('圖片載入失敗:', event.target.src)
  event.target.style.display = 'none'
}

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

// 滾動相關方法
const scrollToTop = () => {
  if (process.client) {
    const contentArea = document.querySelector('.content-area')
    if (contentArea) {
      contentArea.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

const scrollToBottom = () => {
  if (process.client) {
    const contentArea = document.querySelector('.content-area')
    if (contentArea) {
      contentArea.scrollTo({ top: contentArea.scrollHeight, behavior: 'smooth' })
    }
  }
}

const handleScroll = () => {
  if (process.client) {
    const contentArea = document.querySelector('.content-area')
    if (contentArea) {
      // 當滾動超過 300px 時顯示按鈕
      showScrollButtons.value = contentArea.scrollTop > 300
    }
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

// 食品管理方法 - 使用 Supabase
const loadFoodData = async () => {
  if (!supabase.value) return
  
  try {
    const { data, error } = await supabase.value
      .from('food')
      .select('*')
    
    if (error) throw error
    
    foods.value = data || []
  } catch (error) {
    console.error('載入食品資料錯誤:', error.message)
  }
}

const addFood = async () => {
  if (!supabase.value) return
  
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
    
    const { data, error } = await supabase.value
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
  if (!editingFood.value || !supabase.value) return
  
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
    
    const { data, error } = await supabase.value
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
  if (!supabase.value) return
  
  if (!confirm('確定要刪除這項食品嗎？')) return
  
  try {
    foodLoading.value = true
    
    const { error } = await supabase.value
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

// 影片管理方法
const loadVideo = async (videoKey) => {
  if (videoLoading.value[videoKey]) return
  
  try {
    videoLoading.value[videoKey] = true
    videoStatuses.value[videoKey] = '載入中...'
    
    // 影片檔案對應
    const videoFiles = {
      legend: '19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4',
      evolution: 'clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4'
    }
    
    // 嘗試多個來源：Netlify Blobs -> public 目錄
    const possibleUrls = [
      `/.netlify/blobs/${videoFiles[videoKey]}`,  // Netlify Blobs
      `/api/blobs/${videoFiles[videoKey]}`,       // 通過代理函數
      `/videos/${videoFiles[videoKey]}`           // public 目錄備用
    ]
    
    let videoUrl = null
    let loadSource = ''
    
    // 依序嘗試每個 URL
    for (const url of possibleUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD' })
        if (response.ok) {
          videoUrl = url
          loadSource = url.includes('/.netlify/blobs/') ? 'Netlify Blobs' : 'Public 目錄'
          
          // 更新快取大小（如果有 content-length）
          const contentLength = response.headers.get('content-length')
          if (contentLength) {
            totalCacheSize.value += parseInt(contentLength)
          }
          break
        }
      } catch (err) {
        console.log(`嘗試載入 ${url} 失敗:`, err.message)
      }
    }
    
    if (videoUrl) {
      videoUrls.value[videoKey] = videoUrl
      videoStatuses.value[videoKey] = `已載入 (${loadSource})`
      console.log(`影片 ${videoKey} 從 ${loadSource} 載入成功`)
    } else {
      throw new Error('所有來源都無法載入影片')
    }
    
  } catch (error) {
    console.error(`載入影片 ${videoKey} 失敗:`, error)
    videoStatuses.value[videoKey] = '載入失敗'
    
    // 提供更詳細的錯誤提示
    const videoFiles = {
      legend: '19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4',
      evolution: 'clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4'
    }
    
    alert(`載入影片失敗: ${error.message}\n\n請確保影片檔案存在於以下位置之一：\n1. Netlify Blobs\n2. public/videos/${videoFiles[videoKey]}`)
  } finally {
    videoLoading.value[videoKey] = false
  }
}

const toggleVideo = async (videoKey) => {
  if (videoUrls.value[videoKey]) {
    clearVideoCache(videoKey)
  } else {
    await loadVideo(videoKey)
  }
}

const clearVideoCache = (videoKey) => {
  if (videoUrls.value[videoKey]) {
    // 撤銷 blob URL 以釋放記憶體
    if (videoUrls.value[videoKey].startsWith('blob:')) {
      URL.revokeObjectURL(videoUrls.value[videoKey])
    }
    
    videoUrls.value[videoKey] = null
    videoStatuses.value[videoKey] = '未載入'
  }
}

const clearAllCache = () => {
  if (confirm('確定要清除所有影片快取嗎？')) {
    Object.keys(videoUrls.value).forEach(key => {
      clearVideoCache(key)
    })
    totalCacheSize.value = 0
    alert('所有影片快取已清除')
  }
}

const preloadAllVideos = async () => {
  if (confirm('確定要預載所有影片嗎？這可能會消耗較多流量。')) {
    const videoKeys = Object.keys(videoUrls.value)
    for (const key of videoKeys) {
      if (!videoUrls.value[key]) {
        await loadVideo(key)
      }
    }
  }
}

const onVideoLoadStart = (videoKey) => {
  videoStatuses.value[videoKey] = '載入中...'
}

const onVideoCanPlay = (videoKey) => {
  videoStatuses.value[videoKey] = '可播放'
}

const onVideoError = (videoKey) => {
  videoStatuses.value[videoKey] = '播放錯誤'
}

const getVideoStatus = (videoKey) => {
  const status = videoStatuses.value[videoKey]
  if (status === '已載入' || status === '可播放') return 'status-success'
  if (status === '載入中...') return 'status-loading'
  if (status === '載入失敗' || status === '播放錯誤') return 'status-error'
  return 'status-default'
}

const formatCacheSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 時間格式化方法
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === 0) return '0:00'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 影片時間更新事件
const onTimeUpdate = (videoKey) => {
  const videoElement = getVideoElement(videoKey)
  if (videoElement) {
    videoTimes.value[videoKey].current = videoElement.currentTime
    
    // 計算進度百分比
    if (videoTimes.value[videoKey].duration > 0) {
      videoProgress.value[videoKey] = (videoElement.currentTime / videoTimes.value[videoKey].duration) * 100
    }
  }
}

// 影片元數據載入事件
const onLoadedMetadata = (videoKey) => {
  const videoElement = getVideoElement(videoKey)
  if (videoElement) {
    videoTimes.value[videoKey].duration = videoElement.duration
  }
}

// 獲取影片元素
const getVideoElement = (videoKey) => {
  if (videoKey === 'legend') {
    return legendVideo.value
  } else if (videoKey === 'evolution') {
    return evolutionVideo.value
  }
  return null
}

// 時間軸點擊跳轉
const seekVideo = (videoKey, event) => {
  const videoElement = getVideoElement(videoKey)
  if (!videoElement || videoTimes.value[videoKey].duration === 0) return
  
  const timelineContainer = event.currentTarget
  const rect = timelineContainer.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  
  // 計算目標時間
  const targetTime = percentage * videoTimes.value[videoKey].duration
  
  // 跳轉到指定時間
  videoElement.currentTime = Math.max(0, Math.min(targetTime, videoTimes.value[videoKey].duration))
  
  // 更新進度
  videoProgress.value[videoKey] = percentage * 100
}

// 輔助方法
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

// 監聽視窗大小變化
const handleResize = () => {
  if (process.client && window.innerWidth > 768) {
    isSidebarOpen.value = false
  }
}

onMounted(async () => {
  if (process.client) {
    window.addEventListener('resize', handleResize)
    
    // 添加滾動事件監聽器
    const contentArea = document.querySelector('.content-area')
    if (contentArea) {
      contentArea.addEventListener('scroll', handleScroll)
    }
    
    // 初始化 Supabase 客戶端
    const initialized = await initSupabase()
    if (initialized) {
      // 載入資料
      loadSubscriptionData()
    }
    
    // 載入食品資料
    loadFoodData()
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleResize)
    
    // 移除滾動事件監聽器
    const contentArea = document.querySelector('.content-area')
    if (contentArea) {
      contentArea.removeEventListener('scroll', handleScroll)
    }
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

/* 滾動按鈕樣式 */
.scroll-buttons {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
}

.scroll-btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: #3498db;
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.scroll-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.scroll-to-top {
  background: #27ae60;
}

.scroll-to-top:hover {
  background: #229954;
}

.scroll-to-bottom {
  background: #e74c3c;
}

.scroll-to-bottom:hover {
  background: #c0392b;
}

/* 響應式調整 - 滾動按鈕 */
@media (max-width: 768px) {
  .scroll-buttons {
    right: 15px;
    bottom: 15px;
  }
  
  .scroll-btn {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
}
</style>

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

.no-foods {
  text-align: center;
  color: #7f8c8d;
  padding: 3rem;
}

.foods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.category {
  background: #3498db;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.expiry-warning {
  color: #e74c3c;
  font-weight: bold;
}

.date-critical {
  color: #e74c3c;
  font-weight: bold;
}

/* 響應式調整 - 食品管理 */
@media (max-width: 1024px) and (min-width: 769px) {
  .foods-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .foods-grid {
    grid-template-columns: 1fr;
  }
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
  height: auto;
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

/* 響應式調整 - 食品卡片 */
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
/* 儀表板樣式 */
.dashboard-overview {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.dashboard-alerts {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.dashboard-alerts h3 {
  margin: 0 0 1.5rem 0;
  color: #e74c3c;
}

.alert-section {
  margin-bottom: 2rem;
}

.alert-section:last-child {
  margin-bottom: 0;
}

.alert-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.alert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.alert-card {
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid;
}

.alert-card.critical {
  background: #fdf2f2;
  border-left-color: #e74c3c;
}

.alert-card.warning {
  background: #fef9e7;
  border-left-color: #f39c12;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.alert-icon {
  font-size: 1.2rem;
}

.alert-title {
  font-weight: bold;
  flex: 1;
}

.alert-count {
  background: rgba(0,0,0,0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.alert-items {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.alert-item {
  font-size: 0.9rem;
  color: #555;
}

.dashboard-actions {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 2rem;
}

.dashboard-actions h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  text-align: center;
}

.action-btn.primary {
  background: #3498db;
  color: white;
}

.action-btn.primary:hover {
  background: #2980b9;
}

.action-btn.secondary {
  background: #95a5a6;
  color: white;
}

.action-btn.secondary:hover {
  background: #7f8c8d;
}

/* 響應式調整 - 儀表板 */
@media (max-width: 768px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
  
  .alert-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
/* 影片管理樣式 */
.video-management {
  max-width: 1200px;
  margin: 0 auto;
}

.video-info {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

.video-gallery {
  margin-bottom: 2rem;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.video-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.video-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-header h4 {
  margin: 0;
  color: #2c3e50;
}

.video-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.video-date {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.video-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-success {
  background: #d4edda;
  color: #155724;
}

.status-loading {
  background: #fff3cd;
  color: #856404;
}

.status-error {
  background: #f8d7da;
  color: #721c24;
}

.status-default {
  background: #e2e3e5;
  color: #383d41;
}

.video-container {
  position: relative;
  width: 100%;
  height: 250px;
  background: #000;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.placeholder-content {
  text-align: center;
}

.placeholder-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.load-btn {
  background: rgba(255,255,255,0.2);
  border: 2px solid white;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  margin-top: 1rem;
}

.load-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-1px);
}

.video-info {
  padding: 1.5rem;
}

.video-description {
  color: #555;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.video-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.cache-info {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 2rem;
}

.cache-info h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.cache-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cache-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.cache-label {
  font-weight: bold;
  color: #2c3e50;
}

.cache-value {
  color: #3498db;
  font-weight: bold;
}

.cache-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.action-btn.danger {
  background: #e74c3c;
  color: white;
}

.action-btn.danger:hover {
  background: #c0392b;
}

/* 自定義時間軸樣式 */
.custom-timeline {
  padding: 1rem;
  background: rgba(0,0,0,0.05);
  border-top: 1px solid #e1e8ed;
}

.timeline-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #555;
}

.current-time {
  font-weight: bold;
  color: #3498db;
}

.duration {
  color: #7f8c8d;
}

.timeline-container {
  cursor: pointer;
  padding: 0.5rem 0;
}

.timeline-track {
  position: relative;
  height: 6px;
  background: #e1e8ed;
  border-radius: 3px;
  overflow: hidden;
}

.timeline-progress {
  height: 100%;
  background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
  border-radius: 3px;
  transition: width 0.1s ease;
}

.timeline-handle {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background: #3498db;
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: left 0.1s ease;
}

.timeline-handle:hover {
  background: #2980b9;
  transform: translate(-50%, -50%) scale(1.2);
}

.timeline-container:hover .timeline-track {
  height: 8px;
}

.timeline-container:hover .timeline-handle {
  width: 18px;
  height: 18px;
}

/* 響應式調整 - 影片管理 */
@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
  
  .video-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .video-meta {
    width: 100%;
    justify-content: space-between;
  }
  
  .video-container {
    height: 200px;
  }
  
  .video-actions {
    flex-direction: column;
  }
  
  .cache-actions {
    flex-direction: column;
  }
  
  .cache-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .custom-timeline {
    padding: 0.75rem;
  }
  
  .timeline-info {
    font-size: 0.8rem;
  }
  
  .timeline-handle {
    width: 20px;
    height: 20px;
  }
}
/* 關於我們頁面樣式 */
.about-content {
  max-width: 1000px;
  margin: 0 auto;
}

.about-intro {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.about-intro h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
}

.about-intro p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.about-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
}

.about-section {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.about-section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.about-section p {
  margin: 0;
  line-height: 1.6;
  color: #555;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.contact-label {
  font-weight: bold;
  color: #2c3e50;
  min-width: 100px;
}

.contact-value {
  color: #3498db;
  font-family: monospace;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.feature-item {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: transform 0.2s;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.feature-item h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.feature-item p {
  margin: 0;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.copyright-section {
  background: #2c3e50;
  color: white;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
}

.copyright-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.copyright-main {
  text-align: center;
}

.copyright-main h3 {
  margin: 0 0 1rem 0;
  color: white;
}

.copyright-text {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.copyright-symbol {
  font-size: 1.5rem;
  color: #3498db;
}

.copyright-years {
  color: #e74c3c;
  font-weight: bold;
}

.copyright-owner {
  color: #f39c12;
}

.copyright-description {
  margin: 0;
  opacity: 0.8;
  line-height: 1.5;
}

.copyright-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.copyright-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
}

.copyright-item strong {
  color: #3498db;
}

.copyright-item span {
  opacity: 0.9;
  font-size: 0.9rem;
}

/* 響應式調整 - 關於我們 */
@media (max-width: 768px) {
  .about-intro {
    padding: 1.5rem;
  }
  
  .about-intro h2 {
    font-size: 1.5rem;
  }
  
  .about-section {
    padding: 1.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .contact-label {
    min-width: auto;
  }
  
  .copyright-content {
    gap: 1.5rem;
  }
  
  .copyright-section {
    padding: 1.5rem;
  }
  
  .copyright-text {
    font-size: 1rem;
  }
}

/* 圖片畫廊樣式 */
.gallery-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

.gallery-controls {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.search-box {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.filter-btn:hover {
  background: #f8f9fa;
  border-color: #3498db;
}

.filter-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.image-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.image-container {
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

.image-actions-overlay {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-card:hover .image-actions-overlay {
  opacity: 1;
}

.image-info {
  padding: 1rem;
  background: white;
}

.image-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: bold;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-category {
  margin: 0;
  font-size: 0.8rem;
  color: #7f8c8d;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  display: inline-block;
}

.action-btn {
  background: rgba(0,0,0,0.7);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.action-btn:hover {
  background: rgba(0,0,0,0.9);
  transform: scale(1.1);
}

.load-more {
  text-align: center;
  margin: 2rem 0;
}

.load-more-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.load-more-btn:hover {
  background: #2980b9;
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 1;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background: rgba(0,0,0,0.7);
}

.modal-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  display: block;
}

.modal-info {
  padding: 1.5rem;
  background: white;
}

.modal-info h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.modal-info p {
  margin: 0 0 0.5rem 0;
  color: #555;
}

/* 響應式調整 - 圖片畫廊 */
@media (max-width: 768px) {
  .gallery-stats {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  
  .stat-number {
    font-size: 2rem;
    margin-bottom: 0;
  }
  
  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .image-modal {
    padding: 1rem;
  }
  
  .modal-content {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .modal-info {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .image-gallery {
    grid-template-columns: 1fr;
  }
  
  .gallery-controls {
    padding: 1rem;
  }
  
  .filter-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}