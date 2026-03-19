<template>
  <div class="face-name-game">
    <div v-if="phase === 'show'" class="show-phase">
      <div class="face-grid">
        <div v-for="(person, idx) in faceNamePairs" :key="idx" class="face-card">
          <img :src="person.face" :alt="person.name" class="face-img" />
          <span class="face-name">{{ person.name }}</span>
        </div>
      </div>
      <p class="phase-tip">记住每个人脸对应的姓名</p>
    </div>
    <div v-else-if="phase === 'input'" class="input-phase">
      <p class="phase-tip">选择正确的姓名</p>
      <div class="face-quiz">
        <img :src="currentQuiz.face" class="quiz-face" />
        <div class="name-options">
          <button v-for="opt in nameOptions" :key="opt" class="name-btn" :class="{ correct: opt === currentQuiz.correct && answered, wrong: answered && opt === userChoice && opt !== currentQuiz.correct }" :disabled="answered" @click="selectName(opt)">{{ opt }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'M4' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const phase = ref('show')
const faceNamePairs = ref([])
const currentQuiz = ref({})
const nameOptions = ref([])
const userChoice = ref('')
const answered = ref(false)
const startTime = ref(Date.now())

function initGame() {
  phase.value = 'show'
  answered.value = false
  userChoice.value = ''
  startTime.value = Date.now()
  
  const eastAsianFaces = [
    { name: '张伟', face: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { name: '李娜', face: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { name: '王强', face: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { name: '刘洋', face: 'https://randomuser.me/api/portraits/men/4.jpg' },
    { name: '陈静', face: 'https://randomuser.me/api/portraits/women/5.jpg' },
    { name: '杨明', face: 'https://randomuser.me/api/portraits/men/6.jpg' }
  ]
  
  const shuffled = [...eastAsianFaces].sort(() => Math.random() - 0.5)
  faceNamePairs.value = shuffled.slice(0, 4)
  
  setTimeout(() => {
    phase.value = 'input'
    startQuiz()
  }, 4000)
}

function startQuiz() {
  const correct = faceNamePairs.value[Math.floor(Math.random() * faceNamePairs.value.length)]
  currentQuiz.value = { face: correct.face, correct: correct.name }
  const names = faceNamePairs.value.map(p => p.name).sort(() => Math.random() - 0.5)
  nameOptions.value = names
}

function selectName(name) {
  if (answered.value) return
  userChoice.value = name
  answered.value = true
  
  setTimeout(() => {
    if (name === currentQuiz.value.correct) {
      finishGame()
    } else {
      startQuiz()
      answered.value = false
      userChoice.value = ''
    }
  }, 1000)
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
.face-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 350px;
  margin: 0 auto;
}
.face-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
}
.face-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.5rem;
}
.face-name { font-size: 1.25rem; font-weight: 600; color: #1e3a5f; }
.face-quiz { text-align: center; }
.quiz-face {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
}
.name-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 250px;
  margin: 0 auto;
}
.name-btn {
  padding: 1rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 0.75rem;
  font-size: 1.25rem;
  cursor: pointer;
}
.name-btn.correct { background: #4CAF50; color: white; border-color: #4CAF50; }
.name-btn.wrong { background: #f44336; color: white; border-color: #f44336; }
.phase-tip { text-align: center; font-size: 1.25rem; color: #666; margin: 1rem 0; }
</style>
