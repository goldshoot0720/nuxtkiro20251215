<template>
  <div class="subscription-management">
    <div class="user-info">
      <h3 class="page-brand-title">鋒兄訂閱管理系統</h3>
      <p>管理您的所有訂閱服務</p>
    </div>

    <!-- 新增訂閱 -->
    <div class="add-subscription">
      <h3>新增訂閱項目</h3>
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
            <label for="sub-site">網站網址</label>
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
              placeholder="額外說明或提醒事項"
            >
          </div>
        </div>
        <div class="form-actions">
          <button
            @click="handleSubmit"
            class="auth-btn primary"
            :disabled="subscriptionLoading || !newSubscription.name"
          >
            {{ editingSubscription ? '更新訂閱' : '新增訂閱' }}
          </button>
          <button
            @click="resetSubscriptionForm"
            class="auth-btn secondary"
          >
            {{ editingSubscription ? '取消編輯' : '清空' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 訂閱列表 -->
    <div class="subscription-list">
      <div class="list-header">
        <h3>目前訂閱項目</h3>
        <div class="summary">
          <span class="total-count">共 {{ subscriptions.length }} 個項目</span>
          <span class="total-cost">每月總計：NT$ {{ totalMonthlyCost }}</span>
        </div>
      </div>
      
      <div v-if="subscriptions.length === 0" class="no-subscriptions">
        <p>目前還沒有任何訂閱</p>
        <p>點擊上方按鈕新增您的第一個訂閱！</p>
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
              <span class="label">網址：</span>
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
</template>

<script setup>
import { onMounted } from 'vue'
import { useSubscriptions } from '../../composables/useSubscriptions'
import { useFormatters } from '../../composables/useFormatters'

const {
  subscriptions,
  subscriptionLoading,
  editingSubscription,
  newSubscription,
  totalMonthlyCost,
  sortedSubscriptions,
  loadSubscriptions,
  addSubscription,
  editSubscription,
  updateSubscription,
  deleteSubscription,
  resetSubscriptionForm
} = useSubscriptions()

const { formatDate, getDateClass } = useFormatters()

// 組件掛載時載入資料
onMounted(() => {
  loadSubscriptions()
})

const handleSubmit = () => {
  if (editingSubscription.value) {
    updateSubscription()
  } else {
    addSubscription()
  }
}

// 暴露方法給父組件
defineExpose({
  subscriptions,
  totalMonthlyCost
})
</script>


<style scoped>
/* 訂閱管理樣式 */
.subscription-management {
  max-width: 1000px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease-in;
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

/* ===== 響應式設計優化 ===== */

/* 桌面端優化 */
@media (min-width: 1200px) {
  .subscription-management {
    max-width: 1200px;
  }
  
  .subscriptions-grid {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 2rem;
  }
  
  .subscription-card {
    padding: 2rem;
  }
  
  .page-brand-title {
    font-size: 2rem;
  }
}

/* 平板端優化 - Redmi Pad SE 8.7 */
@media (min-width: 769px) and (max-width: 1199px) {
  .subscription-management {
    max-width: 900px;
  }
  
  .subscriptions-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }
  
  .form-row {
    gap: 1.2rem;
  }
  
  .subscription-card {
    padding: 1.8rem;
  }
  
  .page-brand-title {
    font-size: 1.8rem;
  }
}

/* 平板橫向模式 */
@media (min-width: 769px) and (max-width: 1199px) and (orientation: landscape) {
  .subscriptions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
}

/* 平板直向模式 */
@media (min-width: 769px) and (max-width: 1199px) and (orientation: portrait) {
  .subscriptions-grid {
    grid-template-columns: 1fr;
  }
  
  .subscription-card {
    max-width: 600px;
    margin: 0 auto;
  }
}

/* 手機端通用 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .summary {
    align-items: flex-start;
    width: 100%;
  }
  
  .subscriptions-grid {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  
  .subscription-card {
    padding: 1.5rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .card-actions {
    align-self: flex-end;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .label {
    min-width: auto;
    font-size: 0.9rem;
  }
  
  .page-brand-title {
    font-size: 1.5rem;
  }
}

/* Samsung Galaxy A53 直向 */
@media (max-width: 480px) and (orientation: portrait) {
  .subscription-management {
    padding: 0;
  }
  
  .user-info,
  .add-subscription,
  .subscription-list {
    margin-bottom: 1.5rem;
    padding: 1.2rem;
  }
  
  .subscription-card {
    padding: 1.2rem;
  }
  
  .form-group input {
    padding: 0.6rem;
    font-size: 0.95rem;
  }
  
  .auth-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
  
  .page-brand-title {
    font-size: 1.4rem;
  }
  
  .card-header h4 {
    font-size: 1.1rem;
  }
  
  .action-btn {
    padding: 0.3rem;
    font-size: 1.1rem;
  }
}

/* Samsung Galaxy A53 橫向 */
@media (max-width: 915px) and (max-height: 480px) and (orientation: landscape) {
  .user-info,
  .add-subscription,
  .subscription-list {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .subscription-card {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }
  
  .form-actions {
    flex-direction: row;
    gap: 0.8rem;
  }
  
  .page-brand-title {
    font-size: 1.2rem;
  }
}

/* iPhone SE2 直向 */
@media (max-width: 375px) and (orientation: portrait) {
  .user-info,
  .add-subscription,
  .subscription-list {
    padding: 1rem;
    margin-bottom: 1.2rem;
  }
  
  .subscription-card {
    padding: 1rem;
  }
  
  .form-group input {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .form-group label {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }
  
  .auth-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  
  .page-brand-title {
    font-size: 1.3rem;
  }
  
  .card-header h4 {
    font-size: 1rem;
  }
  
  .info-row {
    gap: 0.2rem;
  }
  
  .label {
    font-size: 0.85rem;
  }
  
  .action-btn {
    padding: 0.25rem;
    font-size: 1rem;
  }
}

/* iPhone SE2 橫向 */
@media (max-width: 667px) and (max-height: 375px) and (orientation: landscape) {
  .user-info,
  .add-subscription,
  .subscription-list {
    padding: 0.8rem;
    margin-bottom: 0.8rem;
  }
  
  .subscription-card {
    padding: 0.8rem;
  }
  
  .form-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }
  
  .form-group input {
    padding: 0.4rem;
    font-size: 0.85rem;
  }
  
  .page-brand-title {
    font-size: 1.1rem;
  }
  
  .card-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .info-row {
    flex-direction: row;
    justify-content: space-between;
  }
}

/* 超小螢幕 */
@media (max-width: 320px) {
  .user-info,
  .add-subscription,
  .subscription-list {
    padding: 0.8rem;
    margin-bottom: 1rem;
  }
  
  .subscription-card {
    padding: 0.8rem;
  }
  
  .form-group input {
    padding: 0.4rem;
    font-size: 0.85rem;
  }
  
  .auth-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .page-brand-title {
    font-size: 1.1rem;
  }
  
  .card-header h4 {
    font-size: 0.95rem;
  }
  
  .action-btn {
    padding: 0.2rem;
    font-size: 0.9rem;
  }
}
</style>
