import { ref } from 'vue'

export const useBanks = () => {
  const supabase = useSupabaseClient()
  const banks = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 預設銀行列表
  const defaultBankNames = [
    '台北富邦',
    '國泰世華',
    '兆豐銀行',
    '王道銀行',
    '新光銀行',
    '中華郵政',
    '玉山銀行',
    '中國信託',
    '台新銀行'
  ]

  // 銀行 Favicon 對照表
  const bankFavicons = {
    '台北富邦': 'https://www.fubon.com/favicon.ico',
    '國泰世華': 'https://www.cathaybk.com.tw/favicon.ico',
    '兆豐銀行': 'https://www.megabank.com.tw/favicon.ico',
    '王道銀行': 'https://www.o-bank.com/favicon.ico',
    '新光銀行': 'https://www.skbank.com.tw/favicon.ico',
    '中華郵政': 'https://www.post.gov.tw/favicon.ico',
    '玉山銀行': 'https://www.esunbank.com.tw/favicon.ico',
    '中國信託': 'https://www.ctbcbank.com/favicon.ico',
    '台新銀行': 'https://www.taishinbank.com.tw/favicon.ico'
  }

  // 取得銀行 Favicon
  const getBankFavicon = (bankName) => {
    return bankFavicons[bankName] || null
  }

  // 載入銀行資料
  const loadBanks = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('bank')
        .select('*')
        .order('id', { ascending: true })

      if (fetchError) throw fetchError
      
      banks.value = data || []
    } catch (e) {
      console.error('Error loading banks:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // 新增銀行資料
  const addBank = async (bankData) => {
    try {
      loading.value = true
      // 確保數值型別正確，移除 id 欄位讓資料庫自動生成
      const payload = {
        name: bankData.name,
        deposit: Number(bankData.deposit) || 0,
        withdrawals: Number(bankData.withdrawals) || 0,
        transfer: Number(bankData.transfer) || 0,
        site: bankData.site || null,
        address: bankData.address || null,
        activity: bankData.activity || null,
        card: bankData.card || null,
        account: bankData.account || null,
        created_at: new Date().toISOString()
      }

      const { data, error: insertError } = await supabase
        .from('bank')
        .insert([payload])
        .select()

      if (insertError) throw insertError

      if (data) {
        banks.value.push(data[0])
      }
      return { success: true }
    } catch (e) {
      console.error('Error adding bank:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // 更新銀行資料
  const updateBank = async (id, bankData) => {
    try {
      loading.value = true
      // 只更新需要的欄位，不包含 id 和 created_at
      const payload = {
        name: bankData.name,
        deposit: Number(bankData.deposit) || 0,
        withdrawals: Number(bankData.withdrawals) || 0,
        transfer: Number(bankData.transfer) || 0,
        site: bankData.site || null,
        address: bankData.address || null,
        activity: bankData.activity || null,
        card: bankData.card || null,
        account: bankData.account || null
      }

      const { data, error: updateError } = await supabase
        .from('bank')
        .update(payload)
        .eq('id', id)
        .select()

      if (updateError) throw updateError

      if (data) {
        const index = banks.value.findIndex(b => b.id === id)
        if (index !== -1) {
          banks.value[index] = data[0]
        }
      }
      return { success: true }
    } catch (e) {
      console.error('Error updating bank:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // 刪除銀行資料
  const deleteBank = async (id) => {
    try {
      loading.value = true
      const { error: deleteError } = await supabase
        .from('bank')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      banks.value = banks.value.filter(b => b.id !== id)
      return { success: true }
    } catch (e) {
      console.error('Error deleting bank:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // 批量新增預設銀行
  const initDefaultBanks = async () => {
    try {
      loading.value = true
      const newBanks = defaultBankNames.map(name => ({
        name,
        deposit: 0,
        withdrawals: 0,
        transfer: 0,
        created_at: new Date().toISOString()
      }))

      const { data, error: insertError } = await supabase
        .from('bank')
        .insert(newBanks)
        .select()

      if (insertError) throw insertError

      if (data) {
        banks.value = [...banks.value, ...data]
      }
      return { success: true }
    } catch (e) {
      console.error('Error initializing default banks:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  // 計算總資產
  const totalAssets = computed(() => {
    return banks.value.reduce((sum, bank) => sum + (Number(bank.deposit) || 0), 0)
  })

  return {
    banks,
    loading,
    error,
    defaultBankNames,
    bankFavicons,
    getBankFavicon,
    loadBanks,
    addBank,
    updateBank,
    deleteBank,
    initDefaultBanks,
    totalAssets
  }
}
