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
      <div v-else class="routine-grid">
        <div
          v-for="routine in filteredRoutines"
          :key="routine.id"
          class="routine-card"
        >
          <div class="card-header">
            <h3>{{ routine.name }}</h3>
            <div class="card-actions">
              <button @click="openEditModal(routine)" class="btn-edit">
                編輯
              </button>
              <button @click="handleDelete(routine.id)" class="btn-delete">
                刪除
              </button>
            </div>
          </div>
          <div class="card-body">
            <p v-if="routine.note" class="note">{{ routine.note }}</p>
            <div class="dates">
              <div v-if="routine.lastdate1" class="date-item">
                <span class="date-label">日期1:</span>
                <span>{{ formatDate(routine.lastdate1) }}</span>
              </div>
              <div v-if="routine.lastdate2" class="date-item">
                <span class="date-label">日期2:</span>
                <span>{{ formatDate(routine.lastdate2) }}</span>
              </div>
              <div v-if="routine.lastdate3" class="date-item">
                <span class="date-label">日期3:</span>
                <span>{{ formatDate(routine.lastdate3) }}</span>
              </div>
            </div>
            <div v-if="routine.link" class="link">
              <a :href="routine.link" target="_blank" rel="noopener noreferrer">
                {{ routine.link }}
              </a>
            </div>
            <div v-if="routine.photo" class="photo">
              <span class="photo-label">照片:</span>
              <span>{{ routine.photo }}</span>
            </div>
          </div>
        </div>
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
              <label>照片</label>
              <input
                v-model="formData.photo"
                type="text"
                placeholder="照片路徑或URL"
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

const searchQuery = ref('')
const showModal = ref(false)
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

.routine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .routine-grid {
    grid-template-columns: 1fr;
  }
}

.routine-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  border-left: 4px solid transparent;
  border-image: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%) 1;
}

.routine-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(242, 153, 74, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
  flex: 1;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

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

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.note {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.dates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(242, 153, 74, 0.1) 0%, rgba(242, 201, 76, 0.1) 100%);
  border-radius: 8px;
}

.date-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.date-label {
  font-weight: 600;
  color: #f2994a;
}

.link {
  margin-top: 0.5rem;
}

.link a {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  word-break: break-all;
  transition: color 0.3s;
}

.link a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.photo {
  font-size: 0.9rem;
  color: #666;
}

.photo-label {
  font-weight: 600;
  color: #f2994a;
  margin-right: 0.5rem;
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
</style>
