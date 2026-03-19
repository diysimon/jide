<template>
  <div class="word-memory">
    <div v-if="phase === 'show'" class="show-phase">
      <div class="word-list">
        <div v-for="(word, idx) in words" :key="idx" class="word-item">{{ word }}</div>
      </div>
      <p class="phase-tip">记住这些词语</p>
    </div>
    <div v-else-if="phase === 'input'" class="input-phase">
      <p class="phase-tip">请回忆刚才的词语</p>
      <div class="word-input-grid">
        <input v-for="n in words.length" :key="n" v-model="wordInputs[n-1]" :placeholder="'词语' + n" />
      </div>
      <button class="submit-btn" @click="submitWords">确认</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'M5' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const phase = ref('show')
const words = ref([])
const wordInputs = ref([])
const startTime = ref(Date.now())

function initGame() {
  phase.value = 'show'
  startTime.value = Date.now()
  const wordList = ['苹果', '火车', '书本', '星星', '月亮', '河流', '树木', '花朵']
  let shuffled = [...wordList].sort(() => Math.random() - 0.5)
  words.value = shuffled.slice(0, 5)
  wordInputs.value = new Array(5).fill('')
  
  setTimeout(() => { phase.value = 'input' }, 4000)
}

function submitWords() {
  const correct = wordInputs.value.filter((w, i) => w === words.value[i]).length
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  const score = correct * 200
  trainingStore.recordResult(props.gameId, score, duration)
  emit('finish', { score, duration })
}

onMounted(() => initGame())
</script>

<style scoped>
.word-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1rem;
}
.word-item {
  padding: 1rem 1.5rem;
  background: #1e3a5f;
  color: white;
  border-radius: 0.75rem;
  font-size: 1.25rem;
}
.word-input-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 300px;
  margin: 0 auto;
}
.word-input-grid input {
  padding: 0.875rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
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
