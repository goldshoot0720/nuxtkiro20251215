<template>
  <div class="subscription-page">
    <div class="page-header">
      <h1>💳 訂閱管理</h1>
      <button @click="showAddForm = !showAddForm" class="btn-primary">
        {{ showAddForm ? '取消' : '新增訂閱' }}
      </button>
    </div>

    <!-- 新增表單 -->
    <div v-if="showAddForm" class="add-form">
      <h3>新增訂閱</h3>
      <form @submit.prevent="addSubscription">
        <div class="form-group">
          <label>用戶名稱:</label>
          <input v-model="newSubscription.name" type="text" required>
        </div>
        <div class="form-group">
          <label>電子郵件:</label>
          <input v-model="newSubscription.email" type="email" required>
        </div>
        <div class="form-group">
          <label>訂閱類型:</label>
          <select v-model="newSubscription.type" required>
            <option value="basic">基本版</option>
            <option value="premium">進階版</option>
            <option value="pro">專業版</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">新增</button>
          <button type="button" @click="showAddForm = false" class="btn-secondary">取消</button>
        </div>
      </form>
    </div>

    <!-- 訂閱列表 -->
    <div class="subscription-list">
      <div v-if="subscriptions.length === 0" class="empty-state">
        <p>目前沒有訂閱記錄</p>
      </div>
      <div v-else class="subscription-grid">
        <div v-for="sub in subscriptions" :key="sub.id" class="subscription-card">
          <div class="subscription-info">
            <h4>{{ sub.name }}</h4>
            <p>{{ sub.email }}</p>
            <span class="subscription-type" :class="sub.type">{{ getTypeLabel(sub.type) }}</span>
          </div>
          <div class="subscription-actions">
            <button @click="deleteSubscription(sub.id)" class="btn-danger">刪除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showAddForm = ref(false)
const subscriptions = ref([])
const newSubscription = ref({
  name: '',
  email: '',
  type: 'basic'
})

const addSubscription = () => {
  const subscription = {
    id: Date.now(),
    ...newSubscription.value,
    createdAt: new Date().toISOString()
  }
  subscriptions.value.push(subscription)
  newSubscription.value = { name: '', email: '', type: 'basic' }
  showAddForm.value = false
}

const deleteSubscription = (id) => {
  if (confirm('確定要刪除此訂閱嗎？')) {
    subscriptions.value = subscriptions.value.filter(sub => sub.id !== id)
  }
}

const getTypeLabel = (type) => {
  const labels = {
    basic: '基本版',
    premium: '進階版',
    pro: '專業版'
  }
  return labels[type] || type
}
</script>

<style scoped>
.subscription-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.add-form {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.subscription-grid {
  display: grid;
  gap: 15px;
}

.subscription-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subscription-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.subscription-type.basic { background: #e3f2fd; color: #1976d2; }
.subscription-type.premium { background: #f3e5f5; color: #7b1fa2; }
.subscription-type.pro { background: #fff3e0; color: #f57c00; }

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-danger {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>