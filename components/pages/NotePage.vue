<template>
  <PageContainer>
    <div class="note-page">
      <div class="page-header">
        <h1 class="page-title">📝 鋒兄筆記</h1>
        <p class="page-description">
          記錄重要事項與筆記
        </p>
      </div>
      
      <div class="empty-state">
        <p>🚧 功能開發中...</p>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import PageContainer from '../layout/PageContainer.vue'

// 設置頁面標題
useHead({
  title: '鋒兄筆記 - 鋒兄管理系統',
  meta: [
    { name: 'description', content: '記錄重要事項與筆記' }
  ]
})
</script>

<style scoped>
.note-page {
  animation: fadeIn 0.3s ease-in;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  border-radius: 12px;
  color: #333;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  font-size: 1.2rem;
  color: #666;
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
