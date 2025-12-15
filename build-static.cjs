#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory ${src} does not exist`);
    process.exit(1);
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('🏗️ Building static site...');

// 检查 .output/public 目录
const outputDir = '.output/public';
const distDir = 'dist';

if (fs.existsSync(outputDir)) {
  console.log('✅ Found .output/public directory');
  console.log('📁 Contents:', fs.readdirSync(outputDir));
  
  console.log('📋 Copying files to dist directory...');
  copyDir(outputDir, distDir);
  
  console.log('✅ Static site built successfully!');
  console.log('📊 Dist directory contents:', fs.readdirSync(distDir));
} else {
  console.error('❌ .output/public directory not found');
  console.log('📁 Current directory contents:', fs.readdirSync('.'));
  process.exit(1);
}