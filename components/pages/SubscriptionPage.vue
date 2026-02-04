<template>
  <div class="subscription-management">
    <!-- 新增訂閱 -->
    <div class="add-subscription">
      <h3 class="collapsible-header" @click="showAddForm = !showAddForm">
        <span>{{ editingSubscription ? '編輯訂閱項目' : '新增訂閱項目' }}</span>
        <span class="collapse-icon" :class="{ open: showAddForm }">▶</span>
      </h3>
      <div class="subscription-form" v-show="showAddForm">
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

    <!-- 搜尋訂閱 -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜尋訂閱..."
      >
    </div>

    <!-- 訂閱列表 -->
    <div class="subscription-list">
      <div class="list-header">
        <h3>目前訂閱項目</h3>
        <div class="summary">
          <span class="total-count">共 {{ subscriptions.length }} 個項目</span>
          <span class="total-cost">每月總計：NT$ {{ totalMonthlyCost }}</span>
          <div class="csv-actions">
            <button
              v-if="subscriptions.length > 0"
              @click="exportSubscriptionsCsv"
              class="auth-btn export"
            >
              匯出 CSV
            </button>
            <button @click="$refs.csvFileInput.click()" class="auth-btn import">
              匯入 CSV
            </button>
            <input
              ref="csvFileInput"
              type="file"
              accept=".csv"
              style="display:none"
              @change="handleImportCsv"
            >
          </div>
        </div>
      </div>
      
      <div v-if="subscriptions.length === 0" class="no-subscriptions">
        <p>目前還沒有任何訂閱</p>
        <p>點擊上方按鈕新增您的第一個訂閱！</p>
      </div>
      
      <div v-else class="subscriptions-grid">
        <div
          v-for="subscription in filteredSubscriptions"
          :key="subscription.id"
          class="subscription-card"
        >
          <div class="card-header">
            <h4>{{ subscription.name }}</h4>
            <div class="card-actions">
              <button
                @click="editSubscription(subscription); showAddForm = true"
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
import { ref, computed, onMounted } from 'vue'
import { useSubscriptions } from '../../composables/useSubscriptions'
import { useFormatters } from '../../composables/useFormatters'

const searchQuery = ref('')
const showAddForm = ref(false)

const {
  subscriptions,
  subscriptionLoading,
  editingSubscription,
  newSubscription,
  totalMonthlyCost,
  sortedSubscriptions,
  loadSubscriptions,
  addSubscription,
  importSubscriptions,
  isAppwriteFormat,
  editSubscription,
  updateSubscription,
  deleteSubscription,
  resetSubscriptionForm
} = useSubscriptions()

const { formatDate, getDateClass } = useFormatters()

const filteredSubscriptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return sortedSubscriptions.value
  return sortedSubscriptions.value.filter(s =>
    (s.name || '').toLowerCase().includes(q) ||
    (s.account || '').toLowerCase().includes(q) ||
    (s.site || '').toLowerCase().includes(q) ||
    (s.note || '').toLowerCase().includes(q)
  )
})

// 組件掛載時載入資料
onMounted(() => {
  loadSubscriptions()
})

const exportSubscriptionsCsv = () => {
  const header = ['name', 'site', 'account', 'price', 'nextdate', 'note']
  const rows = sortedSubscriptions.value.map(sub => [
    sub.name || '',
    sub.site || '',
    sub.account || '',
    sub.price ?? '',
    sub.nextdate || '',
    sub.note || ''
  ])
  const bom = '\uFEFF'
  const csvContent = bom + [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'supabase-subscription.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const csvFileInput = ref(null)

const parseCsv = (text) => {
  // 更完善的 CSV 解析器，處理引號內的逗號和換行
  const parseRow = (line) => {
    const cells = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++ // 跳過轉義的引號
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    cells.push(current.trim())
    return cells
  }
  
  // 先將文字分割成行，但要處理引號內的換行
  const splitIntoRows = (text) => {
    const rows = []
    let current = ''
    let inQuotes = false
    
    // 統一換行符
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
        current += char
      } else if (char === '\n' && !inQuotes) {
        if (current.trim()) {
          rows.push(current)
        }
        current = ''
      } else {
        current += char
      }
    }
    if (current.trim()) {
      rows.push(current)
    }
    return rows
  }
  
  const lines = splitIntoRows(text)
  if (lines.length < 2) return []
  
  const headers = parseRow(lines[0])
  console.log('CSV Headers:', headers)
  
  return lines.slice(1).map((line, idx) => {
    const cells = parseRow(line)
    const obj = {}
    headers.forEach((h, i) => { 
      obj[h] = cells[i] || '' 
    })
    if (idx === 0) console.log('First row parsed:', obj)
    return obj
  })
}

const handleImportCsv = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const text = await file.text()
  const rows = parseCsv(text)
  if (rows.length === 0) { alert('CSV 檔案無有效資料'); return }
  
  // 檢測 ISO 8601 日期格式並提示使用者
  const isAppwrite = isAppwriteFormat(rows)
  let confirmMsg = `確定匯入 ${rows.length} 筆訂閱資料？`
  if (isAppwrite) {
    confirmMsg = `ℹ️ 偵測到 ISO 8601 日期格式

系統將自動轉換日期格式（ISO 8601 → YYYY-MM-DD）

確定匯入 ${rows.length} 筆訂閱資料？`
  }
  
  if (!confirm(confirmMsg)) return
  
  const result = await importSubscriptions(rows)
  if (result.success) {
    const msg = result.isAppwrite 
      ? `✅ ${result.message}！共 ${result.count} 筆資料`
      : `成功匯入 ${result.count} 筆訂閱！`
    alert(msg)
  } else {
    alert('匯入失敗: ' + result.error)
  }
  e.target.value = ''
}

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

.collapsible-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin: 0;
}

.collapsible-header:hover {
  color: #3498db;
}

.collapse-icon {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
  color: #95a5a6;
}

.collapse-icon.open {
  transform: rotate(90deg);
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

.auth-btn.export {
  background: #27ae60;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.auth-btn.export:hover {
  background: #219a52;
}

.auth-btn.import {
  background: #2980b9;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.auth-btn.import:hover {
  background: #2471a3;
}

.csv-actions {
  display: flex;
  gap: 0.5rem;
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 2rem;
}

.search-icon {
  font-size: 1.1rem;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  color: var(--text-primary, #2c3e50);
}

.search-input::placeholder {
  color: #95a5a6;
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
  grid-template-columns: 1fr;
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
