<template>
  <div class="visual-search">
    <p class="search-target">找到：<span class="target-char">{{ targetChar }}</span></p>
    <div class="search-grid">
      <div v-for="(cell, idx) in searchCells" :key="idx" class="search-cell" :class="{ found: cell.found }" @click="clickSearchCell(idx)">
        <span :class="{ target: cell.isTarget }">{{ cell.char }}</span>
      </div>
    </div>
    <p class="phase-tip">已找到：{{ foundCount }} / {{ totalTargets }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'A3' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const targetChar = ref('')
const searchCells = ref([])
const foundCount = ref(0)
const totalTargets = ref(5)
const startTime = ref(Date.now())

function initGame() {
  foundCount.value = 0
  startTime.value = Date.now()
  const chars = '天地人和日月星辰山水火木金土'
  targetChar.value = chars[Math.floor(Math.random() * chars.length)]
  
  const cells = []
  const targetCount = 3 + Math.floor(Math.random() * 3)
  totalTargets.value = targetCount
  
  for (let i = 0; i < targetCount; i++) {
    cells.push({ char: targetChar.value, isTarget: true, found: false })
  }
  for (let i = 0; i < 20; i++) {
    let char = chars[Math.floor(Math.random() * chars.length)]
    while (char === targetChar.value) char = chars[Math.floor(Math.random() * chars.length)]
    cells.push({ char, isTarget: false, found: false })
  }
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

function finishGame() {
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  const score = Math.max(1000 - duration * 10, 100)
  trainingStore.recordResult(props.gameId, score, duration)
  emit('finish', { score, duration })
}

onMounted(() => initGame())
</script>

<style scoped>
.search-target { text-align: center; font-size: 1.5rem; margin-bottom: 1rem; }
.target-char {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e3a5f;
  background: #fff3cd;
  padding: 0.25rem 1rem;
  border-radius: 0.5rem;
}
.search-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; max-width: 350px; margin: 0 auto; }
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
.search-cell.found { background: #4CAF50; color: white; }
.phase-tip { text-align: center; font-size: 1.25rem; color: #666; margin: 1rem 0; }
</style>
