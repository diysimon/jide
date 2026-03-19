<template>
  <div class="find-difference">
    <div class="two-images">
      <div class="image-box" @click="checkDiff(0)">
        <div v-for="(item, idx) in diffItems" :key="idx" class="diff-item" :style="{ left: item.x + '%', top: item.y + '%' }">{{ item.show ? item.char : '●' }}</div>
      </div>
      <div class="image-box" @click="checkDiff(1)">
        <div v-for="(item, idx) in diffItems" :key="idx" class="diff-item" :style="{ left: item.x + '%', top: item.y + '%' }">{{ item.show ? item.diffChar : '●' }}</div>
      </div>
    </div>
    <p class="phase-tip">找出两幅图的不同之处 ({{ foundDiffs }}/5)</p>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'A2' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const diffItems = ref([])
const foundDiffs = ref(0)
const startTime = ref(Date.now())

function initGame() {
  foundDiffs.value = 0
  diffItems.value = []
  startTime.value = Date.now()
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
  if (foundDiffs.value < 5) {
    foundDiffs.value++
    if (foundDiffs.value >= 5) finishGame()
  }
}

function finishGame() {
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  const score = Math.max(1000 - duration * 5 - foundDiffs.value * 20, 100)
  trainingStore.recordResult(props.gameId, score, duration)
  emit('finish', { score, duration })
}

onMounted(() => initGame())
</script>

<style scoped>
.two-images { display: flex; gap: 1rem; justify-content: center; margin-bottom: 1rem; }
.image-box {
  width: 150px;
  height: 150px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 0.75rem;
  position: relative;
  cursor: pointer;
}
.diff-item { position: absolute; font-size: 1.5rem; }
.phase-tip { text-align: center; font-size: 1.25rem; color: #666; margin: 1rem 0; }
</style>
