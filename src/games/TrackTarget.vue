<template>
  <div class="track-target">
    <p class="track-instruct">追踪<span class="track-color" :style="{ background: trackColor }"></span>颜色的球</p>
    <div class="track-arena" ref="trackArena">
      <div v-for="ball in balls" :key="ball.id" class="track-ball" :style="{ left: ball.x + '%', top: ball.y + '%', background: ball.color, transform: 'scale(' + (ball.tracked ? 1.3 : 1) + ')' }" @click="clickBall(ball.id)">
        <span v-if="ball.tracked" class="track-mark">✓</span>
      </div>
    </div>
    <p class="phase-tip">已追踪：{{ trackedCount }} / {{ totalBalls }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'A4' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const balls = ref([])
const trackedCount = ref(0)
const totalBalls = ref(3)
const trackColor = ref('#ff6b6b')
const trackArena = ref(null)
const moveInterval = ref(null)
const startTime = ref(Date.now())

function initGame() {
  trackedCount.value = 0
  startTime.value = Date.now()
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7']
  trackColor.value = colors[Math.floor(Math.random() * colors.length)]
  totalBalls.value = 3 + Math.floor(Math.random() * 3)
  
  const ballList = []
  for (let i = 0; i < 5; i++) {
    ballList.push({
      id: i,
      x: 10 + Math.random() * 70,
      y: 10 + Math.random() * 70,
      color: colors[i],
      tracked: false,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    })
  }
  balls.value = ballList
  
  moveInterval.value = setInterval(() => {
    balls.value.forEach(ball => {
      ball.x += ball.vx
      ball.y += ball.vy
      if (ball.x < 5 || ball.x > 90) ball.vx *= -1
      if (ball.y < 5 || ball.y > 90) ball.vy *= -1
    })
  }, 50)
}

function clickBall(id) {
  const ball = balls.value.find(b => b.id === id)
  if (!ball || ball.tracked) return
  
  if (ball.color === trackColor.value) {
    ball.tracked = true
    trackedCount.value++
    if (trackedCount.value >= totalBalls.value) {
      clearInterval(moveInterval.value)
      finishGame()
    }
  }
}

function finishGame() {
  if (moveInterval.value) clearInterval(moveInterval.value)
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  const score = Math.max(1000 - duration * 5, 100)
  trainingStore.recordResult(props.gameId, score, duration)
  emit('finish', { score, duration })
}

onUnmounted(() => {
  if (moveInterval.value) clearInterval(moveInterval.value)
})

onMounted(() => initGame())
</script>

<style scoped>
.track-instruct { text-align: center; font-size: 1.5rem; margin-bottom: 1rem; }
.track-color {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  vertical-align: middle;
}
.track-arena {
  position: relative;
  width: 320px;
  height: 320px;
  background: white;
  border-radius: 1rem;
  margin: 0 auto;
}
.track-ball {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  transition: transform 0.2s;
}
.track-mark { font-weight: bold; }
.phase-tip { text-align: center; font-size: 1.25rem; color: #666; margin: 1rem 0; }
</style>
