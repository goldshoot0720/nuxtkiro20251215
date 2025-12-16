// Netlify Blobs 代理函數
import { getStore } from '@netlify/blobs'

export default async (request) => {
  const url = new URL(request.url)
  // 從 URL 路徑中提取 blob key
  const blobKey = url.pathname.replace('/api/blobs/', '')
  
  console.log('Blob proxy request:', { 
    method: request.method,
    pathname: url.pathname, 
    blobKey, 
    timestamp: new Date().toISOString() 
  })
  
  try {
    // 驗證 blob key
    if (!blobKey || blobKey.trim() === '') {
      console.error('Invalid blob key:', blobKey)
      return new Response('Invalid blob key', { status: 400 })
    }
    
    // 獲取 Netlify Blobs store
    const store = getStore('videos')
    
    // 獲取 blob 作為 stream
    console.log('Fetching blob as stream:', blobKey)
    const blob = await store.get(blobKey, { type: 'stream' })
    
    if (!blob) {
      console.error('Blob not found:', blobKey)
      return new Response('Video not found', { status: 404 })
    }
    
    console.log('Blob stream found!')
    
    // 嘗試獲取元數據來確定文件大小
    let contentLength = null
    try {
      const metadata = await store.getMetadata(blobKey)
      if (metadata && metadata.fileSize) {
        contentLength = metadata.fileSize.toString()
        console.log('Content-Length from metadata:', contentLength)
      }
    } catch (metaError) {
      console.log('Could not get metadata:', metaError.message)
    }
    
    // 構建響應頭
    const headers = {
      'Content-Type': 'video/mp4',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
      'Accept-Ranges': 'bytes'
    }
    
    // 如果有內容長度，添加到頭部
    if (contentLength) {
      headers['Content-Length'] = contentLength
    }
    
    console.log('Returning blob stream with headers:', headers)
    
    // 返回 stream
    return new Response(blob, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('Blob proxy error:', error)
    return new Response(`Internal server error: ${error.message}`, { status: 500 })
  }
}