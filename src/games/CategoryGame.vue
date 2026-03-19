<template>
  <div class="category-game">
    <p class="category-tip">将物品放入正确类别：<span class="cat-name">{{ currentCategory }}</span></p>
    <div class="category-items">
      <div v-for="item in categoryItems" :key="item.name" class="cat-item" :class="{ correct: item.result === 'correct', wrong: item.result === 'wrong' }" @click="categorizeItem(item)">
        <span class="cat-emoji">{{ item.emoji }}</span>
        <span class="cat-label">{{ item.name }}</span>
      </div>
    </div>
    <div class="category-bins">
      <div class="cat-bin" @click="selectBin('水果')">水果</div>
      <div class="cat-bin" @click="selectBin('动物')">动物</div>
      <div class="cat-bin" @click="selectBin('颜色')">颜色</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'L4' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const categoryItems = ref([])
const currentCategory = ref('')
const selectedBin = ref('')
const categoryScore = ref(0)
const startTime = ref(Date.now())

function initGame() {
  categoryScore.value = 0
  startTime.value = Date.now()
  
  const items = [
    { name: '苹果', emoji: '🍎', category: '水果' },
    { name: '香蕉', emoji: '🍌', category: '水果' },
    { name: '狗', emoji: '🐕', category: '动物' },
    { name: '猫', emoji: '🐱', category: '动物' },
    { name: '红色', emoji: '🔴', category: '颜色' },
    { name: '蓝色', emoji: '🔵', category: '颜色' },
    { name: '葡萄', emoji: '🍇', category: '水果' },
    { name: '鸟', emoji: '🐦', category: '动物' }
  ]
  
  categoryItems.value = items.sort(() => Math.random() - 0.5).slice(0, 6).map(i => ({ ...i, result: null }))
  
  const cats = ['水果', '动物', '颜色']
  currentCategory.value = cats[Math.floor(Math.random() * cats.length)]
  selectedBin.value = ''
}

function selectBin(cat) {
  selectedBin.value = cat
}

function categorizeItem(item) {
  if (!selectedBin.value || item.result) return
  
  if (item.category === selectedBin.value) {
    item.result = 'correct'
    categoryScore.value++
    if (categoryScore.value >= 3) finishGame()
  } else {
    item.result = 'wrong'
  }
}

function finishGame() {
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  const score = categoryScore.value * 300
  trainingStore.recordResult(props.gameId, score, duration)
  emit('finish', { score, duration })
}

onMounted(() => initGame())
</script>

<style scoped>
.category-tip { text-align: center; font-size: 1.25rem; margin-bottom: 1rem; }
.cat-name { font-weight: bold; color: #1e3a5f; font-size: 1.5rem; }
.category-items { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; max-width: 320px; margin: 0 auto 1rem; }
.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 0.75rem;
  cursor: pointer;
  min-width: 70px;
}
.cat-item.correct { background: #4CAF50; }
.cat-item.wrong { background: #f44336; }
.cat-emoji { font-size: 2rem; }
.cat-label { font-size: 0.9rem; color: #333; }
.cat-item.correct .cat-label, .cat-item.wrong .cat-label { color: white; }
.category-bins { display: flex; justify-content: center; gap: 1rem; }
.cat-bin {
  padding: 1rem 1.5rem;
  background: #1e3a5f;
  color: white;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 1.1rem;
}
</style>
