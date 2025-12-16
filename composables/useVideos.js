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
      loaded: false, // 新增：是否已載入
      error: false,
      errorType: null, // 新增：錯誤類型
      errorDetails: null, // 新增：錯誤詳情
      caching: false,
      poster: null,
      blobExists: false,
      loadProgress: 0, // 新增：載入進度
      blobStatus: null // 新增：Blob 狀態提示
    },
    {
      blobKey: 'clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4',
      displayName: '鋒兄進化Show🔥',
      fileSize: 46317671, // 44.17MB
      uploadedAt: '2025-12-16',
      cached: false,
      loading: false,
      loaded: false, // 新增：是否已載入
      error: false,
      errorType: null, // 新增：錯誤類型
      errorDetails: null, // 新增：錯誤詳情
      caching: false,
      poster: null,
      blobExists: false,
      loadProgress: 0, // 新增：載入進度
      blobStatus: null // 新增：Blob 狀態提示
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
      video.loadProgress = 0
      
      // 分析錯誤類型
      const target = event.target
      const networkState = target?.networkState
      const error = target?.error
      
      if (networkState === 3) { // NETWORK_NO_SOURCE
        video.errorType = 'no_source'
        video.errorDetails = 'Netlify Blobs 中找不到此影片檔案'
      } else if (error?.code === 4) { // MEDIA_ELEMENT_ERROR_SRC_NOT_SUPPORTED
        video.errorType = 'unsupported'
        video.errorDetails = '影片格式不支援或檔案損壞'
      } else if (error?.code === 2) { // MEDIA_ELEMENT_ERROR_NETWORK
        video.errorType = 'network'
        video.errorDetails = '網路連線問題，無法從 Netlify Blobs 載入'
      } else if (error?.code === 3) { // MEDIA_ELEMENT_ERROR_DECODE
        video.errorType = 'decode'
        video.errorDetails = '影片解碼失敗，檔案可能損壞'
      } else {
        video.errorType = 'unknown'
        video.errorDetails = '未知錯誤，請檢查 Netlify Blobs 狀態'
      }
    }
    console.error(`影片載入失敗 (${blobKey}):`, event)
  }

  // 延遲載入影片
  const loadVideo = async (blobKey) => {
    const video = videoList.value.find(v => v.blobKey === blobKey)
    if (!video || video.loaded || video.loading) return
    
    video.loading = true
    video.error = false
    video.errorType = null
    video.errorDetails = null
    video.loadProgress = 0
    
    try {
      // 先檢查 Blob 是否存在
      const headResponse = await fetch(`/api/blobs/${blobKey}`, { method: 'HEAD' })
      
      if (!headResponse.ok) {
        throw new Error(`Netlify Blobs 中找不到影片檔案 (HTTP ${headResponse.status})`)
      }
      
      video.blobExists = true
      video.loaded = true
      video.loading = false
      video.loadProgress = 100
      
      // 顯示成功狀態
      setBlobStatus(blobKey, 'success', '影片載入成功', '已從 Netlify Blobs 載入')
      
    } catch (error) {
      video.loading = false
      video.error = true
      video.errorType = 'network'
      video.errorDetails = error.message
      video.blobExists = false
      
      // 顯示錯誤狀態
      setBlobStatus(blobKey, 'error', 'Netlify Blobs 載入失敗', error.message)
      
      console.error(`載入影片失敗 (${blobKey}):`, error)
    }
  }

  // 重試載入影片
  const retryVideo = async (blobKey) => {
    const video = videoList.value.find(v => v.blobKey === blobKey)
    if (video) {
      video.error = false
      video.errorType = null
      video.errorDetails = null
      video.loadProgress = 0
      
      // 如果影片還沒載入，使用延遲載入
      if (!video.loaded) {
        await loadVideo(blobKey)
      } else {
        // 如果已載入，重新載入影片元素
        video.loading = true
        
        setTimeout(() => {
          const videoEl = document.querySelector(`[ref="video-${blobKey}"]`)
          if (videoEl) {
            videoEl.load()
          }
        }, 100)
      }
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

  // 檢查單個 Blob 狀態
  const checkSingleBlobStatus = async (blobKey) => {
    const video = videoList.value.find(v => v.blobKey === blobKey)
    if (!video) return
    
    setBlobStatus(blobKey, 'info', '正在檢查 Netlify Blobs 狀態...', '')
    
    try {
      const response = await fetch(`/api/blobs/${blobKey}`, { method: 'HEAD' })
      
      if (response.ok) {
        video.blobExists = true
        video.error = false
        setBlobStatus(blobKey, 'success', 'Blob 檢查完成', '影片存在於 Netlify Blobs')
      } else {
        video.blobExists = false
        setBlobStatus(blobKey, 'error', 'Blob 不存在', `HTTP ${response.status} - 請先上傳影片到 Netlify Blobs`)
      }
    } catch (error) {
      video.blobExists = false
      setBlobStatus(blobKey, 'error', '檢查失敗', `無法連接到 Netlify Blobs: ${error.message}`)
    }
  }

  // 顯示上傳說明
  const showUploadInstructions = (blobKey) => {
    const video = videoList.value.find(v => v.blobKey === blobKey)
    if (!video) return
    
    const instructions = `
上傳 "${video.displayName}" 到 Netlify Blobs:

1. 確保影片檔案存在於 public/videos/ 資料夾
2. 使用 Netlify CLI 上傳:
   netlify blobs:set videos "${blobKey}" -i "./public/videos/${blobKey}"
3. 或執行批次上傳: npm run upload-videos
4. 上傳完成後點擊 "🔍 檢查 Blob 狀態"
    `.trim()
    
    setBlobStatus(blobKey, 'info', '上傳說明', instructions)
  }

  // 設置 Blob 狀態提示
  const setBlobStatus = (blobKey, type, message, details) => {
    const video = videoList.value.find(v => v.blobKey === blobKey)
    if (video) {
      video.blobStatus = {
        type, // 'success', 'warning', 'error', 'info'
        message,
        details,
        timestamp: Date.now()
      }
    }
  }

  // 清除 Blob 狀態提示
  const clearBlobStatus = (blobKey) => {
    const video = videoList.value.find(v => v.blobKey === blobKey)
    if (video) {
      video.blobStatus = null
    }
  }

  // 取得錯誤訊息
  const getErrorMessage = (errorType) => {
    const messages = {
      'no_source': '影片檔案不存在於 Netlify Blobs',
      'unsupported': '影片格式不支援或檔案損壞',
      'network': '網路連線問題，無法載入影片',
      'decode': '影片解碼失敗，檔案可能損壞',
      'unknown': '未知錯誤，請檢查 Netlify Blobs 狀態'
    }
    return messages[errorType] || messages.unknown
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
    showCacheMessage,
    loadVideo,
    checkSingleBlobStatus,
    showUploadInstructions,
    clearBlobStatus,
    getErrorMessage
  }
}
