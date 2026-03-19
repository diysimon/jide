<template>
  <div class="location-memory">
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
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'M6' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const phase = ref('show')
const locations = ref([])
const startTime = ref(Date.now())

function initGame() {
  phase.value = 'show'
  startTime.value = Date.now()
  const locs = []
  for (let i = 0; i < 9; i++) {
    locs.push({ num: i + 1, x: 10 + (i % 3) * 35, y: 10 + Math.floor(i / 3) * 35, clicked: false })
  }
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
    const correct = locations.value.every((l, i) => l.num === i + 1)
    if (correct) finishGame()
    else {
      alert('顺序错误，再试一次')
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
.loc-item.clicked { background: #4CAF50; }
.location-grid.empty .loc-item { background: #e0e0e0; color: #999; }
.location-grid.empty .loc-item.clicked { background: #1e3a5f; }
.phase-tip { text-align: center; font-size: 1.25rem; color: #666; margin: 1rem 0; }
</style>
