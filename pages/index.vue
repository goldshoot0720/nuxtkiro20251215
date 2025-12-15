<template>
  <div class="home-page">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>鋒兄塗哥公關資訊</h1>
        </div>
        <div class="nav-menu">
          <NuxtLink to="/" class="nav-link">首頁</NuxtLink>
          <NuxtLink to="/about" class="nav-link">關於我們</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">專業公關服務</h1>
        <p class="hero-subtitle">創新傳播策略 · 品牌價值提升</p>
        <div class="hero-buttons">
          <NuxtLink to="/about" class="btn btn-primary">了解更多</NuxtLink>
          <button class="btn btn-secondary">聯繫我們</button>
        </div>
      </div>
    </section>

    <!-- Services Preview -->
    <section class="services-preview">
      <div class="container">
        <h2>我們的服務</h2>
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">📢</div>
            <h3>媒體關係</h3>
            <p>建立並維護與各大媒體的良好關係</p>
          </div>
          <div class="service-card">
            <div class="service-icon">💡</div>
            <h3>品牌策略</h3>
            <p>量身定制品牌傳播策略</p>
          </div>
          <div class="service-card">
            <div class="service-icon">🛡️</div>
            <h3>危機處理</h3>
            <p>專業的危機公關處理</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({
  title: '鋒兄塗哥公關資訊 - 專業公關服務',
  meta: [
    { name: 'description', content: '鋒兄塗哥公關資訊提供專業公關服務，包括媒體關係、品牌策略、危機處理等。' }
  ]
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* 导航栏 */
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.nav-brand h1 {
  color: #667eea;
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #667eea;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 150px 0 100px;
  text-align: center;
  margin-top: 70px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.hero-subtitle {
  font-size: 1.3rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 15px 30px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

/* Services Preview */
.services-preview {
  padding: 100px 0;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.services-preview h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 60px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.service-card {
  background: white;
  padding: 40px 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-10px);
}

.service-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.service-card h3 {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 15px;
}

.service-card p {
  line-height: 1.6;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-menu {
    gap: 20px;
  }
}
</style>