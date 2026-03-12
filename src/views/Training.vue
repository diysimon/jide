<template>
  <div class="training">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>🎯 选择训练</h2>
    </div>

    <!-- 模块列表 -->
    <div class="modules-list">
      <div 
        v-for="(module, key) in trainingModules" 
        :key="key"
        class="module-section"
      >
        <div class="module-header" :style="{ borderColor: module.color }">
          <span class="module-icon">{{ module.icon }}</span>
          <span class="module-name">{{ module.name }}</span>
        </div>
        
        <div class="games-grid">
          <button
            v-for="game in module.games"
            :key="game.id"
            class="game-card"
            @click="startGame(key, game.id)"
          >
            <div class="game-info">
              <span class="game-id">{{ game.id }}</span>
              <span class="game-name">{{ game.name }}</span>
              <span class="game-desc">{{ game.description }}</span>
            </div>
            <div class="game-difficulty">
              <span v-for="i in 3" :key="i" class="diff-dot" :class="{ active: i <= game.difficulty }"></span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { trainingModules } from '../stores/training'

const router = useRouter()

function startGame(module, gameId) {
  router.push(`/game/${module}/${gameId}`)
}
</script>

<style scoped>
.training {
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1e3a5f;
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.module-section {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 3px solid;
}

.module-icon {
  font-size: 1.5rem;
}

.module-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.game-card {
  background: #f8f9fa;
  border: none;
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  text-align: left;
  transition: transform 0.2s, box-shadow 0.2s;
}

.game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.game-card:active {
  transform: scale(0.98);
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.game-id {
  font-size: 0.75rem;
  color: #888;
  font-weight: 600;
}

.game-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.game-desc {
  font-size: 0.8rem;
  color: #888;
}

.game-difficulty {
  display: flex;
  gap: 4px;
  margin-top: 0.5rem;
}

.diff-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0e0e0;
}

.diff-dot.active {
  background: #4CAF50;
}

@media (max-width: 480px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
}
</style>
