<template>
  <div class="image-gallery-container">
    <h1>圖片展示畫廊</h1>
    <p>展示 public 資料夾中的所有圖片內容</p>
    
    <!-- 圖片統計 -->
    <div class="gallery-stats">
      <div class="stat-item">
        <span class="stat-number">{{ imageFiles.length }}</span>
        <span class="stat-label">張圖片</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ categoryCount }}</span>
        <span class="stat-label">個分類</span>
      </div>
    </div>

    <!-- 搜尋和篩選 -->
    <div class="gallery-controls">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜尋圖片名稱..."
          class="search-input"
        >
      </div>
      <div class="filter-buttons">
        <button 
          @click="selectedCategory = 'all'"
          :class="{ active: selectedCategory === 'all' }"
          class="filter-btn"
        >
          全部
        </button>
        <button 
          v-for="category in imageCategories" 
          :key="category"
          @click="selectedCategory = category"
          :class="{ active: selectedCategory === category }"
          class="filter-btn"
        >
          {{ getCategoryDisplayName(category) }}
        </button>
      </div>
    </div>

    <!-- 圖片畫廊 -->
    <div class="image-gallery">
      <div 
        v-for="image in filteredImages" 
        :key="image.name"
        class="image-card"
        @click="openImageModal(image)"
      >
        <div class="image-container">
          <img 
            :src="image.url" 
            :alt="image.name"
            class="gallery-image"
            loading="lazy"
            @error="onImageError"
          >
          <div class="image-actions-overlay">
            <button class="action-btn view" title="查看大圖">
              🔍
            </button>
            <button class="action-btn download" title="下載" @click.stop="downloadImage(image)">
              📥
            </button>
          </div>
        </div>
        <div class="image-info">
          <h4 class="image-title">{{ getImageDisplayName(image.name) }}</h4>
          <p class="image-category">{{ getCategoryDisplayName(image.category) }}</p>
        </div>
      </div>
    </div>

    <!-- 載入更多 -->
    <div v-if="hasMoreImages" class="load-more">
      <button @click="loadMoreImages" class="load-more-btn">
        載入更多圖片
      </button>
    </div>

    <!-- 圖片模態框 -->
    <div v-if="selectedImage" class="image-modal" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeImageModal">✕</button>
        <img 
          :src="selectedImage.url" 
          :alt="selectedImage.name"
          class="modal-image"
        >
        <div class="modal-info">
          <h3>{{ getImageDisplayName(selectedImage.name) }}</h3>
          <p>分類：{{ getCategoryDisplayName(selectedImage.category) }}</p>
          <p>檔案名稱：{{ selectedImage.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 響應式數據
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedImage = ref(null)
const displayedImageCount = ref(20)

// 圖片文件列表
const imageFiles = ref([
  // ChatGPT 生成圖片
  { name: 'ChatGPT Image 2025年10月26日 下午07_21_51.jpeg', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年10月26日 下午07_37_12.jpeg', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年10月26日 下午07_45_30.jpeg', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月10日 下午07 07.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月10日 下午07_29.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月13日 下午09_08_37.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月13日 下午09_10_45.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月13日 下午09_18_36.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月13日 下午10_19_22@.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月13日 下午10_19_22@@.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月18日 下午02_00_03.png', category: 'chatgpt' },
  { name: 'ChatGPT Image 2025年11月18日 下午02_11_13.png', category: 'chatgpt' },
  
  // Gemini 生成圖片
  { name: 'Gemini_Generated_Image_1acyxf1acyxf1acy.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_1xs3cf1xs3cf1xs3.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_3348083348083348.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_4iscnp4iscnp4isc.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_5xiatu5xiatu5xia.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_76qn2776qn2776qn.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_a5eanqa5eanqa5ea.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_a7lvpba7lvpba7lv.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_a959gfa959gfa959.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_asj7abasj7abasj7.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_avufzzavufzzavuf.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_azcmkgazcmkgazcm.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_br5g4ybr5g4ybr5g.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_c7gqahc7gqahc7gq.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_cuhb9mcuhb9mcuhb.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_empb0tempb0tempb.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_f7jzmkf7jzmkf7jz.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_gb7e0tgb7e0tgb7e.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_grs13tgrs13tgrs1.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_jc0z4ojc0z4ojc0z.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_kzhm4pkzhm4pkzhm.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_mc90rjmc90rjmc90.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_n016vun016vun016.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_no8fxsno8fxsno8f.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_p8s78p8s78p8s78p.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_urahmhurahmhurah.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_xcac14xcac14xcac.png', category: 'gemini' },
  { name: 'Gemini_Generated_Image_xfh0ydxfh0ydxfh0.png', category: 'gemini' },
  
  // MindVideo 圖片
  { name: 'MindVideo_20251128135952_420.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128184816_627.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128190433_123.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128190629_343.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128191517_115.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128192530_578.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128201528_755.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251128203653_134.jpg', category: 'mindvideo' },
  { name: 'MindVideo_20251203161758_843.png', category: 'mindvideo' },
  { name: 'MindVideo_20251212222832_232.png', category: 'mindvideo' },
  { name: 'MindVideo_20251214000745_021.png', category: 'mindvideo' },
  { name: 'MindVideo_20251214013030_085.png', category: 'mindvideo' },
  
  // 其他圖片
  { name: '11114-product-photo-20231130-54-17pt55y_71998305c2be38bf7096.jpg', category: 'other' },
  { name: '1761405863-3ca40781-b24f-4c48-9795-7bc061f58ed6.jpeg', category: 'other' },
  { name: '1761405934-74814b15-9720-44af-a88e-91f4933748c3.jpeg', category: 'other' },
  { name: '20251104_134814.jpg', category: 'photo' },
  { name: '248adc66-2260-491b-b5a9-91ca01099528.jpeg', category: 'other' },
  { name: '41debbc7-e26c-402d-8d29-7fa1b06441b7.jpeg', category: 'other' },
  { name: '50a2f658-0691-4694-a692-7c53a73c175f.jpg', category: 'other' },
  { name: '6ca6f5cd3a4e4525aeff15d3b43cd8c0.jpeg', category: 'other' },
  { name: '9ed35a46-9d95-4376-bd47-a267b49a22c0.jpeg', category: 'other' },
  { name: 'a31b59e0-088a-4d22-991b-a040af3884fa.jpeg', category: 'other' },
  { name: 'BackTshirtBack.jpeg', category: 'product' },
  { name: 'ec6a52ef-397a-481d-a1c2-4336dabc2eb5.jpeg', category: 'other' },
  { name: 'f56a77b4-342b-4624-aaee-0a1eefda1c02.jpeg', category: 'other' },
  { name: 'Google-logo_1.jpg', category: 'logo' },
  { name: 'IMG_0032.jpg', category: 'photo' },
  { name: 'Screenshot 2025-10-26 at 21-54-22 20251026_2146_01k8gbv2ynecwrezhhpnx3cwg1.mp4.png', category: 'screenshot' },
  { name: 'Screenshot 2025-12-05 at 00-22-42 .png', category: 'screenshot' },
  { name: 'sora2.jpg', category: 'ai' }
].filter(img => {
  // 只保留 JPG/JPEG/PNG 格式的圖片
  const extension = img.name.toLowerCase().split('.').pop()
  return ['jpg', 'jpeg', 'png'].includes(extension)
}).map(img => ({
  ...img,
  url: `/images/${img.name}`
})))

// 計算屬性
const imageCategories = computed(() => {
  const categories = [...new Set(imageFiles.value.map(img => img.category))]
  return categories.sort()
})

const categoryCount = computed(() => {
  return imageCategories.value.length
})

const filteredImages = computed(() => {
  let filtered = imageFiles.value

  // 按分類篩選
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(img => img.category === selectedCategory.value)
  }

  // 按搜尋關鍵字篩選
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(img => 
      img.name.toLowerCase().includes(query) ||
      getCategoryDisplayName(img.category).toLowerCase().includes(query)
    )
  }

  // 限制顯示數量
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

const downloadImage = (image) => {
  const link = document.createElement('a')
  link.href = image.url
  link.download = image.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const loadMoreImages = () => {
  displayedImageCount.value += 20
}

const onImageError = (event) => {
  console.error('圖片載入失敗:', event.target.src)
  event.target.style.display = 'none'
}
</script>

<style scoped>
.image-gallery-container {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.gallery-stats {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  min-width: 120px;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.gallery-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 300px;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover,
.filter-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.image-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.image-card:hover {
  transform: translateY(-5px);
}

.image-container {
  position: relative;
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.image-actions-overlay {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-card:hover .image-actions-overlay {
  opacity: 1;
}

.action-btn {
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.image-info {
  padding: 1rem;
}

.image-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #2c3e50;
}

.image-category {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.load-more {
  text-align: center;
  margin: 2rem 0;
}

.load-more-btn {
  padding: 1rem 2rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.load-more-btn:hover {
  background: #2980b9;
}

/* 模態框樣式 */
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

.modal-image {
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

/* 響應式設計 */
@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }
  
  .gallery-controls {
    flex-direction: column;
  }
  
  .search-input {
    min-width: 100%;
  }
  
  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .gallery-stats {
    justify-content: center;
  }
}
</style>