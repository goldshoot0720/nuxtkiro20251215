// 上傳影片到 Netlify Blobs 的腳本
import { getStore } from '@netlify/blobs'
import { readFile } from 'fs/promises'
import { join } from 'path'

async function uploadVideos() {
  try {
    // 獲取 Netlify Blobs store
    const store = getStore('videos')
    
    // 影片檔案對應
    const videos = {
      '19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4': './videos/legend.mp4',
      'clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4': './videos/evolution.mp4'
    }
    
    for (const [blobKey, localPath] of Object.entries(videos)) {
      try {
        console.log(`上傳 ${localPath} 到 ${blobKey}...`)
        
        // 讀取本地影片檔案
        const videoBuffer = await readFile(localPath)
        
        // 上傳到 Netlify Blobs
        await store.set(blobKey, videoBuffer, {
          metadata: {
            contentType: 'video/mp4',
            uploadedAt: new Date().toISOString()
          }
        })
        
        console.log(`✅ ${blobKey} 上傳成功`)
      } catch (error) {
        console.error(`❌ ${blobKey} 上傳失敗:`, error.message)
      }
    }
    
    console.log('影片上傳完成！')
  } catch (error) {
    console.error('上傳過程發生錯誤:', error)
  }
}

// 執行上傳
uploadVideos()