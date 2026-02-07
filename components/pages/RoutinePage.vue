<template>
  <PageContainer>
    <div class="routine-page">
      <div class="actions-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜尋例行名稱..."
          class="search-input"
        />
        <div class="csv-actions">
          <button @click="exportCsv" class="btn-export">匯出 CSV</button>
          <label class="btn-import">
            匯入 CSV
            <input
              type="file"
              accept=".csv"
              @change="handleImport"
              style="display: none"
            />
          </label>
        </div>
        <button @click="openAddModal" class="btn-add">新增</button>
      </div>

      <div v-if="loading" class="loading">載入中...</div>
      <div v-else-if="filteredRoutines.length === 0" class="empty-state">
        暫無例行記錄
      </div>
      <div v-else class="routine-table-wrapper">
        <table class="routine-table">
          <thead>
            <tr>
              <th>名稱</th>
              <th>備註</th>
              <th>圖片</th>
              <th>最近例行之一</th>
              <th>最近例行之二</th>
              <th>相距天數</th>
              <th>最近例行之三</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="routine in filteredRoutines" :key="routine.id">
              <td class="td-name">{{ routine.name }}</td>
              <td class="td-note">{{ routine.note || '' }}</td>
              <td class="td-photo">
                <img
                  v-if="routine.photo"
                  :src="routine.photo"
                  :alt="routine.name"
                  class="table-photo"
                  @click="previewImage = routine.photo"
                />
              </td>
              <td class="td-date">{{ formatDate(routine.lastdate1) }}</td>
              <td class="td-date">{{ formatDate(routine.lastdate2) }}</td>
              <td class="td-days">
                <span v-if="getDaysBetween(routine.lastdate1, routine.lastdate2) !== null" class="days-badge">
                  {{ getDaysBetween(routine.lastdate1, routine.lastdate2) }} 天
                </span>
              </td>
              <td class="td-date">{{ formatDate(routine.lastdate3) }}</td>
              <td class="td-actions">
                <button @click="handleShiftDates(routine)" class="btn-shift" title="日期遞移">&rarr;</button>
                <button @click="openEditModal(routine)" class="btn-edit">編輯</button>
                <button @click="handleDelete(routine.id)" class="btn-delete">刪除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Image Preview Lightbox -->
      <div v-if="previewImage" class="lightbox-overlay" @click="previewImage = null">
        <img :src="previewImage" class="lightbox-image" />
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ isEditMode ? '編輯例行' : '新增例行' }}</h2>
            <button @click="closeModal" class="btn-close">×</button>
          </div>
          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-group">
              <label>名稱 *</label>
              <input
                v-model="formData.name"
                type="text"
                required
                placeholder="例行名稱"
              />
            </div>
            <div class="form-group">
              <label>備註</label>
              <textarea
                v-model="formData.note"
                rows="3"
                placeholder="備註說明"
              ></textarea>
            </div>
            <div class="form-group">
              <label>最後日期1</label>
              <input v-model="formData.lastdate1" type="date" />
            </div>
            <div class="form-group">
              <label>最後日期2</label>
              <input v-model="formData.lastdate2" type="date" />
            </div>
            <div class="form-group">
              <label>最後日期3</label>
              <input v-model="formData.lastdate3" type="date" />
            </div>
            <div class="form-group">
              <label>連結</label>
              <input
                v-model="formData.link"
                type="text"
                placeholder="https://..."
              />
            </div>
            <div class="form-group">
              <label>照片上傳</label>
              <div class="upload-area">
                <input
                  ref="photoInput"
                  type="file"
                  accept="image/*"
                  @change="handlePhotoUpload"
                  style="display: none"
                />
                <button
                  type="button"
                  @click="$refs.photoInput.click()"
                  class="btn-upload"
                  :disabled="uploading"
                >
                  {{ uploading ? '上傳中...' : '選擇照片' }}
                </button>
                <span v-if="uploadProgress > 0" class="upload-progress">{{ uploadProgress }}%</span>
              </div>
              <div v-if="formData.photo" class="photo-preview">
                <img :src="formData.photo" alt="預覽" class="preview-image" />
                <button type="button" @click="removePhoto" class="btn-remove">移除</button>
              </div>
              <input
                v-model="formData.photo"
                type="text"
                placeholder="或直接輸入照片 URL"
                class="url-input"
              />
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-cancel">
                取消
              </button>
              <button type="submit" class="btn-submit">
                {{ isEditMode ? '更新' : '新增' }}
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
import { useRoutines } from '../../composables/useRoutines'
import { useStorage } from '../../composables/useStorage'

useHead({
  title: '鋒兄例行 - 鋒兄AI Supabase'
})

const {
  routines,
  loading,
  FIELDS,
  loadRoutines,
  addRoutine,
  updateRoutine,
  deleteRoutine,
  importRoutines
} = useRoutines()

const { uploading, uploadProgress, uploadFile } = useStorage()

const searchQuery = ref('')
const photoInput = ref(null)
const showModal = ref(false)
const previewImage = ref(null)
const isEditMode = ref(false)
const formData = ref({
  id: null,
  name: '',
  note: '',
  lastdate1: '',
  lastdate2: '',
  lastdate3: '',
  link: '',
  photo: ''
})

const filteredRoutines = computed(() => {
  if (!searchQuery.value) return routines.value
  const query = searchQuery.value.toLowerCase()
  return routines.value.filter(routine =>
    routine.name?.toLowerCase().includes(query)
  )
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('zh-TW')
  } catch (e) {
    return dateString
  }
}

const getDaysBetween = (date1, date2) => {
  if (!date1 || !date2) return null
  try {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffMs = Math.abs(d1 - d2)
    return Math.round(diffMs / (1000 * 60 * 60 * 24))
  } catch (e) {
    return null
  }
}

const resetForm = () => {
  formData.value = {
    id: null,
    name: '',
    note: '',
    lastdate1: '',
    lastdate2: '',
    lastdate3: '',
    link: '',
    photo: ''
  }
}

const openAddModal = () => {
  resetForm()
  isEditMode.value = false
  showModal.value = true
}

const openEditModal = (routine) => {
  formData.value = {
    id: routine.id,
    name: routine.name || '',
    note: routine.note || '',
    lastdate1: routine.lastdate1 ? routine.lastdate1.split('T')[0] : '',
    lastdate2: routine.lastdate2 ? routine.lastdate2.split('T')[0] : '',
    lastdate3: routine.lastdate3 ? routine.lastdate3.split('T')[0] : '',
    link: routine.link || '',
    photo: routine.photo || ''
  }
  isEditMode.value = true
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

// Photo upload handler
const handlePhotoUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const result = await uploadFile(file, 'routine')
    if (result.success) {
      formData.value.photo = result.url
      alert('照片上傳成功！')
    } else {
      alert('上傳失敗: ' + result.error)
    }
  } catch (error) {
    console.error('Upload error:', error)
    alert('上傳失敗: ' + error.message)
  }
}

// Remove uploaded photo
const removePhoto = () => {
  formData.value.photo = ''
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

const handleSubmit = async () => {
  try {
    const data = {
      name: formData.value.name,
      note: formData.value.note,
      lastdate1: formData.value.lastdate1 || null,
      lastdate2: formData.value.lastdate2 || null,
      lastdate3: formData.value.lastdate3 || null,
      link: formData.value.link,
      photo: formData.value.photo
    }

    if (isEditMode.value) {
      await updateRoutine(formData.value.id, data)
    } else {
      await addRoutine(data)
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save routine:', error)
    alert('儲存失敗: ' + error.message)
  }
}

const handleShiftDates = async (routine) => {
  if (!confirm('確定要執行日期遞移嗎？\n\n最近例行之一 → 最近例行之二\n最近例行之二 → 最近例行之三\n最近例行之一 → 清空')) return
  try {
    await updateRoutine(routine.id, {
      ...routine,
      lastdate1: null,
      lastdate2: routine.lastdate1 || null,
      lastdate3: routine.lastdate2 || null
    })
  } catch (error) {
    console.error('Failed to shift dates:', error)
    alert('日期遞移失敗: ' + error.message)
  }
}

const handleDelete = async (id) => {
  if (!confirm('確定要刪除此例行記錄嗎?')) return
  try {
    await deleteRoutine(id)
  } catch (error) {
    console.error('Failed to delete routine:', error)
    alert('刪除失敗: ' + error.message)
  }
}

const exportCsv = () => {
  if (routines.value.length === 0) {
    alert('無資料可匯出')
    return
  }

  const headers = FIELDS
  const rows = routines.value.map(routine => {
    return FIELDS.map(field => {
      const value = routine[field] ?? ''
      const escaped = String(value).replace(/"/g, '""')
      return `"${escaped}"`
    }).join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'supabase-routine.csv'
  link.click()
}

const parseCsv = (text) => {
  const lines = []
  let currentLine = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        currentLine.push(currentField)
        currentField = ''
      } else if (char === '\n') {
        currentLine.push(currentField)
        if (currentLine.length > 0) {
          lines.push(currentLine)
        }
        currentLine = []
        currentField = ''
      } else if (char === '\r') {
        // Skip
      } else {
        currentField += char
      }
    }
  }

  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField)
    lines.push(currentLine)
  }

  return lines
}

const handleImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const lines = parseCsv(text.replace(/^\uFEFF/, ''))

    if (lines.length < 2) {
      alert('CSV 檔案格式不正確')
      return
    }

    const headers = lines[0]
    const isAppwrite = headers.some(h => h.startsWith('$'))

    const records = lines.slice(1).map(line => {
      const record = {}
      headers.forEach((header, index) => {
        const cleanHeader = header.replace(/^\$/, '')
        let value = line[index] || ''

        // Skip Appwrite system fields
        if (header.startsWith('$') && !['$createdAt', '$updatedAt'].includes(header)) {
          return
        }

        // Map Appwrite timestamps
        if (isAppwrite && header === '$createdAt' && !headers.includes('created_at')) {
          record.created_at = value
        } else if (isAppwrite && header === '$updatedAt' && !headers.includes('updated_at')) {
          record.updated_at = value
        } else if (FIELDS.includes(cleanHeader)) {
          record[cleanHeader] = value
        }
      })
      return record
    })

    await importRoutines(records)
    alert(`成功匯入 ${records.length} 筆記錄`)
    event.target.value = ''
  } catch (error) {
    console.error('Import failed:', error)
    alert('匯入失敗: ' + error.message)
  }
}

onMounted(() => {
  loadRoutines()
})
</script>

<style scoped>
.routine-page {
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

.actions-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #f2994a;
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
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-export:hover,
.btn-import:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-import {
  display: inline-block;
}

.btn-add {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 153, 74, 0.4);
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.routine-table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.routine-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  min-width: 900px;
}

.routine-table thead {
  background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
}

.routine-table thead th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-weight: 600;
  color: white;
  font-size: 0.95rem;
  white-space: nowrap;
}

.routine-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.routine-table tbody tr:hover {
  background: rgba(242, 153, 74, 0.06);
}

.routine-table tbody tr:last-child {
  border-bottom: none;
}

.routine-table td {
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  color: #333;
  vertical-align: middle;
}

.td-name {
  font-weight: 600;
  min-width: 100px;
}

.td-note {
  max-width: 200px;
  white-space: pre-wrap;
  word-break: break-word;
  color: #666;
}

.td-photo {
  width: 60px;
}

.table-photo {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.table-photo:hover {
  transform: scale(1.1);
}

.td-date {
  white-space: nowrap;
  font-size: 0.9rem;
}

.td-days {
  text-align: center;
}

.days-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  background: linear-gradient(135deg, rgba(242, 153, 74, 0.15) 0%, rgba(242, 201, 76, 0.15) 100%);
  color: #e67e22;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
}

.td-actions {
  white-space: nowrap;
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
}

.lightbox-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.btn-shift,
.btn-edit,
.btn-delete {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-shift {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-shift:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(17, 153, 142, 0.3);
}

.btn-edit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-edit:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-delete:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(245, 87, 108, 0.3);
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

.modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #f2994a;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-cancel {
  background: #e0e0e0;
  color: #666;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

.btn-submit {
  background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
  color: white;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 153, 74, 0.4);
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

.photo-preview {
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

.url-input {
  margin-top: 0.5rem;
}

</style>
