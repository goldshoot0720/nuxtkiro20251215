<template>
  <PageContainer>
    <div class="podcast-page">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">鋒兄播客</h1>
      </div>

      <!-- Actions Bar -->
      <div class="actions-bar">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋播客名稱..."
            class="search-input"
          />
        </div>
        <div class="csv-actions">
          <button @click="exportToZIP" class="btn btn-export">
            匯出 ZIP
          </button>
          <label class="btn btn-import">
            匯入 ZIP
            <input
              type="file"
              accept=".zip"
              @change="handleImportZIP"
              style="display: none"
            />
          </label>
        </div>
        <button @click="openAddModal" class="btn btn-primary">
          新增播客
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>載入中...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredPodcasts.length === 0" class="empty-state">
        <p v-if="searchQuery">找不到符合的播客</p>
        <p v-else>尚無播客記錄，點擊「新增播客」開始建立</p>
      </div>

      <!-- Podcasts Grid -->
      <div v-else class="podcasts-grid">
        <div
          v-for="podcast in filteredPodcasts"
          :key="podcast.id"
          class="podcast-card"
        >
          <div class="card-header">
            <h3 class="card-title">{{ podcast.name || '未命名' }}</h3>
            <span v-if="podcast.category" class="category-badge">
              {{ podcast.category }}
            </span>
          </div>

          <div class="card-body">
            <div v-if="podcast.cover" class="cover-preview">
              <img :src="podcast.cover" :alt="podcast.name" />
            </div>

            <div v-if="podcast.note" class="note-preview">
              {{ truncateText(podcast.note, 100) }}
            </div>

            <div class="file-info">
              <div v-if="podcast.file" class="info-item">
                <span class="label">檔案:</span>
                <span class="value">{{ getFileName(podcast.file) }}</span>
              </div>
              <div v-if="podcast.filetype" class="info-item">
                <span class="label">格式:</span>
                <span class="value">{{ podcast.filetype }}</span>
              </div>
              <div v-if="podcast.hash" class="info-item">
                <span class="label">Hash:</span>
                <span class="value hash">{{ truncateText(podcast.hash, 12) }}</span>
              </div>
            </div>

            <div v-if="podcast.ref" class="ref-link">
              <a :href="podcast.ref" target="_blank" rel="noopener noreferrer">
                參考連結
              </a>
            </div>
          </div>

          <div class="card-actions">
            <button @click="openEditModal(podcast)" class="btn btn-edit">
              編輯
            </button>
            <button @click="confirmDelete(podcast)" class="btn btn-delete">
              刪除
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ isEditMode ? '編輯播客' : '新增播客' }}</h2>
            <button @click="closeModal" class="close-btn">&times;</button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label for="name">名稱 *</label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  required
                  class="form-input"
                  placeholder="輸入播客名稱"
                />
              </div>

              <div class="form-group">
                <label for="file">檔案路徑</label>
                <input
                  id="file"
                  v-model="formData.file"
                  type="text"
                  class="form-input"
                  placeholder="輸入檔案路徑或 URL"
                />
              </div>

              <div class="form-group">
                <label for="filetype">檔案格式</label>
                <input
                  id="filetype"
                  v-model="formData.filetype"
                  type="text"
                  class="form-input"
                  placeholder="例如: mp3, m4a, wav"
                />
              </div>

              <div class="form-group">
                <label for="category">分類</label>
                <input
                  id="category"
                  v-model="formData.category"
                  type="text"
                  class="form-input"
                  placeholder="輸入分類"
                />
              </div>

              <div class="form-group">
                <label for="cover">封面圖片 URL</label>
                <input
                  id="cover"
                  v-model="formData.cover"
                  type="text"
                  class="form-input"
                  placeholder="輸入封面圖片 URL"
                />
              </div>

              <div class="form-group">
                <label for="note">備註</label>
                <textarea
                  id="note"
                  v-model="formData.note"
                  class="form-textarea"
                  rows="4"
                  placeholder="輸入備註內容"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="ref">參考連結</label>
                <input
                  id="ref"
                  v-model="formData.ref"
                  type="url"
                  class="form-input"
                  placeholder="輸入參考連結 URL"
                />
              </div>

              <div class="form-group">
                <label for="hash">Hash</label>
                <input
                  id="hash"
                  v-model="formData.hash"
                  type="text"
                  class="form-input"
                  placeholder="輸入檔案 Hash 值"
                />
              </div>

              <div class="modal-actions">
                <button type="button" @click="closeModal" class="btn btn-cancel">
                  取消
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ isEditMode ? '更新' : '新增' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHead } from '#app'
import PageContainer from '../layout/PageContainer.vue'
import { usePodcasts } from '../../composables/usePodcasts'

// Set page title
useHead({
  title: '鋒兄播客 - 鋒兄AI Supabase'
})

// Composable
const { podcasts, loading, FIELDS, loadPodcasts, addPodcast, updatePodcast, deletePodcast, importPodcasts } = usePodcasts()

// State
const searchQuery = ref('')
const showModal = ref(false)
const isEditMode = ref(false)
const currentPodcast = ref(null)
const formData = ref({
  name: '',
  file: '',
  filetype: '',
  note: '',
  ref: '',
  category: '',
  hash: '',
  cover: ''
})

// Computed
const filteredPodcasts = computed(() => {
  if (!searchQuery.value) return podcasts.value
  const query = searchQuery.value.toLowerCase()
  return podcasts.value.filter(podcast =>
    podcast.name?.toLowerCase().includes(query)
  )
})

// Methods
const openAddModal = () => {
  isEditMode.value = false
  currentPodcast.value = null
  formData.value = {
    name: '',
    file: '',
    filetype: '',
    note: '',
    ref: '',
    category: '',
    hash: '',
    cover: ''
  }
  showModal.value = true
}

const openEditModal = (podcast) => {
  isEditMode.value = true
  currentPodcast.value = podcast
  formData.value = {
    name: podcast.name || '',
    file: podcast.file || '',
    filetype: podcast.filetype || '',
    note: podcast.note || '',
    ref: podcast.ref || '',
    category: podcast.category || '',
    hash: podcast.hash || '',
    cover: podcast.cover || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditMode.value = false
  currentPodcast.value = null
  formData.value = {
    name: '',
    file: '',
    filetype: '',
    note: '',
    ref: '',
    category: '',
    hash: '',
    cover: ''
  }
}

const handleSubmit = async () => {
  try {
    if (isEditMode.value && currentPodcast.value) {
      await updatePodcast(currentPodcast.value.id, formData.value)
    } else {
      await addPodcast(formData.value)
    }
    closeModal()
  } catch (error) {
    console.error('Error saving podcast:', error)
    alert('儲存失敗，請稍後再試')
  }
}

const confirmDelete = async (podcast) => {
  if (confirm(`確定要刪除播客「${podcast.name}」嗎？`)) {
    try {
      await deletePodcast(podcast.id)
    } catch (error) {
      console.error('Error deleting podcast:', error)
      alert('刪除失敗，請稍後再試')
    }
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const getFileName = (filePath) => {
  if (!filePath) return ''
  return filePath.split('/').pop()
}

// ZIP Export
const exportToZIP = async () => {
  if (podcasts.value.length === 0) {
    alert('沒有資料可匯出')
    return
  }

  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default

    const zip = new JSZip()

    // Create JSON data
    const jsonData = JSON.stringify(podcasts.value, null, 2)
    zip.file('podcasts.json', jsonData)

    // Generate ZIP file
    const blob = await zip.generateAsync({ type: 'blob' })

    // Download
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'supabase-podcast.zip')
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
const handleImportZIP = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default

    const zip = await JSZip.loadAsync(file)

    // Look for JSON file
    const jsonFile = zip.file('podcasts.json')
    if (!jsonFile) {
      alert('ZIP 檔案中找不到 podcasts.json')
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

    if (confirm(`確定要匯入 ${cleanRecords.length} 筆播客記錄嗎？`)) {
      await importPodcasts(cleanRecords)
      alert('匯入成功！')
    }
  } catch (error) {
    console.error('Error importing ZIP:', error)
    alert('匯入失敗：' + error.message)
  }

  event.target.value = ''
}

// Load data on mount
onMounted(() => {
  loadPodcasts()
})
</script>

<style scoped>
.podcast-page {
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

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.actions-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #11998e;
  box-shadow: 0 0 0 3px rgba(17, 153, 142, 0.1);
}

.csv-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
}

.btn-export {
  background: #f3f4f6;
  color: #374151;
}

.btn-export:hover {
  background: #e5e7eb;
}

.btn-import {
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-import:hover {
  background: #e5e7eb;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top-color: #11998e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.podcasts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.podcast-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;
}

.podcast-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  padding: 1.25rem;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  font-size: 0.85rem;
}

.card-body {
  padding: 1.25rem;
}

.cover-preview {
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.cover-preview img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.note-preview {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.info-item .label {
  color: #6b7280;
  font-weight: 500;
}

.info-item .value {
  color: #374151;
  word-break: break-all;
}

.info-item .hash {
  font-family: monospace;
  font-size: 0.85rem;
}

.ref-link {
  margin-top: 0.5rem;
}

.ref-link a {
  color: #11998e;
  text-decoration: none;
  font-size: 0.9rem;
}

.ref-link a:hover {
  text-decoration: underline;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.btn-edit {
  flex: 1;
  background: #f3f4f6;
  color: #374151;
}

.btn-edit:hover {
  background: #e5e7eb;
}

.btn-delete {
  flex: 1;
  background: #fee2e2;
  color: #dc2626;
}

.btn-delete:hover {
  background: #fecaca;
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
  animation: fadeIn 0.2s ease-in;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.close-btn:hover {
  opacity: 0.8;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #11998e;
  box-shadow: 0 0 0 3px rgba(17, 153, 142, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .podcasts-grid {
    grid-template-columns: 1fr;
  }

  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .csv-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
}
</style>
