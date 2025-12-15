#!/bin/bash

# Netlify构建脚本
echo "开始Netlify构建..."

# 安装依赖
echo "安装依赖..."
npm ci

# 清理缓存
echo "清理缓存..."
rm -rf .nuxt .output

# 生成静态站点
echo "生成静态站点..."
npm run generate

# 检查输出目录
if [ -d ".output/public" ]; then
    echo "✅ 静态站点生成成功！"
    ls -la .output/public/
else
    echo "❌ 静态站点生成失败！"
    exit 1
fi

echo "构建完成！"