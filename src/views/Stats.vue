<template>
  <div class="stats">
    <h2>📊 训练统计</h2>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon">🎮</span>
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">总训练次数</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">⭐</span>
        <span class="stat-value">{{ stats.avgScore }}</span>
        <span class="stat-label">平均得分</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">⏱️</span>
        <span class="stat-value">{{ formatDuration(stats.totalTime) }}</span>
        <span class="stat-label">总训练时长</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🏆</span>
        <span class="stat-value">{{ stats.achievements }}</span>
        <span class="stat-label">获得成就</span>
      </div>
    </div>

    <!-- 成就展示 -->
    <div class="achievements-section">
      <h3>🏆 我的成就</h3>
      <div class="achievements-list" v-if="achievements.length > 0">
        <div v-for="achievement in achievements" :key="achievement.id" class="achievement-item">
          <div class="achievement-icon">🎖️</div>
          <div class="achievement-info">
            <span class="achievement-name">{{ achievement.name }}</span>
            <span class="achievement-desc">{{ achievement.desc }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>还没有成就，快去训练吧！💪</p>
      </div>
    </div>

    <!-- 最近记录 -->
    <div class="history-section">
      <h3>📜 最近记录</h3>
      <div class="history-list" v-if="history.length > 0">
        <div v-for="record in history.slice(0, 10)" :key="record.id" class="history-item">
          <div class="history-game">{{ record.gameId }}</div>
          <div class="history-score">得分: {{ record.score }}</div>
          <div class="history-time">{{ formatDate(record.timestamp) }}</div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>还没有训练记录，开始你的第一次训练吧！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTrainingStore } from '../stores/training'

const trainingStore = useTrainingStore()

const stats = computed(() => trainingStore.stats)
const history = computed(() => trainingStore.history)
const achievements = computed(() => trainingStore.achievements)

function formatDuration(seconds) {
  if (!seconds) return '0分钟'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}分钟`
  const hours = Math.floor(mins / 60)
  return `${hours}小时${mins % 60}分钟`
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.stats {
  max-width: 600px;
  margin: 0 auto;
}

.stats h2 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  color: #1e3a5f;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: #1e3a5f;
}

.stat-label {
  font-size: 0.85rem;
  color: #888;
}

.achievements-section, .history-section {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.achievements-section h3, .history-section h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #333;
}

.achievements-list, .history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.achievement-icon {
  font-size: 1.5rem;
}

.achievement-info {
  display: flex;
  flex-direction: column;
}

.achievement-name {
  font-weight: 600;
  color: #333;
}

.achievement-desc {
  font-size: 0.85rem;
  color: #888;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  gap: 1rem;
}

.history-game {
  font-weight: 600;
  color: #1e3a5f;
  flex: 1;
}

.history-score {
  color: #4CAF50;
}

.history-time {
  font-size: 0.85rem;
  color: #888;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #888;
}
</style>
