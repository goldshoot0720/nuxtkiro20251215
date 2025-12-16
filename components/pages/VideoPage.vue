<template>
  <div class="video-manager-container">
    <h1>影片庫</h1>
    
    <!-- 影片管理資訊 -->
    <div class="video-info">
      <h3>📹 影片雲端管理</h3>
      <p>使用 Netlify Blobs 儲存影片，支援本地快取離線播放</p>
      <div class="video-stats">
        <div class="stat-item">
          <span class="stat-label">影片數量:</span>
          <span class="stat-value">{{ videoList.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">快取大小:</span>
          <span class="stat-value">{{ formatCacheSize(totalCacheSize) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已快取：</span>
          <span class="stat-value">{{ cachedVideos.length }}/{{ videoList.length }}</span>
        </div>
      </div>
    </div>

    <!-- Netlify Blobs 上傳指南 -->
    <div class="upload-guide" v-if="videoList.some(v => !v.blobExists)">
      <h3>📤 影片上傳指南</h3>
      <p>部分影片尚未上傳到 Netlify Blobs，請依照以下步驟：</p>
      <ol>
        <li>將影片檔案放到 <code>public/videos/</code> 資料夾</li>
        <li>執行上傳命令：<code>npm run upload-videos</code></li>
        <li>或使用 Netlify CLI：<code>netlify blobs:set videos [blob-key] -i [file-path]</code></li>
        <li>點擊 "🔄 檢查 Netlify Blobs" 確認上傳狀態</li>
      </ol>
    </div>

    <!-- 快取管理控制 -->
    <div class="cache-controls">
      <h3>🗂️ 快取管理</h3>
      <div class="control-buttons">
        <button @click="checkBlobsStatus" class="cache-btn refresh">
          🔄 檢查 Netlify Blobs
        </button>
        <button @click="preloadAllVideos" class="cache-btn preload" :disabled="isPreloading">
          {{ isPreloading ? '載入中...' : '📥 預載所有影片' }}
        </button>
        <button @click="clearAllCache" class="cache-btn clear">
          🗑️ 清除所有快取
        </button>
        <button @click="checkCacheStatus" class="cache-btn refresh">
          🔄 更新快取狀態
        </button>
      </div>
      <div v-if="cacheMessage" class="cache-message" :class="cacheMessageType">
        {{ cacheMessage }}
      </div>
    </div>

    <!-- 影片列表 -->
    <div class="video-list">
      <h3>🎬 影片清單</h3>
      <div class="videos-grid">
        <div 
          v-for="video in videoList" 
          :key="video.blobKey"
          class="video-card"
        >
          <div class="video-header">
            <h4>{{ video.displayName }}</h4>
            <div class="video-status">
              <span v-if="video.blobExists" class="status-badge blob-exists">Blob 已上傳</span>
              <span v-else class="status-badge blob-missing">Blob 未上傳</span>
              <span v-if="video.cached" class="status-badge cached">已快取</span>
              <span v-else class="status-badge not-cached">未快取</span>
            </div>
          </div>
          
          <div class="video-player-container">
            <video 
              :ref="'video-' + video.blobKey"
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
            
            <!-- 載入中覆蓋層 -->
            <div v-if="video.loading" class="video-loading-overlay">
              <div class="loading-spinner"></div>
              <p>載入中...</p>
            </div>
            
            <!-- 錯誤覆蓋層 -->
            <div v-if="video.error" class="video-error-overlay">
              <div class="error-icon">⚠️</div>
              <p>載入失敗</p>
              <button @click="retryVideo(video.blobKey)" class="retry-btn">
                重試
              </button>
            </div>
          </div>
          
          <div class="video-info-panel">
            <div class="video-details">
              <div class="detail-row">
                <span class="detail-label">檔案名稱:</span>
                <span class="detail-value">{{ video.blobKey }}</span>
              </div>
              <div class="detail-row" v-if="video.fileSize">
                <span class="detail-label">檔案大小:</span>
                <span class="detail-value">{{ formatFileSize(video.fileSize) }}</span>
              </div>
              <div class="detail-row" v-if="video.uploadedAt">
                <span class="detail-label">上傳時間:</span>
                <span class="detail-value">{{ formatDate(video.uploadedAt) }}</span>
              </div>
            </div>
            
            <div class="video-actions">
              <button 
                v-if="!video.cached" 
                @click="cacheVideo(video.blobKey)"
                class="action-btn cache"
                :disabled="video.caching"
              >
                {{ video.caching ? '快取中...' : '📥 快取影片' }}
              </button>
              <button 
                v-if="video.cached" 
                @click="clearVideoCache(video.blobKey)"
                class="action-btn clear-cache"
              >
                🗑️ 清除此快取
              </button>
              <button 
                @click="downloadVideo(video.blobKey, video.displayName)"
                class="action-btn download"
              >
                💾 下載影片
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 技術說明 -->
    <div class="tech-info">
      <h3>💡 技術說明</h3>
      <div class="tech-features">
        <div class="feature-item">
          <div class="feature-icon">📦</div>
          <div class="feature-content">
            <h4>本地快取</h4>
            <p>影片可以快取到本地 IndexedDB，實現離線播放功能</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <div class="feature-content">
            <h4>串流載入</h4>
            <p>影片採用串流載入，無需等待完整下載即可開始播放</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🔒</div>
          <div class="feature-content">
            <h4>安全存儲</h4>
            <p>所有影片存儲在 Netlify Blobs 雲端，透過 HTTPS 安全傳輸</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📱</div>
          <div class="feature-content">
            <h4>響應式設計</h4>
            <p>支援各種螢幕尺寸，在手機和平板上也能流暢觀看</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useVideos } from '../../composables/useVideos'
import { useFormatters } from '../../composables/useFormatters'

const {
  videoList,
  cachedVideos,
  totalCacheSize,
  isPreloading,
  cacheMessage,
  cacheMessageType,
  getVideoUrl,
  onVideoLoadStart,
  onVideoLoaded,
  onVideoError,
  retryVideo,
  cacheVideo,
  clearVideoCache,
  preloadAllVideos,
  clearAllCache,
  checkCacheStatus,
  checkBlobsStatus,
  downloadVideo
} = useVideos()

const { formatFileSize, formatCacheSize, formatDate } = useFormatters()

// 組件掛載時檢查 Blobs 狀態
onMounted(() => {
  checkBlobsStatus()
})

// 暴露方法給父組件
defineExpose({
  videoList,
  cachedVideos,
  checkBlobsStatus
})
</script>


<style scoped>
/* 影片管理樣式 */
.video-manager-container {
  animation: fadeIn 0.3s ease-in;
}

.video-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
}

.video-info h3 {
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.video-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
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
  opacity: 0.9;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
}

.upload-guide {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.upload-guide h3 {
  color: #856404;
  margin-bottom: 1rem;
}

.upload-guide p {
  color: #856404;
  margin-bottom: 1rem;
}

.upload-guide ol {
  color: #856404;
  padding-left: 1.5rem;
}

.upload-guide li {
  margin-bottom: 0.5rem;
}

.upload-guide code {
  background: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #e83e8c;
}

.cache-controls {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.cache-controls h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.control-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
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

.cache-btn.preload {
  background: #3498db;
  color: white;
}

.cache-btn.preload:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-2px);
}

.cache-btn.clear {
  background: #e74c3c;
  color: white;
}

.cache-btn.clear:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

.cache-btn.refresh {
  background: #95a5a6;
  color: white;
}

.cache-btn.refresh:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
}

.cache-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cache-message {
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  font-weight: 500;
}

.cache-message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.cache-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.cache-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.video-list {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.video-list h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.video-card {
  background: #f8f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.video-header {
  padding: 1.5rem;
  background: white;
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

.video-status {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.cached {
  background: #d4edda;
  color: #155724;
}

.status-badge.not-cached {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.blob-exists {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.blob-missing {
  background: #f8d7da;
  color: #721c24;
}

.video-player-container {
  position: relative;
  padding: 1.5rem;
}

.video-player {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.video-loading-overlay,
.video-error-overlay {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  backdrop-filter: blur(5px);
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

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #2980b9;
}

.video-info-panel {
  padding: 1.5rem;
  background: white;
  border-top: 1px solid #e1e8ed;
}

.video-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #666;
  min-width: 80px;
}

.detail-value {
  color: #2c3e50;
  word-break: break-all;
  text-align: right;
}

.video-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  flex: 1;
  min-width: 120px;
}

.action-btn.cache {
  background: #3498db;
  color: white;
}

.action-btn.cache:hover:not(:disabled) {
  background: #2980b9;
}

.action-btn.clear-cache {
  background: #e74c3c;
  color: white;
}

.action-btn.clear-cache:hover {
  background: #c0392b;
}

.action-btn.download {
  background: #27ae60;
  color: white;
}

.action-btn.download:hover {
  background: #229954;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tech-info {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tech-info h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.tech-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.feature-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.feature-content h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.feature-content p {
  margin: 0;
  color: #666;
  line-height: 1.5;
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

/* 響應式設計 */
@media (max-width: 768px) {
  .videos-grid {
    grid-template-columns: 1fr;
  }
  
  .video-stats {
    gap: 1rem;
  }
  
  .control-buttons {
    flex-direction: column;
  }
  
  .cache-btn {
    width: 100%;
  }
  
  .video-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .detail-value {
    text-align: left;
  }
  
  .video-actions {
    flex-direction: column;
  }
  
  .action-btn {
    min-width: auto;
  }
  
  .tech-features {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .video-info {
    padding: 1.5rem;
  }
  
  .cache-controls,
  .video-list,
  .tech-info {
    padding: 1.5rem;
  }
  
  .video-player-container {
    padding: 1rem;
  }
  
  .video-info-panel {
    padding: 1rem;
  }
}
</style>
