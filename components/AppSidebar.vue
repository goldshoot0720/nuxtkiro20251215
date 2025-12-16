<template>
  <nav class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <h2>選單</h2>
      <button 
        class="sidebar-toggle mobile-only" 
        @click="$emit('toggle')"
        aria-label="關閉選單"
      >
        ✕
      </button>
    </div>
    <ul class="nav-list">
      <li>
        <a 
          href="#" 
          @click.prevent="setContent('home')"
          :class="{ active: activeContent === 'home' }"
        >
          首頁
        </a>
      </li>
      <li>
        <a 
          href="#" 
          @click.prevent="setContent('dashboard')"
          :class="{ active: activeContent === 'dashboard' }"
        >
          儀表板
        </a>
      </li>
      <li>
        <a 
          href="#" 
          @click.prevent="setContent('subscription')"
          :class="{ active: activeContent === 'subscription' }"
        >
          訂閱管理
        </a>
      </li>
      <li>
        <a 
          href="#" 
          @click.prevent="setContent('food')"
          :class="{ active: activeContent === 'food' }"
        >
          食品管理
        </a>
      </li>
      <li>
        <a 
          href="#" 
          @click.prevent="setContent('services')"
          :class="{ active: activeContent === 'services' }"
        >
          服務項目
        </a>
      </li>
      <li>
        <a 
          href="#" 
          @click.prevent="setContent('portfolio')"
          :class="{ active: activeContent === 'portfolio' }"
        >
          作品集
        </a>
      </li>
      <li>
        <a 
          href="#" 
          @click.prevent="setContent('videos')"
          :class="{ active: activeContent === 'videos' }"
        >
          影片介紹
        </a>
      </li>
      <li>
        <a 
          href="#" 
          @click.prevent="setContent('about')"
          :class="{ active: activeContent === 'about' }"
        >
          關於我們
        </a>
      </li>
      <li>
        <a 
          href="#" 
          @click.prevent="setContent('contact')"
          :class="{ active: activeContent === 'contact' }"
        >
          聯絡我們
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  activeContent: {
    type: String,
    default: 'home'
  }
})

const emit = defineEmits(['toggle', 'close', 'set-content'])

const setContent = (content) => {
  emit('set-content', content)
}
</script>

<style scoped>
.sidebar {
  background: #2c3e50;
  color: white;
  transition: transform 0.3s ease;
  z-index: 1000;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #34495e;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  border-bottom: 1px solid #34495e;
}

.nav-list a {
  display: block;
  padding: 1rem;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
  cursor: pointer;
}

.nav-list a:hover,
.nav-list a.active {
  background-color: #34495e;
}

.mobile-only {
  display: none;
}

/* 電腦版 */
@media (min-width: 769px) {
  .sidebar {
    width: 250px;
    position: static;
  }
}

/* 手機版 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    transform: translateX(-100%);
  }
  
  .sidebar-open {
    transform: translateX(0);
  }
  
  .sidebar-toggle {
    display: block;
  }
  
  .mobile-only {
    display: block;
  }
}
</style>