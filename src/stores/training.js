import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 训练模块配置
export const trainingModules = {
  memory: {
    name: '记忆力训练',
    icon: '🧠',
    color: '#4CAF50',
    games: [
      { id: 'M1', name: '卡片配对', description: '找出相同的卡片', difficulty: 1 },
      { id: 'M2', name: '数字记忆', description: '记住数字序列', difficulty: 1 },
      { id: 'M3', name: '图片顺序', description: '记住图片顺序', difficulty: 2 },
      { id: 'M4', name: '人脸姓名', description: '匹配人脸和姓名', difficulty: 3 },
      { id: 'M5', name: '词组记忆', description: '记忆词语组合', difficulty: 2 },
      { id: 'M6', name: '地点记忆', description: '记住位置顺序', difficulty: 2 },
      { id: 'M7', name: '事件排序', description: '排列事件顺序', difficulty: 3 },
      { id: 'M8', name: '颜色形状', description: '记忆颜色形状关联', difficulty: 2 }
    ]
  },
  attention: {
    name: '注意力训练',
    icon: '👁️',
    color: '#2196F3',
    games: [
      { id: 'A1', name: '舒尔特方格', description: '按顺序点击数字', difficulty: 1 },
      { id: 'A2', name: '找不同', description: '找出不同的图案', difficulty: 2 },
      { id: 'A3', name: '视觉搜索', description: '快速找到目标', difficulty: 2 },
      { id: 'A4', name: '追踪目标', description: '追踪移动目标', difficulty: 3 }
    ]
  },
  logic: {
    name: '逻辑思维',
    icon: '🧩',
    color: '#9C27B0',
    games: [
      { id: 'L1', name: '图形推理', description: '找出规律', difficulty: 2 },
      { id: 'L2', name: '数独入门', description: '填入正确数字', difficulty: 3 },
      { id: 'L3', name: '序列找规律', description: '发现数字规律', difficulty: 2 },
      { id: 'L4', name: '分类游戏', description: '分类归组', difficulty: 1 }
    ]
  },
  language: {
    name: '语言能力',
    icon: '💬',
    color: '#FF9800',
    games: [
      { id: 'V1', name: '词语接龙', description: '接续词语', difficulty: 2 },
      { id: 'V2', name: '造句练习', description: '完整表达', difficulty: 2 },
      { id: 'V3', name: '看图说话', description: '描述图片内容', difficulty: 3 }
    ]
  },
  executive: {
    name: '执行功能',
    icon: '🎯',
    color: '#E91E63',
    games: [
      { id: 'E1', name: '双重任务', description: '同时做两件事', difficulty: 3 },
      { id: 'E2', name: '停止-开始', description: '根据指令行动', difficulty: 2 },
      { id: 'E3', name: '计划安排', description: '规划任务步骤', difficulty: 3 }
    ]
  },
  emotion: {
    name: '情绪感知',
    icon: '❤️',
    color: '#F44336',
    games: [
      { id: 'P1', name: '音乐感知', description: '识别音乐情绪', difficulty: 2 },
      { id: 'P2', name: '颜色情绪', description: '匹配颜色和情绪', difficulty: 1 }
    ]
  }
}

export const useTrainingStore = defineStore('training', () => {
  const history = ref([])
  const currentSession = ref(null)
  const achievements = ref([])

  // 从localStorage加载
  function loadFromStorage() {
    const savedHistory = localStorage.getItem('jide_history')
    const savedAchievements = localStorage.getItem('jide_achievements')
    if (savedHistory) history.value = JSON.parse(savedHistory)
    if (savedAchievements) achievements.value = JSON.parse(savedAchievements)
  }

  // 保存到localStorage
  function saveToStorage() {
    localStorage.setItem('jide_history', JSON.stringify(history.value))
    localStorage.setItem('jide_achievements', JSON.stringify(achievements.value))
  }

  // 记录训练结果
  function recordResult(gameId, score, duration, details = {}) {
    const record = {
      id: Date.now(),
      gameId,
      score,
      duration,
      details,
      timestamp: new Date().toISOString()
    }
    history.value.unshift(record)
    saveToStorage()
    checkAchievements(record)
    return record
  }

  // 检查成就
  function checkAchievements(record) {
    // 简单的成就检查逻辑
    const gameHistory = history.value.filter(h => h.gameId === record.gameId)
    
    // 首次完成
    if (gameHistory.length === 1) {
      achievements.value.push({ id: 'first_play', name: '初次体验', desc: '完成第一次训练', date: new Date().toISOString() })
    }
    
    // 连续训练
    const days = new Set(history.value.map(h => h.timestamp.split('T')[0])).size
    if (days >= 7 && !achievements.value.find(a => a.id === 'week_streak')) {
      achievements.value.push({ id: 'week_streak', name: '坚持不懈', desc: '连续训练7天', date: new Date().toISOString() })
    }
    
    saveToStorage()
  }

  // 获取统计数据
  const stats = computed(() => {
    const total = history.value.length
    const totalScore = history.value.reduce((sum, h) => sum + (h.score || 0), 0)
    const avgScore = total > 0 ? Math.round(totalScore / total) : 0
    const totalTime = history.value.reduce((sum, h) => sum + (h.duration || 0), 0)
    
    return {
      total,
      totalScore,
      avgScore,
      totalTime,
      achievements: achievements.value.length
    }
  })

  // 加载数据
  loadFromStorage()

  return {
    history,
    currentSession,
    achievements,
    stats,
    trainingModules,
    recordResult,
    loadFromStorage
  }
})
