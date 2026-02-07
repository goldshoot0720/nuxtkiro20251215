<template>
  <div class="food-management">
    <!-- 操作列 -->
    <div class="actions-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜尋食品..."
      />
      <div class="csv-actions">
        <button v-if="foods.length > 0" @click="exportFoodsCsv" class="btn-export">匯出 CSV</button>
        <label class="btn-import">
          匯入 CSV
          <input ref="csvFileInput" type="file" accept=".csv" style="display:none" @change="handleImportCsv" />
        </label>
      </div>
      <button @click="openAddModal" class="btn-add">新增</button>
    </div>

    <!-- 摘要列 -->
    <div class="summary-bar">
      <span>共 {{ foods.length }} 個項目</span>
      <span v-if="expiringFoods.length > 0" class="expiry-warning">{{ expiringFoods.length }} 項即將到期</span>
    </div>

    <!-- 食物表格 -->
    <div v-if="foodLoading" class="loading">載入中...</div>
    <div v-else-if="filteredFoods.length === 0" class="empty-state">暫無食品記錄</div>
    <div v-else class="food-table-wrapper">
      <table class="food-table">
        <thead>
          <tr>
            <th>名稱</th>
            <th>有效期限</th>
            <th>數量</th>
            <th>圖片</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="food in filteredFoods" :key="food.id">
            <td class="td-name">{{ food.name }}</td>
            <td class="td-date">
              <span :class="getExpiryClass(food.todate)">{{ formatDate(food.todate) }}</span>
            </td>
            <td class="td-amount">{{ food.amount || '' }}</td>
            <td class="td-photo">
              <img
                v-if="food.photo"
                :src="food.photo"
                :alt="food.name"
                class="table-photo"
                @click="previewImage = food.photo"
              />
            </td>
            <td class="td-actions">
              <button @click="openEditModal(food)" class="btn-edit">編輯</button>
              <button @click="deleteFood(food.id)" class="btn-delete">刪除</button>
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
          <h2>{{ editingFood ? '編輯食物' : '新增食物' }}</h2>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label>食物名稱 *</label>
            <input v-model="newFood.name" type="text" required placeholder="例如：牛奶、雞蛋" />
          </div>
          <div class="form-group">
            <label>數量</label>
            <input v-model="newFood.amount" type="number" placeholder="1" min="1" />
          </div>
          <div class="form-group">
            <label>價格 (NT$)</label>
            <input v-model="newFood.price" type="number" placeholder="100" min="0" />
          </div>
          <div class="form-group">
            <label>購買商店</label>
            <input v-model="newFood.shop" type="text" placeholder="例如：全聯福利中心" />
          </div>
          <div class="form-group">
            <label>到期日期</label>
            <input v-model="newFood.todate" type="date" />
          </div>
          <div class="form-group">
            <label>食物照片</label>
            <div class="upload-area">
              <input ref="photoFileInput" type="file" accept="image/*" @change="handlePhotoUpload" style="display:none" />
              <button type="button" @click="$refs.photoFileInput.click()" class="btn-upload" :disabled="uploading">
                {{ uploading ? '上傳中...' : '選擇照片' }}
              </button>
            </div>
            <div v-if="newFood.photo" class="photo-preview">
              <img :src="newFood.photo" alt="預覽" class="preview-image" />
              <button type="button" @click="removePhoto" class="btn-remove">移除</button>
            </div>
            <input v-model="newFood.photo" type="text" placeholder="或直接輸入照片 URL" class="url-input" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">取消</button>
            <button type="submit" class="btn-submit" :disabled="foodLoading || !newFood.name">
              {{ editingFood ? '更新' : '新增' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFoods } from '../../composables/useFoods'
import { useFormatters } from '../../composables/useFormatters'
import { useStorage } from '../../composables/useStorage'

const searchQuery = ref('')
const showModal = ref(false)
const previewImage = ref(null)
const photoFileInput = ref(null)

const { uploading, uploadProgress, uploadFile } = useStorage()

const {
  foods,
  foodLoading,
  editingFood,
  newFood,
  expiringFoods,
  sortedFoods,
  loadFoods,
  addFood,
  importFoods,
  isAppwriteFormat,
  editFood,
  updateFood,
  deleteFood,
  resetFoodForm
} = useFoods()

const { formatDate, getExpiryClass } = useFormatters()

const filteredFoods = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return sortedFoods.value
  return sortedFoods.value.filter(f =>
    (f.name || '').toLowerCase().includes(q) ||
    (f.shop || '').toLowerCase().includes(q)
  )
})

const openAddModal = () => {
  resetFoodForm()
  showModal.value = true
}

const openEditModal = (food) => {
  editFood(food)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetFoodForm()
}

const handleSubmit = async () => {
  if (editingFood.value) {
    await updateFood()
  } else {
    await addFood()
  }
  closeModal()
}

const handlePhotoUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { alert('請選擇圖片檔案'); return }
  const result = await uploadFile(file, 'food')
  if (result.success) {
    newFood.value.photo = result.url
  } else {
    alert('圖片上傳失敗: ' + result.error)
  }
  e.target.value = ''
}

const removePhoto = () => {
  newFood.value.photo = ''
}

onMounted(() => {
  loadFoods()
})

const exportFoodsCsv = () => {
  const header = ['name', 'amount', 'price', 'shop', 'todate', 'photo', 'photohash']
  const rows = sortedFoods.value.map(food => [
    food.name || '', food.amount ?? '', food.price ?? '',
    food.shop || '', food.todate || '', food.photo || '', food.photohash || ''
  ])
  const bom = '\uFEFF'
  const csvContent = bom + [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'supabase-food.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const csvFileInput = ref(null)

const parseCsv = (text) => {
  const parseRow = (line) => {
    const cells = []; let current = ''; let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') { if (inQuotes && line[i+1] === '"') { current += '"'; i++ } else inQuotes = !inQuotes }
      else if (char === ',' && !inQuotes) { cells.push(current.trim()); current = '' }
      else current += char
    }
    cells.push(current.trim()); return cells
  }
  const splitIntoRows = (text) => {
    const rows = []; let current = ''; let inQuotes = false
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      if (char === '"') { inQuotes = !inQuotes; current += char }
      else if (char === '\n' && !inQuotes) { if (current.trim()) rows.push(current); current = '' }
      else current += char
    }
    if (current.trim()) rows.push(current); return rows
  }
  const lines = splitIntoRows(text)
  if (lines.length < 2) return []
  const headers = parseRow(lines[0])
  return lines.slice(1).map(line => {
    const cells = parseRow(line); const obj = {}
    headers.forEach((h, i) => { obj[h] = cells[i] || '' }); return obj
  })
}

const handleImportCsv = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const text = await file.text()
  const rows = parseCsv(text)
  if (rows.length === 0) { alert('CSV 檔案無有效資料'); return }
  const isAppwrite = isAppwriteFormat(rows)
  let confirmMsg = `確定匯入 ${rows.length} 筆食品資料？`
  if (isAppwrite) confirmMsg = `偵測到 ISO 8601 日期格式\n系統將自動轉換\n\n確定匯入 ${rows.length} 筆食品資料？`
  if (!confirm(confirmMsg)) return
  const result = await importFoods(rows)
  if (result.success) alert(`成功匯入 ${result.count} 筆食品！`)
  else alert('匯入失敗: ' + result.error)
  e.target.value = ''
}

defineExpose({ foods, expiringFoods })
</script>

<style scoped>
.food-management {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.actions-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
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
  border-color: #27ae60;
}

.csv-actions { display: flex; gap: 0.5rem; }

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

.btn-import { display: inline-block; }

.btn-add {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
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
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
}

.summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.08) 0%, rgba(46, 204, 113, 0.08) 100%);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  color: #555;
}

.expiry-warning {
  color: #e74c3c;
  font-weight: 700;
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

/* Table */
.food-table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.food-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  min-width: 600px;
}

.food-table thead {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
}

.food-table thead th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-weight: 600;
  color: white;
  font-size: 0.95rem;
  white-space: nowrap;
}

.food-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.food-table tbody tr:hover {
  background: rgba(39, 174, 96, 0.06);
}

.food-table tbody tr:last-child { border-bottom: none; }

.food-table td {
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  color: #333;
  vertical-align: middle;
}

.td-name { font-weight: 600; min-width: 100px; }

.td-date { white-space: nowrap; font-size: 0.9rem; }

.td-amount { text-align: center; }

.td-photo { width: 60px; }

.table-photo {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.table-photo:hover { transform: scale(1.1); }

.td-actions { white-space: nowrap; }

.date-normal { color: #27ae60; }
.date-soon { color: #f39c12; font-weight: bold; }
.date-overdue { color: #e74c3c; font-weight: bold; }
.date-critical { color: #e74c3c; font-weight: bold; }

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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

/* Buttons */
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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
  max-width: 550px;
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
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
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
  width: 32px; height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.btn-close:hover { background: #f5f5f5; color: #333; }

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

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #27ae60;
}

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

.btn-upload:disabled { opacity: 0.6; cursor: not-allowed; }

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

.url-input { margin-top: 0.5rem; }

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

.btn-cancel { background: #e0e0e0; color: #666; }
.btn-cancel:hover { background: #d0d0d0; }

.btn-submit {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
}

.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
</style>
