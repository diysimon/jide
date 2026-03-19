<template>
  <div class="schulte-grid">
    <div class="grid-container" :class="'size-' + gridSize">
      <div v-for="n in gridSize * gridSize" :key="n" class="schulte-cell" :class="{ correct: n === nextNumber, clicked: clickedNumbers.includes(n) }" @click="clickSchulte(n)">{{ getNumber(n) }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'A1' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const gridSize = ref(5)
const nextNumber = ref(1)
const clickedNumbers = ref([])
const schulteNums = ref([])
const startTime = ref(Date.now())

function initGame() {
  gridSize.value = 5
  nextNumber.value = 1
  clickedNumbers.value = []
  startTime.value = Date.now()
  let nums = []
  for (let i = 1; i <= 25; i++) nums.push(i)
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]]
  }
  schulteNums.value = nums
}

function getNumber(n) {
  return schulteNums.value[n - 1] || n
}

function clickSchulte(n) {
  if (clickedNumbers.value.includes(n)) return
  
  const expected = schulteNums.value[nextNumber.value - 1]
  if (n === expected) {
    clickedNumbers.value.push(n)
    nextNumber.value++
    if (nextNumber.value > 25) finishGame()
  }
}

function finishGame() {
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  const score = Math.max(1000 - duration * 10, 100)
  trainingStore.recordResult(props.gameId, score, duration)
  emit('finish', { score, duration })
}

onMounted(() => initGame())
</script>

<style scoped>
.schulte-grid { background: white; padding: 1rem; border-radius: 1rem; }
.grid-container { display: grid; gap: 0.5rem; }
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
.schulte-cell.clicked { background: #4CAF50; color: white; }
</style>
