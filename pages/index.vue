<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">鋒兄塗哥公關資訊Professional Business Solutions</h1>
        <p class="hero-subtitle">專業管理系統解決方案 · 前端使用Vue(Nuxt) | 後端使用 Supabase | 影片存放於 Netlify Blobs | 網頁存放於 Netlify</p>
        <div class="hero-buttons">
          <NuxtLink to="/about" class="btn btn-primary">了解更多</NuxtLink>
          <button class="btn btn-secondary">聯繫我們</button>
        </div>
      </div>
    </section>

    <!-- Services Preview -->
    <section class="services-preview">
      <div class="container">
        <h2>我們的服務</h2>
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">📢</div>
            <h3>媒體關係</h3>
            <p>建立並維護與各大媒體的良好關係</p>
          </div>
          <div class="service-card">
            <div class="service-icon">💡</div>
            <h3>品牌策略</h3>
            <p>量身定制品牌傳播策略</p>
          </div>
          <div class="service-card">
            <div class="service-icon">🛡️</div>
            <h3>危機處理</h3>
            <p>專業的危機公關處理</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 图片画廊 -->
    <section class="gallery-section">
      <div class="container">
        <h2>作品展示</h2>
        <div class="gallery-controls">
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="搜尋圖片..."
              class="search-input"
            >
          </div>
          <div class="category-filter">
            <select v-model="selectedCategory" class="category-select">
              <option value="all">所有分類</option>
              <option v-for="category in imageCategories" :key="category" :value="category">
                {{ getCategoryDisplayName(category) }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="filteredImages.length === 0" class="empty-state">
          <p>沒有找到圖片</p>
        </div>
        <div v-else class="image-grid">
          <div 
            v-for="image in filteredImages" 
            :key="image.name" 
            class="image-item"
            @click="openImageModal(image)"
          >
            <img 
              :src="image.url" 
              :alt="image.name"
              @error="onImageError"
              loading="lazy"
            >
            <div class="image-overlay">
              <p class="image-name">{{ getImageDisplayName(image.name) }}</p>
              <p class="image-category">{{ getCategoryDisplayName(image.category) }}</p>
            </div>
          </div>
        </div>

        <div v-if="hasMoreImages" class="load-more">
          <button @click="loadMoreImages" class="btn btn-primary">載入更多</button>
        </div>

        <!-- 图片模态框 -->
        <div v-if="selectedImage" class="image-modal" @click="closeImageModal">
          <div class="modal-content" @click.stop>
            <button class="modal-close" @click="closeImageModal">&times;</button>
            <img :src="selectedImage.url" :alt="selectedImage.name">
            <div class="modal-info">
              <h3>{{ getImageDisplayName(selectedImage.name) }}</h3>
              <p>分類：{{ getCategoryDisplayName(selectedImage.category) }}</p>
              <p>檔案名稱：{{ selectedImage.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 版權信息 -->
    <footer class="footer-section">
      <div class="container">
        <div class="footer-content">
          <p class="copyright">
            鋒兄塗哥公關資訊Professional Business Solutions©版權所有 2025～2125 | 專業管理系統解決方案
          </p>
          <p class="tech-info">
            前端使用Vue(Nuxt) | 後端使用 Supabase | 影片存放於 Netlify Blobs | 網頁存放於 Netlify
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// 图片画廊数据
const imageFiles = ref([])
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedImage = ref(null)
const displayedImageCount = ref(20)

// 计算属性
const imageCategories = computed(() => {
  const categories = [...new Set(imageFiles.value.map(img => img.category))]
  return categories.sort()
})

const filteredImages = computed(() => {
  let filtered = imageFiles.value

  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(img => img.category === selectedCategory.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(img => 
      img.name.toLowerCase().includes(query) ||
      getCategoryDisplayName(img.category).toLowerCase().includes(query)
    )
  }

  return filtered.slice(0, displayedImageCount.value)
})

const hasMoreImages = computed(() => {
  let totalFiltered = imageFiles.value

  if (selectedCategory.value !== 'all') {
    totalFiltered = totalFiltered.filter(img => img.category === selectedCategory.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    totalFiltered = totalFiltered.filter(img => 
      img.name.toLowerCase().includes(query) ||
      getCategoryDisplayName(img.category).toLowerCase().includes(query)
    )
  }

  return totalFiltered.length > displayedImageCount.value
})

// 方法
const getCategoryDisplayName = (category) => {
  const categoryNames = {
    'chatgpt': 'ChatGPT',
    'gemini': 'Gemini',
    'mindvideo': 'MindVideo',
    'photo': '照片',
    'screenshot': '截圖',
    'product': '產品',
    'logo': '標誌',
    'ai': 'AI生成',
    'other': '其他'
  }
  return categoryNames[category] || category
}

const getImageDisplayName = (filename) => {
  return filename.replace(/\.(jpg|jpeg|png)$/i, '')
}

const openImageModal = (image) => {
  selectedImage.value = image
}

const closeImageModal = () => {
  selectedImage.value = null
}

const loadMoreImages = () => {
  displayedImageCount.value += 20
}

const onImageError = (event) => {
  console.error('圖片載入失敗:', event.target.src)
  event.target.style.display = 'none'
}

// 页面配置
useHead({
  title: '鋒兄塗哥公關資訊Professional Business Solutions - 專業管理系統解決方案',
  meta: [
    { name: 'description', content: '鋒兄塗哥公關資訊Professional Business Solutions©版權所有 2025～2125 | 專業管理系統解決方案 前端使用Vue(Nuxt) | 後端使用 Supabase | 影片存放於 Netlify Blobs | 網頁存放於 Netlify' }
  ]
})

// 模拟图片数据（实际项目中应该从API获取）
onMounted(() => {
  // 这里可以添加从Netlify Blobs或其他来源获取图片的逻辑
  imageFiles.value = [
    { name: 'sample1.jpg', url: '/images/sample1.jpg', category: 'product' },
    { name: 'sample2.jpg', url: '/images/sample2.jpg', category: 'logo' },
    // 更多示例图片...
  ]
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 150px 0 100px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.hero-subtitle {
  font-size: 1.3rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 15px 30px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

/* Services Preview */
.services-preview {
  padding: 100px 0;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.services-preview h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 60px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.service-card {
  background: white;
  padding: 40px 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-10px);
}

.service-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.service-card h3 {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 15px;
}

.service-card p {
  line-height: 1.6;
  color: #666;
}

/* Footer Section */
.footer-section {
  background: #2c3e50;
  color: white;
  padding: 40px 0;
  text-align: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.copyright {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #ecf0f1;
}

.tech-info {
  font-size: 0.95rem;
  color: #bdc3c7;
  line-height: 1.6;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-menu {
    gap: 20px;
  }
  
  .footer-section {
    padding: 30px 0;
  }
  
  .copyright {
    font-size: 1rem;
  }
  
  .tech-info {
    font-size: 0.9rem;
  }
}
</style>

/* 图片画廊 */
.gallery-section {
  padding: 100px 0;
  background: white;
}

.gallery-section h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 60px;
}

.gallery-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  justify-content: center;
  flex-wrap: wrap;
}

.search-input, .category-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.search-input {
  min-width: 300px;
}

.category-select {
  min-width: 150px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.image-item {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.image-item:hover {
  transform: translateY(-5px);
}

.image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
  padding: 20px 15px 15px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.image-item:hover .image-overlay {
  transform: translateY(0);
}

.image-name {
  font-weight: 600;
  margin-bottom: 5px;
}

.image-category {
  font-size: 0.9rem;
  opacity: 0.8;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.load-more {
  text-align: center;
  margin-top: 40px;
}

/* 图片模态框 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 10px;
  overflow: hidden;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 1;
}

.modal-content img {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
}

.modal-info {
  padding: 20px;
}

.modal-info h3 {
  margin-bottom: 10px;
  color: #333;
}

.modal-info p {
  margin-bottom: 5px;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .gallery-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .search-input {
    min-width: 250px;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .image-item img {
    height: 150px;
  }
}
</style>