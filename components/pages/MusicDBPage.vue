<template>
  <PageContainer>
    <div class="music-db-page">
      <div class="page-header">
        <h1 class="page-title">鋒兄音樂</h1>
      </div>

      <div class="actions-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜尋音樂名稱..."
          class="search-input"
        />
        <div class="csv-actions">
          <button @click="exportToZIP" class="btn-export">匯出 ZIP</button>
          <label class="btn-import">
            匯入 ZIP
            <input
              type="file"
              accept=".zip"
              @change="handleFileImport"
              style="display: none"
            />
          </label>
        </div>
      </div>

      <!-- 摘要列 -->
      <div class="summary-bar">
        <div class="summary-left">
          <button v-if="!batchMode && filteredMusics.length > 0" @click="enterBatchMode" class="btn-batch-mode">批量選擇</button>
          <button @click="openAddModal" class="btn-add-icon" title="新增">+</button>
          <template v-if="batchMode">
            <label class="select-all-label"><input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" /><span>全選</span></label>
            <button @click="exitBatchMode" class="btn-cancel-batch">取消</button>
          </template>
          <span>共 {{ musics.length }} 個項目</span>
          <span v-if="selectedIds.size > 0" class="selected-count">已選 {{ selectedIds.size }} 項</span>
        </div>
        <div class="summary-right">
          <button v-if="selectedIds.size > 0" class="btn-batch-delete" @click="deleteSelected" :disabled="loading">刪除選中 ({{ selectedIds.size }})</button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">載入中...</div>

      <div v-else-if="filteredMusics.length === 0" class="empty-state">
        <p v-if="searchQuery">找不到符合的音樂記錄</p>
        <p v-else>尚無音樂記錄，點擊「新增」開始建立</p>
      </div>

      <div v-else class="music-grid">
        <div
          v-for="music in filteredMusics"
          :key="music.id"
          class="music-card"
          :class="{ 'card-selected': selectedIds.has(music.id) }"
        >
          <div class="card-header">
            <input
              v-if="batchMode"
              type="checkbox"
              :checked="selectedIds.has(music.id)"
              @change="toggleSelect(music.id)"
              class="card-checkbox"
            />
            <h3 class="card-title">{{ music.name || '未命名' }}</h3>
            <div class="card-actions">
              <button @click="openEditModal(music)" class="btn-edit" title="編輯">
                ✎
              </button>
              <button @click="deleteRecord(music.id)" class="btn-delete" title="刪除">
                ✕
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="music.category || music.language" class="badges">
              <span v-if="music.category" class="badge badge-category">{{ music.category }}</span>
              <span v-if="music.language" class="badge badge-language">{{ music.language }}</span>
            </div>
            <div v-if="music.file || music.cover" class="card-media">
              <div v-if="music.cover" class="card-cover">
                <img :src="music.cover" :alt="music.name || '封面'" class="card-cover-image" />
              </div>
              <div v-if="music.file" class="card-audio">
                <audio controls :src="music.file" class="audio-player" @play="pauseOthers($event)"></audio>
              </div>
            </div>
            <div v-if="music.lyrics" class="card-field">
              <strong>歌詞:</strong>
              <pre class="lyrics-text">{{ music.lyrics }}</pre>
            </div>
            <p v-if="music.note" class="card-field">
              <strong>備註:</strong> {{ truncate(music.note, 80) }}
            </p>
            <p v-if="music.ref" class="card-field">
              <strong>參考:</strong> {{ music.ref }}
            </p>
            <p v-if="music.hash" class="card-field">
              <strong>Hash:</strong> {{ music.hash }}
            </p>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingMusic ? '編輯音樂' : '新增音樂' }}</h2>
            <button @click="closeModal" class="btn-close">✕</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveMusic">
              <div class="form-group">
                <label>名稱</label>
                <input v-model="formData.name" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>上傳音樂檔案</label>
                <div class="upload-area">
                  <input
                    ref="audioFileInput"
                    type="file"
                    accept="audio/*"
                    @change="handleAudioUpload"
                    style="display: none"
                  />
                  <button type="button" @click="$refs.audioFileInput.click()" class="btn-upload" :disabled="uploading">
                    {{ uploading ? '上傳中...' : '選擇檔案' }}
                  </button>
                  <span v-if="uploadProgress > 0" class="upload-progress">{{ uploadProgress }}%</span>
                </div>
                <div v-if="formData.file" class="file-preview">
                  <audio controls :src="formData.file" class="audio-preview"></audio>
                  <button type="button" @click="removeAudio" class="btn-remove">移除</button>
                </div>
              </div>
              <div class="form-group">
                <label>檔案路徑 (或自動上傳)</label>
                <input v-model="formData.file" type="text" class="form-input" placeholder="自動填入或手動輸入" />
              </div>
              <div class="form-group">
                <label>檔案格式</label>
                <input v-model="formData.filetype" type="text" class="form-input" placeholder="例如: mp3, flac, wav" />
              </div>
              <div class="form-group">
                <label>歌詞</label>
                <textarea v-model="formData.lyrics" class="form-textarea" rows="4" placeholder="輸入歌詞內容..."></textarea>
              </div>
              <div class="form-group">
                <label>語言</label>
                <select v-model="languageSelect" @change="handleLanguageChange" class="form-input">
                  <option value="">選擇語言</option>
                  <option value="中文">中文</option>
                  <option value="英語">英語</option>
                  <option value="日語">日語</option>
                  <option value="韓語">韓語</option>
                  <option value="粵語">粵語</option>
                  <option value="custom">自訂...</option>
                </select>
                <input
                  v-if="languageSelect === 'custom'"
                  v-model="formData.language"
                  type="text"
                  class="form-input"
                  placeholder="輸入自訂語言"
                  style="margin-top: 0.5rem"
                />
              </div>
              <div class="form-group">
                <label>備註</label>
                <input v-model="formData.note" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>參考</label>
                <input v-model="formData.ref" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>分類</label>
                <input v-model="formData.category" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>Hash</label>
                <input v-model="formData.hash" type="text" class="form-input" />
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
                <input v-model="formData.cover" type="text" class="form-input" placeholder="或輸入封面 URL" />
              </div>
              <div class="modal-actions">
                <button type="button" @click="closeModal" class="btn-cancel">
                  取消
                </button>
                <button type="submit" class="btn-save">儲存</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useHead } from '#app'
import PageContainer from '../layout/PageContainer.vue'
import { useMusicRecords } from '../../composables/useMusicRecords'
import { useStorage } from '../../composables/useStorage'

useHead({
  title: '鋒兄音樂 - 鋒兄AI Supabase'
})

const { musics, loading, FIELDS, loadMusics, addMusic, updateMusic, deleteMusic, importMusics } = useMusicRecords()
const { uploading, uploadProgress, uploadFile } = useStorage()

const searchQuery = ref('')
const showModal = ref(false)
const editingMusic = ref(null)
const audioFileInput = ref(null)
const coverFileInput = ref(null)
const coverUploading = ref(false)
const languageSelect = ref('')
const formData = ref({
  name: '',
  file: '',
  filetype: '',
  lyrics: '',
  note: '',
  ref: '',
  category: '',
  hash: '',
  language: '',
  cover: ''
})

// Batch mode state
const batchMode = ref(false)
const selectedIds = ref(new Set())

const enterBatchMode = () => {
  batchMode.value = true
  selectedIds.value.clear()
}

const exitBatchMode = () => {
  batchMode.value = false
  selectedIds.value.clear()
}

const toggleSelect = (id) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

const isAllSelected = computed(() => {
  return filteredMusics.value.length > 0 &&
         filteredMusics.value.every(m => selectedIds.value.has(m.id))
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value.clear()
  } else {
    filteredMusics.value.forEach(m => selectedIds.value.add(m.id))
  }
}

const deleteSelected = async () => {
  const count = selectedIds.value.size
  if (count === 0) return

  const isFullDelete = count === musics.value.length
  const confirmText = isFullDelete
    ? `確定要刪除全部 ${count} 個項目嗎？這將清空整個資料表！\n\n請輸入「DELETE musicdb」確認：`
    : `確定要刪除選中的 ${count} 個項目嗎？`

  if (isFullDelete) {
    const userInput = prompt(confirmText)
    if (userInput !== 'DELETE musicdb') {
      alert('確認文字不正確，已取消刪除')
      return
    }
  } else {
    if (!confirm(confirmText)) return
  }

  try {
    const idsToDelete = Array.from(selectedIds.value)
    for (const id of idsToDelete) {
      await deleteMusic(id)
    }
    await loadMusics()
    exitBatchMode()
    alert(`成功刪除 ${count} 個項目`)
  } catch (error) {
    console.error('Error deleting selected:', error)
    alert('批量刪除失敗: ' + error.message)
  }
}

const filteredMusics = computed(() => {
  if (!searchQuery.value) return musics.value
  const query = searchQuery.value.toLowerCase()
  return musics.value.filter(music =>
    music.name?.toLowerCase().includes(query)
  )
})

const pauseOthers = (event) => {
  document.querySelectorAll('.audio-player').forEach(audio => {
    if (audio !== event.target) audio.pause()
  })
}

const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const openAddModal = () => {
  editingMusic.value = null
  formData.value = {
    name: '',
    file: '',
    filetype: '',
    lyrics: '',
    note: '',
    ref: '',
    category: '',
    hash: '',
    language: '',
    cover: ''
  }
  showModal.value = true
}

const openEditModal = (music) => {
  editingMusic.value = music
  formData.value = {
    name: music.name || '',
    file: music.file || '',
    filetype: music.filetype || '',
    lyrics: music.lyrics || '',
    note: music.note || '',
    ref: music.ref || '',
    category: music.category || '',
    hash: music.hash || '',
    language: music.language || '',
    cover: music.cover || ''
  }
  // Set language select
  const predefinedLanguages = ['中文', '英語', '日語', '韓語', '粵語']
  if (predefinedLanguages.includes(music.language)) {
    languageSelect.value = music.language
  } else if (music.language) {
    languageSelect.value = 'custom'
  } else {
    languageSelect.value = ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingMusic.value = null
  languageSelect.value = ''
}

// Audio upload handler
const handleAudioUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    // Get file extension
    const fileExt = file.name.split('.').pop()
    formData.value.filetype = fileExt

    // Upload to Supabase Storage
    const result = await uploadFile(file, 'music')

    if (result.success) {
      formData.value.file = result.url
      // 若名稱為空，預設為上傳檔名（去掉副檔名）
      if (!formData.value.name) {
        formData.value.name = file.name.replace(/\.[^.]+$/, '')
      }
      alert('檔案上傳成功！')
    } else {
      alert('上傳失敗: ' + result.error)
    }
  } catch (error) {
    console.error('Upload error:', error)
    alert('上傳失敗: ' + error.message)
  }
}

// Remove audio
const removeAudio = () => {
  formData.value.file = ''
  formData.value.filetype = ''
  if (audioFileInput.value) {
    audioFileInput.value.value = ''
  }
}

// Cover upload handler
const handleCoverUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  coverUploading.value = true
  try {
    const result = await uploadFile(file, 'music-covers')
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

// Remove cover
const removeCover = () => {
  formData.value.cover = ''
  if (coverFileInput.value) {
    coverFileInput.value.value = ''
  }
}

// Language change handler
const handleLanguageChange = () => {
  if (languageSelect.value !== 'custom') {
    formData.value.language = languageSelect.value
  }
}

const saveMusic = async () => {
  try {
    if (editingMusic.value) {
      await updateMusic(editingMusic.value.id, formData.value)
    } else {
      await addMusic(formData.value)
    }
    closeModal()
    await loadMusics()
  } catch (error) {
    console.error('Error saving music:', error)
    alert('儲存失敗: ' + error.message)
  }
}

const deleteRecord = async (id) => {
  if (!confirm('確定要刪除此音樂記錄嗎？')) return
  try {
    await deleteMusic(id)
    await loadMusics()
  } catch (error) {
    console.error('Error deleting music:', error)
    alert('刪除失敗: ' + error.message)
  }
}

const exportToZIP = async () => {
  if (musics.value.length === 0) {
    alert('沒有資料可以匯出')
    return
  }

  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default

    const zip = new JSZip()

    // Create JSON data
    const jsonData = JSON.stringify(musics.value, null, 2)
    zip.file('music.json', jsonData)

    // Generate ZIP file
    const blob = await zip.generateAsync({ type: 'blob' })

    // Download
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'supabase-music.zip')
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

const handleFileImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default

    const zip = await JSZip.loadAsync(file)

    // Look for JSON file
    const jsonFile = zip.file('music.json')
    if (!jsonFile) {
      alert('ZIP 檔案中找不到 music.json')
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

    if (confirm(`確定要匯入 ${cleanRecords.length} 筆音樂記錄嗎？`)) {
      await importMusics(cleanRecords)
      await loadMusics()
      alert('匯入成功！')
    }
  } catch (error) {
    console.error('Error importing ZIP:', error)
    alert('匯入失敗：' + error.message)
  } finally {
    event.target.value = ''
  }
}

onMounted(() => {
  loadMusics()
})
</script>

<style scoped>
.music-db-page {
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
  font-weight: bold;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #f093fb;
  box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
}

.csv-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-export,
.btn-import {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-export:hover,
.btn-import:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-add {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.music-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.music-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.music-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(240, 147, 251, 0.2);
  border-color: #f093fb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  word-break: break-word;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-edit,
.btn-delete {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-edit:hover {
  background: #1976d2;
  color: white;
}

.btn-delete {
  background: #ffebee;
  color: #d32f2f;
}

.btn-delete:hover {
  background: #d32f2f;
  color: white;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-category {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.badge-language {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-field {
  margin: 0;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
  word-break: break-word;
}

.card-field strong {
  color: #333;
  font-weight: 600;
}

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
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
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
  font-weight: 600;
  color: #333;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #f093fb;
  box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-save {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
}

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
  .btn-import {
    flex: 1;
  }

  .music-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}

/* Media Row: Cover + Audio Player */
.card-media {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0;
}

.card-cover-image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.card-audio {
  flex: 1;
  min-width: 0;
}

.audio-player {
  width: 100%;
  height: 40px;
  border-radius: 8px;
}

.lyrics-text {
  margin: 0.25rem 0 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.8;
  color: #555;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
}

/* Cover Upload Styles */
.cover-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-image {
  max-width: 150px;
  max-height: 100px;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Summary Bar Styles */
.summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.08) 0%, rgba(46, 204, 113, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  color: #555;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.summary-left,
.summary-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.select-all-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.selected-count {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.btn-batch-mode {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-batch-mode:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-add-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
  color: white;
  font-size: 1.5rem;
  font-weight: 300;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  line-height: 1;
  padding-bottom: 4px;
}

.btn-add-icon:hover {
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.btn-cancel-batch {
  padding: 0.35rem 0.75rem;
  background: #e0e0e0;
  color: #666;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancel-batch:hover {
  background: #d0d0d0;
}

.btn-batch-delete {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-batch-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.btn-batch-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
}

.card-selected {
  border-color: #3498db !important;
  background: rgba(52, 152, 219, 0.05);
}
</style>
