// composables/useSubscriptions.js
// 訂閱管理的完整邏輯 - 使用共享狀態
import { ref, computed } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseCredentials } from './useSettings'

// 共享狀態（在模組層級定義，所有組件共用）
const subscriptions = ref([])
const subscriptionLoading = ref(false)
const editingSubscription = ref(null)
const newSubscription = ref({
  name: '',
  site: '',
  account: '',
  price: null,
  nextdate: '',
  note: ''
})
let supabase = null
let isInitialized = false
let currentCredentials = null // 記錄當前使用的認證

export const useSubscriptions = () => {
  // 初始化 Supabase（優先使用 localStorage 設定）
  const initSupabase = () => {
    if (!process.client) return null
    
    // 檢查認證是否變更
    const creds = getSupabaseCredentials()
    const config = useRuntimeConfig()
    
    // 決定使用哪個認證
    const url = creds?.url || config.public.supabaseUrl
    const key = creds?.key || config.public.supabaseAnonKey
    const credKey = `${url}:${key?.slice(0, 20)}`
    
    // 如果認證變更，重新建立客戶端並重置資料
    if (supabase && currentCredentials !== credKey) {
      console.log('Supabase 認證變更，重新初始化...')
      supabase = null
      isInitialized = false
      subscriptions.value = []
    }
    
    if (!supabase) {
      supabase = createClient(url, key)
      currentCredentials = credKey
      console.log('Supabase 客戶端已初始化:', creds ? 'localStorage' : '.env')
    }
    
    return supabase
  }

  // 計算屬性：每月總費用
  const totalMonthlyCost = computed(() => {
    return subscriptions.value.reduce((total, sub) => total + (sub.price || 0), 0)
  })

  // 計算屬性：排序後的訂閱（按下次扣款日期）
  const sortedSubscriptions = computed(() => {
    return [...subscriptions.value].sort((a, b) => {
      if (!a.nextdate && !b.nextdate) return 0
      if (!a.nextdate) return 1
      if (!b.nextdate) return -1
      
      const dateA = new Date(a.nextdate)
      const dateB = new Date(b.nextdate)
      return dateA - dateB
    })
  })

  // 載入訂閱資料
  const loadSubscriptions = async () => {
    const client = initSupabase()
    if (!client) return
    
    // 避免重複載入
    if (isInitialized && subscriptions.value.length > 0) return
    
    try {
      subscriptionLoading.value = true
      const { data, error } = await client
        .from('subscription')
        .select('*')
      
      if (error) throw error
      if (data) {
        subscriptions.value = data
        isInitialized = true
      }
    } catch (error) {
      console.error('載入訂閱資料失敗:', error)
    } finally {
      subscriptionLoading.value = false
    }
  }

  // 新增訂閱
  const addSubscription = async () => {
    const client = initSupabase()
    if (!client) return
    
    // 驗證日期格式
    if (newSubscription.value.nextdate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(newSubscription.value.nextdate)) {
        alert('請輸入正確的日期格式 (YYYY-MM-DD)')
        return
      }
    }
    
    try {
      subscriptionLoading.value = true
      
      const { data, error } = await client
        .from('subscription')
        .insert({
          name: newSubscription.value.name,
          site: newSubscription.value.site || null,
          account: newSubscription.value.account || null,
          price: newSubscription.value.price || null,
          nextdate: newSubscription.value.nextdate || null,
          note: newSubscription.value.note || null
        })
        .select()
        .single()
      
      if (error) throw error
      
      subscriptions.value.unshift(data)
      resetSubscriptionForm()
      alert('訂閱已新增成功！')
    } catch (error) {
      console.error('新增訂閱失敗:', error.message)
      alert('新增訂閱失敗: ' + error.message)
    } finally {
      subscriptionLoading.value = false
    }
  }

  // 編輯訂閱
  const editSubscription = (subscription) => {
    editingSubscription.value = subscription
    newSubscription.value = {
      name: subscription.name,
      site: subscription.site || '',
      account: subscription.account || '',
      price: subscription.price,
      nextdate: subscription.nextdate || '',
      note: subscription.note || ''
    }
    
    // 滾動到表單區域
    if (process.client) {
      document.querySelector('.add-subscription')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // 更新訂閱
  const updateSubscription = async () => {
    const client = initSupabase()
    if (!editingSubscription.value || !client) return
    
    // 驗證日期格式
    if (newSubscription.value.nextdate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(newSubscription.value.nextdate)) {
        alert('請輸入正確的日期格式 (YYYY-MM-DD)')
        return
      }
    }
    
    try {
      subscriptionLoading.value = true
      
      const { data, error } = await client
        .from('subscription')
        .update({
          name: newSubscription.value.name,
          site: newSubscription.value.site || null,
          account: newSubscription.value.account || null,
          price: newSubscription.value.price || null,
          nextdate: newSubscription.value.nextdate || null,
          note: newSubscription.value.note || null
        })
        .eq('id', editingSubscription.value.id)
        .select()
        .single()
      
      if (error) throw error
      
      // 更新本地資料
      const index = subscriptions.value.findIndex(s => s.id === editingSubscription.value.id)
      if (index !== -1) {
        subscriptions.value[index] = data
      }
      
      resetSubscriptionForm()
      alert('訂閱已更新成功！')
    } catch (error) {
      console.error('更新訂閱失敗:', error.message)
      alert('更新訂閱失敗: ' + error.message)
    } finally {
      subscriptionLoading.value = false
    }
  }

  // 刪除訂閱
  const deleteSubscription = async (id) => {
    const client = initSupabase()
    if (!client) return
    
    if (!confirm('確定要刪除此訂閱項目嗎？')) return
    
    try {
      subscriptionLoading.value = true
      
      const { error } = await client
        .from('subscription')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      subscriptions.value = subscriptions.value.filter(s => s.id !== id)
      alert('訂閱已刪除！')
    } catch (error) {
      console.error('刪除訂閱失敗:', error.message)
      alert('刪除訂閱失敗: ' + error.message)
    } finally {
      subscriptionLoading.value = false
    }
  }

  // 重置表單
  const resetSubscriptionForm = () => {
    newSubscription.value = {
      name: '',
      site: '',
      account: '',
      price: null,
      nextdate: '',
      note: ''
    }
    editingSubscription.value = null
  }

  // 檢測是否為 Appwrite 格式（ISO 8601 日期）
  const isAppwriteFormat = (rows) => {
    if (!rows || rows.length === 0) return false
    const firstRow = rows[0]
    // Appwrite 格式的日期包含 'T'
    const hasIsoDate = firstRow.nextdate && firstRow.nextdate.includes('T')
    return hasIsoDate
  }

  // 驗證日期格式（YYYY-MM-DD 或 ISO 8601）
  const isValidDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return false
    // 接受 YYYY-MM-DD 或 ISO 8601 格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T.*)?$/
    return dateRegex.test(dateStr)
  }

  // 轉換 ISO 8601 日期格式為簡單日期
  const convertAppwriteDate = (isoDate) => {
    if (!isoDate) return null
    if (isoDate.includes('T')) {
      return isoDate.split('T')[0]
    }
    return isoDate
  }

  // 批次匯入訂閱
  const importSubscriptions = async (rows) => {
    const client = initSupabase()
    if (!client) return { success: false, error: '無法連接資料庫' }
    
    try {
      subscriptionLoading.value = true
      
      // 檢測格式
      const isAppwrite = isAppwriteFormat(rows)
      console.log('Import format - isAppwrite:', isAppwrite)
      console.log('First row:', rows[0])
      
      const payload = rows.map((r, idx) => {
        // 處理日期格式
        let nextdate = r.nextdate || null
        
        // 驗證日期格式，無效則設為 null
        if (nextdate && !isValidDate(nextdate)) {
          console.warn(`Row ${idx}: Invalid date format "${nextdate}", setting to null`)
          nextdate = null
        } else if (nextdate && nextdate.includes('T')) {
          // 轉換 ISO 8601 格式
          nextdate = convertAppwriteDate(nextdate)
        }
        
        const record = {
          name: r.name || '',
          site: r.site || null,
          account: r.account || null,
          price: Number(r.price || 0) || null,
          nextdate: nextdate,
          note: r.note || null
        }
        
        if (idx === 0) console.log('First payload record:', record)
        return record
      }).filter(r => r.name)
      
      if (payload.length === 0) return { success: false, error: '無有效資料' }
      
      console.log('Inserting', payload.length, 'records')
      const { data, error } = await client.from('subscription').insert(payload).select()
      if (error) throw error
      
      subscriptions.value.push(...data)
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
      subscriptionLoading.value = false
    }
  }

  return {
    subscriptions,
    subscriptionLoading,
    editingSubscription,
    newSubscription,
    totalMonthlyCost,
    sortedSubscriptions,
    loadSubscriptions,
    addSubscription,
    importSubscriptions,
    isAppwriteFormat,
    editSubscription,
    updateSubscription,
    deleteSubscription,
    resetSubscriptionForm
  }
}
