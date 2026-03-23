<template>
  <div class="card-match">
    <!-- Tutorial Mode -->
    <div v-if="tutorialPhase" class="tutorial-overlay">
      <div class="tutorial-card">
        <div class="tutorial-step" v-if="tutorialPhase === 'intro'">
          <h3>🎯 翻卡配对教程</h3>
          <p>找出所有相同的图片配对</p>
          <div class="tutorial-steps">
            <div class="step">1. 点击卡片翻开</div>
            <div class="step">2. 找到相同的图片</div>
            <div class="step">3. 配对成功得分</div>
          </div>
          <button class="tutorial-btn" @click="startTutorialDemo">开始演示</button>
        </div>
        
        <div class="tutorial-step" v-else-if="tutorialPhase === 'demo'">
          <h3>👆 跟我做</h3>
          <p>点击这张卡片翻开</p>
          <div class="tutorial-highlight">
            <div class="card demo-card" @click="tutorialDemoFlip">
              <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back"><span>👆 点这里</span></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="tutorial-step" v-else-if="tutorialPhase === 'match'">
          <h3>🔍 找相同</h3>
          <p>再找一张相同的图片配对</p>
          <button class="tutorial-btn primary" @click="tutorialMatch">开始配对</button>
        </div>
        
        <div class="tutorial-step" v-else-if="tutorialPhase === 'success'">
          <h3>🎉 配对成功！</h3>
          <p>两张相同的图片会消除</p>
          <button class="tutorial-btn" @click="endTutorial">知道了，开始游戏！</button>
        </div>
      </div>
    </div>
    
    <!-- Normal Game -->
    <div v-else class="cards-grid" :class="gridClass">
      <div v-for="(card, index) in cards" :key="index" class="card" :class="{ flipped: card.flipped, matched: card.matched }" @click="flipCard(index)">
        <div class="card-inner">
          <div class="card-front">?</div>
          <div class="card-back">
            <img 
              v-if="!imageErrors[index]" 
              :src="card.value" 
              :alt="card.name"
              @error="imageErrors[index] = true"
            />
            <div v-else class="image-fallback">{{ card.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({
  gameId: { type: String, default: 'M1' }
})

const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const cards = ref([])
const matched = ref(0)
const selectedCards = ref([])
const canFlip = ref(true)
const startTime = ref(Date.now())
const imageErrors = ref({})

// Tutorial state
const tutorialPhase = ref('intro')

const totalPairs = computed(() => cards.value.length / 2)
const gridClass = computed(() => `grid-${Math.ceil(Math.sqrt(cards.value.length))}`)

function startTutorialDemo() {
  tutorialPhase.value = 'demo'
}

function tutorialDemoFlip() {
  tutorialPhase.value = 'match'
}

function tutorialMatch() {
  tutorialPhase.value = 'success'
}

function endTutorial() {
  tutorialPhase.value = null
  initGame()
}

function initGame() {
  const imageCards = [
    { name: '故宫', img: 'https://picsum.photos/id/1015/400/400' },
    { name: '上海外滩', img: 'https://picsum.photos/id/1016/400/400' },
    { name: '西湖', img: 'https://picsum.photos/id/1018/400/400' },
    { name: '长城', img: 'https://picsum.photos/id/1019/400/400' },
    { name: '桂林山水', img: 'https://picsum.photos/id/1020/400/400' },
    { name: '黄山', img: 'https://picsum.photos/id/1021/400/400' },
    { name: '熊猫', img: 'https://picsum.photos/id/1025/400/400' },
    { name: '荷花', img: 'https://picsum.photos/id/1027/400/400' },
    { name: '雪景', img: 'https://picsum.photos/id/1030/400/400' },
    { name: '日落', img: 'https://picsum.photos/id/1033/400/400' }
  ]
  
  const shuffled = [...imageCards].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 6)
  const pairs = [...selected, ...selected]
  
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
  matched.value = 0
  selectedCards.value = []
  canFlip.value = true
  startTime.value = Date.now()
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

function finishGame() {
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  const score = Math.max(1000 - duration * 5 - matched.value * 20, 100)
  trainingStore.recordResult(props.gameId, score, duration)
  emit('finish', { score, duration })
}

onMounted(() => {
  // Start with tutorial
})
</script>

<style scoped>
.card-match { padding: 1rem; }

/* Tutorial Styles */
.tutorial-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tutorial-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 90%;
  width: 320px;
  text-align: center;
}

.tutorial-card h3 {
  color: #1e3a5f;
  margin-bottom: 1rem;
}

.tutorial-card p {
  color: #666;
  margin-bottom: 1.5rem;
}

.tutorial-steps {
  text-align: left;
  margin-bottom: 1.5rem;
}

.tutorial-steps .step {
  padding: 0.5rem 0;
  color: #333;
}

.tutorial-btn {
  background: #1e3a5f;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
}

.tutorial-btn.primary {
  background: #4caf50;
}

.tutorial-highlight {
  padding: 1rem;
}

.demo-card {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  cursor: pointer;
}

/* Game Styles */
.cards-grid {
  display: grid;
  gap: 0.75rem;
  justify-content: center;
}
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-6 { grid-template-columns: repeat(4, 1fr); }
.card { aspect-ratio: 1; perspective: 1000px; cursor: pointer; }
.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}
.card.flipped .card-inner, .card.matched .card-inner { transform: rotateY(180deg); }
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
.card-back img { width: 100%; height: 100%; object-fit: cover; }
.card-back .image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  color: #1565c0;
  font-size: 1.2rem;
  font-weight: bold;
}
.card-front { background: #1e3a5f; color: white; }
.card-back { background: white; transform: rotateY(180deg); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.card.matched .card-back { background: #e8f5e9; }
</style>
