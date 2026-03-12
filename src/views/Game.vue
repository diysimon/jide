<template>
  <div class="game">
    <!-- 玩法说明弹窗 -->
    <div v-if="showInstructions" class="instruction-modal">
      <div class="instruction-content">
        <h2>📖 玩法说明</h2>
        <div class="instruction-text">
          <h3>{{ gameInfo.name }}</h3>
          <p class="instruction-desc">{{ gameInstructions[type]?.[id] || '请仔细阅读以下说明' }}</p>
          
          <div class="instruction-steps">
            <div v-for="(step, idx) in gameSteps[id] || defaultSteps" :key="idx" class="step-item">
              <span class="step-num">{{ idx + 1 }}</span>
              <span class="step-text">{{ step }}</span>
            </div>
          </div>
        </div>
        <button class="start-btn" @click="showInstructions = false">我知道了，开始游戏</button>
      </div>
    </div>

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
        <button class="guide-btn" @click="showInstructions = true">
          📖 查看玩法说明
        </button>
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
const showInstructions = ref(false)
const cards = ref([])
const matched = ref(0)
const time = ref(0)
const timer = ref(null)
const selectedCards = ref([])
const canFlip = ref(true)

// 游戏详细说明
const gameInstructions = {
  memory: {
    M1: '卡片配对游戏帮助锻炼您的短期记忆和视觉识别能力。',
    M2: '数字记忆游戏测试您的数字广度和短期记忆能力。',
    M3: '图片顺序记忆训练您的序列记忆和空间位置记忆。',
    M4: '人脸姓名匹配帮助您记住人物和对应姓名。',
    M5: '词组记忆训练您的言语记忆和词语联想能力。',
    M6: '地点记忆测试您的空间记忆和位置识别能力。',
    M7: '事件排序训练您的时序记忆和逻辑排序能力。',
    M8: '颜色形状关联训练多感官关联记忆能力。'
  },
  attention: {
    A1: '舒尔特方格是经典的注意力训练工具，测试您的视觉搜索和专注能力。',
    A2: '找不同游戏锻炼您的细节观察和持续注意力。',
    A3: '视觉搜索训练您快速识别和定位目标的能力。',
    A4: '追踪目标测试您的分配注意和多目标追踪能力。'
  },
  logic: {
    L1: '图形推理训练您的抽象思维和模式识别能力。',
    L2: '数独入门是经典的逻辑推理数字游戏。',
    L3: '序列找规律训练您的归纳推理和演绎思维能力。',
    L4: '分类游戏帮助您理解概念和分类能力。'
  },
  language: {
    V1: '词语接龙训练您的词汇检索和语言流畅性。',
    V2: '造句练习帮助您组织语言和表达能力。',
    V3: '看图说话训练描述能力和语言组织能力。'
  },
  executive: {
    E1: '双重任务训练您同时处理多项任务的能力。',
    E2: '停止-开始任务测试您的反应抑制和控制能力。',
    E3: '计划安排训练您的任务规划和管理能力。'
  },
  emotion: {
    P1: '音乐感知帮助您识别音乐中的情绪变化。',
    P2: '颜色情绪匹配训练情绪认知和联想能力。'
  }
}

// 游戏步骤说明
const gameSteps = {
  M1: [
    '屏幕上会显示若干张卡片，每张卡片都有一个水果图案',
    '点击任意一张卡片，卡片会翻开显示图案',
    '记住第一张卡片的位置和图案',
    '点击第二张卡片，如果图案相同就配对成功',
    '如果图案不同，卡片会翻回去，您需要重新记忆',
    '找到所有配对即可完成游戏'
  ],
  A1: [
    '屏幕上显示一个5x5的数字方格',
    '请按顺序点击数字，从1开始',
    '点击完25个数字即可完成',
    '用时越短得分越高'
  ]
}

const defaultSteps = [
  '仔细阅读游戏规则',
  '理解游戏目标',
  '按照步骤操作',
  '完成游戏后查看成绩'
]

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

/* 玩法说明弹窗 */
.instruction-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.instruction-content {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.instruction-content h2 {
  color: #1e3a5f;
  margin: 0 0 1rem;
  text-align: center;
}

.instruction-text h3 {
  color: #333;
  margin: 0 0 0.75rem;
}

.instruction-desc {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.instruction-steps {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.step-num {
  width: 28px;
  height: 28px;
  background: #1e3a5f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-text {
  font-size: 1.05rem;
  line-height: 1.6;
  color: #333;
}

.guide-btn {
  display: block;
  width: 100%;
  padding: 1rem;
  background: #fff;
  color: #1e3a5f;
  border: 2px solid #1e3a5f;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.guide-btn:hover {
  background: #f0f4f8;
}

.start-screen .start-btn {
  display: block;
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
}
</style>
