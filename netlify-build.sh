#!/bin/bash

# Netlify构建脚本
echo "🚀 开始Netlify构建..."

# 显示环境信息
echo "📋 环境信息:"
echo "Node版本: $(node --version)"
echo "NPM版本: $(npm --version)"
echo "当前目录: $(pwd)"

# 安装依赖
echo "📦 安装依赖..."
npm ci --verbose

# 显示package.json内容
echo "📄 Package.json scripts:"
cat package.json | grep -A 10 '"scripts"'

# 清理缓存
echo "🧹 清理缓存..."
rm -rf .nuxt .output node_modules/.cache

# 显示文件结构
echo "📁 项目文件结构:"
ls -la

# 生成静态站点
echo "🏗️ 生成静态站点..."
npm run generate --verbose

# 检查输出目录
echo "🔍 检查输出目录..."
if [ -d ".output" ]; then
    echo "✅ .output 目录存在"
    ls -la .output/
    if [ -d ".output/public" ]; then
        echo "✅ .output/public 目录存在"
        ls -la .output/public/
        echo "📊 文件统计:"
        find .output/public -type f | wc -l
    else
        echo "❌ .output/public 目录不存在！"
        exit 1
    fi
else
    echo "❌ .output 目录不存在！"
    exit 1
fi

echo "🎉 构建完成！"