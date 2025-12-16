// composables/useSubscriptions.js
// 訂閱管理的完整邏輯 - 使用共享狀態
import { ref, computed } from 'vue'
import { createClient } from '@supabase/supabase-js'

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

export const useSubscriptions = () => {
  // 初始化 Supabase（只執行一次）
  const initSupabase = () => {
    if (!supabase && process.client) {
      const config = useRuntimeConfig()
      supabase = createClient(
        config.public.supabaseUrl,
        config.public.supabaseAnonKey
      )
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

  return {
    subscriptions,
    subscriptionLoading,
    editingSubscription,
    newSubscription,
    totalMonthlyCost,
    sortedSubscriptions,
    loadSubscriptions,
    addSubscription,
    editSubscription,
    updateSubscription,
    deleteSubscription,
    resetSubscriptionForm
  }
}
