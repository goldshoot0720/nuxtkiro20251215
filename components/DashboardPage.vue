<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>📊 系統儀表板</h1>
      <p>歡迎使用管理系統</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💳</div>
        <div class="stat-content">
          <h3>訂閱用戶</h3>
          <p class="stat-number">{{ stats.subscriptions }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🍎</div>
        <div class="stat-content">
          <h3>食品項目</h3>
          <p class="stat-number">{{ stats.foods }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎬</div>
        <div class="stat-content">
          <h3>影片數量</h3>
          <p class="stat-number">{{ stats.videos }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref({
  subscriptions: 0,
  foods: 0,
  videos: 2
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 14px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}
</style>