import { ref } from 'vue'

export const useCommonAccounts = () => {
  const supabase = useSupabaseClient()
  const accounts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 載入資料
  const loadAccounts = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('commonaccount')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      
      accounts.value = data || []
    } catch (e) {
      console.error('Error loading common accounts:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // 新增資料
  const addAccount = async (accountData) => {
    try {
      loading.value = true
      
      // 移除 id (如果是新資料)
      const { id, ...payload } = accountData
      
      // 確保空值為 null 或空字串，視需求而定，這裡保留原樣
      
      const { data, error: insertError } = await supabase
        .from('commonaccount')
        .insert([payload])
        .select()

      if (insertError) throw insertError

      if (data) {
        accounts.value.unshift(data[0])
      }
      return { success: true }
    } catch (e) {
      console.error('Error adding common account:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // 更新資料
  const updateAccount = async (id, accountData) => {
    try {
      loading.value = true
      
      // 確保不包含 id 在 update payload 中 (雖然 supabase 會忽略，但為了乾淨)
      const { id: _, created_at: __, ...payload } = accountData

      const { data, error: updateError } = await supabase
        .from('commonaccount')
        .update(payload)
        .eq('id', id)
        .select()

      if (updateError) throw updateError

      if (data) {
        const index = accounts.value.findIndex(a => a.id === id)
        if (index !== -1) {
          accounts.value[index] = data[0]
        }
      }
      return { success: true }
    } catch (e) {
      console.error('Error updating common account:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // 刪除資料
  const deleteAccount = async (id) => {
    try {
      loading.value = true
      const { error: deleteError } = await supabase
        .from('commonaccount')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      accounts.value = accounts.value.filter(a => a.id !== id)
      return { success: true }
    } catch (e) {
      console.error('Error deleting common account:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  return {
    accounts,
    loading,
    error,
    loadAccounts,
    addAccount,
    updateAccount,
    deleteAccount
  }
}
