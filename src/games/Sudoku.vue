<template>
  <div class="sudoku-game">
    <div class="sudoku-grid">
      <div v-for="(row, ridx) in sudokuBoard" :key="ridx" class="sudoku-row">
        <div v-for="(cell, cidx) in row" :key="cidx" class="sudoku-cell" :class="{ fixed: cell.fixed, selected: selectedCell?.r === ridx && selectedCell?.c === cidx }" @click="selectSudokuCell(ridx, cidx)">
          <span v-if="cell.value">{{ cell.value }}</span>
          <span v-else class="sudoku-empty" @click.stop="inputSudoku(num)" v-for="num in 4" :key="num">{{ num }}</span>
        </div>
      </div>
    </div>
    <p class="phase-tip">在4x4网格中填入1-4，每行每列不重复</p>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import { useTrainingStore } from '../stores/training'

const props = defineProps({ gameId: { type: String, default: 'L2' } })
const emit = defineEmits(['finish'])

const trainingStore = useTrainingStore()
const sudokuBoard = ref([])
const selectedCell = ref(null)
const startTime = ref(Date.now())

function initGame() {
  selectedCell.value = null
  startTime.value = Date.now()
  const solution = [[1,2,3,4], [3,4,1,2], [2,1,4,3], [4,3,2,1]]
  
  const board = []
  for (let r = 0; r < 4; r++) {
    const row = []
    for (let c = 0; c < 4; c++) {
      const fixed = Math.random() > 0.4
      row.push({ value: fixed ? solution[r][c] : null, fixed })
    }
    board.push(row)
  }
  sudokuBoard.value = board
}

function selectSudokuCell(r, c) {
  if (sudokuBoard.value[r][c].fixed) return
  selectedCell.value = { r, c }
}

function inputSudoku(num) {
  if (!selectedCell.value) return
  const { r, c } = selectedCell.value
  sudokuBoard.value[r][c].value = num
  
  let complete = true
  for (let row of sudokuBoard.value) {
    for (let cell of row) {
      if (!cell.value) { complete = false; break }
    }
  }
  if (complete) {
    const values = sudokuBoard.value.flat().map(c => c.value)
    const unique = new Set(values)
    if (unique.size === 16) finishGame()
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
.sudoku-grid { display: flex; flex-direction: column; gap: 4px; max-width: 280px; margin: 0 auto; }
.sudoku-row { display: flex; gap: 4px; }
.sudoku-cell {
  width: 60px;
  height: 60px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
}
.sudoku-cell.fixed { background: #e8e8e8; color: #333; }
.sudoku-cell.selected { border-color: #1e3a5f; border-width: 3px; }
.sudoku-empty { font-size: 0.75rem; color: #ccc; cursor: pointer; padding: 2px; }
.phase-tip { text-align: center; font-size: 1.25rem; color: #666; margin: 1rem 0; }
</style>
