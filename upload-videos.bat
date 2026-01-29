@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo 🎬 影片上傳到 Netlify Blobs
echo ==========================================
echo.

echo 📋 檢查環境...
if not exist "public\videos\鋒兄進化 Show🔥影片保留十五年.mp4" (
    echo ❌ 找不到影片文件: 鋒兄進化 Show🔥影片保留十五年.mp4
    echo 請確保影片文件已放置在 public\videos\ 目錄中
    pause
    exit /b 1
)

echo ✅ 影片文件檢查完成
echo.

echo 📤 開始上傳影片...
node scripts/upload-videos.js

echo.
echo ==========================================
echo 🎉 影片上傳完成！
echo ==========================================
echo.
echo 💡 提示:
echo - 影片已上傳到 Netlify Blobs
echo - 可以在網站的影片庫中查看
echo - 如果遇到問題，請檢查 Netlify 設定
echo.
pause