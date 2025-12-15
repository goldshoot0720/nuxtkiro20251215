# 影片檔案目錄

## 📁 用途

此目錄用於存放網站的影片檔案，作為 Netlify Blobs 的替代方案。

## 🎬 需要的影片檔案

請將以下影片檔案放置在此目錄中：

1. **鋒兄的傳奇人生**
   - 檔案名稱：`19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4`

2. **鋒兄進化Show🔥**
   - 檔案名稱：`clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4`

## 🚀 使用方式

1. 將影片檔案放置在此目錄中
2. 影片將通過以下 URL 訪問：
   - `/videos/19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4`
   - `/videos/clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4`

## 📝 注意事項

- 影片檔案會被包含在 Git 倉庫中（除非在 .gitignore 中排除）
- 較大的檔案可能會增加倉庫大小和部署時間
- 應用程式會自動偵測並載入此目錄中的影片

## 🔄 與 Netlify Blobs 的關係

應用程式會依序嘗試以下來源：
1. Netlify Blobs（如果可用）
2. 此 public/videos 目錄

這確保了最大的兼容性和可靠性。