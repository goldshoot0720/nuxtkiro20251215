<template>
  <div class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <h2>管理系統</h2>
      <button @click="$emit('toggle')" class="sidebar-toggle">
        {{ isOpen ? '✕' : '☰' }}
      </button>
    </div>
    
    <nav class="sidebar-nav">
      <ul>
        <li v-for="item in navItems" :key="item.id">
          <button 
            @click="$emit('navigate', item.id)" 
            :class="{ active: currentPage === item.id }"
            class="nav-btn"
          >
            {{ item.icon }} {{ item.label }}
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  currentPage: String
})

defineEmits(['toggle', 'navigate'])

const navItems = [
  { id: 'dashboard', icon: '📊', label: '儀表板' },
  { id: 'subscription', icon: '💳', label: '訂閱管理' },
  { id: 'food', icon: '🍎', label: '食品管理' },
  { id: 'video', icon: '🎬', label: '影片介紹' }
]
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: -250px;
  top: 0;
  width: 250px;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: left 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}

.sidebar-open {
  left: 0;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.sidebar-toggle:hover {
  background-color: rgba(255,255,255,0.1);
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-btn {
  width: 100%;
  padding: 15px 20px;
  background: none;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;
}

.nav-btn:hover {
  background-color: rgba(255,255,255,0.1);
}

.nav-btn.active {
  background-color: rgba(255,255,255,0.2);
  border-right: 3px solid white;
}
</style>