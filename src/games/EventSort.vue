<template>
  <div class="event-sort">
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
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'M7' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const phase = ref('show')
const events = ref([])
const shuffledEvents = ref([])
const startTime = ref(Date.now())

function initGame() {
  phase.value = 'show'
  startTime.value = Date.now()
  const evtList = ['早上起床', '吃早餐', '上班工作', '午餐时间', '下班回家', '晚餐时间', '看电视', '上床睡觉']
  events.value = evtList.slice(0, 5)
  shuffledEvents.value = [...events.value].sort(() => Math.random() - 0.5)
  
  setTimeout(() => { phase.value = 'input' }, 4000)
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
.event-timeline, .event-list {
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
.event-text { font-size: 1.1rem; color: #333; }
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
.submit-btn {
  padding: 1rem 2rem;
  background: #1e3a5f;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  display: block;
  margin: 1rem auto;
}
.phase-tip { text-align: center; font-size: 1.25rem; color: #666; margin: 1rem 0; }
</style>
