import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  const path = event.context.params?.path
  
  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing path parameter'
    })
  }
  
  // 解碼 URL 編碼的路徑
  const blobKey = decodeURIComponent(path)
  
  console.log('Blob request:', {
    rawPath: path,
    decodedKey: blobKey,
    timestamp: new Date().toISOString()
  })
  
  try {
    const config = useRuntimeConfig()
    
    // 獲取 videos store (預設為影片)
    const store = getStore({
      name: 'videos',
      siteID: config.public.NETLIFY_SITE_ID || process.env.NETLIFY_SITE_ID || '970c7bab-2d0c-46b4-941f-1f7131995a0f',
      token: config.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_AUTH_TOKEN
    })
    
    // 獲取 blob 作為 stream
    const blob = await store.get(blobKey, { type: 'stream' })
    
    if (!blob) {
      console.error('Blob not found:', blobKey)
      throw createError({
        statusCode: 404,
        statusMessage: 'Video not found'
      })
    }
    
    console.log('Blob found (stream)')
    
    // 嘗試獲取 metadata
    let contentLength: string | undefined
    let contentType = 'video/mp4' // 預設為影片
    
    try {
      const metadata = await store.getMetadata(blobKey)
      if (metadata) {
        if (metadata.fileSize) {
          contentLength = metadata.fileSize.toString()
          console.log('Content-Length from metadata:', contentLength)
        }
        if (metadata.contentType) {
          contentType = metadata.contentType
          console.log('Content-Type from metadata:', contentType)
        }
      }
    } catch (metaError) {
      console.log('Could not get metadata')
    }
    
    // 根據檔案副檔名判斷內容類型
    if (blobKey.toLowerCase().endsWith('.mp4')) {
      contentType = 'video/mp4'
    } else if (blobKey.toLowerCase().endsWith('.webm')) {
      contentType = 'video/webm'
    } else if (blobKey.toLowerCase().endsWith('.avi')) {
      contentType = 'video/avi'
    } else if (blobKey.toLowerCase().endsWith('.mov')) {
      contentType = 'video/quicktime'
    }
    
    // 設置響應頭
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*'
    }
    
    if (contentLength) {
      headers['Content-Length'] = contentLength
    }
    
    setResponseHeaders(event, headers)
    
    // 返回 stream
    return blob
    
  } catch (error: any) {
    console.error('Error fetching blob:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch video: ${error.message}`
    })
  }
})