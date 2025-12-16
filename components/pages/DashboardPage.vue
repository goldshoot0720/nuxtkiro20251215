<template>
  <div class="dashboard-container">
    <h1>儀表板</h1>
    
    <!-- 儀表板概覽 -->
    <div class="dashboard-overview">
      <div class="dashboard-stats">
        <div class="stat-card">
          <h3>訂閱數量</h3>
          <div class="stat-number">{{ subscriptionsCount }}</div>
          <div class="stat-label">項目</div>
        </div>
        <div class="stat-card">
          <h3>食物庫存</h3>
          <div class="stat-number">{{ foodsCount }}</div>
          <div class="stat-label">項目</div>
        </div>
        <div class="stat-card">
          <h3>每月費用</h3>
          <div class="stat-number">NT$ {{ totalMonthlyCost }}</div>
          <div class="stat-label">訂閱總計</div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="dashboard-actions">
        <h3>🚀 快速操作</h3>
        <div class="action-buttons">
          <button @click="$emit('navigate', 'subscription')" class="action-btn primary">
            ➕ 新增訂閱
          </button>
          <button @click="$emit('navigate', 'food')" class="action-btn secondary">
            ➕ 新增食物
          </button>
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
