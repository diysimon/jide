<template>
  <div class="word-chain">
    <p class="word-chain-topic">话题：<span class="topic-word">{{ chainTopic }}</span></p>
    <div class="chain-display">
      <div v-for="(word, idx) in chainWords" :key="idx" class="chain-word">{{ word }}</div>
    </div>
    <p class="phase-tip">请接一个以「{{ lastChar}}」开头的词语</p>
    <div class="chain-input">
      <input v-model="chainInput" :placeholder="'以' + lastChar + '开头'" @keyup.enter="submitChain" />
      <button @click="submitChain">确定</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'V1' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const chainWords = ref([])
const chainInput = ref('')
const chainTopic = ref('')
const lastChar = ref('')
const startTime = ref(Date.now())

function initGame() {
  startTime.value = Date.now()
  const topics = ['动物', '水果', '颜色', '国家', '城市']
  chainTopic.value = topics[Math.floor(Math.random() * topics.length)]
  const words = { '动物': ['狗', '猫', '兔子'], '水果': ['苹果', '香蕉', '橘子'], '颜色': ['红色', '蓝色', '绿色'], '国家': ['中国', '美国', '日本'], '城市': ['北京', '上海', '广州'] }
  chainWords.value = words[chainTopic.value].slice(0, 2)
  lastChar.value = chainWords.value[chainWords.value.length - 1].slice(-1)
}

function submitChain() {
  if (!chainInput.value) return
  if (chainInput.value[0] === lastChar.value) {
    chainWords.value.push(chainInput.value)
    if (chainWords.value.length >= 5) {
      finishGame()
    } else {
      lastChar.value = chainInput.value.slice(-1)
      chainInput.value = ''
    }
  } else {
    alert('请接一个以「' + lastChar.value + '」开头的词语')
    chainInput.value = ''
  }
}

function finishGame() {
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  const score = chainWords.value.length * 200
  trainingStore.recordResult(props.gameId, score, duration)
  emit('finish', { score, duration })
}

onMounted(() => initGame())
</script>

<style scoped>
.word-chain-topic { text-align: center; font-size: 1.25rem; margin-bottom: 1rem; }
.topic-word { font-weight: bold; color: #1e3a5f; font-size: 1.5rem; }
.chain-display { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
.chain-word { padding: 0.5rem 1rem; background: #1e3a5f; color: white; border-radius: 0.5rem; font-size: 1.25rem; }
.chain-input { display: flex; gap: 0.5rem; justify-content: center; max-width: 300px; margin: 0 auto; }
.chain-input input { flex: 1; padding: 0.75rem; border: 2px solid #ddd; border-radius: 0.5rem; font-size: 1.1rem; }
.chain-input button { padding: 0.75rem 1.5rem; background: #1e3a5f; color: white; border: none; border-radius: 0.5rem; cursor: pointer; }
.phase-tip { text-align: center; font-size: 1.25rem; color: #666; margin: 1rem 0; }
</style>
