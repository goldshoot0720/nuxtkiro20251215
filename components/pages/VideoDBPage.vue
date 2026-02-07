<template>
  <PageContainer>
    <div class="video-page">
      <h1 class="page-title">鋒兄影片</h1>

      <!-- Actions Bar -->
      <div class="actions-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜尋影片名稱..."
          class="search-input"
        />
        <div class="csv-actions">
          <button @click="exportZip" class="btn-export" title="匯出 ZIP">
            <span>📤</span> 匯出 ZIP
          </button>
          <label class="btn-import" title="匯入 ZIP">
            <span>📥</span> 匯入 ZIP
            <input
              type="file"
              accept=".zip"
              @change="handleImport"
              style="display: none"
            />
          </label>
        </div>
        <button @click="openAddModal" class="btn-add">+ 新增</button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">載入中...</div>

      <!-- Empty State -->
      <div v-else-if="filteredVideos.length === 0" class="empty-state">
        <p v-if="searchQuery">找不到符合的影片</p>
        <p v-else>尚無影片記錄，點擊「新增」開始</p>
      </div>

      <!-- Video Grid -->
      <div v-else class="video-grid">
        <div
          v-for="video in filteredVideos"
          :key="video.id"
          class="video-card"
        >
          <div class="card-header">
            <h3 class="video-name">{{ video.name || '未命名' }}</h3>
            <span v-if="video.category" class="category-badge">{{
              video.category
            }}</span>
          </div>

          <div class="card-body">
            <div v-if="video.note" class="video-note">
              {{ truncateText(video.note, 100) }}
            </div>

            <div class="video-info">
              <div v-if="video.file" class="info-item">
                <strong>檔案:</strong> {{ video.file }}
              </div>
              <div v-if="video.filetype" class="info-item">
                <strong>類型:</strong> {{ video.filetype }}
              </div>
              <div v-if="video.ref" class="info-item">
                <strong>參考:</strong> {{ video.ref }}
              </div>
              <div v-if="video.hash" class="info-item">
                <strong>雜湊:</strong> {{ truncateText(video.hash, 16) }}
              </div>
              <div v-if="video.cover" class="info-item">
                <strong>封面:</strong> {{ video.cover }}
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button @click="openEditModal(video)" class="btn-edit">編輯</button>
            <button @click="handleDelete(video)" class="btn-delete">刪除</button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ isEditing ? '編輯影片' : '新增影片' }}</h2>
            <button @click="closeModal" class="btn-close">&times;</button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-body">
            <div class="form-group">
              <label for="name">名稱 *</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                placeholder="輸入影片名稱"
              />
            </div>

            <div class="form-group">
              <label>上傳影片</label>
              <div class="upload-area">
                <input
                  ref="videoFileInput"
                  type="file"
                  accept="video/*"
                  @change="handleVideoUpload"
                  style="display: none"
                />
                <button
                  type="button"
                  @click="$refs.videoFileInput.click()"
                  class="btn-upload"
                  :disabled="videoUploading"
                >
                  {{ videoUploading ? '上傳中...' : '選擇影片' }}
                </button>
                <span v-if="videoUploadProgress > 0" class="upload-progress">{{ videoUploadProgress }}%</span>
              </div>
              <div v-if="formData.file" class="video-preview">
                <video :src="formData.file" controls class="preview-video"></video>
                <button type="button" @click="removeVideo" class="btn-remove">移除</button>
              </div>
            </div>

            <div class="form-group">
              <label for="file">檔案路徑</label>
              <input
                id="file"
                v-model="formData.file"
                type="text"
                placeholder="自動上傳或手動輸入 URL"
              />
            </div>

            <div class="form-group">
              <label for="filetype">檔案類型</label>
              <input
                id="filetype"
                v-model="formData.filetype"
                type="text"
                placeholder="例: mp4, avi, mov"
              />
            </div>

            <div class="form-group">
              <label for="category">分類</label>
              <input
                id="category"
                v-model="formData.category"
                type="text"
                placeholder="影片分類"
              />
            </div>

            <div class="form-group">
              <label for="ref">參考</label>
              <input
                id="ref"
                v-model="formData.ref"
                type="text"
                placeholder="參考連結或資訊"
              />
            </div>

            <div class="form-group">
              <label for="hash">雜湊值</label>
              <input
                id="hash"
                v-model="formData.hash"
                type="text"
                placeholder="檔案雜湊值"
              />
            </div>

            <div class="form-group">
              <label>封面上傳</label>
              <div class="upload-area">
                <input
                  ref="coverFileInput"
                  type="file"
                  accept="image/*"
                  @change="handleCoverUpload"
                  style="display: none"
                />
                <button
                  type="button"
                  @click="$refs.coverFileInput.click()"
                  class="btn-upload"
                  :disabled="coverUploading"
                >
                  {{ coverUploading ? '上傳中...' : '選擇封面' }}
                </button>
              </div>
              <div v-if="formData.cover" class="cover-preview">
                <img :src="formData.cover" alt="封面預覽" class="preview-image" />
                <button type="button" @click="removeCover" class="btn-remove">移除</button>
              </div>
              <input
                id="cover"
                v-model="formData.cover"
                type="text"
                placeholder="或輸入封面 URL"
              />
            </div>

            <div class="form-group">
              <label for="note">備註</label>
              <textarea
                id="note"
                v-model="formData.note"
                rows="4"
                placeholder="輸入備註說明"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-cancel">
                取消
              </button>
              <button type="submit" class="btn-submit">
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
import { useVideoRecords } from '../../composables/useVideoRecords'
import { useStorage } from '../../composables/useStorage'

useHead({
  title: '鋒兄影片 - 鋒兄AI Supabase'
})

const {
  videos,
  loading,
  FIELDS,
  loadVideos,
  addVideo,
  updateVideo,
  deleteVideo,
  importVideos
} = useVideoRecords()

// Search
const searchQuery = ref('')

// Upload state
const videoFileInput = ref(null)
const coverFileInput = ref(null)
const { uploading: videoUploading, uploadProgress: videoUploadProgress, uploadFile } = useStorage()
const coverUploading = ref(false)

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

// Form data
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
const filteredVideos = computed(() => {
  if (!searchQuery.value.trim()) {
    return videos.value
  }
  const query = searchQuery.value.toLowerCase()
  return videos.value.filter((video) =>
    video.name?.toLowerCase().includes(query)
  )
})

// Methods
function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
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

function openEditModal(video) {
  isEditing.value = true
  editingId.value = video.id
  formData.value = {
    name: video.name || '',
    file: video.file || '',
    filetype: video.filetype || '',
    note: video.note || '',
    ref: video.ref || '',
    category: video.category || '',
    hash: video.hash || '',
    cover: video.cover || ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  isEditing.value = false
  editingId.value = null
}

// 影片上傳處理
async function handleVideoUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const result = await uploadFile(file, 'video')
    if (result.success) {
      formData.value.file = result.url
      const ext = file.name.split('.').pop()
      if (ext) formData.value.filetype = ext
      alert('影片上傳成功！')
    } else {
      alert('上傳失敗: ' + result.error)
    }
  } catch (error) {
    console.error('Upload error:', error)
    alert('上傳失敗: ' + error.message)
  }
}

// 移除影片
function removeVideo() {
  formData.value.file = ''
  formData.value.filetype = ''
  if (videoFileInput.value) {
    videoFileInput.value.value = ''
  }
}

// 封面上傳處理
async function handleCoverUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  coverUploading.value = true
  try {
    const result = await uploadFile(file, 'video-covers')
    if (result.success) {
      formData.value.cover = result.url
      alert('封面上傳成功！')
    } else {
      alert('封面上傳失敗: ' + result.error)
    }
  } catch (error) {
    console.error('Cover upload error:', error)
    alert('封面上傳失敗: ' + error.message)
  } finally {
    coverUploading.value = false
  }
}

// 移除封面
function removeCover() {
  formData.value.cover = ''
  if (coverFileInput.value) {
    coverFileInput.value.value = ''
  }
}

async function handleSubmit() {
  try {
    if (isEditing.value) {
      await updateVideo(editingId.value, formData.value)
      alert('影片已更新')
    } else {
      await addVideo(formData.value)
      alert('影片已新增')
    }
    closeModal()
    await loadVideos()
  } catch (error) {
    console.error('操作失敗:', error)
    alert('操作失敗: ' + error.message)
  }
}

async function handleDelete(video) {
  if (!confirm(`確定要刪除影片「${video.name}」嗎？`)) {
    return
  }
  try {
    await deleteVideo(video.id)
    alert('影片已刪除')
    await loadVideos()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗: ' + error.message)
  }
}

// ZIP Export
async function exportZip() {
  if (videos.value.length === 0) {
    alert('沒有資料可以匯出')
    return
  }

  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default

    const zip = new JSZip()

    // Create JSON data
    const jsonData = JSON.stringify(videos.value, null, 2)
    zip.file('videos.json', jsonData)

    // Generate ZIP file
    const blob = await zip.generateAsync({ type: 'blob' })

    // Download
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'supabase-videos.zip')
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
async function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default

    const zip = await JSZip.loadAsync(file)

    // Look for JSON file
    const jsonFile = zip.file('videos.json')
    if (!jsonFile) {
      alert('ZIP 檔案中找不到 videos.json')
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

    if (!confirm(`確定要匯入 ${cleanRecords.length} 筆影片記錄嗎？`)) {
      return
    }

    await importVideos(cleanRecords)
    alert(`成功匯入 ${cleanRecords.length} 筆資料`)
    await loadVideos()
  } catch (error) {
    console.error('匯入失敗:', error)
    alert('匯入失敗：' + error.message)
  } finally {
    event.target.value = ''
  }
}

// Lifecycle
onMounted(() => {
  loadVideos()
})
</script>

<style scoped>
.video-page {
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

.page-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 2rem;
}

.actions-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.csv-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-export,
.btn-import {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover,
.btn-import:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-import {
  cursor: pointer;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.loading,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
  font-size: 1.1rem;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.video-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.video-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
  word-break: break-word;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-note {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.video-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  font-size: 0.9rem;
  color: #475569;
  word-break: break-all;
}

.info-item strong {
  color: #334155;
  font-weight: 600;
  margin-right: 0.5rem;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #667eea;
  color: white;
}

.btn-edit:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Modal Styles */
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
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #475569;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .actions-bar {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .csv-actions {
    width: 100%;
  }

  .btn-export,
  .btn-import,
  .btn-add {
    flex: 1;
  }

  .video-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
  }
}

/* Upload Area Styles */
.upload-area {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.btn-upload {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-upload:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-upload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-progress {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 500;
}

.video-preview, .cover-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-video {
  max-width: 200px;
  max-height: 120px;
  border-radius: 6px;
}

.preview-image {
  max-width: 150px;
  max-height: 100px;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-remove {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-remove:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(245, 87, 108, 0.3);
}
</style>
