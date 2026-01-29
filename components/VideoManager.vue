<template>
  <div class="video-manager">
    <div class="video-info">
      <h3>🎬 影片展示系統</h3>
      <p>使用 Netlify Blobs 優化影片載入，減少流量消耗</p>
    </div>

    <!-- 快取管理控制台 -->
    <div class="cache-controls">
      <div class="cache-stats">
        <div class="stat-item">
          <span class="stat-label">快取大小:</span>
          <span class="stat-value">{{ formatFileSize(cacheSize) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已快取影片:</span>
          <span class="stat-value">{{ cachedVideos.length }}/{{ videos.length }}</span>
        </div>
      </div>
      
      <div class="cache-actions">
        <button 
          @click="preloadAllVideos" 
          :disabled="loading"
          class="cache-btn primary"
        >
          {{ loading ? '載入中...' : '預載所有影片' }}
        </button>
        <button 
          @click="clearAllCache" 
          :disabled="cacheSize === 0"
          class="cache-btn secondary"
        >
          清除所有快取
        </button>
      </div>
    </div>

    <!-- 影片列表 -->
    <div class="videos-grid">
      <div 
        v-for="video in videos" 
        :key="video.blobKey"
        class="video-card"
      >
        <div class="video-header">
          <h4>{{ video.displayName }}</h4>
          <div class="video-actions">
            <button 
              v-if="!isVideoCached(video.blobKey)"
              @click="preloadVideo(video.blobKey)"
              :disabled="loadingVideos.has(video.blobKey)"
              class="action-btn cache"
              title="預載影片"
            >
              {{ loadingVideos.has(video.blobKey) ? '⏳' : '📥' }}
            </button>
            <button 
              v-if="isVideoCached(video.blobKey)"
              @click="clearVideoCache(video.blobKey)"
              class="action-btn clear"
              title="清除快取"
            >
              🗑️
            </button>
          </div>
        </div>

        <div class="video-container">
          <video 
            :ref="el => setVideoRef(video.blobKey, el)"
            class="video-player"
            controls
            preload="metadata"
            :poster="video.poster"
            @loadstart="onVideoLoadStart(video.blobKey)"
            @loadeddata="onVideoLoaded(video.blobKey)"
            @error="onVideoError(video.blobKey, $event)"
          >
            <source :src="getVideoUrl(video.blobKey)" type="video/mp4">
            您的瀏覽器不支援影片播放。
          </video>
          
          <!-- 載入狀態 -->
          <div 
            v-if="loadingVideos.has(video.blobKey)" 
            class="loading-overlay"
          >
            <div class="loading-spinner"></div>
            <p>載入中...</p>
          </div>
        </div>

        <div class="video-info-panel">
          <div class="info-row">
            <span class="label">檔案名稱:</span>
            <span class="value">{{ video.blobKey }}</span>
          </div>
          <div class="info-row">
            <span class="label">快取狀態:</span>
            <span :class="['status', isVideoCached(video.blobKey) ? 'cached' : 'not-cached']">
              {{ isVideoCached(video.blobKey) ? '✅ 已快取' : '❌ 未快取' }}
            </span>
          </div>
          <div class="info-row" v-if="video.fileSize">
            <span class="label">檔案大小:</span>
            <span class="value">{{ formatFileSize(video.fileSize) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用說明 -->
    <div class="usage-guide">
      <h3>📋 使用說明</h3>
      <ul>
        <li><strong>智能快取:</strong> 影片會自動快取到本地，減少重複載入</li>
        <li><strong>按需載入:</strong> 點擊播放按鈕才開始載入影片內容</li>
        <li><strong>預載功能:</strong> 可以預先載入影片到快取中</li>
        <li><strong>快取管理:</strong> 支援單個或全部影片的快取清除</li>
        <li><strong>離線播放:</strong> 已快取的影片可以離線播放</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

// 響應式數據
const loading = ref(false)
const loadingVideos = reactive(new Set())
const cachedVideos = ref([])
const cacheSize = ref(0)
const videoRefs = reactive(new Map())

// 影片配置
const videos = ref([
  {
    blobKey: '19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4',
    displayName: '鋒兄的傳奇人生',
    fileSize: null,
    poster: null
  },
  {
    blobKey: 'clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4',
    displayName: '鋒兄進化Show🔥',
    fileSize: null,
    poster: null
  },
  {
    blobKey: '鋒兄進化 Show🔥影片保留十五年.mp4',
    displayName: '鋒兄進化 Show🔥影片保留十五年',
    fileSize: null,
    poster: null
  }
])

// IndexedDB 快取管理
let db = null

// 初始化 IndexedDB
const initDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VideoCache', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('videos')) {
        const store = db.createObjectStore('videos', { keyPath: 'blobKey' })
        store.createIndex('displayName', 'displayName', { unique: false })
      }
    }
  })
}

// 格式化檔案大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 獲取影片 URL
const getVideoUrl = (blobKey) => {
  // 優先使用快取的 blob URL
  const cached = cachedVideos.value.find(v => v.blobKey === blobKey)
  if (cached && cached.blobUrl) {
    return cached.blobUrl
  }
  
  // 回退到 Netlify Blobs URL
  return `/api/blobs/${encodeURIComponent(blobKey)}`
}

// 檢查影片是否已快取
const isVideoCached = (blobKey) => {
  return cachedVideos.value.some(v => v.blobKey === blobKey)
}

// 設置影片元素引用
const setVideoRef = (blobKey, el) => {
  if (el) {
    videoRefs.set(blobKey, el)
  }
}

// 從快取載入影片
const loadVideoFromCache = async (blobKey) => {
  if (!db) return null
  
  try {
    const transaction = db.transaction(['videos'], 'readonly')
    const store = transaction.objectStore('videos')
    const request = store.get(blobKey)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result
        if (result && result.blob) {
          const blobUrl = URL.createObjectURL(result.blob)
          resolve({ ...result, blobUrl })
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('載入快取失敗:', error)
    return null
  }
}

// 儲存影片到快取
const saveVideoToCache = async (blobKey, blob, metadata = {}) => {
  if (!db) return false
  
  try {
    const transaction = db.transaction(['videos'], 'readwrite')
    const store = transaction.objectStore('videos')
    
    const videoData = {
      blobKey,
      blob,
      metadata: {
        ...metadata,
        cachedAt: new Date().toISOString(),
        size: blob.size
      }
    }
    
    const request = store.put(videoData)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('儲存快取失敗:', error)
    return false
  }
}

// 預載影片
const preloadVideo = async (blobKey) => {
  if (isVideoCached(blobKey) || loadingVideos.has(blobKey)) return
  
  loadingVideos.add(blobKey)
  
  try {
    // 從 Netlify Blobs 獲取影片
    const response = await fetch(`/api/blobs/${encodeURIComponent(blobKey)}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    
    // 儲存到快取
    await saveVideoToCache(blobKey, blob, {
      displayName: videos.value.find(v => v.blobKey === blobKey)?.displayName
    })
    
    // 更新快取列表
    cachedVideos.value.push({
      blobKey,
      blobUrl,
      size: blob.size,
      cachedAt: new Date()
    })
    
    // 更新影片元素的 src
    const videoEl = videoRefs.get(blobKey)
    if (videoEl) {
      videoEl.src = blobUrl
    }
    
    updateCacheSize()
    
  } catch (error) {
    console.error(`預載影片失敗 (${blobKey}):`, error)
    alert(`預載影片失敗: ${error.message}`)
  } finally {
    loadingVideos.delete(blobKey)
  }
}

// 預載所有影片
const preloadAllVideos = async () => {
  loading.value = true
  
  try {
    const promises = videos.value
      .filter(video => !isVideoCached(video.blobKey))
      .map(video => preloadVideo(video.blobKey))
    
    await Promise.all(promises)
    alert('所有影片預載完成！')
  } catch (error) {
    console.error('預載所有影片失敗:', error)
    alert('預載過程中發生錯誤')
  } finally {
    loading.value = false
  }
}

// 清除單個影片快取
const clearVideoCache = async (blobKey) => {
  if (!db) return
  
  try {
    const transaction = db.transaction(['videos'], 'readwrite')
    const store = transaction.objectStore('videos')
    await store.delete(blobKey)
    
    // 清理 blob URL
    const cached = cachedVideos.value.find(v => v.blobKey === blobKey)
    if (cached && cached.blobUrl) {
      URL.revokeObjectURL(cached.blobUrl)
    }
    
    // 從快取列表移除
    cachedVideos.value = cachedVideos.value.filter(v => v.blobKey !== blobKey)
    
    // 重置影片元素的 src
    const videoEl = videoRefs.get(blobKey)
    if (videoEl) {
      videoEl.src = `/api/blobs/${encodeURIComponent(blobKey)}`
    }
    
    updateCacheSize()
    
  } catch (error) {
    console.error('清除快取失敗:', error)
  }
}

// 清除所有快取
const clearAllCache = async () => {
  if (!confirm('確定要清除所有影片快取嗎？')) return
  
  if (!db) return
  
  try {
    const transaction = db.transaction(['videos'], 'readwrite')
    const store = transaction.objectStore('videos')
    await store.clear()
    
    // 清理所有 blob URLs
    cachedVideos.value.forEach(cached => {
      if (cached.blobUrl) {
        URL.revokeObjectURL(cached.blobUrl)
      }
    })
    
    cachedVideos.value = []
    
    // 重置所有影片元素的 src
    videos.value.forEach(video => {
      const videoEl = videoRefs.get(video.blobKey)
      if (videoEl) {
        videoEl.src = `/api/blobs/${encodeURIComponent(video.blobKey)}`
      }
    })
    
    updateCacheSize()
    alert('所有快取已清除')
    
  } catch (error) {
    console.error('清除所有快取失敗:', error)
    alert('清除快取失敗')
  }
}

// 更新快取大小統計
const updateCacheSize = () => {
  cacheSize.value = cachedVideos.value.reduce((total, video) => total + (video.size || 0), 0)
}

// 載入已存在的快取
const loadExistingCache = async () => {
  if (!db) return
  
  try {
    const transaction = db.transaction(['videos'], 'readonly')
    const store = transaction.objectStore('videos')
    const request = store.getAll()
    
    request.onsuccess = () => {
      const results = request.result
      cachedVideos.value = results.map(result => ({
        blobKey: result.blobKey,
        blobUrl: URL.createObjectURL(result.blob),
        size: result.blob.size,
        cachedAt: new Date(result.metadata.cachedAt)
      }))
      
      updateCacheSize()
    }
  } catch (error) {
    console.error('載入現有快取失敗:', error)
  }
}

// 影片事件處理
const onVideoLoadStart = (blobKey) => {
  console.log(`影片開始載入: ${blobKey}`)
}

const onVideoLoaded = (blobKey) => {
  console.log(`影片載入完成: ${blobKey}`)
}

const onVideoError = (blobKey, event) => {
  console.error(`影片載入錯誤 (${blobKey}):`, event)
}

// 組件掛載
onMounted(async () => {
  try {
    await initDB()
    await loadExistingCache()
  } catch (error) {
    console.error('初始化失敗:', error)
  }
})

// 組件卸載時清理
onUnmounted(() => {
  // 清理所有 blob URLs
  cachedVideos.value.forEach(cached => {
    if (cached.blobUrl) {
      URL.revokeObjectURL(cached.blobUrl)
    }
  })
  
  if (db) {
    db.close()
  }
})
</script>

<style scoped>
.video-manager {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease-in;
}

.video-info {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.video-info h3 {
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.cache-controls {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.cache-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.cache-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.cache-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.cache-btn.primary {
  background: #3498db;
  color: white;
}

.cache-btn.primary:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.cache-btn.secondary {
  background: #95a5a6;
  color: white;
}

.cache-btn.secondary:hover:not(:disabled) {
  background: #7f8c8d;
  transform: translateY(-2px);
}

.cache-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.video-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s;
}

.video-card:hover {
  transform: translateY(-5px);
}

.video-header {
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.video-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.2rem;
}

.action-btn:hover {
  background: #f8f9fa;
  transform: scale(1.1);
}

.action-btn.cache {
  border-color: #3498db;
  color: #3498db;
}

.action-btn.clear {
  border-color: #e74c3c;
  color: #e74c3c;
}

.video-container {
  position: relative;
  padding: 1.5rem;
}

.video-player {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.video-info-panel {
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e1e8ed;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  color: #2c3e50;
  word-break: break-all;
}

.status.cached {
  color: #27ae60;
  font-weight: 600;
}

.status.not-cached {
  color: #e74c3c;
  font-weight: 600;
}

.usage-guide {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.usage-guide h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.usage-guide ul {
  list-style: none;
  padding: 0;
}

.usage-guide li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  color: #555;
  line-height: 1.6;
}

.usage-guide li:last-child {
  border-bottom: none;
}

.usage-guide strong {
  color: #2c3e50;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .videos-grid {
    grid-template-columns: 1fr;
  }
  
  .cache-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .cache-stats {
    justify-content: space-around;
  }
  
  .cache-actions {
    justify-content: center;
  }
  
  .video-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
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