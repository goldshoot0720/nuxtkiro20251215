import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseCredentials } from './useSettings'

// 共享狀態
let supabase = null
let currentCredentials = null

// 初始化 Supabase（優先使用 localStorage 設定）
const initSupabase = () => {
  if (typeof window === 'undefined') return null
  
  const creds = getSupabaseCredentials()
  const config = useRuntimeConfig()
  
  const url = creds?.url || config.public.supabaseUrl
  const key = creds?.key || config.public.supabaseAnonKey
  const credKey = `${url}:${key?.slice(0, 20)}`
  
  if (supabase && currentCredentials !== credKey) {
    supabase = null
  }
  
  if (!supabase) {
    supabase = createClient(url, key)
    currentCredentials = credKey
  }
  
  return supabase
}

export const useArticles = () => {
  const articles = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 載入筆記資料
  const loadArticles = async () => {
    const client = initSupabase()
    if (!client) return
    
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await client
        .from('article')
        .select('*')
        .order('newDate', { ascending: false })

      if (fetchError) throw fetchError
      
      articles.value = data || []
    } catch (e) {
      console.error('Error loading articles:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // 新增筆記
  const addArticle = async (articleData) => {
    const client = initSupabase()
    if (!client) return { success: false, error: 'No client' }
    
    try {
      loading.value = true
      
      const payload = {
        title: articleData.title,
        content: articleData.content,
        category: articleData.category || null,
        ref: articleData.ref || null,
        newDate: articleData.newDate || new Date().toISOString().split('T')[0],
        url1: articleData.url1 || null,
        url2: articleData.url2 || null,
        url3: articleData.url3 || null,
        file1: articleData.file1 || null,
        file1name: articleData.file1name || null,
        file1type: articleData.file1type || null,
        file2: articleData.file2 || null,
        file2name: articleData.file2name || null,
        file2type: articleData.file2type || null,
        file3: articleData.file3 || null,
        file3name: articleData.file3name || null,
        file3type: articleData.file3type || null
      }

      const { data, error: insertError } = await client
        .from('article')
        .insert([payload])
        .select()

      if (insertError) throw insertError

      if (data) {
        articles.value.unshift(data[0])
        articles.value.sort((a, b) => new Date(b.newDate) - new Date(a.newDate))
      }
      return { success: true }
    } catch (e) {
      console.error('Error adding article:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // 更新筆記
  const updateArticle = async (id, articleData) => {
    const client = initSupabase()
    if (!client) return { success: false, error: 'No client' }
    
    try {
      loading.value = true
      
      const payload = {
        title: articleData.title,
        content: articleData.content,
        category: articleData.category || null,
        ref: articleData.ref || null,
        newDate: articleData.newDate,
        url1: articleData.url1 || null,
        url2: articleData.url2 || null,
        url3: articleData.url3 || null,
        file1: articleData.file1 || null,
        file1name: articleData.file1name || null,
        file1type: articleData.file1type || null,
        file2: articleData.file2 || null,
        file2name: articleData.file2name || null,
        file2type: articleData.file2type || null,
        file3: articleData.file3 || null,
        file3name: articleData.file3name || null,
        file3type: articleData.file3type || null
      }

      const { data, error: updateError } = await client
        .from('article')
        .update(payload)
        .eq('id', id)
        .select()

      if (updateError) throw updateError

      if (data) {
        const index = articles.value.findIndex(a => a.id === id)
        if (index !== -1) {
          articles.value[index] = data[0]
          articles.value.sort((a, b) => new Date(b.newDate) - new Date(a.newDate))
        }
      }
      return { success: true }
    } catch (e) {
      console.error('Error updating article:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // 刪除筆記
  const deleteArticle = async (id) => {
    const client = initSupabase()
    if (!client) return { success: false, error: 'No client' }
    
    try {
      loading.value = true
      const { error: deleteError } = await client
        .from('article')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      articles.value = articles.value.filter(a => a.id !== id)
      return { success: true }
    } catch (e) {
      console.error('Error deleting article:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // 檢測是否為 Appwrite 格式（ISO 8601 日期）
  const isAppwriteFormat = (rows) => {
    if (!rows || rows.length === 0) return false
    const firstRow = rows[0]
    const hasIsoDate = firstRow.newDate && firstRow.newDate.includes('T')
    return hasIsoDate
  }

  // 轉換 ISO 8601 日期格式為簡單日期
  const convertAppwriteDate = (isoDate) => {
    if (!isoDate) return null
    if (isoDate.includes('T')) {
      return isoDate.split('T')[0]
    }
    return isoDate
  }

  // 批次匯入筆記
  const importArticles = async (rows) => {
    const client = initSupabase()
    if (!client) return { success: false, error: '無法連接資料庫' }
    
    try {
      loading.value = true
      
      const isAppwrite = isAppwriteFormat(rows)
      console.log('Import format - isAppwrite:', isAppwrite)
      
      const payload = rows.map((r) => {
        let newDate = r.newDate || null
        if (newDate && newDate.includes('T')) {
          newDate = convertAppwriteDate(newDate)
        }
        
        return {
          title: r.title || '',
          content: r.content || '',
          category: r.category || null,
          ref: r.ref || null,
          newDate: newDate,
          url1: r.url1 || null,
          url2: r.url2 || null,
          url3: r.url3 || null,
          file1: r.file1 || null,
          file1name: r.file1name || null,
          file1type: r.file1type || null,
          file2: r.file2 || null,
          file2name: r.file2name || null,
          file2type: r.file2type || null,
          file3: r.file3 || null,
          file3name: r.file3name || null,
          file3type: r.file3type || null
        }
      }).filter(r => r.title || r.content)
      
      if (payload.length === 0) return { success: false, error: '無有效資料' }
      
      console.log('Inserting', payload.length, 'articles')
      const { data, error: insertError } = await client.from('article').insert(payload).select()
      if (insertError) throw insertError
      
      articles.value.push(...data)
      articles.value.sort((a, b) => new Date(b.newDate) - new Date(a.newDate))
      
      return { 
        success: true, 
        count: data.length,
        isAppwrite: isAppwrite,
        message: isAppwrite ? '已轉換 ISO 8601 日期格式並匯入' : '匯入成功'
      }
    } catch (e) {
      console.error('Import error:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  return {
    articles,
    loading,
    error,
    loadArticles,
    addArticle,
    updateArticle,
    deleteArticle,
    importArticles,
    isAppwriteFormat
  }
}
