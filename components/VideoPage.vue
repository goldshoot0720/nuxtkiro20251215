<template>
  <div class="video-page">
    <div class="page-header">
      <h1>🎬 影片庫</h1>
      <button @click="checkBlobStatus" class="btn-check" :disabled="checking">
        {{ checking ? '檢查中...' : '🔍 檢查 Blob 狀態' }}
      </button>
    </div>

    <div class="video-grid">
      <div v-for="video in videos" :key="video.blobKey" class="video-card">
        <div class="video-container">
          <video 
            :src="getVideoUrl(video.blobKey)" 
            controls 
            preload="metadata"
            @error="video.error = true"
            @loadeddata="video.error = false"
          >
            您的瀏覽器不支援影片播放。
          </video>
        </div>
        
        <div class="video-info">
          <h3>{{ video.displayName }}</h3>
          <div class="video-meta">
            <span class="badge" :class="video.blobExists ? 'success' : 'warning'">
              {{ video.blobExists ? 'Blob 已上傳' : '檢查中' }}
            </span>
          </div>
          <p class="file-info">
            <strong>檔案名稱:</strong> {{ video.blobKey }}<br>
            <strong>檔案大小:</strong> {{ formatSize(video.fileSize) }}<br>
            <strong>上傳時間:</strong> {{ video.uploadedAt }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="message" class="message" :class="messageType">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const videos = ref([
  {
    blobKey: '19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4',
    displayName: '鋒兄的傳奇人生',
    fileSize: 149202463,
    uploadedAt: '2025-12-16',
    blobExists: false,
    error: false
  },
  {
    blobKey: 'clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4',
    displayName: '鋒兄進化Show🔥',
    fileSize: 46317671,
    uploadedAt: '2025-12-16',
    blobExists: false,
    error: false
  }
])

const checking = ref(false)
const message = ref('')
const messageType = ref('info')

const getVideoUrl = (blobKey) => `/api/blobs/${blobKey}`

const formatSize = (bytes) => {
  if (!bytes) return '未知'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

const checkBlobStatus = async () => {
  checking.value = true
  message.value = ''
  
  for (const video of videos.value) {
    try {
      const response = await fetch(getVideoUrl(video.blobKey), { method: 'HEAD' })
      video.blobExists = response.ok
    } catch {
      video.blobExists = false
    }
  }
  
  const existCount = videos.value.filter(v => v.blobExists).length
  message.value = `檢查完成: ${existCount}/${videos.value.length} 個影片可用`
  messageType.value = existCount === videos.value.length ? 'success' : 'warning'
  checking.value = false
}

onMounted(checkBlobStatus)
</script>

<style scoped>
.video-page { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
.video-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
.video-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.video-container { background: #000; aspect-ratio: 16/9; }
.video-container video { width: 100%; height: 100%; object-fit: contain; }
.video-info { padding: 15px; }
.video-info h3 { margin: 0 0 10px; color: #333; }
.video-meta { margin-bottom: 10px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
.badge.success { background: #e8f5e9; color: #2e7d32; }
.badge.warning { background: #fff3e0; color: #ef6c00; }
.file-info { font-size: 13px; color: #666; line-height: 1.6; margin: 0; }
.btn-check { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-check:disabled { opacity: 0.6; cursor: not-allowed; }
.message { margin-top: 20px; padding: 15px; border-radius: 8px; text-align: center; }
.message.success { background: #e8f5e9; color: #2e7d32; }
.message.warning { background: #fff3e0; color: #ef6c00; }
.message.info { background: #e3f2fd; color: #1565c0; }
</style>