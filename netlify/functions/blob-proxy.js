// Netlify Blobs 代理函數
import { getStore } from '@netlify/blobs'

export default async (request, context) => {
  const url = new URL(request.url)
  const blobKey = url.pathname.replace('/.netlify/blobs/', '')
  
  try {
    // 獲取 Netlify Blobs store
    const store = getStore('videos')
    
    // 檢查 blob 是否存在
    const blob = await store.get(blobKey)
    
    if (!blob) {
      return new Response('Video not found', { status: 404 })
    }
    
    // 返回影片內容
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Blob proxy error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}