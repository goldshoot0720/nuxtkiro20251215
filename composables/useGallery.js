// composables/useGallery.js
// 圖片庫的完整邏輯
import { ref, computed } from 'vue'

export const useGallery = () => {
  // 狀態
  const galleryImages = ref([])
  const searchQuery = ref('')
  const viewMode = ref('grid')
  const lightboxOpen = ref(false)
  const currentImageIndex = ref(0)

  // 計算屬性：篩選後的圖片
  const filteredImages = computed(() => {
    let filtered = galleryImages.value
    
    // 根據搜尋關鍵字篩選
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(img => 
        img.name.toLowerCase().includes(query) ||
        img.displayName.toLowerCase().includes(query)
      )
    }
    
    return filtered
  })

  // 計算屬性：當前 Lightbox 圖片
  const currentLightboxImage = computed(() => {
    return filteredImages.value[currentImageIndex.value] || {}
  })

  // 載入圖片庫
  const loadGalleryImages = () => {
    // 靜態圖片列表（實際專案中可從 API 獲取）
    const imageFiles = [
      '1761405863-3ca40781-b24f-4c48-9795-7bc061f58ed6.jpeg',
      '1761405934-74814b15-9720-44af-a88e-91f4933748c3.jpeg',
      '248adc66-2260-491b-b5a9-91ca01099528.jpeg',
      '50a2f658-0691-4694-a692-7c53a73c175f.jpg',
      'a31b59e0-088a-4d22-991b-a040af3884fa.jpeg',
      'apple-touch-icon.png',
      'ChatGPT Image 2025年10月16日 下午07_21_51.jpeg',
      'ChatGPT Image 2025年10月16日 下午07_37_12.jpeg',
      'ChatGPT Image 2025年10月16日 下午07_45_30.jpeg',
      'ChatGPT Image 2025年11月10日 上午07 07.png',
      'ChatGPT Image 2025年11月10日 上午07_29.png',
      'ChatGPT Image 2025年11月13日 上午09_08_37.png',
      'ChatGPT Image 2025年11月13日 上午09_10_45.png',
      'ChatGPT Image 2025年11月13日 上午09_18_36.png',
      'ChatGPT Image 2025年11月18日 上午02_00_03.png',
      'ChatGPT Image 2025年11月18日 上午02_11_13.png',
      'ec6a52ef-397a-481d-a1c2-4336dabc2eb5.jpeg',
      'f56a77b4-342b-4624-aaee-0a1eefda1c02.jpeg',
      'Gemini_Generated_Image_1acyxf1acyxf1acy.png',
      'Gemini_Generated_Image_1xs3cf1xs3cf1xs3.png',
      'Gemini_Generated_Image_3348083348083348.png',
      'Gemini_Generated_Image_4iscnp4iscnp4isc.png',
      'Gemini_Generated_Image_5xiatu5xiatu5xia.png',
      'Gemini_Generated_Image_76qn2776qn2776qn.png',
      'Gemini_Generated_Image_a5eanqa5eanqa5ea.png',
      'Gemini_Generated_Image_a7lvpba7lvpba7lv.png',
      'Gemini_Generated_Image_a959gfa959gfa959.png',
      'Gemini_Generated_Image_asj7abasj7abasj7.png',
      'Gemini_Generated_Image_avufzzavufzzavuf.png',
      'Gemini_Generated_Image_azcmkgazcmkgazcm.png',
      'Gemini_Generated_Image_br5g4ybr5g4ybr5g.png',
      'Gemini_Generated_Image_c7gqahc7gqahc7gq.png',
      'Gemini_Generated_Image_cuhb9mcuhb9mcuhb.png',
      'Gemini_Generated_Image_empb0tempb0tempb.png',
      'Gemini_Generated_Image_f7jzmkf7jzmkf7jz.png',
      'Gemini_Generated_Image_gb7e0tgb7e0tgb7e.png',
      'Gemini_Generated_Image_grs13tgrs13tgrs1.png',
      'Gemini_Generated_Image_jc0z4ojc0z4ojc0z.png',
      'Gemini_Generated_Image_kzhm4pkzhm4pkzhm.png',
      'Gemini_Generated_Image_mc90rjmc90rjmc90.png',
      'Gemini_Generated_Image_n016vun016vun016.png',
      'Gemini_Generated_Image_no8fxsno8fxsno8f.png',
      'Gemini_Generated_Image_p8s78p8s78p8s78p.png',
      'Gemini_Generated_Image_urahmhurahmhurah.png',
      'Gemini_Generated_Image_xcac14xcac14xcac.png',
      'Gemini_Generated_Image_xfh0ydxfh0ydxfh0.png',
      'Google-logo_1.jpg',
      'IMG_0032.jpg',
      'MindVideo_20251128135952_420.jpg',
      'MindVideo_20251128184816_627.jpg',
      'MindVideo_20251128190433_123.jpg',
      'MindVideo_20251128190629_343.jpg',
      'MindVideo_20251128191517_115.jpg',
      'MindVideo_20251128201528_755.jpg',
      'MindVideo_20251128203653_134.jpg',
      'MindVideo_20251203161758_843.png',
      'MindVideo_20251212222832_232.png',
      'MindVideo_20251214000745_021.png',
      'MindVideo_20251214013030_085.png',
      'Screenshot 2025-10-26 at 21-54-22 20251026_2146_01k8gbv2ynecwrezhhpnx3cwg1.mp4.png',
      'Screenshot 2025-12-05 at 00-22-42 .png',
      'sora2.jpg'
    ]

    galleryImages.value = imageFiles.map(filename => {
      const extension = filename.split('.').pop().toLowerCase()
      return {
        name: filename,
        displayName: filename.length > 50 ? filename.substring(0, 47) + '...' : filename,
        url: `/images/${filename}`,
        path: `public/images/${filename}`,
        extension: extension,
        size: Math.floor(Math.random() * 2000000) + 100000, // 模擬檔案大小
        type: ['jpg', 'jpeg'].includes(extension) ? 'jpeg' : extension
      }
    })
  }

  // 清除搜尋
  const clearSearch = () => {
    searchQuery.value = ''
  }

  // 開啟 Lightbox
  const openLightbox = (index) => {
    currentImageIndex.value = index
    lightboxOpen.value = true
    document.body.style.overflow = 'hidden'
  }

  // 關閉 Lightbox
  const closeLightbox = () => {
    lightboxOpen.value = false
    document.body.style.overflow = 'auto'
  }

  // 下一張圖片
  const nextImage = () => {
    if (currentImageIndex.value < filteredImages.value.length - 1) {
      currentImageIndex.value++
    }
  }

  // 上一張圖片
  const previousImage = () => {
    if (currentImageIndex.value > 0) {
      currentImageIndex.value--
    }
  }

  // 處理圖片載入錯誤
  const handleImageError = (event) => {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWclueJh+eEoeazleWKoOi8iDwvdGV4dD48L3N2Zz4='
  }

  // 下載圖片
  const downloadImage = (image) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 複製圖片網址
  const copyImageUrl = async (image) => {
    try {
      const fullUrl = window.location.origin + image.url
      await navigator.clipboard.writeText(fullUrl)
      alert('圖片網址已複製到剪貼簿！')
    } catch (err) {
      console.error('複製失敗:', err)
      alert('複製失敗，請手動複製網址')
    }
  }

  return {
    galleryImages,
    searchQuery,
    viewMode,
    lightboxOpen,
    currentImageIndex,
    filteredImages,
    currentLightboxImage,
    loadGalleryImages,
    clearSearch,
    openLightbox,
    closeLightbox,
    nextImage,
    previousImage,
    handleImageError,
    downloadImage,
    copyImageUrl
  }
}
