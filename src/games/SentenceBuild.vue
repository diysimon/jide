<template>
  <div class="sentence-game">
    <p class="sentence-prompt">用下面的词语造句：</p>
    <div class="sentence-words">
      <span v-for="word in sentenceWords" :key="word" class="sentence-word">{{ word }}</span>
    </div>
    <textarea v-model="userSentence" placeholder="请输入完整的句子..." class="sentence-input"></textarea>
    <button class="submit-btn" @click="checkSentence">确认</button>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'V2' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const sentenceWords = ref([])
const userSentence = ref('')
const startTime = ref(Date.now())

function initGame() {
  startTime.value = Date.now()
  const sets = [
    ['今天', '天气', '很好'],
    ['我', '喜欢', '学习'],
    ['妈妈', '做', '饭']
  ]
  sentenceWords.value = sets[Math.floor(Math.random() * sets.length)]
  userSentence.value = ''
}

function checkSentence() {
  const text = userSentence.value
  const hasAll = sentenceWords.value.every(w => text.includes(w))
  if (hasAll && text.length > 8) {
    finishGame()
  } else {
    alert('请用所有词语造一个完整的句子')
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
.sentence-prompt { text-align: center; font-size: 1.25rem; margin-bottom: 1rem; }
.sentence-words { display: flex; justify-content: center; gap: 0.75rem; margin-bottom: 1rem; }
.sentence-word { padding: 0.75rem 1rem; background: #fff3cd; border-radius: 0.5rem; font-size: 1.25rem; }
.sentence-input { width: 100%; max-width: 400px; margin: 0 auto 1rem; display: block; padding: 0.75rem; border: 2px solid #ddd; border-radius: 0.5rem; font-size: 1.1rem; min-height: 80px; }
.submit-btn { padding: 1rem 2rem; background: #1e3a5f; color: white; border: none; border-radius: 0.5rem; font-size: 1.1rem; cursor: pointer; display: block; margin: 0 auto; }
</style>
