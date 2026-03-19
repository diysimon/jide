<template>
  <div class="image-sequence">
    <div v-if="phase === 'show'" class="show-phase">
      <div class="image-grid">
        <div v-for="(img, idx) in showImages" :key="idx" class="seq-image">
          <img :src="img.img" :alt="img.name" class="seq-img" />
          <span class="seq-num-badge">{{ img.num }}</span>
        </div>
      </div>
      <p class="phase-tip">🖼️ 记住这9张图片的顺序</p>
    </div>
    <div v-else-if="phase === 'input'" class="input-phase">
      <p class="phase-tip">👆 按1-9顺序点击图片</p>
      <div class="image-grid">
        <div v-for="(img, idx) in inputImages" :key="idx" class="seq-image" :class="{ selected: img.clicked }" @click="clickImage(idx)">
          <img :src="img.img" :alt="img.name" class="seq-img" />
          <span v-if="img.clicked" class="seq-num-badge">{{ img.num }}</span>
        </div>
      </div>
      <p class="sequence-display">当前顺序：{{ currentSequence.join(' → ') || '还未点击' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'M3' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const phase = ref('show')
const showImages = ref([])
const inputImages = ref([])
const currentSequence = ref([])
const startTime = ref(Date.now())

function initGame() {
  phase.value = 'show'
  currentSequence.value = []
  startTime.value = Date.now()
  
  const imageThemes = [
    { num: 1, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200', name: '山峰' },
    { num: 2, img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200', name: '森林' },
    { num: 3, img: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=200', name: '树木' },
    { num: 4, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', name: '大海' },
    { num: 5, img: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200', name: '湖泊' },
    { num: 6, img: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=200', name: '日出' },
    { num: 7, img: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=200', name: 'mountains' },
    { num: 8, img: 'https://images.unsplash.com/photo-1434394354979-a235cd36269d?w=200', name: '河流' },
    { num: 9, img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200', name: '峡谷' }
  ]
  
  const shuffled = [...imageThemes].sort(() => Math.random() - 0.5)
  showImages.value = shuffled.map((item, idx) => ({ num: item.num, img: item.img, name: item.name, pos: idx }))
  inputImages.value = [...showImages.value].map(n => ({ num: n.num, img: n.img, name: n.name, clicked: false }))
  
  setTimeout(() => { phase.value = 'input' }, 5000)
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
      initGame()
    }
  }
}

function finishGame() {
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  const score = Math.max(1000 - duration * 5, 100)
  trainingStore.recordResult(props.gameId, score, duration)
  emit('finish', { score, duration })
}

onMounted(() => initGame())
</script>

<style scoped>
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 450px;
  margin: 0 auto;
}
.seq-image {
  aspect-ratio: 1;
  background: #1e3a5f;
  border-radius: 0.75rem;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}
.seq-img { width: 100%; height: 100%; object-fit: cover; }
.seq-num-badge {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: rgba(0,0,0,0.7);
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}
.seq-image.selected { outline: 4px solid #4CAF50; outline-offset: 2px; }
.sequence-display {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 1.5rem;
  color: #333;
  background: white;
  padding: 1rem;
  border-radius: 0.75rem;
}
.phase-tip {
  text-align: center;
  font-size: 1.25rem;
  color: #666;
  margin: 1rem 0;
}
</style>
