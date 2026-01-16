<template>
  <div class="image-gallery-container">
    <h1 class="page-brand-title">鋒兄本地圖片庫</h1>
    <div class="gallery-info">
      <p>瀏覽 public/images 資料夾中的所有圖片</p>
      <div class="gallery-stats">
        <span class="stat-item">共有 {{ galleryImages.length }} 張圖片</span>
        <span class="stat-item" v-if="filteredImages.length !== galleryImages.length">
          篩選出 {{ filteredImages.length }} 張
        </span>
      </div>
    </div>

    <!-- 搜尋和控制 -->
    <div class="gallery-controls">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜尋圖片名稱..."
          class="search-input"
        >
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="clear-btn"
        >
          ✕
        </button>
      </div>
      
      <div class="view-controls">
        <button
          @click="viewMode = 'grid'"
          :class="{ active: viewMode === 'grid' }"
          class="view-btn"
          title="網格檢視"
        >
          🔲
        </button>
        <button
          @click="viewMode = 'list'"
          :class="{ active: viewMode === 'list' }"
          class="view-btn"
          title="列表檢視"
        >
          📋
        </button>
      </div>
    </div>

    <!-- 圖片瀏覽區 -->
    <div class="gallery-content" v-if="filteredImages.length > 0">
      <!-- 網格檢視 -->
      <div v-if="viewMode === 'grid'" class="gallery-grid">
        <div 
          v-for="(image, index) in filteredImages" 
          :key="image.name"
          class="image-card"
          @click="openLightbox(index)"
        >
          <div class="image-wrapper">
            <img 
              :src="image.url" 
              :alt="image.name"
              class="gallery-image"
              loading="lazy"
              @error="handleImageError"
            >
            <div class="image-overlay">
              <div class="image-info">
                <span class="image-name">{{ image.displayName }}</span>
                <span class="image-size">{{ formatFileSize(image.size) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表檢視 -->
      <div v-if="viewMode === 'list'" class="gallery-list">
        <div 
          v-for="(image, index) in filteredImages" 
          :key="image.name"
          class="image-list-item"
          @click="openLightbox(index)"
        >
          <div class="list-image-wrapper">
            <img 
              :src="image.url" 
              :alt="image.name"
              class="list-image"
              loading="lazy"
              @error="handleImageError"
            >
          </div>
          <div class="list-image-info">
            <h4 class="list-image-name">{{ image.displayName }}</h4>
            <div class="list-image-details">
              <span class="detail-item">檔案大小: {{ formatFileSize(image.size) }}</span>
              <span class="detail-item">格式: {{ image.extension.toUpperCase() }}</span>
              <span class="detail-item">路徑: {{ image.path }}</span>
            </div>
          </div>
          <div class="list-actions">
            <button
              @click.stop="downloadImage(image)"
              class="action-btn download"
              title="下載圖片"
            >
              💾
            </button>
            <button
              @click.stop="copyImageUrl(image)"
              class="action-btn copy"
              title="複製網址"
            >
              📋
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 無圖片狀態 -->
    <div v-else-if="galleryImages.length === 0" class="no-images">
      <div class="no-images-icon">🖼️</div>
      <h3>沒有找到圖片</h3>
      <p>public/images 資料夾中沒有圖片</p>
    </div>

    <!-- 搜尋無結果 -->
    <div v-else class="no-results">
      <div class="no-results-icon">🔍</div>
      <h3>沒有符合的結果</h3>
      <p>嘗試使用不同的關鍵字搜尋</p>
      <button
        @click="clearSearch"
        class="clear-search-btn"
      >
        清除搜尋
      </button>
    </div>

    <!-- Lightbox -->
    <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <button @click="closeLightbox" class="lightbox-close">✕</button>
        
        <div class="lightbox-image-container">
          <button 
            @click="previousImage" 
            class="lightbox-nav prev"
            :disabled="currentImageIndex === 0"
          >
            ◀
          </button>
          
          <img 
            :src="currentLightboxImage.url" 
            :alt="currentLightboxImage.name"
            class="lightbox-image"
          >
          
          <button 
            @click="nextImage" 
            class="lightbox-nav next"
            :disabled="currentImageIndex === filteredImages.length - 1"
          >
            ▶
          </button>
        </div>
        
        <div class="lightbox-info">
          <h3>{{ currentLightboxImage.displayName }}</h3>
          <div class="lightbox-details">
            <span>{{ formatFileSize(currentLightboxImage.size) }}</span>
            <span>{{ currentLightboxImage.extension?.toUpperCase() }}</span>
            <span>{{ currentImageIndex + 1 }} / {{ filteredImages.length }}</span>
          </div>
          <div class="lightbox-actions">
            <button
              @click="downloadImage(currentLightboxImage)"
              class="lightbox-btn primary"
            >
              下載圖片
            </button>
            <button
              @click="copyImageUrl(currentLightboxImage)"
              class="lightbox-btn secondary"
            >
              複製網址
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGallery } from '../../composables/useGallery'
import { useFormatters } from '../../composables/useFormatters'

const {
  galleryImages,
  searchQuery,
  viewMode,
  lightboxOpen,
  currentImageIndex,
  filteredImages,
  currentLightboxImage,
  loadGalleryImages,
  clearSearch,
  openLightbox,
  closeLightbox,
  nextImage,
  previousImage,
  handleImageError,
  downloadImage,
  copyImageUrl
} = useGallery()

const { formatFileSize } = useFormatters()

// 組件掛載時載入圖片
onMounted(() => {
  loadGalleryImages()
})

// 暴露方法給父組件
defineExpose({
  galleryImages,
  filteredImages
})
</script>


<style scoped>
/* 圖片庫樣式 */
.image-gallery-container {
  animation: fadeIn 0.3s ease-in;
}

.gallery-info {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.gallery-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #666;
}

.gallery-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background: #f0f0f0;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.view-btn:hover {
  background: #f8f9fa;
}

.view-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

/* 網格檢視 */
.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.image-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.image-wrapper {
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

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  padding: 1rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.image-card:hover .image-overlay {
  transform: translateY(0);
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.image-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.image-size {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 列表檢視 */
.gallery-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-list-item {
  display: flex;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-list-item:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.list-image-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 1rem;
}

.list-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-image-info {
  flex: 1;
  min-width: 0;
}

.list-image-name {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.list-image-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.detail-item {
  font-size: 0.9rem;
  color: #666;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
  font-size: 1.2rem;
}

.action-btn:hover {
  background: #f0f0f0;
}

/* 無圖片狀態 */
.no-images, .no-results {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.no-images-icon, .no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-images h3, .no-results h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.no-images p, .no-results p {
  color: #666;
  margin-bottom: 1rem;
}

.clear-search-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-search-btn:hover {
  background: #2980b9;
}

/* Lightbox 樣式 */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 10;
  transition: background-color 0.2s;
}

.lightbox-close:hover {
  background: rgba(0, 0, 0, 0.9);
}

.lightbox-image-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  display: block;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.2s;
  z-index: 10;
}

.lightbox-nav:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-50%) scale(1.1);
}

.lightbox-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.lightbox-nav.prev {
  left: 1rem;
}

.lightbox-nav.next {
  right: 1rem;
}

.lightbox-info {
  padding: 1.5rem;
  background: white;
}

.lightbox-info h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.lightbox-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.lightbox-actions {
  display: flex;
  gap: 1rem;
}

.lightbox-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.lightbox-btn.primary {
  background: #3498db;
  color: white;
}

.lightbox-btn.primary:hover {
  background: #2980b9;
}

.lightbox-btn.secondary {
  background: #95a5a6;
  color: white;
}

.lightbox-btn.secondary:hover {
  background: #7f8c8d;
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
  .image-gallery-container {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
  }
  
  .image-wrapper {
    height: 250px;
  }
  
  .list-image-wrapper {
    width: 100px;
    height: 100px;
  }
  
  .page-brand-title {
    font-size: 2rem;
  }
  
  .lightbox-content {
    max-width: 85vw;
    max-height: 85vh;
  }
  
  .lightbox-image {
    max-height: 75vh;
  }
}

/* 平板端優化 - Redmi Pad SE 8.7 */
@media (min-width: 769px) and (max-width: 1199px) {
  .image-gallery-container {
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }
  
  .image-wrapper {
    height: 220px;
  }
  
  .list-image-wrapper {
    width: 90px;
    height: 90px;
  }
  
  .page-brand-title {
    font-size: 1.8rem;
  }
  
  .gallery-controls {
    padding: 1.5rem 2rem;
  }
  
  .search-input {
    max-width: 500px;
  }
}

/* 平板橫向模式 */
@media (min-width: 769px) and (max-width: 1199px) and (orientation: landscape) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .image-wrapper {
    height: 180px;
  }
  
  .image-list-item {
    padding: 1rem;
  }
  
  .list-image-wrapper {
    width: 80px;
    height: 80px;
  }
}

/* 平板直向模式 */
@media (min-width: 769px) and (max-width: 1199px) and (orientation: portrait) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .image-wrapper {
    height: 240px;
  }
}

/* 手機端通用 */
@media (max-width: 768px) {
  .gallery-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1.2rem;
  }
  
  .search-box {
    max-width: none;
  }
  
  .view-controls {
    justify-content: center;
  }
  
  .gallery-grid {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  
  .image-wrapper {
    height: 160px;
  }
  
  .image-list-item {
    flex-direction: column;
    text-align: center;
    padding: 1.2rem;
  }
  
  .list-image-wrapper {
    width: 100%;
    height: 180px;
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .list-image-details {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.8rem;
  }
  
  .list-actions {
    margin-top: 1rem;
    justify-content: center;
  }
  
  .lightbox-content {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .lightbox-image {
    max-height: 65vh;
  }
  
  .lightbox-nav {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .lightbox-details {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .lightbox-actions {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .page-brand-title {
    font-size: 1.5rem;
  }
}

/* Samsung Galaxy A53 直向 */
@media (max-width: 480px) and (orientation: portrait) {
  .gallery-info,
  .gallery-controls {
    padding: 1rem;
    margin-bottom: 1.2rem;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .image-wrapper {
    height: 140px;
  }
  
  .image-list-item {
    padding: 1rem;
  }
  
  .list-image-wrapper {
    height: 150px;
  }
  
  .search-input {
    padding: 0.6rem;
    font-size: 0.95rem;
  }
  
  .view-btn {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
  
  .page-brand-title {
    font-size: 1.4rem;
  }
  
  .gallery-stats {
    flex-direction: column;
    gap: 0.6rem;
  }
  
  .stat-item {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .lightbox-info {
    padding: 1rem;
  }
  
  .lightbox-nav.prev {
    left: 0.5rem;
  }
  
  .lightbox-nav.next {
    right: 0.5rem;
  }
  
  .action-btn {
    padding: 0.4rem;
    font-size: 1.1rem;
  }
}

/* Samsung Galaxy A53 橫向 */
@media (max-width: 915px) and (max-height: 480px) and (orientation: landscape) {
  .gallery-info,
  .gallery-controls {
    padding: 0.8rem;
    margin-bottom: 1rem;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.8rem;
  }
  
  .image-wrapper {
    height: 100px;
  }
  
  .image-list-item {
    flex-direction: row;
    text-align: left;
    padding: 0.8rem;
  }
  
  .list-image-wrapper {
    width: 80px;
    height: 80px;
    margin-right: 1rem;
    margin-bottom: 0;
  }
  
  .list-image-details {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .gallery-controls {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .search-box {
    max-width: 300px;
  }
  
  .page-brand-title {
    font-size: 1.2rem;
  }
}

/* iPhone SE2 直向 */
@media (max-width: 375px) and (orientation: portrait) {
  .gallery-info,
  .gallery-controls {
    padding: 0.8rem;
    margin-bottom: 1rem;
  }
  
  .gallery-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .image-wrapper {
    height: 200px;
  }
  
  .image-list-item {
    padding: 0.8rem;
  }
  
  .list-image-wrapper {
    height: 120px;
  }
  
  .search-input {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .view-btn {
    padding: 0.5rem 0.6rem;
    font-size: 0.85rem;
  }
  
  .page-brand-title {
    font-size: 1.3rem;
  }
  
  .gallery-stats {
    gap: 0.4rem;
  }
  
  .stat-item {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }
  
  .list-image-name {
    font-size: 0.95rem;
  }
  
  .detail-item {
    font-size: 0.8rem;
  }
  
  .lightbox-info {
    padding: 0.8rem;
  }
  
  .lightbox-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  
  .action-btn {
    padding: 0.3rem;
    font-size: 1rem;
  }
}

/* iPhone SE2 橫向 */
@media (max-width: 667px) and (max-height: 375px) and (orientation: landscape) {
  .gallery-info,
  .gallery-controls {
    padding: 0.6rem;
    margin-bottom: 0.8rem;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.6rem;
  }
  
  .image-wrapper {
    height: 80px;
  }
  
  .image-list-item {
    flex-direction: row;
    padding: 0.6rem;
  }
  
  .list-image-wrapper {
    width: 60px;
    height: 60px;
    margin-right: 0.8rem;
  }
  
  .gallery-controls {
    flex-direction: row;
  }
  
  .search-box {
    max-width: 250px;
  }
  
  .page-brand-title {
    font-size: 1.1rem;
  }
  
  .lightbox-image {
    max-height: 50vh;
  }
}

/* 超小螢幕 */
@media (max-width: 320px) {
  .gallery-info,
  .gallery-controls {
    padding: 0.6rem;
    margin-bottom: 0.8rem;
  }
  
  .gallery-grid {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }
  
  .image-wrapper {
    height: 160px;
  }
  
  .image-list-item {
    padding: 0.6rem;
  }
  
  .list-image-wrapper {
    height: 100px;
  }
  
  .search-input {
    padding: 0.4rem;
    font-size: 0.85rem;
  }
  
  .view-btn {
    padding: 0.4rem 0.5rem;
    font-size: 0.8rem;
  }
  
  .page-brand-title {
    font-size: 1.1rem;
  }
  
  .stat-item {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .lightbox-info {
    padding: 0.6rem;
  }
  
  .lightbox-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .action-btn {
    padding: 0.25rem;
    font-size: 0.9rem;
  }
}

/* 動畫 */
@keyframes imageLoad {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.gallery-image,
.list-image {
  animation: imageLoad 0.3s ease;
}

/* 錯誤圖片樣式 */
.gallery-image[src*="data:image/svg"],
.list-image[src*="data:image/svg"] {
  background: #f8f9fa;
  border: 2px dashed #ddd;
}
</style>
