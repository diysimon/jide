<template>
  <div class="card-match">
    <div class="cards-grid" :class="gridClass">
      <div v-for="(card, index) in cards" :key="index" class="card" :class="{ flipped: card.flipped, matched: card.matched }" @click="flipCard(index)">
        <div class="card-inner">
          <div class="card-front">?</div>
          <div class="card-back"><img :src="card.value" :alt="card.name" /></div>
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

const totalPairs = computed(() => cards.value.length / 2)
const gridClass = computed(() => `grid-${Math.ceil(Math.sqrt(cards.value.length))}`)

function initGame() {
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
  initGame()
})
</script>

<style scoped>
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
.card-front { background: #1e3a5f; color: white; }
.card-back { background: white; transform: rotateY(180deg); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.card.matched .card-back { background: #e8f5e9; }
</style>
