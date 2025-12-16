// composables/useVideos.js
// 影片管理的完整邏輯（含 Netlify Blobs 和本地快取）
import { ref } from 'vue'

export const useVideos = () => {
  // 影片列表
  const videoList = ref([
    {
      blobKey: '19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4',
      displayName: '鋒兄的傳奇人生',
      fileSize: 149202463, // 142.29MB
      uploadedAt: '2025-12-16',
      cached: false,
      loading: false,
      error: false,
      caching: false,
      poster: null,
      blobExists: false
    },
    {
      blobKey: 'clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4',
      displayName: '鋒兄進化Show🔥',
      fileSize: 46317671, // 44.17MB
      uploadedAt: '2025-12-16',
      cached: false,
      loading: false,
      error: false,
      caching: false,
      poster: null,
      blobExists: false
    }
  ])

  // 快取狀態
  const cachedVideos = ref([])
  const totalCacheSize = ref(0)
  const isPreloading = ref(false)
  const cacheMessage = ref('')
  const cacheMessageType = ref('info')

  // 取得影片 URL
  const getVideoUrl = (blobKey) => {
    // 優先使用快取的 blob URL
    const cached = cachedVideos.value.find(v => v.blobKey === blobKey)
    if (cached && cached.blobUrl) {
      return cached.blobUrl
    }
    // 使用 Netlify Blobs API
    return `/api/blobs/${blobKey}`
  }

  // 影片載入開始
  const onVideoLoadStart = (blobKey) => {
    const video = videoList.value.find(v => v.blobKey === blobKey)
    if (video) {
      video.loading = true
      video.error = false
    }
  }

  // 影片載入完成
  const onVideoLoaded = (blobKey) => {
    const video = videoList.value.find(v => v.blobKey === blobKey)
    if (video) {
      video.loading = false
      video.error = false
    }
  }

  // 影片載入錯誤
  const onVideoError = (blobKey, event) => {
    const video = videoList.value.find(v => v.blobKey === blobKey)
    if (video) {
      video.loading = false
      video.error = true
    }
    console.error(`影片載入失敗 (${blobKey}):`, event)
  }

  // 重試載入影片
  const retryVideo = (blobKey) => {
    const video = videoList.value.find(v => v.blobKey === blobKey)
    if (video) {
      video.error = false
      video.loading = true
      
      setTimeout(() => {
        const videoEl = document.querySelector(`[ref="video-${blobKey}"]`)
        if (videoEl) {
          videoEl.load()
        }
      }, 100)
    }
  }

  // 快取單個影片
  const cacheVideo = async (blobKey) => {
    const video = videoList.value.find(v => v.blobKey === blobKey)
    if (!video || video.cached || video.caching) return
    
    video.caching = true
    
    try {
      const response = await fetch(`/api/blobs/${blobKey}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      
      // 更新影片狀態
      video.cached = true
      video.caching = false
      video.fileSize = blob.size
      
      // 添加到快取列表
      cachedVideos.value.push({
        blobKey,
        blobUrl,
        size: blob.size,
        cachedAt: new Date()
      })
      
      // 更新快取大小
      totalCacheSize.value += blob.size
      
      // 更新影片播放器的 src
      const videoEl = document.querySelector(`[ref="video-${blobKey}"]`)
      if (videoEl) {
        videoEl.src = blobUrl
      }
      
      showCacheMessage(`影片 "${video.displayName}" 快取成功！`, 'success')
      
    } catch (error) {
      video.caching = false
      console.error(`快取影片失敗 (${blobKey}):`, error)
      showCacheMessage(`快取影片失敗: ${error.message}`, 'error')
    }
  }

  // 清除單個影片快取
  const clearVideoCache = (blobKey) => {
    const video = videoList.value.find(v => v.blobKey === blobKey)
    if (!video || !video.cached) return
    
    // 釋放 blob URL
    const cached = cachedVideos.value.find(v => v.blobKey === blobKey)
    if (cached && cached.blobUrl) {
      URL.revokeObjectURL(cached.blobUrl)
      totalCacheSize.value -= cached.size
    }
    
    // 從快取列表移除
    cachedVideos.value = cachedVideos.value.filter(v => v.blobKey !== blobKey)
    
    // 更新影片狀態
    video.cached = false
    
    // 重設影片播放器的 src
    const videoEl = document.querySelector(`[ref="video-${blobKey}"]`)
    if (videoEl) {
      videoEl.src = `/api/blobs/${blobKey}`
    }
    
    showCacheMessage(`影片 "${video.displayName}" 快取已清除`, 'info')
  }

  // 預載所有影片
  const preloadAllVideos = async () => {
    isPreloading.value = true
    showCacheMessage('正在預載所有影片...', 'info')
    
    try {
      const uncachedVideos = videoList.value.filter(v => !v.cached)
      
      for (const video of uncachedVideos) {
        await cacheVideo(video.blobKey)
      }
      
      showCacheMessage('所有影片預載完成！', 'success')
    } catch (error) {
      showCacheMessage('部分影片預載失敗', 'error')
    } finally {
      isPreloading.value = false
    }
  }

  // 清除所有快取
  const clearAllCache = () => {
    if (!confirm('確定要清除所有影片快取嗎？')) return
    
    // 釋放所有 blob URLs
    cachedVideos.value.forEach(cached => {
      if (cached.blobUrl) {
        URL.revokeObjectURL(cached.blobUrl)
      }
    })
    
    // 重設所有影片狀態
    videoList.value.forEach(video => {
      video.cached = false
      
      // 重設影片播放器的 src
      const videoEl = document.querySelector(`[ref="video-${video.blobKey}"]`)
      if (videoEl) {
        videoEl.src = `/api/blobs/${video.blobKey}`
      }
    })
    
    cachedVideos.value = []
    totalCacheSize.value = 0
    
    showCacheMessage('所有快取已清除', 'info')
  }

  // 檢查快取狀態
  const checkCacheStatus = () => {
    // 重新計算快取大小
    totalCacheSize.value = cachedVideos.value.reduce((total, video) => total + (video.size || 0), 0)
    
    // 更新影片快取狀態
    videoList.value.forEach(video => {
      video.cached = cachedVideos.value.some(cached => cached.blobKey === video.blobKey)
    })
    
    showCacheMessage('快取狀態已更新', 'info')
  }

  // 檢查 Netlify Blobs 狀態
  const checkBlobsStatus = async () => {
    showCacheMessage('正在檢查 Netlify Blobs 狀態...', 'info')
    
    try {
      let existingBlobs = 0
      
      for (const video of videoList.value) {
        try {
          const response = await fetch(`/api/blobs/${video.blobKey}`, { method: 'HEAD' })
          video.blobExists = response.ok
          
          if (response.ok) {
            existingBlobs++
            video.error = false
          } else {
            video.error = true
          }
        } catch (error) {
          video.blobExists = false
          video.error = true
        }
      }
      
      const totalBlobs = videoList.value.length
      
      if (existingBlobs === totalBlobs) {
        showCacheMessage(`所有影片 (${existingBlobs}/${totalBlobs}) 都已上傳到 Netlify Blobs`, 'success')
      } else if (existingBlobs > 0) {
        showCacheMessage(`部分影片 (${existingBlobs}/${totalBlobs}) 存在於 Netlify Blobs`, 'info')
      } else {
        showCacheMessage(`沒有影片上傳到 Netlify Blobs，請先上傳`, 'error')
      }
    } catch (error) {
      console.error('檢查 Netlify Blobs 狀態失敗:', error)
      showCacheMessage(`檢查失敗: ${error.message}`, 'error')
    }
  }

  // 下載影片
  const downloadVideo = async (blobKey, displayName) => {
    try {
      const response = await fetch(`/api/blobs/${blobKey}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${displayName}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      URL.revokeObjectURL(url)
      
      showCacheMessage(`影片 "${displayName}" 下載成功！`, 'success')
    } catch (error) {
      console.error('下載影片失敗:', error)
      showCacheMessage(`下載失敗: ${error.message}`, 'error')
    }
  }

  // 顯示快取訊息
  const showCacheMessage = (message, type = 'info') => {
    cacheMessage.value = message
    cacheMessageType.value = type
    
    // 3秒後清除訊息
    setTimeout(() => {
      cacheMessage.value = ''
    }, 3000)
  }

  return {
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
    downloadVideo,
    showCacheMessage
  }
}
