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

        <!-- 追踪目标 A4 -->
        <div v-else-if="id === 'A4'" class="track-target">
          <p class="track-instruct">追踪<span class="track-color" :style="{ background: trackColor }"></span>颜色的球</p>
          <div class="track-arena" ref="trackArena">
            <div v-for="ball in balls" :key="ball.id" class="track-ball" :style="{ left: ball.x + '%', top: ball.y + '%', background: ball.color, transform: 'scale(' + (ball.tracked ? 1.3 : 1) + ')' }" @click="clickBall(ball.id)">
              <span v-if="ball.tracked" class="track-mark">✓</span>
            </div>
          </div>
          <p class="phase-tip">已追踪：{{ trackedCount }} / {{ totalBalls }}</p>
        </div>

        <!-- 图形推理 L1 -->
        <div v-else-if="id === 'L1'" class="pattern-reason">
          <div class="pattern-display">
            <div v-for="(row, ridx) in patternRows" :key="ridx" class="pattern-row">
              <div v-for="(cell, cidx) in row" :key="cidx" class="pattern-cell" :style="{ background: cell }"></div>
            </div>
            <div class="pattern-arrow">→</div>
            <div class="pattern-row">
              <div v-for="(opt, oidx) in patternOptions" :key="oidx" class="pattern-cell option" @click="selectPattern(oidx)">{{ opt }}</div>
            </div>
          </div>
          <p class="phase-tip">找出规律，选择下一个图形</p>
        </div>

        <!-- 数独入门 L2 -->
        <div v-else-if="id === 'L2'" class="sudoku-game">
          <div class="sudoku-grid">
            <div v-for="(row, ridx) in sudokuBoard" :key="ridx" class="sudoku-row">
              <div v-for="(cell, cidx) in row" :key="cidx" class="sudoku-cell" :class="{ fixed: cell.fixed, selected: selectedCell?.r === ridx && selectedCell?.c === cidx }" @click="selectSudokuCell(ridx, cidx)">
                <span v-if="cell.value">{{ cell.value }}</span>
                <span v-else class="sudoku-empty" @click.stop="inputSudoku(num)" v-for="num in 4" :key="num">{{ num }}</span>
              </div>
            </div>
          </div>
          <p class="phase-tip">在4x4网格中填入1-4，每行每列不重复</p>
        </div>

        <!-- 序列找规律 L3 -->
        <div v-else-if="id === 'L3'" class="sequence-game">
          <div class="sequence-display">
            <span v-for="(num, idx) in sequenceNum" :key="idx" class="seq-num">{{ num }}</span>
            <span class="seq-q mark">?</span>
          </div>
          <div class="sequence-options">
            <button v-for="opt in sequenceOptions" :key="opt" class="seq-btn" @click="selectSequence(opt)">{{ opt }}</button>
          </div>
        </div>

        <!-- 分类游戏 L4 -->
        <div v-else-if="id === 'L4'" class="category-game">
          <p class="category-tip">将物品放入正确类别：<span class="cat-name">{{ currentCategory }}</span></p>
          <div class="category-items">
            <div v-for="item in categoryItems" :key="item.name" class="cat-item" :class="{ correct: item.result === 'correct', wrong: item.result === 'wrong' }" @click="categorizeItem(item)">
              <span class="cat-emoji">{{ item.emoji }}</span>
              <span class="cat-label">{{ item.name }}</span>
            </div>
          </div>
          <div class="category-bins">
            <div class="cat-bin" @click="selectBin('水果')">水果</div>
            <div class="cat-bin" @click="selectBin('动物')">动物</div>
            <div class="cat-bin" @click="selectBin('颜色')">颜色</div>
          </div>
        </div>

        <!-- 词语接龙 V1 -->
        <div v-else-if="id === 'V1'" class="word-chain">
          <p class="word-chain-topic">话题：<span class="topic-word">{{ chainTopic }}</span></p>
          <div class="chain-display">
            <div v-for="(word, idx) in chainWords" :key="idx" class="chain-word">{{ word }}</div>
          </div>
          <p class="phase-tip">请接一个以「{{ lastChar}}」开头的词语</p>
          <div class="chain-input">
            <input v-model="chainInput" :placeholder="'以' + lastChar + '开头'" @keyup.enter="submitChain" />
            <button @click="submitChain">确定</button>
          </div>
        </div>

        <!-- 造句练习 V2 -->
        <div v-else-if="id === 'V2'" class="sentence-game">
          <p class="sentence-prompt">用下面的词语造句：</p>
          <div class="sentence-words">
            <span v-for="word in sentenceWords" :key="word" class="sentence-word">{{ word }}</span>
          </div>
          <textarea v-model="userSentence" placeholder="请输入完整的句子..." class="sentence-input"></textarea>
          <button class="submit-btn" @click="checkSentence">确认</button>
        </div>

        <!-- 看图说话 V3 -->
        <div v-else-if="id === 'V3'" class="describe-image">
          <img :src="describeImg" alt="描述图片" class="desc-img" />
          <p class="phase-tip">请描述这张图片的内容</p>
          <textarea v-model="imageDesc" placeholder="请描述你看到的内容..." class="desc-input"></textarea>
          <button class="submit-btn" @click="submitDesc">完成描述</button>
        </div>

        <!-- 双重任务 E1 -->
        <div v-else-if="id === 'E1'" class="dual-task">
          <div class="dual-info">
            <div class="dual-panel">
              <span class="dual-label">任务1：记住数字</span>
              <span class="dual-num">{{ dualNum }}</span>
            </div>
            <div class="dual-panel">
              <span class="dual-label">任务2：点击圆形</span>
              <div class="dual-shapes">
                <div v-for="shape in dualShapes" :key="shape.id" class="shape-item" :class="shape.type" @click="clickDualShape(shape.id)"></div>
              </div>
            </div>
          </div>
          <p class="phase-tip">回答刚才的数字：{{ dualAnswer }}</p>
          <div class="dual-input">
            <input v-model="dualInput" type="number" placeholder="输入数字" />
            <button @click="checkDualTask">确认</button>
          </div>
        </div>

        <!-- 停止-开始 E2 -->
        <div v-else-if="id === 'E2'" class="stop-game">
          <p class="stop-instruct" :class="{ warning: stopSignal === '停' }">
            <span v-if="stopSignal === '开始'">🟢 说"开始"时点击</span>
            <span v-else-if="stopSignal === '停'">🔴 说"停"时不要点击！</span>
            <span v-else>🤔 等待指令...</span>
          </p>
          <div class="stop-area" @click="handleStopClick">
            <span class="stop-icon">{{ stopSignal === '停' ? '✋' : '👆' }}</span>
          </div>
          <p class="phase-tip">得分：{{ stopScore }} | 错误：{{ stopErrors }}</p>
        </div>

        <!-- 计划安排 E3 -->
        <div v-else-if="id === 'E3'" class="plan-game">
          <p class="plan-tip">将任务按正确顺序排列：</p>
          <div class="plan-tasks">
            <div v-for="(task, idx) in planTasks" :key="idx" class="plan-task" :class="{ done: task.done }" @click="togglePlanTask(idx)">
              <span class="task-num">{{ idx + 1 }}</span>
              <span class="task-text">{{ task.text }}</span>
            </div>
          </div>
          <button class="submit-btn" @click="checkPlanOrder">检查顺序</button>
        </div>

        <!-- 音乐感知 P1 -->
        <div v-else-if="id === 'P1'" class="music-feel">
          <div class="music-player">
            <div class="music-icon" :class="{ playing: musicPlaying }">🎵</div>
            <button class="play-btn" @click="toggleMusic">{{ musicPlaying ? '⏸️ 暂停' : '▶️ 播放' }}</button>
          </div>
          <p class="phase-tip">这段音乐表达什么情绪？</p>
          <div class="emotion-options">
            <button v-for="emo in emotions" :key="emo" class="emo-btn" :class="{ correct: answeredEmo === emo && correctEmo, wrong: answeredEmo === emo && !correctEmo }" :disabled="answeredEmo" @click="selectEmotion(emo)">{{ emo }}</button>
          </div>
        </div>

        <!-- 颜色情绪 P2 -->
        <div v-else-if="id === 'P2'" class="color-emotion">
          <div class="color-show" :style="{ background: currentColor }"></div>
          <p class="phase-tip">这个颜色让你联想到什么情绪？</p>
          <div class="emotion-options">
            <button v-for="emo in colorEmotions" :key="emo" class="emo-btn" :class="{ correct: answeredColor === emo && correctColor, wrong: answeredColor === emo && !correctColor }" :disabled="answeredColor" @click="selectColorEmotion(emo)">{{ emo }}</button>
          </div>
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

// 追踪目标 A4
const balls = ref([])
const trackedCount = ref(0)
const totalBalls = ref(3)
const trackColor = ref('#ff6b6b')
const trackArena = ref(null)

// 图形推理 L1
const patternRows = ref([])
const patternOptions = ref([])
const selectedPattern = ref(null)

// 数独入门 L2
const sudokuBoard = ref([])
const selectedCell = ref(null)

// 序列找规律 L3
const sequenceNum = ref([])
const sequenceOptions = ref([])
const correctAnswer = ref(0)

// 分类游戏 L4
const categoryItems = ref([])
const currentCategory = ref('')
const selectedBin = ref('')
const categoryScore = ref(0)

// 词语接龙 V1
const chainWords = ref([])
const chainInput = ref('')
const chainTopic = ref('')
const lastChar = ref('')

// 造句练习 V2
const sentenceWords = ref([])
const userSentence = ref('')

// 看图说话 V3
const describeImg = ref('')
const imageDesc = ref('')

// 双重任务 E1
const dualNum = ref(0)
const dualAnswer = ref(0)
const dualInput = ref('')
const dualShapes = ref([])
const clickCount = ref(0)

// 停止-开始 E2
const stopSignal = ref('等待')
const stopScore = ref(0)
const stopErrors = ref(0)
const stopInterval = ref(null)
const shouldClick = ref(true)

// 计划安排 E3
const planTasks = ref([])
const planOrder = ref([])

// 音乐感知 P1
const musicPlaying = ref(false)
const emotions = ref(['快乐', '悲伤', '平静', '紧张'])
const answeredEmo = ref('')
const correctEmo = ref(false)

// 颜色情绪 P2
const currentColor = ref('')
const colorEmotions = ref(['温暖', '冷静', '活力', '忧郁'])
const answeredColor = ref('')
const correctColor = ref(false)

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
  else if (id === 'A4') initTrackTarget()
  else if (id === 'L1') initPatternReason()
  else if (id === 'L2') initSudoku()
  else if (id === 'L3') initSequenceGame()
  else if (id === 'L4') initCategoryGame()
  else if (id === 'V1') initWordChain()
  else if (id === 'V2') initSentenceGame()
  else if (id === 'V3') initDescribeImage()
  else if (id === 'E1') initDualTask()
  else if (id === 'E2') initStopGame()
  else if (id === 'E3') initPlanGame()
  else if (id === 'P1') initMusicFeel()
  else if (id === 'P2') initColorEmotion()
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
  
  // 东亚人脸照片（使用randomuser.me可靠源）
  const eastAsianFaces = [
    { name: '张伟', face: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { name: '李娜', face: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { name: '王强', face: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { name: '刘洋', face: 'https://randomuser.me/api/portraits/men/4.jpg' },
    { name: '陈静', face: 'https://randomuser.me/api/portraits/women/5.jpg' },
    { name: '杨明', face: 'https://randomuser.me/api/portraits/men/6.jpg' },
    { name: '赵磊', face: 'https://randomuser.me/api/portraits/men/7.jpg' },
    { name: '孙丽', face: 'https://randomuser.me/api/portraits/women/8.jpg' },
    { name: '周杰', face: 'https://randomuser.me/api/portraits/men/9.jpg' },
    { name: '吴芳', face: 'https://randomuser.me/api/portraits/women/10.jpg' },
    { name: '郑浩', face: 'https://randomuser.me/api/portraits/men/11.jpg' },
    { name: '林梅', face: 'https://randomuser.me/api/portraits/women/12.jpg' },
    { name: '黄涛', face: 'https://randomuser.me/api/portraits/men/13.jpg' },
    { name: '林霞', face: 'https://randomuser.me/api/portraits/women/14.jpg' },
    { name: '徐鹏', face: 'https://randomuser.me/api/portraits/men/15.jpg' },
    { name: '孙丽', face: 'https://randomuser.me/api/portraits/women/16.jpg' },
    { name: '马超', face: 'https://randomuser.me/api/portraits/men/17.jpg' },
    { name: '朱琳', face: 'https://randomuser.me/api/portraits/women/18.jpg' },
    { name: '胡军', face: 'https://randomuser.me/api/portraits/men/19.jpg' },
    { name: '郭敏', face: 'https://randomuser.me/api/portraits/women/20.jpg' },
    { name: '何刚', face: 'https://randomuser.me/api/portraits/men/21.jpg' },
    { name: '罗娜', face: 'https://randomuser.me/api/portraits/women/22.jpg' },
    { name: '高峰', face: 'https://randomuser.me/api/portraits/men/23.jpg' },
    { name: '宋娟', face: 'https://randomuser.me/api/portraits/women/24.jpg' }
  ]
  
  // 随机打乱并选择4个人
  const shuffled = [...eastAsianFaces].sort(() => Math.random() - 0.5)
  faceNamePairs.value = shuffled.slice(0, 4)
  
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

// 追踪目标 A4
function initTrackTarget() {
  trackedCount.value = 0
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7']
  trackColor.value = colors[Math.floor(Math.random() * colors.length)]
  totalBalls.value = 3 + Math.floor(Math.random() * 3)
  
  const ballList = []
  for (let i = 0; i < 5; i++) {
    ballList.push({
      id: i,
      x: 10 + Math.random() * 70,
      y: 10 + Math.random() * 70,
      color: colors[i],
      tracked: false,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    })
  }
  balls.value = ballList
  
  // 动画循环
  const moveInterval = setInterval(() => {
    if (gameState.value !== 'playing') {
      clearInterval(moveInterval)
      return
    }
    balls.value.forEach(ball => {
      ball.x += ball.vx
      ball.y += ball.vy
      if (ball.x < 5 || ball.x > 90) ball.vx *= -1
      if (ball.y < 5 || ball.y > 90) ball.vy *= -1
    })
  }, 50)
  
  window.trackInterval = moveInterval
}

function clickBall(id) {
  const ball = balls.value.find(b => b.id === id)
  if (!ball || ball.tracked) return
  
  if (ball.color === trackColor.value) {
    ball.tracked = true
    trackedCount.value++
    if (trackedCount.value >= totalBalls.value) {
      clearInterval(window.trackInterval)
      finishGame()
    }
  }
}

// 图形推理 L1
function initPatternReason() {
  const shapes = ['■', '●', '▲', '◆', '★']
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1']
  
  // 生成简单的规律：每行增加一个形状
  const row1 = [shapes[0], shapes[1], shapes[2]]
  const row2 = [shapes[1], shapes[2], shapes[3]]
  const row3 = [shapes[2], shapes[3], shapes[4]]
  
  patternRows.value = [row1, row2, row3]
  patternOptions.value = [shapes[4], shapes[3], shapes[2]]
}

function selectPattern(idx) {
  if (patternOptions.value[idx] === '★') {
    finishGame()
  } else {
    initPatternReason()
  }
}

// 数独入门 L2
function initSudoku() {
  selectedCell.value = null
  const solution = [[1,2,3,4], [3,4,1,2], [2,1,4,3], [4,3,2,1]]
  
  // 挖空一些格子
  const board = []
  for (let r = 0; r < 4; r++) {
    const row = []
    for (let c = 0; c < 4; c++) {
      const fixed = Math.random() > 0.4
      row.push({ value: fixed ? solution[r][c] : null, fixed })
    }
    board.push(row)
  }
  sudokuBoard.value = board
}

function selectSudokuCell(r, c) {
  if (sudokuBoard.value[r][c].fixed) return
  selectedCell.value = { r, c }
}

function inputSudoku(num) {
  if (!selectedCell.value) return
  const { r, c } = selectedCell.value
  sudokuBoard.value[r][c].value = num
  
  // 检查是否完成
  let complete = true
  for (let row of sudokuBoard.value) {
    for (let cell of row) {
      if (!cell.value) { complete = false; break }
    }
  }
  if (complete) {
    // 简单检查每行每列是否不重复
    const values = sudokuBoard.value.flat().map(c => c.value)
    const unique = new Set(values)
    if (unique.size === 16) finishGame()
  }
}

// 序列找规律 L3
function initSequenceGame() {
  // 等差数列
  const start = Math.floor(Math.random() * 5) + 1
  const diff = Math.floor(Math.random() * 3) + 1
  sequenceNum.value = [start, start + diff, start + diff * 2, start + diff * 3]
  correctAnswer.value = start + diff * 4
  
  const opts = [correctAnswer.value, correctAnswer.value + 1, correctAnswer.value - 1]
  sequenceOptions.value = opts.sort(() => Math.random() - 0.5)
}

function selectSequence(num) {
  if (num === correctAnswer.value) {
    finishGame()
  } else {
    initSequenceGame()
  }
}

// 分类游戏 L4
function initCategoryGame() {
  categoryScore.value = 0
  
  const items = [
    { name: '苹果', emoji: '🍎', category: '水果' },
    { name: '香蕉', emoji: '🍌', category: '水果' },
    { name: '狗', emoji: '🐕', category: '动物' },
    { name: '猫', emoji: '🐱', category: '动物' },
    { name: '红色', emoji: '🔴', category: '颜色' },
    { name: '蓝色', emoji: '🔵', category: '颜色' },
    { name: '葡萄', emoji: '🍇', category: '水果' },
    { name: '鸟', emoji: '🐦', category: '动物' }
  ]
  
  categoryItems.value = items.sort(() => Math.random() - 0.5).slice(0, 6).map(i => ({ ...i, result: null }))
  
  const cats = ['水果', '动物', '颜色']
  currentCategory.value = cats[Math.floor(Math.random() * cats.length)]
  selectedBin.value = ''
}

function selectBin(cat) {
  selectedBin.value = cat
}

function categorizeItem(item) {
  if (!selectedBin.value || item.result) return
  
  if (item.category === selectedBin.value) {
    item.result = 'correct'
    categoryScore.value++
    if (categoryScore.value >= 3) finishGame()
  } else {
    item.result = 'wrong'
  }
}

// 词语接龙 V1
function initWordChain() {
  const topics = ['动物', '水果', '颜色', '国家', '城市']
  chainTopic.value = topics[Math.floor(Math.random() * topics.length)]
  const words = { '动物': ['狗', '猫', '兔子'], '水果': ['苹果', '香蕉', '橘子'], '颜色': ['红色', '蓝色', '绿色'], '国家': ['中国', '美国', '日本'], '城市': ['北京', '上海', '广州'] }
  chainWords.value = words[chainTopic.value].slice(0, 2)
  lastChar.value = chainWords.value[chainWords.value.length - 1].slice(-1)
}

function submitChain() {
  if (!chainInput.value) return
  if (chainInput.value[0] === lastChar.value) {
    chainWords.value.push(chainInput.value)
    if (chainWords.value.length >= 5) {
      finishGame()
    } else {
      lastChar.value = chainInput.value.slice(-1)
      chainInput.value = ''
    }
  } else {
    alert('请接一个以「' + lastChar.value + '」开头的词语')
    chainInput.value = ''
  }
}

// 造句练习 V2
function initSentenceGame() {
  const sets = [
    ['今天', '天气', '很好'],
    ['我', '喜欢', '学习'],
    ['妈妈', '做', '饭']
  ]
  sentenceWords.value = sets[Math.floor(Math.random() * sets.length)]
  userSentence.value = ''
}

function checkSentence() {
  const text = userSentence.value
  const hasAll = sentenceWords.value.every(w => text.includes(w))
  if (hasAll && text.length > 8) {
    finishGame()
  } else {
    alert('请用所有词语造一个完整的句子')
  }
}

// 看图说话 V3
function initDescribeImage() {
  const imgs = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400'
  ]
  describeImg.value = imgs[Math.floor(Math.random() * imgs.length)]
  imageDesc.value = ''
}

function submitDesc() {
  if (imageDesc.value.length >= 5) {
    finishGame()
  } else {
    alert('请输入更详细的描述')
  }
}

// 双重任务 E1
function initDualTask() {
  dualNum.value = Math.floor(Math.random() * 90) + 10
  dualAnswer.value = dualNum.value
  dualInput.value = ''
  clickCount.value = 0
  
  const shapes = []
  for (let i = 0; i < 8; i++) {
    shapes.push({ id: i, type: i < 3 ? 'circle' : 'square' })
  }
  dualShapes.value = shapes.sort(() => Math.random() - 0.5)
}

function clickDualShape(id) {
  const shape = dualShapes.value.find(s => s.id === id)
  if (!shape) return
  
  clickCount.value++
  if (clickCount.value >= 3) {
    // 接下来问数字
  }
}

function checkDualTask() {
  if (parseInt(dualInput.value) === dualAnswer.value) {
    finishGame()
  } else {
    alert('回答错误，再试一次')
    initDualTask()
  }
}

// 停止-开始 E2
function initStopGame() {
  stopSignal.value = '等待'
  stopScore.value = 0
  stopErrors.value = 0
  shouldClick.value = true
  
  const signals = ['开始', '停', '开始', '停', '开始']
  let idx = 0
  
  stopInterval.value = setInterval(() => {
    if (gameState.value !== 'playing') {
      clearInterval(stopInterval.value)
      return
    }
    stopSignal.value = signals[idx % signals.length]
    shouldClick.value = stopSignal.value === '开始'
    idx++
  }, 2000)
}

function handleStopClick() {
  if (stopSignal.value === '等待') return
  
  if (shouldClick.value) {
    stopScore.value++
    if (stopScore.value >= 5) {
      clearInterval(stopInterval.value)
      finishGame()
    }
  } else {
    stopErrors.value++
    if (stopErrors.value >= 3) {
      clearInterval(stopInterval.value)
      finishGame()
    }
  }
}

// 计划安排 E3
function initPlanGame() {
  const tasks = [
    { text: '起床', order: 1 },
    { text: '刷牙', order: 2 },
    { text: '吃早餐', order: 3 },
    { text: '上班', order: 4 },
    { text: '下班回家', order: 5 }
  ]
  planTasks.value = [...tasks].sort(() => Math.random() - 0.5).map(t => ({ ...t, done: false }))
  planOrder.value = []
}

function togglePlanTask(idx) {
  const task = planTasks.value[idx]
  task.done = !task.done
}

function checkPlanOrder() {
  const done = planTasks.value.filter(t => t.done)
  const correct = done.length >= 3
  if (correct) finishGame()
  else alert('请完成至少3个任务')
}

// 音乐感知 P1
function initMusicFeel() {
  musicPlaying.value = false
  answeredEmo.value = ''
  const emos = ['快乐', '悲伤', '平静', '紧张']
  correctEmo.value = emos[Math.floor(Math.random() * 2)] // 前两个更容易
}

function toggleMusic() {
  musicPlaying.value = !musicPlaying.value
}

function selectEmotion(emo) {
  answeredEmo.value = emo
  correctEmo.value = emo === correctEmo.value
  setTimeout(finishGame, 1000)
}

// 颜色情绪 P2
function initColorEmotion() {
  answeredColor.value = ''
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7']
  currentColor.value = colors[Math.floor(Math.random() * colors.length)]
  const colorToEmo = { '#ff6b6b': '温暖', '#4ecdc4': '冷静', '#45b7d1': '平静', '#96ceb4': '活力', '#ffeaa7': '忧郁' }
  correctColor.value = colorToEmo[currentColor.value]
}

function selectColorEmotion(emo) {
  answeredColor.value = emo
  correctColor.value = emo === correctColor.value
  setTimeout(finishGame, 1000)
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

/* 追踪目标 */
.track-instruct {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.track-color {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  vertical-align: middle;
}

.track-arena {
  position: relative;
  width: 320px;
  height: 320px;
  background: white;
  border-radius: 1rem;
  margin: 0 auto;
}

.track-ball {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  transition: transform 0.2s;
}

.track-mark {
  font-weight: bold;
}

/* 图形推理 */
.pattern-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
}

.pattern-row {
  display: flex;
  gap: 0.5rem;
}

.pattern-cell {
  width: 50px;
  height: 50px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.pattern-cell.option {
  background: white;
  border: 2px solid #ddd;
  cursor: pointer;
}

.pattern-cell.option:hover {
  border-color: #1e3a5f;
}

.pattern-arrow {
  font-size: 2rem;
  color: #1e3a5f;
}

/* 数独 */
.sudoku-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 280px;
  margin: 0 auto;
}

.sudoku-row {
  display: flex;
  gap: 4px;
}

.sudoku-cell {
  width: 60px;
  height: 60px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
}

.sudoku-cell.fixed {
  background: #e8e8e8;
  color: #333;
}

.sudoku-cell.selected {
  border-color: #1e3a5f;
  border-width: 3px;
}

.sudoku-empty {
  font-size: 0.75rem;
  color: #ccc;
  cursor: pointer;
  padding: 2px;
}

/* 序列找规律 */
.sequence-display {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.seq-num {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.seq-q {
  background: #fff3cd;
}

.sequence-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.seq-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  cursor: pointer;
}

.seq-btn:hover {
  border-color: #1e3a5f;
}

/* 分类游戏 */
.category-tip {
  text-align: center;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.cat-name {
  font-weight: bold;
  color: #1e3a5f;
  font-size: 1.5rem;
}

.category-items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  max-width: 320px;
  margin: 0 auto 1rem;
}

.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 0.75rem;
  cursor: pointer;
  min-width: 70px;
}

.cat-item.correct {
  background: #4CAF50;
}

.cat-item.wrong {
  background: #f44336;
}

.cat-emoji {
  font-size: 2rem;
}

.cat-label {
  font-size: 0.9rem;
  color: #333;
}

.cat-item.correct .cat-label,
.cat-item.wrong .cat-label {
  color: white;
}

.category-bins {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.cat-bin {
  padding: 1rem 1.5rem;
  background: #1e3a5f;
  color: white;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 1.1rem;
}

/* 词语接龙 */
.word-chain-topic {
  text-align: center;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.topic-word {
  font-weight: bold;
  color: #1e3a5f;
  font-size: 1.5rem;
}

.chain-display {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.chain-word {
  padding: 0.5rem 1rem;
  background: #1e3a5f;
  color: white;
  border-radius: 0.5rem;
  font-size: 1.25rem;
}

.chain-input {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  max-width: 300px;
  margin: 0 auto;
}

.chain-input input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1.1rem;
}

.chain-input button {
  padding: 0.75rem 1.5rem;
  background: #1e3a5f;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

/* 造句 */
.sentence-prompt {
  text-align: center;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.sentence-words {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.sentence-word {
  padding: 0.75rem 1rem;
  background: #fff3cd;
  border-radius: 0.5rem;
  font-size: 1.25rem;
}

.sentence-input {
  width: 100%;
  max-width: 400px;
  margin: 0 auto 1rem;
  display: block;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  min-height: 80px;
}

/* 看图说话 */
.desc-img {
  width: 100%;
  max-width: 350px;
  border-radius: 1rem;
  margin-bottom: 1rem;
  display: block;
}

.desc-input {
  width: 100%;
  max-width: 400px;
  margin: 0 auto 1rem;
  display: block;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  min-height: 80px;
}

/* 双重任务 */
.dual-info {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.dual-panel {
  background: white;
  padding: 1rem;
  border-radius: 0.75rem;
  text-align: center;
}

.dual-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.dual-num {
  font-size: 2rem;
  font-weight: bold;
  color: #1e3a5f;
}

.dual-shapes {
  display: flex;
  gap: 0.5rem;
}

.shape-item {
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.shape-item.circle {
  border-radius: 50%;
  background: #ff6b6b;
}

.shape-item.square {
  background: #4ecdc4;
}

.dual-input {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.dual-input input {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  width: 100px;
  font-size: 1.1rem;
}

.dual-input button {
  padding: 0.75rem 1.5rem;
  background: #1e3a5f;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

/* 停止-开始 */
.stop-instruct {
  text-align: center;
  font-size: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}

.stop-instruct.warning {
  background: #fee;
  color: #c00;
}

.stop-area {
  width: 150px;
  height: 150px;
  background: white;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.stop-icon {
  font-size: 4rem;
}

/* 计划安排 */
.plan-tip {
  text-align: center;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.plan-tasks {
  max-width: 350px;
  margin: 0 auto 1rem;
}

.plan-task {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.plan-task.done {
  background: #4CAF50;
}

.plan-task.done .task-text {
  color: white;
}

.task-num {
  width: 30px;
  height: 30px;
  background: #1e3a5f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-text {
  font-size: 1.1rem;
}

/* 音乐感知 */
.music-player {
  text-align: center;
  margin-bottom: 1rem;
}

.music-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.music-icon.playing {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.play-btn {
  padding: 0.75rem 1.5rem;
  background: #1e3a5f;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
}

.emotion-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.emo-btn {
  padding: 1rem 1.5rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 0.75rem;
  font-size: 1.25rem;
  cursor: pointer;
}

.emo-btn.correct {
  background: #4CAF50;
  color: white;
}

.emo-btn.wrong {
  background: #f44336;
  color: white;
}

/* 颜色情绪 */
.color-show {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
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
