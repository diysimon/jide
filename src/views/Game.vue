<template>
  <div class="game">
    <!-- 游戏头部 -->
    <div class="game-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <div class="game-info">
        <h2>{{ gameInfo.name }}</h2>
        <p>{{ gameInfo.description }}</p>
      </div>
      <div class="game-stats">
        <span class="stat">⏱️ {{ formatTime(time) }}</span>
        <span class="stat">✅ {{ matched }}/{{ totalPairs }}</span>
      </div>
    </div>

    <!-- 游戏区域 -->
    <div class="game-area">
      <!-- 开始界面 -->
      <div v-if="gameState === 'ready'" class="start-screen">
        <div class="start-icon">🧠</div>
        <h3>准备好开始了吗？</h3>
        <p>找出所有相同的卡片配对</p>
        <button class="start-btn" @click="startGame">开始游戏</button>
      </div>

      <!-- 游戏进行中 -->
      <div v-else-if="gameState === 'playing'" class="playing-area">
        <div class="cards-grid" :class="gridClass">
          <div
            v-for="(card, index) in cards"
            :key="index"
            class="card"
            :class="{ flipped: card.flipped, matched: card.matched }"
            @click="flipCard(index)"
          >
            <div class="card-inner">
              <div class="card-front">?</div>
              <div class="card-back">{{ card.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 游戏结束 -->
      <div v-else-if="gameState === 'finished'" class="end-screen">
        <div class="end-icon">🎉</div>
        <h3>恭喜完成！</h3>
        <div class="end-stats">
          <div class="end-stat">
            <span class="label">用时</span>
            <span class="value">{{ formatTime(time) }}</span>
          </div>
          <div class="end-stat">
            <span class="label">得分</span>
            <span class="value">{{ score }}</span>
          </div>
        </div>
        <div class="end-actions">
          <button class="action-btn primary" @click="playAgain">再玩一次</button>
          <button class="action-btn secondary" @click="goBack">返回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTrainingStore, trainingModules } from '../stores/training'

const router = useRouter()
const route = useRoute()
const trainingStore = useTrainingStore()

const { type, id } = route.params
const gameInfo = computed(() => {
  const module = trainingModules[type]
  return module?.games.find(g => g.id === id) || { name: '游戏', description: '' }
})

const gameState = ref('ready')
const cards = ref([])
const matched = ref(0)
const time = ref(0)
const timer = ref(null)
const selectedCards = ref([])
const canFlip = ref(true)

const totalPairs = computed(() => cards.value.length / 2)
const score = computed(() => Math.max(1000 - time.value * 10 - (matched.value * 50), 100))
const gridClass = computed(() => `grid-${Math.ceil(Math.sqrt(cards.value.length))}`)

function initCards() {
  const symbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🥭', '🍍', '🥥', '🍌']
  const numPairs = Math.min(totalPairs.value || 6, symbols.length)
  const selectedSymbols = symbols.slice(0, numPairs)
  
  let deck = [...selectedSymbols, ...selectedSymbols]
  // 洗牌
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]
  }
  
  cards.value = deck.map((value, index) => ({
    value,
    flipped: false,
    matched: false,
    index
  }))
  matched.value = 0
  selectedCards.value = []
  canFlip.value = true
}

function startGame() {
  gameState.value = 'playing'
  time.value = 0
  initCards()
  timer.value = setInterval(() => {
    time.value++
  }, 1000)
}

function flipCard(index) {
  const card = cards.value[index]
  
  if (!canFlip.value || card.flipped || card.matched) return
  
  card.flipped = true
  selectedCards.value.push(index)
  
  if (selectedCards.value.length === 2) {
    canFlip.value = false
    const [first, second] = selectedCards.value
    
    if (cards.value[first].value === cards.value[second].value) {
      // 配对成功
      setTimeout(() => {
        cards.value[first].matched = true
        cards.value[second].matched = true
        matched.value++
        selectedCards.value = []
        canFlip.value = true
        
        if (matched.value === totalPairs.value) {
          finishGame()
        }
      }, 500)
    } else {
      // 配对失败
      setTimeout(() => {
        cards.value[first].flipped = false
        cards.value[second].flipped = false
        selectedCards.value = []
        canFlip.value = true
      }, 1000)
    }
  }
}

function finishGame() {
  clearInterval(timer.value)
  gameState.value = 'finished'
  
  // 记录结果
  trainingStore.recordResult(id, score.value, time.value)
}

function playAgain() {
  gameState.value = 'ready'
  time.value = 0
  matched.value = 0
}

function goBack() {
  router.push('/training')
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  // 根据难度设置卡片数量
  if (type === 'memory' && id === 'M1') {
    // 卡片配对默认6对
  }
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
.game {
  max-width: 600px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
}

.game-header {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.game-info {
  flex: 1;
}

.game-info h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e3a5f;
}

.game-info p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #888;
}

.game-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat {
  font-size: 0.9rem;
  color: #666;
}

.game-area {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 开始/结束界面 */
.start-screen, .end-screen {
  text-align: center;
}

.start-icon, .end-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.start-screen h3, .end-screen h3 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: #333;
}

.start-screen p {
  color: #888;
  margin-bottom: 1.5rem;
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 2rem;
  cursor: pointer;
}

.end-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 1.5rem 0;
}

.end-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.end-stat .label {
  font-size: 0.9rem;
  color: #888;
}

.end-stat .value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e3a5f;
}

.end-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.action-btn.primary {
  background: #1e3a5f;
  color: white;
  border: none;
}

.action-btn.secondary {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

/* 卡片区域 */
.cards-grid {
  display: grid;
  gap: 0.75rem;
  justify-content: center;
}

.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-5 { grid-template-columns: repeat(5, 1fr); }

.card {
  width: 70px;
  height: 90px;
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s;
}

.card.flipped .card-inner,
.card.matched .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-size: 2rem;
}

.card-front {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  color: white;
}

.card-back {
  background: white;
  border: 2px solid #e0e0e0;
  transform: rotateY(180deg);
}

.card.matched .card-back {
  border-color: #4CAF50;
  background: #e8f5e9;
}

@media (max-width: 480px) {
  .card {
    width: 60px;
    height: 75px;
  }
  
  .grid-3 .card { width: 65px; }
  .grid-4 .card { width: 55px; }
}
</style>
