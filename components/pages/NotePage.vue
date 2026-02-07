<template>
  <PageContainer>
    <div class="note-page">
      <!-- 操作區 -->
      <div class="actions-bar">
        <div class="search-box">
          <span class="icon">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="搜尋筆記標題或內容..." class="search-input">
        </div>
        <div class="action-buttons">
          <div class="csv-actions">
            <button v-if="articles.length > 0" @click="exportArticlesCsv" class="btn-export">
              <span class="icon">📤</span> 匯出 CSV
            </button>
            <button @click="$refs.csvFileInput.click()" class="btn-import">
              <span class="icon">📥</span> 匯入 CSV
            </button>
            <input
              ref="csvFileInput"
              type="file"
              accept=".csv"
              style="display:none"
              @change="handleImportCsv"
            >
          </div>
          <button class="btn-primary" @click="openAddModal">
            <span class="icon">➕</span> 新增筆記
          </button>
        </div>
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
              <span class="note-date">{{ formatDate(article.newdate) }}</span>
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
                <template v-for="n in 3" :key="'file' + n">
                  <div v-if="article['file' + n]" class="file-item-card">
                    <!-- 圖片預覽 -->
                    <img
                      v-if="isImageType(article['file' + n + 'type'])"
                      :src="article['file' + n]"
                      :alt="article['file' + n + 'name'] || '附件'"
                      class="file-preview-img"
                      @click="openPreview(article['file' + n])"
                    />
                    <!-- 非圖片檔案 -->
                    <div v-else class="file-icon-box">📄</div>
                    <div class="file-detail">
                      <span class="file-name">{{ article['file' + n + 'name'] || '附件 ' + n }}</span>
                      <span class="file-type">{{ article['file' + n + 'type'] || 'FILE' }}</span>
                    </div>
                    <a :href="article['file' + n]" target="_blank" class="btn-download" title="開啟/下載">⬇️</a>
                  </div>
                </template>
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
              <input v-model="formData.newdate" type="date" class="form-input">
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
                📎 附件設定 (最多 3 個) {{ showSection.files ? '▼' : '▶' }}
              </h4>
              <div v-if="showSection.files" class="section-content">
                <div v-for="n in 3" :key="n" class="attachment-upload-item" :class="{ 'mb-3': n < 3 }">
                  <label class="attachment-label">附件 {{ n }}</label>
                  <!-- 已上傳預覽 -->
                  <div v-if="formData['file' + n]" class="attachment-preview">
                    <div class="attachment-preview-content">
                      <img
                        v-if="isImageType(formData['file' + n + 'type'])"
                        :src="formData['file' + n]"
                        alt="附件預覽"
                        class="attachment-thumb"
                      />
                      <div v-else class="attachment-file-icon">📄</div>
                      <div class="attachment-info">
                        <span class="attachment-name">{{ formData['file' + n + 'name'] || '已上傳' }}</span>
                        <span class="attachment-type-badge">{{ formData['file' + n + 'type'] || 'FILE' }}</span>
                      </div>
                    </div>
                    <button type="button" class="btn-remove-attachment" @click="removeAttachment(n)">✕</button>
                  </div>
                  <!-- 上傳區域 -->
                  <div v-else class="attachment-drop-zone" @click="triggerFileInput(n)" @dragover.prevent @drop.prevent="handleFileDrop($event, n)">
                    <span class="drop-icon">📎</span>
                    <span class="drop-text">點擊或拖曳上傳</span>
                  </div>
                  <input
                    :ref="el => { if (el) fileInputRefs[n] = el }"
                    type="file"
                    style="display:none"
                    @change="handleFileUpload($event, n)"
                  >
                  <!-- 上傳進度 -->
                  <div v-if="uploadingSlot === n" class="attachment-progress">
                    <div class="progress-bar"><div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div></div>
                    <span class="progress-text">上傳中...</span>
                  </div>
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
      <!-- 圖片預覽 Lightbox -->
      <div v-if="previewUrl" class="lightbox-overlay" @click="previewUrl = null">
        <div class="lightbox-content" @click.stop>
          <button class="lightbox-close" @click="previewUrl = null">✕</button>
          <img :src="previewUrl" alt="預覽" class="lightbox-img" />
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import PageContainer from '../layout/PageContainer.vue'
import { useArticles } from '../../composables/useArticles'
import { useStorage } from '../../composables/useStorage'

const {
  articles,
  loading,
  loadArticles,
  addArticle,
  updateArticle,
  deleteArticle,
  importArticles,
  isAppwriteFormat
} = useArticles()

const { uploading, uploadProgress, uploadFile } = useStorage()

// 狀態
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const uploadingSlot = ref(null)
const previewUrl = ref(null)
const fileInputRefs = {}
const showSection = reactive({
  urls: false,
  files: false
})

// 表單資料
const formData = reactive({
  id: null,
  title: '',
  content: '',
  newdate: '',
  url1: '',
  url2: '',
  url3: '',
  file1: '',
  file1name: '',
  file1type: '',
  file2: '',
  file2name: '',
  file2type: '',
  file3: '',
  file3name: '',
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
  formData.newdate = new Date().toISOString().split('T')[0]
  showModal.value = true
}

// 開啟編輯 Modal
const editArticle = (article) => {
  isEditing.value = true
  Object.assign(formData, article)
  // 處理日期格式以符合 input type="date"
  if (formData.newdate) {
    formData.newdate = formData.newdate.split('T')[0]
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

// CSV 匯出
const exportArticlesCsv = () => {
  const header = ['title', 'content', 'category', 'ref', 'newdate', 'url1', 'url2', 'url3', 'file1', 'file1name', 'file1type', 'file2', 'file2name', 'file2type', 'file3', 'file3name', 'file3type']
  const rows = articles.value.map(a => [
    a.title || '',
    a.content || '',
    a.category || '',
    a.ref || '',
    a.newdate || '',
    a.url1 || '',
    a.url2 || '',
    a.url3 || '',
    a.file1 || '',
    a.file1name || '',
    a.file1type || '',
    a.file2 || '',
    a.file2name || '',
    a.file2type || '',
    a.file3 || '',
    a.file3name || '',
    a.file3type || ''
  ])
  const bom = '\uFEFF'
  const csvContent = bom + [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'supabase-article.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const csvFileInput = ref(null)

const parseCsv = (text) => {
  const parseRow = (line) => {
    const cells = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    cells.push(current.trim())
    return cells
  }
  
  const splitIntoRows = (text) => {
    const rows = []
    let current = ''
    let inQuotes = false
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      if (char === '"') {
        inQuotes = !inQuotes
        current += char
      } else if (char === '\n' && !inQuotes) {
        if (current.trim()) rows.push(current)
        current = ''
      } else {
        current += char
      }
    }
    if (current.trim()) rows.push(current)
    return rows
  }
  
  const lines = splitIntoRows(text)
  if (lines.length < 2) return []
  
  const headers = parseRow(lines[0])
  console.log('CSV Headers:', headers)
  
  return lines.slice(1).map((line, idx) => {
    const cells = parseRow(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = cells[i] || '' })
    if (idx === 0) console.log('First row parsed:', obj)
    return obj
  })
}

const handleImportCsv = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const text = await file.text()
  let rows = parseCsv(text)
  if (rows.length === 0) { alert('CSV 檔案無有效資料'); return }

  // 偵測 Appwrite 格式（有 $id, $createdAt 等系統欄位）
  const firstRow = rows[0]
  const isAppwrite = '$id' in firstRow || '$createdAt' in firstRow || '$collectionId' in firstRow

  if (isAppwrite) {
    console.log('偵測到 Appwrite CSV 格式，自動轉換欄位')
    rows = rows.map(r => {
      const mapped = {}
      for (const [key, value] of Object.entries(r)) {
        if (key.startsWith('$')) {
          // $createdAt 對應 newdate（Supabase 全小寫）
          if (key === '$createdAt' && !r.newDate && !r.newdate) {
            mapped.newdate = value
          }
          // 其他 $ 開頭系統欄位跳過
          continue
        }
        // Appwrite 的 newDate (camelCase) → Supabase 的 newdate (lowercase)
        if (key === 'newDate') {
          mapped.newdate = value
        } else {
          mapped[key] = value
        }
      }
      return mapped
    })
  }

  const hasIsoDate = isAppwrite || isAppwriteFormat(rows)
  let confirmMsg = `確定匯入 ${rows.length} 筆筆記資料？`
  if (isAppwrite) {
    confirmMsg = `ℹ️ 偵測到 Appwrite CSV 格式

已自動移除系統欄位（$id, $createdAt...）
日期格式將自動轉換（ISO 8601 → YYYY-MM-DD）

確定匯入 ${rows.length} 筆筆記資料？`
  } else if (hasIsoDate) {
    confirmMsg = `ℹ️ 偵測到 ISO 8601 日期格式

系統將自動轉換日期格式（ISO 8601 → YYYY-MM-DD）

確定匯入 ${rows.length} 筆筆記資料？`
  }

  if (!confirm(confirmMsg)) return

  const result = await importArticles(rows)
  if (result.success) {
    let msg = `✅ ${result.message}！共 ${result.count} 筆資料`
    alert(msg)
  } else {
    alert('匯入失敗: ' + result.error)
  }
  e.target.value = ''
}

// 判斷是否為圖片類型
const isImageType = (type) => {
  if (!type) return false
  const t = type.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(t)
}

// 取得檔案副檔名
const getFileExt = (filename) => {
  if (!filename) return ''
  return filename.split('.').pop().toLowerCase()
}

// 觸發檔案選擇
const triggerFileInput = (slot) => {
  fileInputRefs[slot]?.click()
}

// 上傳檔案
const handleFileUpload = async (e, slot) => {
  const file = e.target.files?.[0]
  if (!file) return
  uploadingSlot.value = slot
  const result = await uploadFile(file, 'article')
  if (result.success) {
    formData['file' + slot] = result.url
    formData['file' + slot + 'name'] = file.name
    formData['file' + slot + 'type'] = getFileExt(file.name)
  } else {
    alert('上傳失敗: ' + result.error)
  }
  uploadingSlot.value = null
  e.target.value = ''
}

// 拖曳上傳
const handleFileDrop = async (e, slot) => {
  const file = e.dataTransfer.files?.[0]
  if (!file) return
  uploadingSlot.value = slot
  const result = await uploadFile(file, 'article')
  if (result.success) {
    formData['file' + slot] = result.url
    formData['file' + slot + 'name'] = file.name
    formData['file' + slot + 'type'] = getFileExt(file.name)
  } else {
    alert('上傳失敗: ' + result.error)
  }
  uploadingSlot.value = null
}

// 移除附件
const removeAttachment = (slot) => {
  formData['file' + slot] = ''
  formData['file' + slot + 'name'] = ''
  formData['file' + slot + 'type'] = ''
}

// 開啟大圖預覽
const openPreview = (url) => {
  previewUrl.value = url
}

// SEO
useHead({
  title: '鋒兄筆記 - 鋒兄AI Supabase',
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

.action-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.csv-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-export, .btn-import {
  padding: 0.6rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.btn-export:hover {
  background: #f0fdf4;
  border-color: #86efac;
}

.btn-import:hover {
  background: #fef3c7;
  border-color: #fcd34d;
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

/* 附件卡片（列表顯示） */
.file-item-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9f9f9;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.file-preview-img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.file-preview-img:hover {
  transform: scale(1.1);
}

.file-icon-box {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #e5e7eb;
  border-radius: 6px;
  flex-shrink: 0;
}

.file-detail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.file-type {
  font-size: 0.7rem;
  background: #ddd;
  color: #555;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  text-transform: uppercase;
  width: fit-content;
}

.file-name {
  color: #555;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-download {
  text-decoration: none;
  font-size: 1.1rem;
  opacity: 0.6;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.btn-download:hover {
  opacity: 1;
}

/* 上傳區域（Modal 表單內） */
.attachment-upload-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem;
  background: #fafafa;
}

.attachment-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
}

.attachment-drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 1.25rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.attachment-drop-zone:hover {
  border-color: #a8edea;
  background: #f0faf9;
}

.drop-icon { font-size: 1.2rem; }
.drop-text { font-size: 0.9rem; color: #888; }

.attachment-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.attachment-preview-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.attachment-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.attachment-file-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #e5e7eb;
  border-radius: 6px;
  flex-shrink: 0;
}

.attachment-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.attachment-name {
  font-size: 0.85rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-type-badge {
  font-size: 0.7rem;
  background: #a8edea;
  color: #444;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  text-transform: uppercase;
  width: fit-content;
}

.btn-remove-attachment {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-remove-attachment:hover {
  background: #dc2626;
}

.attachment-progress {
  margin-top: 0.5rem;
}

.progress-bar {
  height: 5px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a8edea, #6ee7b7);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.75rem;
  color: #10b981;
  margin-top: 0.2rem;
  display: block;
}

/* Lightbox 預覽 */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.lightbox-close {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  z-index: 1;
}

.lightbox-close:hover {
  background: #f0f0f0;
}

.lightbox-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
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
