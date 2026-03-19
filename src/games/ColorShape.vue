<template>
  <div class="color-shape">
    <div class="show-phase">
      <div class="cs-pairs">
        <div v-for="(pair, idx) in colorShapePairs" :key="idx" class="cs-pair">
          <span class="cs-color" :style="{ background: pair.color }"></span>
          <span class="cs-shape">{{ pair.shape }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'M8' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const colorShapePairs = ref([])
const startTime = ref(Date.now())

function initGame() {
  startTime.value = Date.now()
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
  const shapes = ['■', '●', '▲', '◆', '★', '□']
  colorShapePairs.value = []
  for (let i = 0; i < 6; i++) {
    colorShapePairs.value.push({ color: colors[i], shape: shapes[i] })
  }
  setTimeout(finishGame, 5000)
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
.cs-shape { font-size: 2rem; }
</style>
