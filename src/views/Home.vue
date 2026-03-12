<template>
  <div class="home">
    <!-- 欢迎区域 -->
    <div class="welcome-card">
      <div class="welcome-avatar">👤</div>
      <div class="welcome-text">
        <h2>欢迎回来！</h2>
        <p>今天也要好好训练大脑🧠</p>
      </div>
    </div>

    <!-- 今日目标 -->
    <div class="today-goal">
      <h3>🎯 今日目标</h3>
      <div class="goal-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <p class="progress-text">{{ todayCount }} / {{ dailyTarget }} 次训练</p>
      </div>
    </div>

    <!-- 快速开始 -->
    <div class="quick-start">
      <h3>🚀 快速开始</h3>
      <div class="quick-buttons">
        <button @click="startRandomGame" class="quick-btn random">
          <span class="btn-icon">🎲</span>
          <span class="btn-text">随机练习</span>
        </button>
        <button @click="continueLastGame" class="quick-btn continue" :disabled="!lastGame">
          <span class="btn-icon">▶️</span>
          <span class="btn-text">继续上次</span>
        </button>
      </div>
    </div>

    <!-- 训练模块入口 -->
    <div class="modules-section">
      <h3>🧠 训练模块</h3>
      <div class="modules-grid">
        <div 
          v-for="(module, key) in trainingModules" 
          :key="key"
          class="module-card"
          :style="{ borderColor: module.color }"
          @click="goToModule(key)"
        >
          <div class="module-icon">{{ module.icon }}</div>
          <div class="module-info">
            <h4>{{ module.name }}</h4>
            <p>{{ module.games.length }}种训练</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useTrainingStore, trainingModules } from '../stores/training'

const router = useRouter()
const userStore = useUserStore()
const trainingStore = useTrainingStore()

const dailyTarget = 3
const todayCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return trainingStore.history.filter(h => h.timestamp.startsWith(today)).length
})

const progressPercent = computed(() => Math.min((todayCount.value / dailyTarget) * 100, 100))

const lastGame = computed(() => trainingStore.history[0]?.gameId)

function goToModule(key) {
  router.push({ path: '/training', query: { module: key } })
}

function startRandomGame() {
  const modules = Object.keys(trainingModules)
  const randomModule = modules[Math.floor(Math.random() * modules.length)]
  const games = trainingModules[randomModule].games
  const randomGame = games[Math.floor(Math.random() * games.length)]
  router.push(`/game/${randomModule}/${randomGame.id}`)
}

function continueLastGame() {
  if (lastGame.value) {
    const game = findGameById(lastGame.value)
    if (game) {
      router.push(`/game/${game.module}/${game.id}`)
    }
  }
}

function findGameById(gameId) {
  for (const [moduleKey, module] of Object.entries(trainingModules)) {
    const game = module.games.find(g => g.id === gameId)
    if (game) return { ...game, module: moduleKey }
  }
  return null
}
</script>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
}

.welcome-card {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.welcome-avatar {
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.welcome-text h2 {
  margin: 0;
  font-size: 1.5rem;
}

.welcome-text p {
  margin: 0.25rem 0 0;
  opacity: 0.9;
}

.today-goal, .quick-start, .modules-section {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.today-goal h3, .quick-start h3, .modules-section h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #333;
}

.progress-bar {
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.quick-buttons {
  display: flex;
  gap: 1rem;
}

.quick-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s;
}

.quick-btn:active {
  transform: scale(0.98);
}

.quick-btn.random {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.quick-btn.continue {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.75rem;
}

.btn-text {
  font-size: 0.95rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.module-card {
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 1rem;
  border-left: 4px solid;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.module-icon {
  font-size: 1.75rem;
}

.module-info h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #333;
}

.module-info p {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: #888;
}
</style>
