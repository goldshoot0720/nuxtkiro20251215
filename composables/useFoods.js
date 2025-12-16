// composables/useFoods.js
// 食物管理的完整邏輯 - 使用共享狀態
import { ref, computed } from 'vue'
import { createClient } from '@supabase/supabase-js'

// 共享狀態（在模組層級定義，所有組件共用）
const foods = ref([])
const foodLoading = ref(false)
const editingFood = ref(null)
const newFood = ref({
  name: '',
  amount: null,
  price: null,
  shop: '',
  todate: '',
  photo: '',
  photohash: ''
})
let supabase = null
let isInitialized = false

export const useFoods = () => {
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

  // 計算屬性：即將到期的食物（7天內）
  const expiringFoods = computed(() => {
    const today = new Date()
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return foods.value.filter(food => {
      if (!food.todate) return false
      const toDate = new Date(food.todate)
      return toDate <= sevenDaysLater && toDate >= today
    })
  })

  // 計算屬性：排序後的食物（按到期日）
  const sortedFoods = computed(() => {
    return [...foods.value].sort((a, b) => {
      if (!a.todate && !b.todate) return 0
      if (!a.todate) return 1
      if (!b.todate) return -1
      
      const dateA = new Date(a.todate)
      const dateB = new Date(b.todate)
      return dateA - dateB
    })
  })

  // 載入食物資料
  const loadFoods = async () => {
    const client = initSupabase()
    if (!client) return
    
    // 避免重複載入
    if (isInitialized && foods.value.length > 0) return
    
    try {
      foodLoading.value = true
      const { data, error } = await client
        .from('food')
        .select('*')
      
      if (error) throw error
      if (data) {
        foods.value = data
        isInitialized = true
      }
    } catch (error) {
      console.error('載入食物資料失敗:', error)
    } finally {
      foodLoading.value = false
    }
  }

  // 新增食物
  const addFood = async () => {
    const client = initSupabase()
    if (!client) return
    
    // 驗證日期格式
    if (newFood.value.todate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(newFood.value.todate)) {
        alert('請輸入正確的日期格式 (YYYY-MM-DD)')
        return
      }
    }
    
    try {
      foodLoading.value = true
      
      const { data, error } = await client
        .from('food')
        .insert({
          name: newFood.value.name,
          amount: newFood.value.amount || null,
          price: newFood.value.price || null,
          shop: newFood.value.shop || null,
          todate: newFood.value.todate || null,
          photo: newFood.value.photo || null,
          photohash: newFood.value.photohash || null
        })
        .select()
        .single()
      
      if (error) throw error
      
      foods.value.unshift(data)
      resetFoodForm()
      alert('食物新增成功！')
    } catch (error) {
      console.error('新增食物失敗:', error.message)
      alert('新增食物失敗: ' + error.message)
    } finally {
      foodLoading.value = false
    }
  }

  // 編輯食物
  const editFood = (food) => {
    editingFood.value = food
    newFood.value = {
      name: food.name,
      amount: food.amount,
      price: food.price,
      shop: food.shop || '',
      todate: food.todate || '',
      photo: food.photo || '',
      photohash: food.photohash || ''
    }
    
    // 滾動到表單區域
    if (process.client) {
      document.querySelector('.add-food')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // 更新食物
  const updateFood = async () => {
    const client = initSupabase()
    if (!editingFood.value || !client) return
    
    // 驗證日期格式
    if (newFood.value.todate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(newFood.value.todate)) {
        alert('請輸入正確的日期格式 (YYYY-MM-DD)')
        return
      }
    }
    
    try {
      foodLoading.value = true
      
      const { data, error } = await client
        .from('food')
        .update({
          name: newFood.value.name,
          amount: newFood.value.amount || null,
          price: newFood.value.price || null,
          shop: newFood.value.shop || null,
          todate: newFood.value.todate || null,
          photo: newFood.value.photo || null,
          photohash: newFood.value.photohash || null
        })
        .eq('id', editingFood.value.id)
        .select()
        .single()
      
      if (error) throw error
      
      // 更新本地資料
      const index = foods.value.findIndex(f => f.id === editingFood.value.id)
      if (index !== -1) {
        foods.value[index] = data
      }
      
      resetFoodForm()
      alert('食物更新成功！')
    } catch (error) {
      console.error('更新食物失敗:', error.message)
      alert('更新食物失敗: ' + error.message)
    } finally {
      foodLoading.value = false
    }
  }

  // 刪除食物
  const deleteFood = async (id) => {
    const client = initSupabase()
    if (!client) return
    
    if (!confirm('確定要刪除此食物項目嗎？')) return
    
    try {
      foodLoading.value = true
      
      const { error } = await client
        .from('food')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      foods.value = foods.value.filter(f => f.id !== id)
      alert('食物已刪除！')
    } catch (error) {
      console.error('刪除食物失敗:', error.message)
      alert('刪除食物失敗: ' + error.message)
    } finally {
      foodLoading.value = false
    }
  }

  // 重置表單
  const resetFoodForm = () => {
    newFood.value = {
      name: '',
      amount: null,
      price: null,
      shop: '',
      todate: '',
      photo: '',
      photohash: ''
    }
    editingFood.value = null
  }

  return {
    foods,
    foodLoading,
    editingFood,
    newFood,
    expiringFoods,
    sortedFoods,
    loadFoods,
    addFood,
    editFood,
    updateFood,
    deleteFood,
    resetFoodForm
  }
}
