<template>
  <PageContainer>
    <div class="document-page">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">鋒兄文件</h1>
      </div>

      <!-- Actions Bar -->
      <div class="actions-bar">
        <div class="search-group">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋文件名稱..."
            class="search-input"
          />
        </div>

        <div class="csv-actions">
          <button @click="exportToZip" class="btn btn-export">
            匯出 ZIP
          </button>
          <label class="btn btn-import">
            匯入 ZIP
            <input
              type="file"
              accept=".zip"
              @change="handleZipImport"
              style="display: none"
            />
          </label>
        </div>

        <button @click="openAddModal" class="btn btn-primary">
          新增文件
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>載入中...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredDocuments.length === 0" class="empty-state">
        <div class="empty-icon">📄</div>
        <p class="empty-text">
          {{ searchQuery ? '找不到符合的文件' : '尚無文件記錄' }}
        </p>
        <button v-if="!searchQuery" @click="openAddModal" class="btn btn-primary">
          新增第一筆文件
        </button>
      </div>

      <!-- Documents Grid -->
      <div v-else class="documents-grid">
        <div
          v-for="document in filteredDocuments"
          :key="document.id"
          class="document-card"
        >
          <div class="card-header">
            <h3 class="card-title">{{ document.name || '未命名' }}</h3>
            <div class="card-actions">
              <button @click="openEditModal(document)" class="btn-icon" title="編輯">
                ✏️
              </button>
              <button @click="confirmDelete(document)" class="btn-icon" title="刪除">
                🗑️
              </button>
            </div>
          </div>

          <div class="card-body">
            <div v-if="document.category" class="category-badge">
              {{ document.category }}
            </div>

            <div v-if="document.note" class="note-preview">
              {{ truncateText(document.note, 100) }}
            </div>

            <div v-if="document.file" class="file-info">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ getFileName(document.file) }}</span>
            </div>

            <div v-if="document.ref" class="ref-info">
              <span class="label">參考:</span>
              <span class="value">{{ document.ref }}</span>
            </div>

            <div v-if="document.cover" class="cover-preview">
              <img :src="document.cover" :alt="document.name" class="cover-image" />
            </div>
          </div>

          <div class="card-footer">
            <span class="hash-info" v-if="document.hash">
              Hash: {{ truncateText(document.hash, 16) }}
            </span>
            <span class="timestamp">
              {{ formatDate(document.created_at) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ isEditing ? '編輯文件' : '新增文件' }}
            </h2>
            <button @click="closeModal" class="btn-close">×</button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-group">
              <label class="form-label">名稱 *</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-input"
                required
                placeholder="請輸入文件名稱"
              />
            </div>

            <div class="form-group">
              <label class="form-label">檔案</label>
              <input
                v-model="formData.file"
                type="text"
                class="form-input"
                placeholder="檔案路徑或 URL"
              />
            </div>

            <div class="form-group">
              <label class="form-label">備註</label>
              <textarea
                v-model="formData.note"
                class="form-textarea"
                rows="4"
                placeholder="請輸入備註..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">參考</label>
              <input
                v-model="formData.ref"
                type="text"
                class="form-input"
                placeholder="參考來源"
              />
            </div>

            <div class="form-group">
              <label class="form-label">分類</label>
              <input
                v-model="formData.category"
                type="text"
                class="form-input"
                placeholder="文件分類"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Hash</label>
              <input
                v-model="formData.hash"
                type="text"
                class="form-input"
                placeholder="檔案 Hash 值"
              />
            </div>

            <div class="form-group">
              <label class="form-label">封面</label>
              <input
                v-model="formData.cover"
                type="text"
                class="form-input"
                placeholder="封面圖片 URL"
              />
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                取消
              </button>
              <button type="submit" class="btn btn-primary">
                {{ isEditing ? '更新' : '新增' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHead } from '#app'
import PageContainer from '../layout/PageContainer.vue'
import { useDocuments } from '../../composables/useDocuments'

// SEO
useHead({
  title: '鋒兄文件 - 鋒兄AI Supabase'
})

// Composable
const {
  documents,
  loading,
  FIELDS,
  loadDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  importDocuments
} = useDocuments()

// Search
const searchQuery = ref('')

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

// Form data
const formData = ref({
  name: '',
  file: '',
  note: '',
  ref: '',
  category: '',
  hash: '',
  cover: ''
})

// Computed
const filteredDocuments = computed(() => {
  if (!searchQuery.value) return documents.value

  const query = searchQuery.value.toLowerCase()
  return documents.value.filter(doc =>
    doc.name?.toLowerCase().includes(query)
  )
})

// Methods
const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (document) => {
  isEditing.value = true
  editingId.value = document.id
  formData.value = {
    name: document.name || '',
    file: document.file || '',
    note: document.note || '',
    ref: document.ref || '',
    category: document.category || '',
    hash: document.hash || '',
    cover: document.cover || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    file: '',
    note: '',
    ref: '',
    category: '',
    hash: '',
    cover: ''
  }
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await updateDocument(editingId.value, formData.value)
    } else {
      await addDocument(formData.value)
    }
    closeModal()
    await loadDocuments()
  } catch (error) {
    console.error('Error saving document:', error)
    alert('儲存失敗，請稍後再試')
  }
}

const confirmDelete = async (document) => {
  if (confirm(`確定要刪除文件「${document.name}」嗎？`)) {
    try {
      await deleteDocument(document.id)
      await loadDocuments()
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('刪除失敗，請稍後再試')
    }
  }
}

// ZIP Export
const exportToZip = async () => {
  if (documents.value.length === 0) {
    alert('沒有資料可以匯出')
    return
  }

  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default

    const zip = new JSZip()

    // Create JSON data
    const jsonData = JSON.stringify(documents.value, null, 2)
    zip.file('documents.json', jsonData)

    // Generate ZIP file
    const blob = await zip.generateAsync({ type: 'blob' })

    // Download
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'supabase-documents.zip')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    alert('匯出成功！')
  } catch (error) {
    console.error('Error exporting ZIP:', error)
    alert('匯出失敗：' + error.message)
  }
}

// ZIP Import
const handleZipImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default

    const zip = await JSZip.loadAsync(file)

    // Look for JSON file
    const jsonFile = zip.file('documents.json')
    if (!jsonFile) {
      alert('ZIP 檔案中找不到 documents.json')
      return
    }

    const jsonText = await jsonFile.async('text')
    const records = JSON.parse(jsonText)

    if (!Array.isArray(records) || records.length === 0) {
      alert('JSON 檔案格式錯誤或無資料')
      return
    }

    // Filter out system fields
    const cleanRecords = records.map(record => {
      const { id, created_at, updated_at, ...rest } = record
      return rest
    })

    if (confirm(`確定要匯入 ${cleanRecords.length} 筆文件記錄嗎？`)) {
      await importDocuments(cleanRecords)
      await loadDocuments()
      alert('匯入成功！')
    }
  } catch (error) {
    console.error('Error importing ZIP:', error)
    alert('匯入失敗：' + error.message)
  }

  event.target.value = ''
}

// Utility functions
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const getFileName = (filePath) => {
  if (!filePath) return ''
  return filePath.split('/').pop() || filePath
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.document-page {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Actions Bar */
.actions-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-group {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.csv-actions {
  display: flex;
  gap: 0.5rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.btn-secondary {
  background: #e2e8f0;
  color: #334155;
}

.btn-secondary:hover {
  background: #cbd5e1;
}

.btn-export {
  background: #10b981;
  color: white;
}

.btn-export:hover {
  background: #059669;
  transform: translateY(-2px);
}

.btn-import {
  background: #3b82f6;
  color: white;
  display: inline-block;
  text-align: center;
}

.btn-import:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
  border: 4px solid #e2e8f0;
  border-top-color: #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.25rem;
  color: #64748b;
  margin-bottom: 2rem;
}

/* Documents Grid */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.document-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(79, 172, 254, 0.2);
  border-color: #4facfe;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
  word-break: break-word;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  align-self: flex-start;
}

.note-preview {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 0.9rem;
}

.file-icon {
  font-size: 1.2rem;
}

.file-name {
  color: #475569;
  word-break: break-all;
}

.ref-info {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.ref-info .label {
  font-weight: 500;
}

.cover-preview {
  margin-top: 0.5rem;
}

.cover-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #94a3b8;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.hash-info {
  font-family: monospace;
  color: #64748b;
}

.timestamp {
  color: #94a3b8;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-in;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #94a3b8;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #475569;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #334155;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-group {
    width: 100%;
  }

  .csv-actions {
    width: 100%;
  }

  .csv-actions .btn {
    flex: 1;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
  }

  .card-actions {
    align-self: flex-end;
  }
}
</style>
