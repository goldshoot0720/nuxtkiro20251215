<template>
  <div class="food-page">
    <div class="page-header">
      <h1>🍎 食品管理</h1>
      <button @click="showAddForm = !showAddForm" class="btn-primary">
        {{ showAddForm ? '取消' : '新增食品' }}
      </button>
    </div>

    <div v-if="showAddForm" class="add-form">
      <form @submit.prevent="addFood">
        <div class="form-row">
          <div class="form-group">
            <label>食品名稱:</label>
            <input v-model="newFood.name" type="text" required>
          </div>
          <div class="form-group">
            <label>類別:</label>
            <select v-model="newFood.category">
              <option value="fruit">水果</option>
              <option value="vegetable">蔬菜</option>
              <option value="meat">肉類</option>
              <option value="dairy">乳製品</option>
            </select>
          </div>
          <div class="form-group">
            <label>熱量 (kcal):</label>
            <input v-model.number="newFood.calories" type="number" min="0">
          </div>
        </div>
        <button type="submit" class="btn-primary">新增</button>
      </form>
    </div>

    <div class="food-grid">
      <div v-for="food in foods" :key="food.id" class="food-card">
        <span class="food-icon">{{ getCategoryIcon(food.category) }}</span>
        <h4>{{ food.name }}</h4>
        <p>{{ food.calories }} kcal</p>
        <button @click="deleteFood(food.id)" class="btn-delete">✕</button>
      </div>
      <div v-if="foods.length === 0" class="empty-state">暫無食品資料</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showAddForm = ref(false)
const foods = ref([])
const newFood = ref({ name: '', category: 'fruit', calories: 0 })

const getCategoryIcon = (cat) => ({ fruit: '🍎', vegetable: '🥬', meat: '🥩', dairy: '🧀' }[cat] || '🍽️')

const addFood = () => {
  foods.value.push({ id: Date.now(), ...newFood.value })
  newFood.value = { name: '', category: 'fruit', calories: 0 }
  showAddForm.value = false
}

const deleteFood = (id) => { foods.value = foods.value.filter(f => f.id !== id) }
</script>

<style scoped>
.food-page { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.add-form { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
.form-row { display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap; }
.form-group { flex: 1; min-width: 150px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
.form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px; }
.food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; }
.food-card { background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; position: relative; }
.food-icon { font-size: 40px; }
.food-card h4 { margin: 10px 0 5px; }
.food-card p { color: #666; margin: 0; }
.btn-delete { position: absolute; top: 5px; right: 5px; background: #ff5252; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; }
.btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
.empty-state { grid-column: 1/-1; text-align: center; padding: 40px; color: #999; }
</style>