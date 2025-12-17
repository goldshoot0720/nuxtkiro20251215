<template>
  <header class="top-header">
    <div class="header-left">
      <button @click="$emit('toggleSidebar')" class="mobile-menu-btn">
        <span class="menu-icon">☰</span>
      </button>
      <h1>{{ title }}</h1>
    </div>
    
    <div class="header-right">
      <slot name="actions" />
      
      <button
        @click="$emit('toggleDarkMode')"
        class="dark-mode-toggle"
        :title="isDarkMode ? '切換到亮色模式' : '切換到暗黑模式'"
      >
        <span class="dark-mode-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, default: '鋒兄管理系統' },
  isDarkMode: { type: Boolean, default: false }
})

defineEmits(['toggleSidebar', 'toggleDarkMode'])
</script>

<style scoped>
.top-header {
  background: linear-gradient(135deg, var(--header-bg, #ffffff) 0%, rgba(255, 255, 255, 0.95) 100%);
  padding: 1.25rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-btn:hover {
  background: var(--bg-tertiary, #f8f9fa);
}

.menu-icon {
  font-size: 1.2rem;
}

.top-header h1 {
  color: var(--text-primary, #2c3e50);
  font-size: 2.4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  text-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  letter-spacing: 1px;
}

.dark-mode-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-mode-toggle:hover {
  background: var(--bg-tertiary, #f8f9fa);
  transform: rotate(180deg);
}

.dark-mode-icon {
  font-size: 1.2rem;
}

/* 暗黑模式 */
:global(.dark) .top-header {
  background: linear-gradient(135deg, #1e293b 0%, rgba(30, 41, 59, 0.95) 100%);
  border-bottom-color: #475569;
}

:global(.dark) .top-header h1 {
  background: none;
  -webkit-background-clip: unset;
  -webkit-text-fill-color: unset;
  background-clip: unset;
  color: #f1f5f9;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

:global(.dark) .mobile-menu-btn:hover,
:global(.dark) .dark-mode-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 桌面端隱藏手機選單按鈕 */
@media (min-width: 769px) {
  .mobile-menu-btn {
    display: none;
  }
}

/* 響應式 */
@media (max-width: 768px) {
  .top-header {
    padding: 1rem 1.5rem;
  }
  
  .top-header h1 {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .top-header {
    padding: 0.8rem 1rem;
  }
  
  .top-header h1 {
    font-size: 1.2rem;
  }
}
</style>
