<template>
  <div class="number-memory">
    <div v-if="phase === 'show'" class="show-phase">
      <div class="number-display">{{ currentNumber }}</div>
      <p class="phase-tip">记住这个数字</p>
    </div>
    <div v-else-if="phase === 'input'" class="input-phase">
      <p class="phase-tip">请输入刚才的数字</p>
      <div class="number-input">
        <input v-model="userInput" type="text" maxlength="10" placeholder="输入数字" @keyup.enter="submitNumber" />
        <button @click="submitNumber">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'M2' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const phase = ref('show')
const currentNumber = ref('')
const userInput = ref('')
const startTime = ref(Date.now())

function initGame() {
  phase.value = 'show'
  userInput.value = ''
  const len = 3 + Math.floor(Math.random() * 3)
  let num = ''
  for (let i = 0; i < len; i++) num += Math.floor(Math.random() * 10)
  currentNumber.value = num
  startTime.value = Date.now()
  
  setTimeout(() => {
    phase.value = 'input'
  }, 2000)
}

function submitNumber() {
  if (userInput.value === currentNumber.value) {
    finishGame()
  } else {
    userInput.value = ''
    alert('答案错误，再试一次！')
  }
}

function finishGame() {
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  const score = 1000 - duration * 5
  trainingStore.recordResult(props.gameId, score, duration)
  emit('finish', { score, duration })
}

onMounted(() => initGame())
</script>

<style scoped>
.number-display {
  font-size: 4rem;
  font-weight: bold;
  color: #1e3a5f;
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 1rem;
}
.number-input {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}
.number-input input {
  padding: 1rem;
  font-size: 1.5rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  width: 150px;
  text-align: center;
}
.number-input button {
  padding: 1rem 2rem;
  background: #1e3a5f;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
}
.phase-tip {
  text-align: center;
  font-size: 1.25rem;
  color: #666;
  margin: 1rem 0;
}
</style>
