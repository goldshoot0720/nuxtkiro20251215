<template>
  <div class="image-gallery-container">
    <h1 class="page-brand-title">鋒兄圖片庫</h1>
    <div class="gallery-placeholder">
      <div class="placeholder-icon">🖼️</div>
      <h2>圖片庫功能準備中</h2>
      <p class="placeholder-desc">即將整合 Supabase 雲端儲存，提供更強大的圖片管理功能</p>
      <div class="feature-preview">
        <div class="feature-item">
          <span class="feature-icon">☁️</span>
          <span>Supabase Storage 雲端存儲</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🔍</span>
          <span>圖片搜尋與分類</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📤</span>
          <span>圖片上傳與管理</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🖼️</span>
          <span>Lightbox 預覽</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 未來將整合 Supabase Storage
</script>

<style scoped>
.image-gallery-container {
  animation: fadeIn 0.3s ease-in;
}

.gallery-placeholder {
  background: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-top: 1.5rem;
}

.placeholder-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.gallery-placeholder h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.placeholder-desc {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.feature-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8f9fa;
  padding: 1rem 1.2rem;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #555;
  transition: transform 0.2s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 1.3rem;
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

@media (max-width: 768px) {
  .gallery-placeholder {
    padding: 3rem 1.5rem;
  }

  .gallery-placeholder h2 {
    font-size: 1.4rem;
  }

  .placeholder-desc {
    font-size: 1rem;
  }

  .feature-preview {
    grid-template-columns: 1fr;
  }
}
</style>
