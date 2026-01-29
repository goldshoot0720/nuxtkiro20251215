import { ref } from 'vue'

export const useArticles = () => {
  const supabase = useSupabaseClient()
  const articles = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 載入筆記資料
  const loadArticles = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('article')
        .select('*')
        .order('newDate', { ascending: false }) // 預設按日期降序

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
    try {
      loading.value = true
      
      // 處理資料格式
      const payload = {
        title: articleData.title,
        content: articleData.content,
        newDate: articleData.newDate || new Date().toISOString().split('T')[0],
        url1: articleData.url1 || null,
        url2: articleData.url2 || null,
        url3: articleData.url3 || null,
        file1: articleData.file1 || null,
        file1type: articleData.file1type || null,
        file2: articleData.file2 || null,
        file2type: articleData.file2type || null,
        file3: articleData.file3 || null,
        file3type: articleData.file3type || null
      }

      const { data, error: insertError } = await supabase
        .from('article')
        .insert([payload])
        .select()

      if (insertError) throw insertError

      if (data) {
        articles.value.unshift(data[0])
        // 重新排序
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
    try {
      loading.value = true
      
      const payload = {
        title: articleData.title,
        content: articleData.content,
        newDate: articleData.newDate,
        url1: articleData.url1 || null,
        url2: articleData.url2 || null,
        url3: articleData.url3 || null,
        file1: articleData.file1 || null,
        file1type: articleData.file1type || null,
        file2: articleData.file2 || null,
        file2type: articleData.file2type || null,
        file3: articleData.file3 || null,
        file3type: articleData.file3type || null
      }

      const { data, error: updateError } = await supabase
        .from('article')
        .update(payload)
        .eq('id', id)
        .select()

      if (updateError) throw updateError

      if (data) {
        const index = articles.value.findIndex(a => a.id === id)
        if (index !== -1) {
          articles.value[index] = data[0]
          // 重新排序
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
    try {
      loading.value = true
      const { error: deleteError } = await supabase
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

  return {
    articles,
    loading,
    error,
    loadArticles,
    addArticle,
    updateArticle,
    deleteArticle
  }
}
