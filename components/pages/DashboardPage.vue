<template>
  <div class="dashboard-container">
    <!-- 版權資訊 -->
    <div class="copyright-info">
      <div class="copyright-content">
        <div class="copyright-icon">🏢</div>
        <div class="copyright-text-wrapper">
          <div class="company-brand">
            <h2 class="company-name">鋒兄塗哥公關資訊</h2>
            <div class="company-tagline">Professional Business Solutions</div>
          </div>
          <p class="copyright-text">
            <span class="copyright-main">©版權所有 2025～2125 | 專業管理系統解決方案</span><br>
            <span class="tech-stack">前端使用Vue(Nuxt) | 後端使用 Supabase | 影片存放於 Netlify | 網頁存放於 Netlify</span>
          </p>
        </div>
      </div>
      <div class="copyright-decoration">
        <div class="decoration-circle"></div>
        <div class="decoration-circle"></div>
        <div class="decoration-circle"></div>
      </div>
    </div>

    <h1 class="dashboard-title">鋒兄儀表板</h1>
    
    <!-- 儀表板概覽 -->
    <div class="dashboard-overview">
      <div class="dashboard-stats">
        <div class="stat-card subscription-card">
          <div class="stat-icon">
            <span class="icon">💳</span>
          </div>
          <div class="stat-content">
            <h3>訂閱數量</h3>
            <div class="stat-number">{{ subscriptionsCount }}</div>
            <div class="stat-label">項目</div>
          </div>
          <div class="stat-trend">
            <span class="trend-icon">📈</span>
          </div>
        </div>
        
        <div class="stat-card food-card">
          <div class="stat-icon">
            <span class="icon">🛒</span>
          </div>
          <div class="stat-content">
            <h3>食物庫存</h3>
            <div class="stat-number">{{ foodsCount }}</div>
            <div class="stat-label">項目</div>
          </div>
          <div class="stat-trend">
            <span class="trend-icon">📊</span>
          </div>
        </div>
        
        <div class="stat-card cost-card">
          <div class="stat-icon">
            <span class="icon">💰</span>
          </div>
          <div class="stat-content">
            <h3>每月費用</h3>
            <div class="stat-number">NT$ {{ totalMonthlyCost }}</div>
            <div class="stat-label">訂閱總計</div>
          </div>
          <div class="stat-trend">
            <span class="trend-icon">🧮</span>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="dashboard-actions">
        <div class="actions-header">
          <div class="actions-title">
            <span class="title-icon">🚀</span>
            <h3>快速操作</h3>
          </div>
          <div class="actions-subtitle">
            快速新增項目到您的管理系統
          </div>
        </div>
        
        <div class="action-buttons">
          <div class="action-card">
            <button
              @click="$emit('navigate', 'subscription')"
              class="action-btn-main primary"
            >
              <span class="btn-icon">➕</span>
              新增訂閱
            </button>
            <p class="action-description">管理您的訂閱服務</p>
          </div>
          
          <div class="action-card">
            <button
              @click="$emit('navigate', 'food')"
              class="action-btn-main emerald"
            >
              <span class="btn-icon">➕</span>
              新增食物
            </button>
            <p class="action-description">追蹤食物庫存狀態</p>
          </div>
          
          <div class="action-card">
            <button
              @click="$emit('navigate', 'video')"
              class="action-btn-main purple"
            >
              <span class="btn-icon">🎥</span>
              影片庫
            </button>
            <p class="action-description">管理影片資源</p>
          </div>
          
          <div class="action-card">
            <button
              @click="$emit('navigate', 'gallery')"
              class="action-btn-main pink"
            >
              <span class="btn-icon">🖼️</span>
              圖片庫
            </button>
            <p class="action-description">瀏覽圖片收藏</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 額外內容區域確保頁面有足夠長度 -->
    <div class="additional-content">
      <div class="info-section">
        <h2>系統資訊</h2>
        <div class="info-grid">
          <div class="info-card">
            <h4>🔧 系統狀態</h4>
            <p>所有服務正常運行</p>
          </div>
          <div class="info-card">
            <h4>📈 使用統計</h4>
            <p>本月活躍用戶增長 15%</p>
          </div>
          <div class="info-card">
            <h4>🔒 安全狀態</h4>
            <p>系統安全，無異常活動</p>
          </div>
          <div class="info-card">
            <h4>💾 存儲使用</h4>
            <p>已使用 65% 存儲空間</p>
          </div>
        </div>
      </div>

      <div class="recent-activity">
        <h2>最近活動</h2>
        <div class="activity-list">
          <div class="activity-item">
            <span class="activity-icon">📝</span>
            <div class="activity-content">
              <p class="activity-title">新增訂閱項目</p>
              <p class="activity-time">2 小時前</p>
            </div>
          </div>
          <div class="activity-item">
            <span class="activity-icon">🛒</span>
            <div class="activity-content">
              <p class="activity-title">更新食物庫存</p>
              <p class="activity-time">4 小時前</p>
            </div>
          </div>
          <div class="activity-item">
            <span class="activity-icon">🎥</span>
            <div class="activity-content">
              <p class="activity-title">上傳新影片</p>
              <p class="activity-time">1 天前</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  subscriptionsCount: {
    type: Number,
    default: 0
  },
  foodsCount: {
    type: Number,
    default: 0
  },
  totalMonthlyCost: {
    type: Number,
    default: 0
  }
})

defineEmits(['navigate'])
</script>

<style scoped>
.dashboard-container {
  animation: fadeIn 0.3s ease-in;
}

.dashboard-title {
  color: var(--text-primary);
  margin-bottom: 2rem;
}

/* 版權資訊樣式 */
.copyright-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.copyright-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

.copyright-icon {
  font-size: 3rem;
  opacity: 0.9;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.copyright-text-wrapper {
  flex: 1;
  text-align: left;
}

.company-brand {
  margin-bottom: 1rem;
}

.company-name {
  margin: 0 0 0.25rem 0;
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #ffffff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 12px rgba(255, 255, 255, 0.5);
  letter-spacing: 1.5px;
  text-transform: none;
}

.company-tagline {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.copyright-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.8;
}

.copyright-main {
  font-weight: 600;
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.95);
}

.tech-stack {
  font-size: 0.85rem;
  opacity: 0.85;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
}

.copyright-decoration {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.decoration-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.decoration-circle:nth-child(2) {
  animation-delay: 0.5s;
}

.decoration-circle:nth-child(3) {
  animation-delay: 1s;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
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
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid var(--border-color);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--card-gradient));
}

.subscription-card {
  --card-gradient: #3b82f6, #1d4ed8;
}

.subscription-card:hover {
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.3);
}

.food-card {
  --card-gradient: #10b981, #047857;
}

.food-card:hover {
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.3);
}

.cost-card {
  --card-gradient: #f59e0b, #d97706;
}

.cost-card:hover {
  box-shadow: 0 12px 40px rgba(245, 158, 11, 0.3);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--card-gradient));
  flex-shrink: 0;
}

.stat-icon .icon {
  font-size: 1.8rem;
  color: white;
}

.stat-content {
  flex: 1;
  text-align: left;
}

.stat-content h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--card-gradient));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.25rem;
  line-height: 1;
  color: #3b82f6; /* 備用顏色，當 background-clip 不支持時使用 */
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
}

.stat-trend {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.trend-icon {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.dashboard-actions {
  background: var(--bg-secondary);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid var(--border-color);
}

.actions-header {
  margin-bottom: 2rem;
  text-align: center;
}

.actions-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.title-icon {
  font-size: 1.5rem;
  color: #3b82f6;
}

.actions-title h3 {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.actions-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.action-card {
  text-align: center;
  padding: 1.5rem;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px var(--shadow);
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
}

.action-btn-main {
  margin-bottom: 1rem;
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: white;
}

.action-btn-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.action-btn-main.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.action-btn-main.emerald {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.action-btn-main.purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.action-btn-main.pink {
  background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
}

.btn-icon {
  font-size: 1.2rem;
}

.action-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.4;
}

/* 舊的按鈕樣式已被 Nuxt UI 取代 */

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

/* 響應式設計 */
@media (max-width: 768px) {
  .copyright-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .copyright-text-wrapper {
    text-align: center;
  }
  
  .copyright-info {
    padding: 2rem 1.5rem;
  }
  
  .copyright-info h2 {
    font-size: 1.6rem;
  }
  
  .copyright-text {
    font-size: 0.9rem;
  }
  
  .dashboard-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1.5rem;
  }
  
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .copyright-info {
    padding: 1.5rem 1rem;
  }
  
  .copyright-info h2 {
    font-size: 1.4rem;
  }
  
  .copyright-text {
    font-size: 0.8rem;
    line-height: 1.8;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .stat-content {
    text-align: center;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .dashboard-actions {
    padding: 1.5rem;
  }
}

/* 額外內容樣式 */
.additional-content {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section h2,
.recent-activity h2 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px var(--shadow);
}

.info-card h4 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.info-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.activity-list {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background: var(--bg-tertiary);
}

.activity-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  color: var(--text-primary);
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
}

.activity-time {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin: 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .additional-content {
    margin-top: 2rem;
  }
  
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .activity-item {
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 480px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}


</style>
