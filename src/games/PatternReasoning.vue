<template>
  <div class="pattern-reason">
    <div class="pattern-display">
      <div v-for="(row, ridx) in patternRows" :key="ridx" class="pattern-row">
        <div v-for="(cell, cidx) in row" :key="cidx" class="pattern-cell" :style="{ background: cell }">{{ cell }}</div>
      </div>
      <div class="pattern-arrow">→</div>
      <div class="pattern-row">
        <div v-for="(opt, oidx) in patternOptions" :key="oidx" class="pattern-cell option" @click="selectPattern(oidx)">{{ opt }}</div>
      </div>
    </div>
    <p class="phase-tip">找出规律，选择下一个图形</p>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'L1' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const patternRows = ref([])
const patternOptions = ref([])
const startTime = ref(Date.now())

function initGame() {
  startTime.value = Date.now()
  const shapes = ['■', '●', '▲', '◆', '★']
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
    initGame()
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
.pattern-display { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; padding: 1rem; }
.pattern-row { display: flex; gap: 0.5rem; }
.pattern-cell {
  width: 50px;
  height: 50px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  background: #f0f0f0;
}
.pattern-cell.option { background: white; border: 2px solid #ddd; cursor: pointer; }
.pattern-cell.option:hover { border-color: #1e3a5f; }
.pattern-arrow { font-size: 2rem; color: #1e3a5f; }
.phase-tip { text-align: center; font-size: 1.25rem; color: #666; margin: 1rem 0; }
</style>
