<template>
  <div class="sequence-game">
    <div class="sequence-display">
      <span v-for="(num, idx) in sequenceNum" :key="idx" class="seq-num">{{ num }}</span>
      <span class="seq-q mark">?</span>
    </div>
    <div class="sequence-options">
      <button v-for="opt in sequenceOptions" :key="opt" class="seq-btn" @click="selectSequence(opt)">{{ opt }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'L3' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const sequenceNum = ref([])
const sequenceOptions = ref([])
const correctAnswer = ref(0)
const startTime = ref(Date.now())

function initGame() {
  startTime.value = Date.now()
  const start = Math.floor(Math.random() * 5) + 1
  const diff = Math.floor(Math.random() * 3) + 1
  sequenceNum.value = [start, start + diff, start + diff * 2, start + diff * 3]
  correctAnswer.value = start + diff * 4
  
  const opts = [correctAnswer.value, correctAnswer.value + 1, correctAnswer.value - 1]
  sequenceOptions.value = opts.sort(() => Math.random() - 0.5)
}

function selectSequence(num) {
  if (num === correctAnswer.value) {
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
.sequence-display { display: flex; justify-content: center; gap: 0.75rem; margin-bottom: 1.5rem; }
.seq-num, .seq-q {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}
.seq-q { background: #fff3cd; }
.sequence-options { display: flex; justify-content: center; gap: 1rem; }
.seq-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  cursor: pointer;
}
.seq-btn:hover { border-color: #1e3a5f; }
</style>
