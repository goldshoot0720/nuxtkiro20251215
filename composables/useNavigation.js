// composables/useNavigation.js
// 導航管理 - 頁面切換和側邊欄控制
import { ref, computed } from 'vue'

// 共享狀態
const currentPage = ref('home')
const sidebarOpen = ref(false)

// 頁面配置
const pages = [
  { id: 'home', name: '鋒兄首頁', icon: '🏠', title: '🏠 鋒兄首頁' },
  { id: 'dashboard', name: '鋒兄儀表', icon: '📊', title: '📊 鋒兄儀表' },
  { id: 'subscription', name: '鋒兄訂閱', icon: '💳', title: '💳 鋒兄訂閱' },
  { id: 'food', name: '鋒兄食品', icon: '🛒', title: '🛒 鋒兄食品' },
  { id: 'note', name: '鋒兄筆記', icon: '📝', title: '📝 鋒兄筆記' },
  { id: 'common', name: '鋒兄常用', icon: '⭐', title: '⭐ 鋒兄常用' },
  { id: 'gallery', name: '鋒兄圖片', icon: '🖼️', title: '🖼️ 鋒兄圖片' },
  { id: 'video', name: '鋒兄影片', icon: '🎥', title: '🎥 鋒兄影片' },
  { id: 'music', name: '鋒兄音樂', icon: '🎵', title: '🎵 鋒兄音樂' },
  { id: 'document', name: '鋒兄文件', icon: '📄', title: '📄 鋒兄文件' },
  { id: 'podcast', name: '鋒兄播客', icon: '🎙️', title: '🎙️ 鋒兄播客' },
  { id: 'bank', name: '鋒兄銀行', icon: '💰', title: '💰 鋒兄銀行' },
  { id: 'routine', name: '鋒兄例行', icon: '📅', title: '📅 鋒兄例行' },
  { id: 'settings', name: '鋒兄設定', icon: '⚙️', title: '⚙️ 鋒兄設定' },
  { id: 'about', name: '鋒兄關於', icon: 'ℹ️', title: 'ℹ️ 鋒兄關於' }
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
