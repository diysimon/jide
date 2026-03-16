<template>
  <div class="game">
    <!-- 玩法说明弹窗 -->
    <div v-if="showInstructions" class="instruction-modal">
      <div class="instruction-content">
        <h2>📖 玩法说明</h2>
        <div class="instruction-text">
          <h3>{{ gameInfo.name }}</h3>
          <p class="instruction-desc">{{ gameInstructions[type]?.[id] }}</p>
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

    <!-- 游戏头部 - 极简设计 -->
    <div class="game-header-mini">
      <button class="back-btn-mini" @click="goBack">←</button>
      <span class="game-title-mini">{{ gameInfo.name }}</span>
      <span class="time-mini">⏱️ {{ formatTime(time) }}</span>
    </div>

    <!-- 游戏区域 -->
    <div class="game-area">
      <!-- 开始界面 -->
      <div v-if="gameState === 'ready'" class="start-screen">
        <div class="start-icon">{{ gameIcon }}</div>
        <h3>{{ gameInfo.name }}</h3>
        <p>{{ gameInfo.description }}</p>
        <button class="guide-btn" @click="showInstructions = true">📖 查看玩法说明</button>
        <button class="start-btn" @click="startGame">开始游戏</button>
      </div>

      <!-- 游戏进行中 -->
      <div v-else-if="gameState === 'playing'" class="playing-area">
        <!-- 翻卡配对 M1 -->
        <div v-if="id === 'M1'" class="memory-cards">
          <div class="cards-grid" :class="gridClass">
            <div v-for="(card, index) in cards" :key="index" class="card" :class="{ flipped: card.flipped, matched: card.matched }" @click="flipCard(index)">
              <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back"><img :src="card.value" :alt="card.name" /></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 数字记忆 M2 -->
        <div v-else-if="id === 'M2'" class="number-memory">
          <div v-if="phase === 'show'" class="show-phase">
            <div class="number-display">{{ currentNumber }}</div>
            <p class="phase-tip">记住这个数字</p>
          </div>
          <div v-else-if="phase === 'input'" class="input-phase">
            <p class="phase-tip">请输入刚才的数字</p>
            <div class="number-input">
              <input v-model="userInput" type="text" maxlength="10" placeholder="输入数字" />
              <button @click="submitNumber">确认</button>
            </div>
          </div>
        </div>

        <!-- 图片顺序 M3 -->
        <div v-else-if="id === 'M3'" class="image-sequence">
          <div v-if="phase === 'show'" class="show-phase">
            <div class="image-grid">
              <div v-for="(img, idx) in showImages" :key="idx" class="seq-image">{{ img.num }}</div>
            </div>
            <p class="phase-tip">记住图片顺序 (点击数字)</p>
          </div>
          <div v-else-if="phase === 'input'" class="input-phase">
            <p class="phase-tip">按顺序点击图片</p>
            <div class="image-grid">
              <div v-for="(img, idx) in inputImages" :key="idx" class="seq-image" :class="{ selected: img.clicked }" @click="clickImage(idx)">{{ img.num }}</div>
            </div>
            <p class="sequence-display">{{ currentSequence.join(' → ') }}</p>
          </div>
        </div>

        <!-- 舒尔特方格 A1 -->
        <div v-else-if="id === 'A1'" class="schulte-grid">
          <div class="grid-container" :class="'size-' + gridSize">
            <div v-for="n in gridSize * gridSize" :key="n" class="schulte-cell" :class="{ correct: n === nextNumber, clicked: clickedNumbers.includes(n) }" @click="clickSchulte(n)">{{ n }}</div>
          </div>
        </div>

        <!-- 找不同 A2 -->
        <div v-else-if="id === 'A2'" class="find-difference">
          <div class="two-images">
            <div class="image-box" @click="checkDiff(0)">
              <div v-for="(item, idx) in diffItems" :key="idx" class="diff-item" :style="{ left: item.x + '%', top: item.y + '%' }">{{ item.show ? item.char : '●' }}</div>
            </div>
            <div class="image-box" @click="checkDiff(1)">
              <div v-for="(item, idx) in diffItems" :key="idx" class="diff-item" :style="{ left: item.x + '%', top: item.y + '%' }">{{ item.show ? item.diffChar : '●' }}</div>
            </div>
          </div>
          <p class="phase-tip">找出两幅图的不同之处</p>
        </div>

        <!-- 词组记忆 M5 -->
        <div v-else-if="id === 'M5'" class="word-memory">
          <div v-if="phase === 'show'" class="show-phase">
            <div class="word-list">
              <div v-for="(word, idx) in words" :key="idx" class="word-item">{{ word }}</div>
            </div>
            <p class="phase-tip">记住这些词语</p>
          </div>
          <div v-else-if="phase === 'input'" class="input-phase">
            <p class="phase-tip">请回忆刚才的词语</p>
            <div class="word-input-grid">
              <input v-for="n in words.length" :key="n" v-model="wordInputs[n-1]" :placeholder="'词语' + n" />
            </div>
            <button class="submit-btn" @click="submitWords">确认</button>
          </div>
        </div>

        <!-- 颜色形状 M8 -->
        <div v-else-if="id === 'M8'" class="color-shape">
          <div class="show-phase">
            <div class="cs-pairs">
              <div v-for="(pair, idx) in colorShapePairs" :key="idx" class="cs-pair">
                <span class="cs-color" :style="{ background: pair.color }"></span>
                <span class="cs-shape">{{ pair.shape }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 人脸姓名 M4 -->
        <div v-else-if="id === 'M4'" class="face-name-game">
          <div v-if="phase === 'show'" class="show-phase">
            <div class="face-grid">
              <div v-for="(person, idx) in faceNamePairs" :key="idx" class="face-card">
                <img :src="person.face" :alt="person.name" class="face-img" />
                <span class="face-name">{{ person.name }}</span>
              </div>
            </div>
            <p class="phase-tip">记住每个人脸对应的姓名</p>
          </div>
          <div v-else-if="phase === 'input'" class="input-phase">
            <p class="phase-tip">选择正确的姓名</p>
            <div class="face-quiz">
              <img :src="currentQuiz.face" class="quiz-face" />
              <div class="name-options">
                <button v-for="opt in nameOptions" :key="opt" class="name-btn" :class="{ correct: opt === currentQuiz.correct && answered, wrong: answered && opt === userChoice && opt !== currentQuiz.correct }" :disabled="answered" @click="selectName(opt)">{{ opt }}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 地点记忆 M6 -->
        <div v-else-if="id === 'M6'" class="location-memory">
          <div v-if="phase === 'show'" class="show-phase">
            <div class="location-grid">
              <div v-for="(loc, idx) in locations" :key="idx" class="loc-item" :style="{ left: loc.x + '%', top: loc.y + '%' }">
                <span class="loc-num">{{ loc.num }}</span>
              </div>
            </div>
            <p class="phase-tip">记住数字位置顺序</p>
          </div>
          <div v-else-if="phase === 'input'" class="input-phase">
            <p class="phase-tip">按顺序点击位置</p>
            <div class="location-grid empty">
              <div v-for="(loc, idx) in locations" :key="idx" class="loc-item" :class="{ clicked: loc.clicked }" :style="{ left: loc.x + '%', top: loc.y + '%' }" @click="clickLocation(idx)">
                <span class="loc-num">{{ loc.clicked ? loc.num : '?' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 事件排序 M7 -->
        <div v-else-if="id === 'M7'" class="event-sort">
          <div v-if="phase === 'show'" class="show-phase">
            <div class="event-timeline">
              <div v-for="(evt, idx) in events" :key="idx" class="event-item">
                <span class="event-num">{{ idx + 1 }}</span>
                <span class="event-text">{{ evt }}</span>
              </div>
            </div>
            <p class="phase-tip">记住事件顺序</p>
          </div>
          <div v-else-if="phase === 'input'" class="input-phase">
            <p class="phase-tip">将事件按正确顺序拖拽排列</p>
            <div class="event-list">
              <div v-for="(evt, idx) in shuffledEvents" :key="idx" class="event-drag" @click="moveEvent(idx)">
                <span class="event-num">{{ idx + 1 }}</span>
                <span class="event-text">{{ evt }}</span>
              </div>
            </div>
            <button class="submit-btn" @click="checkEventOrder">确认顺序</button>
          </div>
        </div>

        <!-- 视觉搜索 A3 -->
        <div v-else-if="id === 'A3'" class="visual-search">
          <p class="search-target">找到：<span class="target-char">{{ targetChar }}</span></p>
          <div class="search-grid">
            <div v-for="(cell, idx) in searchCells" :key="idx" class="search-cell" :class="{ found: cell.found }" @click="clickSearchCell(idx)">
              <span :class="{ target: cell.isTarget }">{{ cell.char }}</span>
            </div>
          </div>
          <p class="phase-tip">已找到：{{ foundCount }} / {{ totalTargets }}</p>
        </div>

        <!-- 默认：显示开发中 -->
        <div v-else class="coming-soon">
          <div class="coming-icon">🚧</div>
          <h3>游戏开发中</h3>
          <p>{{ gameInfo.name }} 即将上线</p>
          <button class="back-home-btn" @click="goBack">返回训练选择</button>
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
          <div v-if="resultMessage" class="result-message">{{ resultMessage }}</div>
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

const gameIcon = computed(() => {
  const icons = { memory: '🧠', attention: '👁️', logic: '🧩', language: '💬', executive: '🎯', emotion: '❤️' }
  return icons[type] || '🎮'
})

const gameState = ref('ready')
const showInstructions = ref(false)
const showScore = ref(true)
const score = ref(0)
const time = ref(0)
const timer = ref(null)
const resultMessage = ref('')
const phase = ref('show')

// 翻卡配对
const cards = ref([])
const matched = ref(0)
const selectedCards = ref([])
const canFlip = ref(true)

// 数字记忆
const currentNumber = ref('')
const userInput = ref('')
const correctNumbers = ref([])

// 图片顺序
const showImages = ref([])
const inputImages = ref([])
const currentSequence = ref([])

// 舒尔特方格
const gridSize = ref(5)
const nextNumber = ref(1)
const clickedNumbers = ref([])

// 找不同
const diffItems = ref([])
const foundDiffs = ref(0)

// 词组记忆
const words = ref([])
const wordInputs = ref([])

// 颜色形状
const colorShapePairs = ref([])

// 人脸姓名 M4
const faceNamePairs = ref([])
const currentQuiz = ref({})
const nameOptions = ref([])
const userChoice = ref('')
const answered = ref(false)

// 地点记忆 M6
const locations = ref([])

// 事件排序 M7
const events = ref([])
const shuffledEvents = ref([])

// 视觉搜索 A3
const targetChar = ref('')
const searchCells = ref([])
const foundCount = ref(0)
const totalTargets = ref(5)

const totalPairs = computed(() => cards.value.length / 2)
const gridClass = computed(() => `grid-${Math.ceil(Math.sqrt(cards.value.length))}`)

const gameInstructions = {
  memory: {
    M1: '卡片配对游戏锻炼您的视觉记忆和观察能力。找出所有相同的卡片配对即可获胜。',
    M2: '数字记忆训练您的短期记忆和数字广度。记住显示的数字并在输入框中复现。',
    M3: '图片顺序记忆锻炼序列记忆能力。记住数字1-9的显示顺序，然后按顺序点击。',
    M4: '人脸姓名匹配帮助您识别人物和记忆姓名。',
    M5: '词组记忆训练言语记忆和联想能力。记住屏幕上显示的词语序列。',
    M6: '地点记忆测试空间记忆和位置关联能力。',
    M7: '事件排序训练时序记忆和逻辑推理能力。',
    M8: '颜色形状关联训练多维度记忆和联想能力。'
  },
  attention: {
    A1: '舒尔特方格是经典的注意力训练工具。按顺序点击数字1-25，用时越短越好。',
    A2: '找不同锻炼观察力和注意力。找出两幅图中的不同之处。',
    A3: '视觉搜索训练快速定位目标的能力。',
    A4: '追踪目标测试多目标追踪和分配注意能力。'
  },
  logic: {
    L1: '图形推理训练抽象思维和模式识别。',
    L2: '数独入门是经典的逻辑推理游戏。',
    L3: '序列找规律训练归纳推理能力。',
    L4: '分类游戏帮助理解概念和分类。'
  },
  language: {
    V1: '词语接龙训练词汇检索和语言流畅性。',
    V2: '造句练习帮助组织语言和表达。',
    V3: '看图说话训练描述能力和想象力。'
  },
  executive: {
    E1: '双重任务训练同时处理多项任务的能力。',
    E2: '停止-开始测试反应抑制和控制能力。',
    E3: '计划安排训练任务规划和管理能力。'
  },
  emotion: {
    P1: '音乐感知帮助识别音乐中的情绪。',
    P2: '颜色情绪匹配训练情绪认知和联想。'
  }
}

const gameSteps = {
  M1: ['屏幕上显示若干张卡片，每张卡片有一个水果图案', '点击卡片查看图案', '找到两张相同的卡片即可配对成功', '配对成功会显示绿色标记', '找出所有配对即可完成游戏'],
  M2: ['屏幕会显示一个数字，请仔细记住', '数字显示2秒后会自动消失', '在输入框中输入刚才的数字', '输入正确进入下一关，错误则重来'],
  M3: ['屏幕显示1-9九个数字位置', '记住数字的排列顺序', '数字消失后，按顺序点击', '全部正确即完成游戏'],
  A1: ['屏幕上显示5x5的方格，每个格子有一个数字', '按顺序点击数字，从1开始', '点击完25个数字即可完成', '用时越短得分越高'],
  A2: ['左右两幅图基本相同，有几处细微差别', '仔细观察找出不同之处', '点击有差异的位置即可'],
  A5: ['记住显示的词语', '回忆并输入刚才的词语']
}

const defaultSteps = ['仔细阅读游戏规则', '理解游戏目标', '按照步骤操作', '完成游戏后查看成绩']

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function goBack() {
  router.push('/training')
}

function startGame() {
  gameState.value = 'playing'
  time.value = 0
  score.value = 0
  matched.value = 0
  selectedCards.value = []
  canFlip.value = true
  resultMessage.value = ''
  
  timer.value = setInterval(() => time.value++, 1000)
  
  // 根据游戏类型初始化
  if (id === 'M1') initMemoryCards()
  else if (id === 'M2') initNumberMemory()
  else if (id === 'M3') initImageSequence()
  else if (id === 'A1') initSchulte()
  else if (id === 'A2') initFindDifference()
  else if (id === 'M5') initWordMemory()
  else if (id === 'M8') initColorShape()
  else if (id === 'M4') initFaceName()
  else if (id === 'M6') initLocationMemory()
  else if (id === 'M7') initEventSort()
  else if (id === 'A3') initVisualSearch()
}

function finishGame() {
  clearInterval(timer.value)
  gameState.value = 'finished'
  score.value = Math.max(1000 - time.value * 5 - (matched.value > 0 ? matched.value * 20 : 0), 100)
  
  if (score.value >= 800) resultMessage.value = '太棒了！表现优秀！'
  else if (score.value >= 600) resultMessage.value = '做得好！继续加油！'
  else resultMessage.value = '再接再厉！'
  
  trainingStore.recordResult(id, score.value, time.value)
}

function playAgain() {
  gameState.value = 'ready'
  showInstructions.value = false
}

// 翻卡配对 M1
function initMemoryCards() {
  // 真实图片 - 中国城市与风景
  const imageCards = [
    { name: '故宫', img: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=400&fit=crop' },
    { name: '上海外滩', img: 'https://images.unsplash.com/photo-1537531383496-f4749a4b8590?w=400&h=400&fit=crop' },
    { name: '西湖', img: 'https://images.unsplash.com/photo-1537531383496-f4749a4b8590?w=400&h=400&fit=crop' },
    { name: '长城', img: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=400&fit=crop' },
    { name: '桂林山水', img: 'https://images.unsplash.com/photo-1537531383496-f4749a4b8590?w=400&h=400&fit=crop' },
    { name: '黄山', img: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=400&fit=crop' },
    { name: '熊猫', img: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=400&fit=crop' },
    { name: '荷花', img: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=400&fit=crop' },
    { name: '雪景', img: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=400&fit=crop' },
    { name: '日落', img: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=400&fit=crop' }
  ]
  
  // 随机选择6对图片
  const shuffled = [...imageCards].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 6)
  const pairs = [...selected, ...selected]
  
  // 洗牌
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  
  cards.value = pairs.map((item, index) => ({
    name: item.name,
    value: item.img,
    flipped: false,
    matched: false,
    index
  }))
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
      setTimeout(() => {
        cards.value[first].matched = true
        cards.value[second].matched = true
        matched.value++
        selectedCards.value = []
        canFlip.value = true
        if (matched.value === totalPairs.value) finishGame()
      }, 500)
    } else {
      setTimeout(() => {
        cards.value[first].flipped = false
        cards.value[second].flipped = false
        selectedCards.value = []
        canFlip.value = true
      }, 1000)
    }
  }
}

// 数字记忆 M2
function initNumberMemory() {
  phase.value = 'show'
  userInput.value = ''
  const len = 3 + Math.floor(Math.random() * 3)
  let num = ''
  for (let i = 0; i < len; i++) num += Math.floor(Math.random() * 10)
  currentNumber.value = num
  correctNumbers.value = num.split('').map(Number)
  
  setTimeout(() => {
    phase.value = 'input'
  }, 2000)
}

function submitNumber() {
  if (userInput.value === currentNumber.value) {
    finishGame()
  } else {
    userInput.value = ''
    alert('答案错误，再试一次！')
  }
}

// 图片顺序 M3
function initImageSequence() {
  phase.value = 'show'
  currentSequence.value = []
  let nums = [1,2,3,4,5,6,7,8,9]
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]]
  }
  showImages.value = nums.map(n => ({ num: n, pos: n-1 }))
  inputImages.value = [...showImages.value].map(n => ({ num: n.num, clicked: false }))
  
  setTimeout(() => {
    phase.value = 'input'
  }, 3000)
}

function clickImage(idx) {
  if (inputImages.value[idx].clicked) return
  inputImages.value[idx].clicked = true
  currentSequence.value.push(inputImages.value[idx].num)
  
  if (currentSequence.value.length === 9) {
    const correct = currentSequence.value.every((n, i) => n === i + 1)
    if (correct) finishGame()
    else {
      alert('顺序错误，再试一次！')
      initImageSequence()
    }
  }
}

// 舒尔特方格 A1
function initSchulte() {
  gridSize.value = 5
  nextNumber.value = 1
  clickedNumbers.value = []
  let nums = []
  for (let i = 1; i <= 25; i++) nums.push(i)
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]]
  }
  window.schulteNums = nums
}

function clickSchulte(n) {
  if (clickedNumbers.value.includes(n)) return
  
  const expected = window.schulteNums[nextNumber.value - 1]
  if (n === expected) {
    clickedNumbers.value.push(n)
    nextNumber.value++
    if (nextNumber.value > 25) finishGame()
  }
}

// 找不同 A2
function initFindDifference() {
  foundDiffs.value = 0
  diffItems.value = []
  const chars = ['★', '●', '■', '▲', '◆', '♠', '♣', '♥']
  for (let i = 0; i < 5; i++) {
    diffItems.value.push({
      x: 10 + Math.random() * 70,
      y: 10 + Math.random() * 70,
      char: chars[i],
      diffChar: chars[i + 1],
      show: true
    })
  }
}

function checkDiff(boxIndex) {
  // 简化版：点击正确差异加1
  if (foundDiffs.value < 5) {
    foundDiffs.value++
    if (foundDiffs.value >= 5) finishGame()
  }
}

// 词组记忆 M5
function initWordMemory() {
  phase.value = 'show'
  const wordList = ['苹果', '火车', '书本', '星星', '月亮', '河流', '树木', '花朵']
  let shuffled = [...wordList].sort(() => Math.random() - 0.5)
  words.value = shuffled.slice(0, 5)
  wordInputs.value = new Array(5).fill('')
  
  setTimeout(() => {
    phase.value = 'input'
  }, 4000)
}

function submitWords() {
  const correct = wordInputs.value.filter((w, i) => w === words.value[i]).length
  score.value = correct * 200
  finishGame()
}

// 颜色形状 M8
function initColorShape() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
  const shapes = ['■', '●', '▲', '◆', '★', '□']
  colorShapePairs.value = []
  for (let i = 0; i < 6; i++) {
    colorShapePairs.value.push({ color: colors[i], shape: shapes[i] })
  }
  setTimeout(finishGame, 5000)
}

// 人脸姓名 M4
function initFaceName() {
  phase.value = 'show'
  answered.value = false
  userChoice.value = ''
  
  // 真实人物照片（使用picsumfaces）
  const people = [
    { name: '张伟', face: 'https://i.pravatar.cc/150?img=1' },
    { name: '李娜', face: 'https://i.pravatar.cc/150?img=5' },
    { name: '王强', face: 'https://i.pravatar.cc/150?img=8' },
    { name: '刘洋', face: 'https://i.pravatar.cc/150?img=12' },
    { name: '陈静', face: 'https://i.pravatar.cc/150?img=9' },
    { name: '杨明', face: 'https://i.pravatar.cc/150?img=11' }
  ]
  faceNamePairs.value = people.slice(0, 4)
  
  setTimeout(() => {
    phase.value = 'input'
    startQuiz()
  }, 4000)
}

function startQuiz() {
  const correct = faceNamePairs.value[Math.floor(Math.random() * faceNamePairs.value.length)]
  currentQuiz.value = { face: correct.face, correct: correct.name }
  
  const names = faceNamePairs.value.map(p => p.name).sort(() => Math.random() - 0.5)
  nameOptions.value = names
}

function selectName(name) {
  if (answered.value) return
  userChoice.value = name
  answered.value = true
  
  setTimeout(() => {
    if (name === currentQuiz.value.correct) {
      finishGame()
    } else {
      startQuiz()
      answered.value = false
      userChoice.value = ''
    }
  }, 1000)
}

// 地点记忆 M6
function initLocationMemory() {
  phase.value = 'show'
  const locs = []
  for (let i = 0; i < 9; i++) {
    locs.push({ num: i + 1, x: 10 + (i % 3) * 35, y: 10 + Math.floor(i / 3) * 35, clicked: false })
  }
  // 随机位置
  for (let i = locs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [locs[i], locs[j]] = [locs[j], locs[i]]
  }
  locations.value = locs.map((l, i) => ({ ...l, num: i + 1 }))
  
  setTimeout(() => {
    phase.value = 'input'
    locations.value.forEach(l => l.clicked = false)
  }, 3000)
}

function clickLocation(idx) {
  if (locations.value[idx].clicked) return
  locations.value[idx].clicked = true
  
  const clicked = locations.value.filter(l => l.clicked)
  if (clicked.length === 9) {
    // 检查顺序
    const sorted = [...locations.value].sort((a, b) => a.num - b.num)
    const correct = locations.value.every((l, i) => l.num === i + 1)
    if (correct) finishGame()
    else {
      alert('顺序错误，再试一次')
      initLocationMemory()
    }
  }
}

// 事件排序 M7
function initEventSort() {
  phase.value = 'show'
  const evtList = [
    '早上起床',
    '吃早餐',
    '上班工作',
    '午餐时间',
    '下班回家',
    '晚餐时间',
    '看电视',
    '上床睡觉'
  ]
  events.value = evtList.slice(0, 5)
  shuffledEvents.value = [...events.value].sort(() => Math.random() - 0.5)
  
  setTimeout(() => {
    phase.value = 'input'
  }, 4000)
}

function moveEvent(idx) {
  const item = shuffledEvents.value.splice(idx, 1)[0]
  shuffledEvents.value.push(item)
}

function checkEventOrder() {
  const correct = shuffledEvents.value.every((e, i) => e === events.value[i])
  if (correct) finishGame()
  else {
    alert('顺序错误，再试一次')
    initEventSort()
  }
}

// 视觉搜索 A3
function initVisualSearch() {
  foundCount.value = 0
  const chars = '天地人和日月星辰山水火木金土'
  targetChar.value = chars[Math.floor(Math.random() * chars.length)]
  
  const cells = []
  const targetCount = 3 + Math.floor(Math.random() * 3)
  totalTargets.value = targetCount
  
  // 添加目标字符
  for (let i = 0; i < targetCount; i++) {
    cells.push({ char: targetChar.value, isTarget: true, found: false })
  }
  // 添加干扰字符
  for (let i = 0; i < 20; i++) {
    let char = chars[Math.floor(Math.random() * chars.length)]
    while (char === targetChar.value) char = chars[Math.floor(Math.random() * chars.length)]
    cells.push({ char, isTarget: false, found: false })
  }
  // 洗牌
  cells.sort(() => Math.random() - 0.5)
  searchCells.value = cells
}

function clickSearchCell(idx) {
  const cell = searchCells.value[idx]
  if (cell.found) return
  
  if (cell.isTarget) {
    cell.found = true
    foundCount.value++
    if (foundCount.value >= totalTargets.value) finishGame()
  }
}

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
.game {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f5f7fa;
}

.instruction-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.instruction-content {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.instruction-content h2 {
  text-align: center;
  margin-bottom: 1rem;
  color: #1e3a5f;
  font-size: 1.5rem;
}

.instruction-desc {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.instruction-steps {
  margin-bottom: 1.5rem;
}

.step-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: flex-start;
}

.step-num {
  width: 1.5rem;
  height: 1.5rem;
  background: #1e3a5f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.step-text {
  color: #444;
  font-size: 1rem;
  line-height: 1.5;
}

.start-btn, .guide-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.75rem;
}

.start-btn {
  background: #1e3a5f;
  color: white;
}

.guide-btn {
  background: #f0f0f0;
  color: #333;
}

/* 极简头部 */
.game-header-mini {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: white;
}

.back-btn-mini {
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-title-mini {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e3a5f;
}

.time-mini {
  font-size: 1rem;
  color: #666;
  background: #f5f5f5;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
}

.game-area {
  padding: 1rem;
}

.start-screen, .end-screen {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 1rem;
}

.start-icon, .end-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.start-screen h3, .end-screen h3 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: #1e3a5f;
}

.start-screen p, .end-screen p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.end-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 1.5rem 0;
}

.end-stat {
  text-align: center;
}

.end-stat .label {
  display: block;
  font-size: 1rem;
  color: #888;
  margin-bottom: 0.25rem;
}

.end-stat .value {
  font-size: 2rem;
  font-weight: bold;
  color: #1e3a5f;
}

.result-message {
  font-size: 1.25rem;
  color: #4CAF50;
  font-weight: 600;
  margin-top: 1rem;
}

.end-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-btn {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.action-btn.primary {
  background: #1e3a5f;
  color: white;
}

.action-btn.secondary {
  background: #f0f0f0;
  color: #333;
}

/* 卡片配对 */
.cards-grid {
  display: grid;
  gap: 0.75rem;
  justify-content: center;
}

.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-6 { grid-template-columns: repeat(4, 1fr); }

.card {
  aspect-ratio: 1;
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}

.card.flipped .card-inner, .card.matched .card-inner {
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
  border-radius: 0.75rem;
  font-size: 2rem;
  overflow: hidden;
}

.card-back img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-front {
  background: #1e3a5f;
  color: white;
}

.card-back {
  background: white;
  transform: rotateY(180deg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card.matched .card-back {
  background: #e8f5e9;
}

/* 数字记忆 */
.number-display {
  font-size: 4rem;
  font-weight: bold;
  color: #1e3a5f;
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 1rem;
}

.number-input {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.number-input input {
  padding: 1rem;
  font-size: 1.5rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  width: 150px;
  text-align: center;
}

.number-input button, .submit-btn {
  padding: 1rem 2rem;
  background: #1e3a5f;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
}

/* 图片顺序 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 300px;
  margin: 0 auto;
}

.seq-image {
  aspect-ratio: 1;
  background: #1e3a5f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border-radius: 0.75rem;
  cursor: pointer;
}

.seq-image.selected {
  background: #4CAF50;
}

.sequence-display {
  text-align: center;
  margin-top: 1rem;
  font-size: 1.25rem;
  color: #666;
}

/* 舒尔特方格 */
.schulte-grid {
  background: white;
  padding: 1rem;
  border-radius: 1rem;
}

.grid-container {
  display: grid;
  gap: 0.5rem;
}

.grid-container.size-5 { grid-template-columns: repeat(5, 1fr); }

.schulte-cell {
  aspect-ratio: 1;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  border-radius: 0.5rem;
  cursor: pointer;
}

.schulte-cell.clicked {
  background: #4CAF50;
  color: white;
}

/* 找不同 */
.two-images {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.image-box {
  width: 150px;
  height: 150px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 0.75rem;
  position: relative;
  cursor: pointer;
}

.diff-item {
  position: absolute;
  font-size: 1.5rem;
}

/* 词组记忆 */
.word-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.word-item {
  padding: 1rem 1.5rem;
  background: #1e3a5f;
  color: white;
  border-radius: 0.75rem;
  font-size: 1.25rem;
}

.word-input-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 300px;
  margin: 0 auto;
}

.word-input-grid input {
  padding: 0.875rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
}

/* 颜色形状 */
.cs-pairs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.cs-pair {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
}

.cs-color {
  width: 60px;
  height: 60px;
  border-radius: 0.5rem;
}

.cs-shape {
  font-size: 2rem;
}

/* 人脸姓名 */
.face-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 350px;
  margin: 0 auto;
}

.face-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
}

.face-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.5rem;
}

.face-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e3a5f;
}

.face-quiz {
  text-align: center;
}

.quiz-face {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
}

.name-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 250px;
  margin: 0 auto;
}

.name-btn {
  padding: 1rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 0.75rem;
  font-size: 1.25rem;
  cursor: pointer;
}

.name-btn.correct {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.name-btn.wrong {
  background: #f44336;
  color: white;
  border-color: #f44336;
}

/* 地点记忆 */
.location-grid {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
}

.loc-item {
  position: absolute;
  width: 50px;
  height: 50px;
  background: #1e3a5f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.loc-item.clicked {
  background: #4CAF50;
}

.location-grid.empty .loc-item {
  background: #e0e0e0;
  color: #999;
}

.location-grid.empty .loc-item.clicked {
  background: #1e3a5f;
}

/* 事件排序 */
.event-timeline {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  max-width: 350px;
  margin: 0 auto;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.event-num {
  width: 30px;
  height: 30px;
  background: #1e3a5f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.event-text {
  font-size: 1.1rem;
  color: #333;
}

.event-list {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  max-width: 350px;
  margin: 0 auto;
}

.event-drag {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

/* 视觉搜索 */
.search-target {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.target-char {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e3a5f;
  background: #fff3cd;
  padding: 0.25rem 1rem;
  border-radius: 0.5rem;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  max-width: 350px;
  margin: 0 auto;
}

.search-cell {
  aspect-ratio: 1;
  background: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  cursor: pointer;
}

.search-cell.found {
  background: #4CAF50;
  color: white;
}

/* 通用 */
.phase-tip {
  text-align: center;
  font-size: 1.25rem;
  color: #666;
  margin: 1rem 0;
}

.coming-soon {
  text-align: center;
  padding: 4rem 1rem;
  background: white;
  border-radius: 1rem;
}

.coming-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.back-home-btn {
  margin-top: 2rem;
  padding: 1rem 2rem;
  background: #1e3a5f;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  cursor: pointer;
}

@media (max-width: 480px) {
  .card-front, .card-back { font-size: 1.5rem; }
  .number-display { font-size: 3rem; }
  .seq-image { font-size: 1.5rem; }
  .schulte-cell { font-size: 1.25rem; }
  .end-stats { flex-direction: column; gap: 1rem; }
}
</style>
