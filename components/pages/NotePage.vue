<template>
  <PageContainer>
    <div class="note-page">
      <div class="page-header">
        <h1 class="page-title">📝 鋒兄筆記</h1>
        <p class="page-description">
          記錄生活點滴與重要資訊
        </p>
      </div>

      <!-- 操作區 -->
      <div class="actions-bar">
        <div class="search-box">
          <span class="icon">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="搜尋筆記標題或內容..." class="search-input">
        </div>
        <button class="btn-primary" @click="openAddModal">
          <span class="icon">➕</span> 新增筆記
        </button>
      </div>
      
      <!-- 載入中 -->
      <div v-if="loading && articles.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>載入資料中...</p>
      </div>

      <!-- 筆記列表 -->
      <div v-else class="notes-container">
        <div v-if="filteredArticles.length === 0" class="empty-state">
          <p>沒有找到相關筆記 🍃</p>
        </div>

        <div v-for="article in filteredArticles" :key="article.id" class="note-card">
          <div class="note-header">
            <div class="note-meta">
              <span class="note-date">{{ formatDate(article.newDate) }}</span>
            </div>
            <div class="note-actions">
              <button class="btn-icon" @click="editArticle(article)" title="編輯">✏️</button>
              <button class="btn-icon delete" @click="confirmDelete(article)" title="刪除">🗑️</button>
            </div>
          </div>
          
          <h3 class="note-title">{{ article.title || '無標題' }}</h3>
          
          <div class="note-content">
            <p>{{ article.content }}</p>
          </div>

          <!-- 連結與附件區 -->
          <div class="note-attachments" v-if="hasAttachments(article)">
            <div class="attachment-group" v-if="article.url1 || article.url2 || article.url3">
              <h4>🔗 相關連結</h4>
              <div class="links-list">
                <a v-if="article.url1" :href="article.url1" target="_blank" class="link-item">{{ article.url1 }}</a>
                <a v-if="article.url2" :href="article.url2" target="_blank" class="link-item">{{ article.url2 }}</a>
                <a v-if="article.url3" :href="article.url3" target="_blank" class="link-item">{{ article.url3 }}</a>
              </div>
            </div>

            <div class="attachment-group" v-if="article.file1 || article.file2 || article.file3">
              <h4>📎 附件檔案</h4>
              <div class="files-list">
                <div v-if="article.file1" class="file-item">
                  <span class="file-type">{{ article.file1type || 'FILE' }}</span>
                  <span class="file-name">{{ article.file1 }}</span>
                </div>
                <div v-if="article.file2" class="file-item">
                  <span class="file-type">{{ article.file2type || 'FILE' }}</span>
                  <span class="file-name">{{ article.file2 }}</span>
                </div>
                <div v-if="article.file3" class="file-item">
                  <span class="file-type">{{ article.file3type || 'FILE' }}</span>
                  <span class="file-name">{{ article.file3 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 編輯/新增 Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ isEditing ? '編輯筆記' : '新增筆記' }}</h3>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>標題</label>
              <input v-model="formData.title" type="text" class="form-input" placeholder="請輸入標題">
            </div>

            <div class="form-group">
              <label>日期</label>
              <input v-model="formData.newDate" type="date" class="form-input">
            </div>

            <div class="form-group">
              <label>內容</label>
              <textarea v-model="formData.content" class="form-textarea" rows="6" placeholder="請輸入內容..."></textarea>
            </div>

            <div class="form-section">
              <h4 @click="toggleSection('urls')" class="section-toggle">
                🔗 連結設定 {{ showSection.urls ? '▼' : '▶' }}
              </h4>
              <div v-if="showSection.urls" class="section-content">
                <div class="form-group">
                  <input v-model="formData.url1" type="text" class="form-input mb-2" placeholder="連結 1">
                  <input v-model="formData.url2" type="text" class="form-input mb-2" placeholder="連結 2">
                  <input v-model="formData.url3" type="text" class="form-input" placeholder="連結 3">
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4 @click="toggleSection('files')" class="section-toggle">
                📎 附件設定 {{ showSection.files ? '▼' : '▶' }}
              </h4>
              <div v-if="showSection.files" class="section-content">
                <div class="file-input-group mb-3">
                  <input v-model="formData.file1" type="text" class="form-input" placeholder="檔案 1 名稱/路徑">
                  <input v-model="formData.file1type" type="text" class="form-input small" placeholder="類型">
                </div>
                <div class="file-input-group mb-3">
                  <input v-model="formData.file2" type="text" class="form-input" placeholder="檔案 2 名稱/路徑">
                  <input v-model="formData.file2type" type="text" class="form-input small" placeholder="類型">
                </div>
                <div class="file-input-group">
                  <input v-model="formData.file3" type="text" class="form-input" placeholder="檔案 3 名稱/路徑">
                  <input v-model="formData.file3type" type="text" class="form-input small" placeholder="類型">
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">取消</button>
            <button class="btn-submit" @click="handleSubmit" :disabled="loading">
              {{ loading ? '處理中...' : '確認儲存' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import PageContainer from '../layout/PageContainer.vue'
import { useArticles } from '../../composables/useArticles'

const { 
  articles, 
  loading, 
  loadArticles, 
  addArticle, 
  updateArticle, 
  deleteArticle 
} = useArticles()

// 狀態
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const showSection = reactive({
  urls: false,
  files: false
})

// 表單資料
const formData = reactive({
  id: null,
  title: '',
  content: '',
  newDate: '',
  url1: '',
  url2: '',
  url3: '',
  file1: '',
  file1type: '',
  file2: '',
  file2type: '',
  file3: '',
  file3type: ''
})

// 初始化
onMounted(() => {
  loadArticles()
})

// 搜尋過濾
const filteredArticles = computed(() => {
  if (!searchQuery.value) return articles.value
  
  const query = searchQuery.value.toLowerCase()
  return articles.value.filter(article => 
    (article.title && article.title.toLowerCase().includes(query)) ||
    (article.content && article.content.toLowerCase().includes(query))
  )
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-TW')
}

// 檢查是否有附件
const hasAttachments = (article) => {
  return article.url1 || article.url2 || article.url3 || 
         article.file1 || article.file2 || article.file3
}

// 切換區塊顯示
const toggleSection = (section) => {
  showSection[section] = !showSection[section]
}

// 開啟新增 Modal
const openAddModal = () => {
  isEditing.value = false
  resetForm()
  formData.newDate = new Date().toISOString().split('T')[0]
  showModal.value = true
}

// 開啟編輯 Modal
const editArticle = (article) => {
  isEditing.value = true
  Object.assign(formData, article)
  // 處理日期格式以符合 input type="date"
  if (formData.newDate) {
    formData.newDate = formData.newDate.split('T')[0]
  }
  showModal.value = true
}

// 重置表單
const resetForm = () => {
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
  formData.id = null
  showSection.urls = false
  showSection.files = false
}

// 關閉 Modal
const closeModal = () => {
  showModal.value = false
  resetForm()
}

// 提交表單
const handleSubmit = async () => {
  if (!formData.title && !formData.content) {
    alert('請至少輸入標題或內容')
    return
  }

  let result
  if (isEditing.value) {
    result = await updateArticle(formData.id, formData)
  } else {
    result = await addArticle(formData)
  }

  if (result.success) {
    closeModal()
  } else {
    alert('儲存失敗: ' + result.error)
  }
}

// 確認刪除
const confirmDelete = async (article) => {
  if (confirm(`確定要刪除這則筆記嗎？\n標題: ${article.title || '(無標題)'}`)) {
    await deleteArticle(article.id)
  }
}

// SEO
useHead({
  title: '鋒兄筆記 - 鋒兄管理系統',
  meta: [
    { name: 'description', content: '記錄生活點滴與重要資訊' }
  ]
})
</script>

<style scoped>
.note-page {
  animation: fadeIn 0.3s ease-in;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  border-radius: 12px;
  color: #333;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.8;
  margin-bottom: 0;
}

.actions-bar {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box .icon {
  position: absolute;
  left: 12px;
  color: #999;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #a8edea;
  box-shadow: 0 0 0 3px rgba(168, 237, 234, 0.3);
}

.notes-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 769px) {
  .notes-container {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

.note-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #a8edea;
  display: flex;
  flex-direction: column;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.note-date {
  font-size: 0.85rem;
  color: #888;
  background: #f5f5f5;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
}

.note-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.2s;
}

.btn-icon:hover {
  opacity: 1;
  background: #f0f0f0;
}

.btn-icon.delete:hover {
  background: #fee2e2;
}

.note-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.note-content {
  flex: 1;
  color: #555;
  line-height: 1.6;
  font-size: 0.95rem;
  white-space: pre-wrap;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.note-attachments {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px dashed #eee;
  font-size: 0.9rem;
}

.attachment-group h4 {
  font-size: 0.9rem;
  color: #666;
  margin: 0.5rem 0;
}

.links-list, .files-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.link-item {
  color: #4a90e2;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.link-item:hover {
  text-decoration: underline;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f9f9f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.file-type {
  font-size: 0.7rem;
  background: #ddd;
  color: #555;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  text-transform: uppercase;
}

.file-name {
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Modal & Form Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #a8edea;
  box-shadow: 0 0 0 3px rgba(168, 237, 234, 0.3);
}

.form-section {
  margin-top: 1.5rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.section-toggle {
  cursor: pointer;
  user-select: none;
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-toggle:hover {
  color: #333;
}

.file-input-group {
  display: flex;
  gap: 0.5rem;
}

.form-input.small {
  width: 80px;
  flex-shrink: 0;
}

.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }

.btn-primary {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #444;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-submit {
  background: #a8edea;
  color: #444;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
}

.btn-cancel {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.loading-state {
  text-align: center;
  padding: 4rem;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #a8edea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #888;
  font-size: 1.1rem;
  background: #f9f9f9;
  border-radius: 12px;
  grid-column: 1 / -1;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
