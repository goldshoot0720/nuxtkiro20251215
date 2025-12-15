# 響應式UI設計 - Nuxt 3 專案

這是一個展示響應式UI設計的 Nuxt 3 專案，實現了跨裝置的自適應佈局。

## 設計特色

### 🖥️ 電腦版 (桌面)
- **佈局**：左側選單 + 右側內容展示
- **選單寬度**：250px 固定寬度
- **適用範圍**：螢幕寬度 > 768px

### 📱 手機版
- **佈局**：上側選單按鈕 + 下側內容展示
- **選單行為**：滑出式側邊選單 (280px 寬)
- **適用範圍**：螢幕寬度 ≤ 768px

### 📟 平板版
- **橫向模式**：比照電腦版 (左側選單 + 右側內容)
- **直向模式**：比照手機版 (滑出式選單)
- **自動切換**：根據螢幕方向自動調整佈局

### 💳 個人訂閱管理功能
- **本地存儲**：無需註冊登入，資料存儲在瀏覽器本地
- **訂閱追蹤**：管理個人所有訂閱服務 (Netflix, Spotify 等)
- **費用管理**：追蹤月費、計算總支出
- **到期提醒**：顯示下次扣款日期，標示即將到期的服務
- **完整資訊**：記錄服務名稱、網站、帳號、備註等
- **隱私保護**：所有資料僅存儲在本地，不會上傳到任何伺服器

## 技術實現

### 響應式斷點
```css
/* 電腦版和平板橫向 */
@media (min-width: 769px) { ... }

/* 手機版和平板直向 */
@media (max-width: 768px) { ... }

/* 平板橫向特定樣式 */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) { ... }

/* 平板直向特定樣式 */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) { ... }
```

### 主要組件
- `ResponsiveLayout.vue` - 主要佈局組件
- `ContentDisplay.vue` - 內容展示組件

### 功能特色
- ✅ 自動響應式佈局切換
- ✅ 滑出式選單動畫
- ✅ 觸控友善的互動設計
- ✅ 無障礙支援 (ARIA 標籤)
- ✅ 現代化 CSS Grid 和 Flexbox
- ✅ 平滑過渡動畫效果

## 快速開始

### 安裝依賴
```bash
npm install
```

### 啟動開發伺服器
```bash
npm run dev
```

開啟瀏覽器訪問 `http://localhost:3000` 查看效果。

### 使用方法
1. 點擊 **個人訂閱管理**
2. 填寫表單新增你的訂閱服務
3. 管理、編輯或刪除現有訂閱
4. 查看月總費用和到期提醒

### 測試響應式設計
1. 在瀏覽器中開啟開發者工具 (F12)
2. 切換到裝置模擬模式
3. 測試不同螢幕尺寸和方向
4. 觀察佈局自動調整效果

## 專案結構

```
├── app/
│   └── app.vue              # 主應用程式入口
├── components/
│   ├── ResponsiveLayout.vue # 響應式佈局組件
│   └── ContentDisplay.vue   # 內容展示組件
├── public/                  # 靜態資源
└── nuxt.config.ts          # Nuxt 配置檔
```

## 建置部署

### 建置生產版本
```bash
npm run build
```

### 預覽生產版本
```bash
npm run preview
```

### 生成靜態網站
```bash
npm run generate
```

## 瀏覽器支援

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+

## 授權

MIT License