<template>
  <div class="food-management">
    <div class="user-info">
      <h3 class="page-brand-title">鋒兄食物庫存管理系統</h3>
      <p>管理您的食物庫存，追蹤購買記錄</p>
    </div>

    <!-- 新增食物 -->
    <div class="add-food">
      <h3>新增食物</h3>
      <div class="food-form">
        <div class="form-row">
          <div class="form-group">
            <label for="food-name">食物名稱</label>
            <input 
              type="text" 
              id="food-name" 
              v-model="newFood.name" 
              placeholder="例如：牛奶、雞蛋"
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
              placeholder="例如：全聯福利中心"
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
            @click="handleSubmit"
            class="auth-btn primary"
            :disabled="foodLoading || !newFood.name"
          >
            {{ editingFood ? '更新食物' : '新增食物' }}
          </button>
          <button
            @click="resetFoodForm"
            class="auth-btn secondary"
          >
            {{ editingFood ? '取消編輯' : '清空' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 食物列表 -->
    <div class="food-list">
      <div class="list-header">
        <h3>食物庫存</h3>
        <div class="summary">
          <span class="total-count">共 {{ foods.length }} 個項目</span>
          <span class="expiry-warning" v-if="expiringFoods.length > 0">
            {{ expiringFoods.length }} 項即將到期
          </span>
          <button
            v-if="foods.length > 0"
            @click="exportFoodsCsv"
            class="auth-btn export"
          >
            匯出 CSV
          </button>
        </div>
      </div>
      
      <div v-if="foods.length === 0" class="no-foods">
        <p>目前還沒有任何食物</p>
        <p>點擊上方按鈕新增您的第一個食物！</p>
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
            <!-- 主要資訊區：照片和關鍵資訊並排 -->
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
</template>

<script setup>
import { onMounted } from 'vue'
import { useFoods } from '../../composables/useFoods'
import { useFormatters } from '../../composables/useFormatters'

const {
  foods,
  foodLoading,
  editingFood,
  newFood,
  expiringFoods,
  sortedFoods,
  loadFoods,
  addFood,
  editFood,
  updateFood,
  deleteFood,
  resetFoodForm
} = useFoods()

const { formatDate, getFoodStatusClass, getExpiryClass } = useFormatters()

// 組件掛載時載入資料
onMounted(() => {
  loadFoods()
})

const exportFoodsCsv = () => {
  const header = ['食物名稱', '數量', '價格(NT$)', '購買商店', '到期日期', '照片網址']
  const rows = sortedFoods.value.map(food => [
    food.name || '',
    food.amount ?? '',
    food.price ?? '',
    food.shop || '',
    food.todate || '',
    food.photo || ''
  ])
  const bom = '\uFEFF'
  const csvContent = bom + [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'supabase-food.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const handleSubmit = () => {
  if (editingFood.value) {
    updateFood()
  } else {
    addFood()
  }
}

// 暴露方法給父組件
defineExpose({
  foods,
  expiringFoods
})
</script>

<style scoped>
/* 食物管理樣式 */
.food-management {
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

.auth-btn.export {
  background: #27ae60;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.auth-btn.export:hover {
  background: #219a52;
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.food-list {
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
  grid-template-columns: 1fr;
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

/* 食物卡片主要資訊區佈局 */
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

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
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

.date-critical {
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
  .food-management {
    max-width: 1200px;
  }
  
  .foods-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
  }
  
  .food-card {
    padding: 2rem;
  }
  
  .food-photo {
    width: 80px;
    height: 80px;
  }
  
  .page-brand-title {
    font-size: 2rem;
  }
}

/* 平板端優化 - Redmi Pad SE 8.7 */
@media (min-width: 769px) and (max-width: 1199px) {
  .food-management {
    max-width: 900px;
  }
  
  .foods-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }
  
  .form-row {
    gap: 1.2rem;
  }
  
  .food-card {
    padding: 1.8rem;
  }
  
  .food-photo {
    width: 70px;
    height: 70px;
  }
  
  .page-brand-title {
    font-size: 1.8rem;
  }
}

/* 平板橫向模式 */
@media (min-width: 769px) and (max-width: 1199px) and (orientation: landscape) {
  .foods-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
  
  .main-info-row {
    flex-direction: row;
    align-items: center;
  }
}

/* 平板直向模式 */
@media (min-width: 769px) and (max-width: 1199px) and (orientation: portrait) {
  .foods-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .food-card {
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
  
  .foods-grid {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  
  .food-card {
    padding: 1.5rem;
  }
  
  .main-info-row {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .photo-section {
    align-self: center;
  }
  
  .food-photo {
    width: 80px;
    height: 80px;
  }
  
  .key-info-section {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .key-info-item {
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    text-align: center;
  }
  
  .page-brand-title {
    font-size: 1.5rem;
  }
}

/* Samsung Galaxy A53 直向 */
@media (max-width: 480px) and (orientation: portrait) {
  .food-management {
    padding: 0;
  }
  
  .user-info,
  .add-food,
  .food-list {
    margin-bottom: 1.5rem;
    padding: 1.2rem;
  }
  
  .food-card {
    padding: 1.2rem;
  }
  
  .food-photo {
    width: 70px;
    height: 70px;
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
  
  .key-info-item {
    font-size: 0.9rem;
  }
  
  .action-btn {
    padding: 0.3rem;
    font-size: 1.1rem;
  }
}

/* Samsung Galaxy A53 橫向 */
@media (max-width: 915px) and (max-height: 480px) and (orientation: landscape) {
  .user-info,
  .add-food,
  .food-list {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .food-card {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }
  
  .main-info-row {
    flex-direction: row;
    gap: 1rem;
  }
  
  .food-photo {
    width: 60px;
    height: 60px;
  }
  
  .key-info-section {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .page-brand-title {
    font-size: 1.2rem;
  }
}

/* iPhone SE2 直向 */
@media (max-width: 375px) and (orientation: portrait) {
  .user-info,
  .add-food,
  .food-list {
    padding: 1rem;
    margin-bottom: 1.2rem;
  }
  
  .food-card {
    padding: 1rem;
  }
  
  .food-photo {
    width: 60px;
    height: 60px;
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
  
  .key-info-item {
    font-size: 0.85rem;
    gap: 0.2rem;
  }
  
  .label {
    font-size: 0.8rem;
  }
  
  .action-btn {
    padding: 0.25rem;
    font-size: 1rem;
  }
}

/* iPhone SE2 橫向 */
@media (max-width: 667px) and (max-height: 375px) and (orientation: landscape) {
  .user-info,
  .add-food,
  .food-list {
    padding: 0.8rem;
    margin-bottom: 0.8rem;
  }
  
  .food-card {
    padding: 0.8rem;
  }
  
  .form-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }
  
  .main-info-row {
    flex-direction: row;
    gap: 0.8rem;
  }
  
  .food-photo {
    width: 50px;
    height: 50px;
  }
  
  .key-info-section {
    flex-direction: row;
    gap: 1rem;
  }
  
  .key-info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }
  
  .page-brand-title {
    font-size: 1.1rem;
  }
}

/* 超小螢幕 */
@media (max-width: 320px) {
  .user-info,
  .add-food,
  .food-list {
    padding: 0.8rem;
    margin-bottom: 1rem;
  }
  
  .food-card {
    padding: 0.8rem;
  }
  
  .food-photo {
    width: 50px;
    height: 50px;
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
  
  .key-info-item {
    font-size: 0.8rem;
  }
  
  .action-btn {
    padding: 0.2rem;
    font-size: 0.9rem;
  }
}
</style>
