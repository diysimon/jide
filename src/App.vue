<template>
  <div class="app">
    <header class="app-header">
      <h1>🧠 Jide</h1>
      <p class="tagline">用科技守护记忆</p>
    </header>
    <main class="app-main">
      <router-view />
    </main>
    <nav class="app-nav">
      <router-link to="/" class="nav-item">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">首页</span>
      </router-link>
      <router-link to="/training" class="nav-item">
        <span class="nav-icon">🎯</span>
        <span class="nav-text">训练</span>
      </router-link>
      <router-link to="/stats" class="nav-item">
        <span class="nav-icon">📊</span>
        <span class="nav-text">统计</span>
      </router-link>
      <router-link to="/profile" class="nav-item">
        <span class="nav-icon">👤</span>
        <span class="nav-text">我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
// App组件
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.app-header {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  color: white;
  padding: 1.5rem 1rem;
  text-align: center;
}

.app-header h1 {
  font-size: 2rem;
  margin: 0;
}

.tagline {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0.5rem 0 0;
}

.app-main {
  flex: 1;
  padding: 1rem;
  padding-bottom: 5rem;
}

.app-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.08);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.nav-item.router-link-active {
  color: #1e3a5f;
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.nav-text {
  font-size: 0.75rem;
}
</style>
