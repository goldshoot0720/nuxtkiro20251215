// composables/useNavigation.js
// 導航管理 - 頁面切換和側邊欄控制
import { ref, computed } from 'vue'

// 共享狀態
const currentPage = ref('dashboard')
const sidebarOpen = ref(false)

// 頁面配置
const pages = [
  { id: 'dashboard', name: '儀表板', icon: '📊', title: '🏢 鋒兄儀表板' },
  { id: 'subscription', name: '訂閱管理', icon: '💳', title: '💳 鋒兄訂閱管理' },
  { id: 'food', name: '食物管理', icon: '🛒', title: '🛒 鋒兄食物管理' },
  { id: 'video', name: '影片庫', icon: '🎥', title: '🎥 鋒兄影片庫' },
  { id: 'gallery', name: '圖片庫', icon: '🖼️', title: '🖼️ 鋒兄圖片庫' }
]

export const useNavigation = () => {
  // 當前頁面配置
  const currentPageConfig = computed(() => {
    return pages.find(p => p.id === currentPage.value) || pages[0]
  })

  // 頁面標題
  const pageTitle = computed(() => currentPageConfig.value.title)

  // 設置當前頁面
  const setCurrentPage = (pageId) => {
    currentPage.value = pageId
    
    // 手機版自動關閉側邊欄
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      sidebarOpen.value = false
    }
    
    // 更新頁面標題
    if (typeof document !== 'undefined') {
      const config = pages.find(p => p.id === pageId)
      if (config) {
        document.title = `${config.name} - 鋒兄管理系統`
      }
    }
  }

  // 切換側邊欄
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  // 關閉側邊欄
  const closeSidebar = () => {
    sidebarOpen.value = false
  }

  // 響應式處理
  const handleResize = () => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      sidebarOpen.value = false
    }
  }

  return {
    currentPage,
    sidebarOpen,
    pages,
    currentPageConfig,
    pageTitle,
    setCurrentPage,
    toggleSidebar,
    closeSidebar,
    handleResize
  }
}
