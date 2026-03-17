import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 训练模块配置
export const trainingModules = {
  memory: {
    name: '记忆力训练',
    nameEn: 'Memory Training',
    icon: '🧠',
    color: '#4CAF50',
    games: [
      { id: 'M1', name: '卡片配对', nameEn: 'Card Matching', description: '找出相同的卡片', descriptionEn: 'Find matching pairs', difficulty: 1 },
      { id: 'M2', name: '数字记忆', nameEn: 'Number Memory', description: '记住数字序列', descriptionEn: 'Remember number sequence', difficulty: 1 },
      { id: 'M3', name: '图片顺序', nameEn: 'Image Sequence', description: '记住图片顺序', descriptionEn: 'Remember image order', difficulty: 2 },
      { id: 'M4', name: '人脸姓名', nameEn: 'Face Name', description: '匹配人脸和姓名', descriptionEn: 'Match face to name', difficulty: 3 },
      { id: 'M5', name: '词组记忆', nameEn: 'Word Memory', description: '记忆词语组合', descriptionEn: 'Remember word pairs', difficulty: 2 },
      { id: 'M6', name: '地点记忆', nameEn: 'Location Memory', description: '记住位置顺序', descriptionEn: 'Remember positions', difficulty: 2 },
      { id: 'M7', name: '事件排序', nameEn: 'Event Sort', description: '排列事件顺序', descriptionEn: 'Arrange events in order', difficulty: 3 },
      { id: 'M8', name: '颜色形状', nameEn: 'Color Shape', description: '记忆颜色形状关联', descriptionEn: 'Remember color-shape pairs', difficulty: 2 }
    ]
  },
  attention: {
    name: '注意力训练',
    nameEn: 'Attention Training',
    icon: '👁️',
    color: '#2196F3',
    games: [
      { id: 'A1', name: '舒尔特方格', nameEn: 'Schulte Grid', description: '按顺序点击数字', descriptionEn: 'Click numbers in order', difficulty: 1 },
      { id: 'A2', name: '找不同', nameEn: 'Find Differences', description: '找出不同的图案', descriptionEn: 'Find different patterns', difficulty: 2 },
      { id: 'A3', name: '视觉搜索', nameEn: 'Visual Search', description: '快速找到目标', descriptionEn: 'Find target quickly', difficulty: 2 },
      { id: 'A4', name: '追踪目标', nameEn: 'Track Target', description: '追踪移动目标', descriptionEn: 'Track moving target', difficulty: 3 }
    ]
  },
  logic: {
    name: '逻辑思维',
    nameEn: 'Logic Thinking',
    icon: '🧩',
    color: '#9C27B0',
    games: [
      { id: 'L1', name: '图形推理', nameEn: 'Pattern Reasoning', description: '找出规律', descriptionEn: 'Find the pattern', difficulty: 2 },
      { id: 'L2', name: '数独入门', nameEn: 'Sudoku', description: '填入正确数字', descriptionEn: 'Fill in correct numbers', difficulty: 3 },
      { id: 'L3', name: '序列找规律', nameEn: 'Sequence Pattern', description: '发现数字规律', descriptionEn: 'Find number pattern', difficulty: 2 },
      { id: 'L4', name: '分类游戏', nameEn: 'Category Game', description: '分类归组', descriptionEn: 'Group by category', difficulty: 1 }
    ]
  },
  language: {
    name: '语言能力',
    nameEn: 'Language',
    icon: '💬',
    color: '#FF9800',
    games: [
      { id: 'V1', name: '词语接龙', nameEn: 'Word Chain', description: '接续词语', descriptionEn: 'Continue the word', difficulty: 2 },
      { id: 'V2', name: '造句练习', nameEn: 'Sentence Building', description: '完整表达', descriptionEn: 'Complete expression', difficulty: 2 },
      { id: 'V3', name: '看图说话', nameEn: 'Describe Image', description: '描述图片内容', descriptionEn: 'Describe the image', difficulty: 3 }
    ]
  },
  executive: {
    name: '执行功能',
    nameEn: 'Executive Function',
    icon: '🎯',
    color: '#E91E63',
    games: [
      { id: 'E1', name: '双重任务', nameEn: 'Dual Task', description: '同时做两件事', descriptionEn: 'Do two things at once', difficulty: 3 },
      { id: 'E2', name: '停止-开始', nameEn: 'Stop-Go', description: '根据指令行动', descriptionEn: 'Act on command', difficulty: 2 },
      { id: 'E3', name: '计划安排', nameEn: 'Planning', description: '规划任务步骤', descriptionEn: 'Plan task steps', difficulty: 3 }
    ]
  },
  emotion: {
    name: '情绪感知',
    nameEn: 'Emotion Perception',
    icon: '❤️',
    color: '#F44336',
    games: [
      { id: 'P1', name: '音乐感知', nameEn: 'Music Emotion', description: '识别音乐情绪', descriptionEn: 'Identify music emotion', difficulty: 2 },
      { id: 'P2', name: '颜色情绪', nameEn: 'Color Emotion', description: '匹配颜色和情绪', descriptionEn: 'Match color to emotion', difficulty: 1 }
    ]
  }
}

// 丰富的内容库
export const contentLibrary = {
  // 词组记忆 M5
  wordPairs: [
    ['太阳', '月亮'], ['天空', '大地'], ['春天', '冬天'], ['快乐', '悲伤'],
    ['爸爸', '妈妈'], ['爷爷', '奶奶'], ['老师', '学生'], ['医生', '护士'],
    ['汽车', '飞机'], ['火车', '轮船'], ['书本', '铅笔'], ['手机', '电脑'],
    ['苹果', '香蕉'], ['牛奶', '面包'], ['米饭', '面条'], ['咖啡', '茶水'],
    ['红色', '蓝色'], ['绿色', '黄色'], ['黑色', '白色'], ['美丽', '丑陋']
  ],
  
  // 事件排序 M7
  eventSequences: [
    ['出生', '上学', '工作', '结婚', '养老'],
    ['起床', '刷牙', '吃早餐', '上班', '下班'],
    ['开学', '期中考试', '期末考试', '放假', '过年'],
    ['春种', '夏长', '秋收', '冬藏', '立春'],
    ['出生', '成长', '衰老', '生病', '死亡']
  ],
  
  // 造句练习 V2
  sentencePrompts: [
    { words: ['我', '喜欢', '学习'], hint: '表达你的爱好' },
    { words: ['今天', '天气', '很好'], hint: '描述天气' },
    { words: ['妈妈', '做', '饭'], hint: '描述家人活动' },
    { words: ['爸爸', '去', '上班'], hint: '描述爸爸的行动' },
    { words: ['我们', '是', '学生'], hint: '描述身份' },
    { words: ['小狗', '很', '可爱'], hint: '描述动物' },
    { words: ['明天', '会', '下雨'], hint: '预测天气' },
    { words: ['学习', '让', '进步'], hint: '表达观点' }
  ],
  
  // 分类游戏 L4
  categoryItems: {
    '水果': ['苹果', '香蕉', '葡萄', '橘子', '西瓜', '草莓'],
    '动物': ['狗', '猫', '鸟', '鱼', '兔子', '乌龟'],
    '颜色': ['红色', '蓝色', '绿色', '黄色', '紫色', '橙色'],
    '职业': ['医生', '老师', '警察', '厨师', '司机', '农民'],
    '交通工具': ['汽车', '飞机', '火车', '轮船', '自行车', '地铁'],
    '家电': ['电视', '空调', '冰箱', '洗衣机', '电脑', '手机']
  },
  
  // 序列找规律 L3
  sequences: [
    { nums: [2, 4, 6, 8], answer: 10, rule: '等差数列（+2）' },
    { nums: [3, 6, 9, 12], answer: 15, rule: '等差数列（+3）' },
    { nums: [1, 2, 4, 8], answer: 16, rule: '等比数列（×2）' },
    { nums: [1, 1, 2, 3, 5], answer: 8, rule: '斐波那契数列' },
    { nums: [10, 8, 6, 4], answer: 2, rule: '等差数列（-2）' },
    { nums: [2, 5, 8, 11], answer: 14, rule: '等差数列（+3）' }
  ],
  
  // 图形推理 L1
  patterns: [
    { rows: [['■', '●', '■'], ['●', '■', '●'], ['■', '●', '■']], options: ['■', '●', '▲'], answer: '■' },
    { rows: [['▲', '▲', '◆'], ['◆', '▲', '◆'], ['▲', '◆', '▲']], options: ['◆', '▲', '■'], answer: '◆' },
    { rows: [['★', '☆', '★'], ['☆', '★', '☆'], ['★', '☆', '★']], options: ['☆', '★', '●'], answer: '★' }
  ]
}

// 难度配置
export const difficultySettings = {
  easy: { name: '简单', nameEn: 'Easy', multiplier: 0.8, timeLimit: null },
  normal: { name: '中等', nameEn: 'Normal', multiplier: 1, timeLimit: null },
  hard: { name: '困难', nameEn: 'Hard', multiplier: 1.2, timeLimit: 60 }
}

export const useTrainingStore = defineStore('training', () => {
  const history = ref([])
  const currentSession = ref(null)
  const achievements = ref([])
  const language = ref('zh')
  const difficulty = ref('normal')
  const soundEnabled = ref(true)
  const highScores = ref({})
  
  // 从localStorage加载
  function loadFromStorage() {
    const savedHistory = localStorage.getItem('jide_history')
    const savedAchievements = localStorage.getItem('jide_achievements')
    const savedLanguage = localStorage.getItem('jide_language')
    const savedDifficulty = localStorage.getItem('jide_difficulty')
    const savedSound = localStorage.getItem('jide_sound')
    const savedHighScores = localStorage.getItem('jide_highscores')
    
    if (savedHistory) history.value = JSON.parse(savedHistory)
    if (savedAchievements) achievements.value = JSON.parse(savedAchievements)
    if (savedLanguage) language.value = savedLanguage
    if (savedDifficulty) difficulty.value = savedDifficulty
    if (savedSound !== null) soundEnabled.value = savedSound === 'true'
    if (savedHighScores) highScores.value = JSON.parse(savedHighScores)
  }
  
  // 保存到localStorage
  function saveToStorage() {
    localStorage.setItem('jide_history', JSON.stringify(history.value))
    localStorage.setItem('jide_achievements', JSON.stringify(achievements.value))
    localStorage.setItem('jide_language', language.value)
    localStorage.setItem('jide_difficulty', difficulty.value)
    localStorage.setItem('jide_sound', String(soundEnabled.value))
    localStorage.setItem('jide_highscores', JSON.stringify(highScores.value))
  }
  
  // 切换语言
  function toggleLanguage() {
    language.value = language.value === 'zh' ? 'en' : 'zh'
    saveToStorage()
  }
  
  // 切换难度
  function setDifficulty(level) {
    if (difficultySettings[level]) {
      difficulty.value = level
      saveToStorage()
    }
  }
  
  // 切换音效
  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
    saveToStorage()
  }
  
  // 记录训练结果
  function recordResult(gameId, score, duration, details = {}) {
    const record = {
      id: Date.now(),
      gameId,
      score,
      duration,
      difficulty: difficulty.value,
      details,
      timestamp: new Date().toISOString()
    }
    history.value.unshift(record)
    
    // 更新最高分
    if (!highScores.value[gameId] || score > highScores.value[gameId].score) {
      highScores.value[gameId] = { score, duration, date: new Date().toISOString() }
    }
    
    saveToStorage()
    checkAchievements(record)
    playSound('success')
    return record
  }
  
  // 播放音效
  function playSound(type) {
    if (!soundEnabled.value) return
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    if (type === 'success') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
    } else if (type === 'error') {
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1)
    } else if (type === 'click') {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    }
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }
  
  // 检查成就
  function checkAchievements(record) {
    const gameHistory = history.value.filter(h => h.gameId === record.gameId)
    const allGames = Object.values(trainingModules).flatMap(m => m.games)
    const uniqueGamesPlayed = new Set(history.value.map(h => h.gameId)).size
    
    // 首次完成
    if (gameHistory.length === 1) {
      const hasAchievement = achievements.value.find(a => a.id === `first_${record.gameId}`)
      if (!hasAchievement) {
        const game = allGames.find(g => g.id === record.gameId)
        achievements.value.push({ 
          id: `first_${record.gameId}`, 
          name: language.value === 'zh' ? `首次完成${game?.name || ''}` : `First ${game?.nameEn || ''}`, 
          desc: language.value === 'zh' ? '完成第一次训练' : 'Complete first training',
          date: new Date().toISOString() 
        })
      }
    }
    
    // 连续训练天数
    const days = new Set(history.value.map(h => h.timestamp.split('T')[0])).size
    if (days >= 7 && !achievements.value.find(a => a.id === 'week_streak')) {
      achievements.value.push({ 
        id: 'week_streak', 
        name: language.value === 'zh' ? '坚持不懈' : 'Perseverance', 
        desc: language.value === 'zh' ? '连续训练7天' : 'Train 7 days in a row',
        date: new Date().toISOString() 
      })
    }
    
    // 完成所有游戏
    if (uniqueGamesPlayed >= allGames.length && !achievements.value.find(a => a.id === 'all_games')) {
      achievements.value.push({ 
        id: 'all_games', 
        name: language.value === 'zh' ? '全能玩家' : 'All-Rounder', 
        desc: language.value === 'zh' ? '完成所有训练' : 'Complete all games',
        date: new Date().toISOString() 
      })
    }
    
    // 高分成就
    if (record.score >= 100 && !achievements.value.find(a => a.id === `highscore_${record.gameId}`)) {
      achievements.value.push({ 
        id: `highscore_${record.gameId}`, 
        name: language.value === 'zh' ? '高分达人' : 'High Scorer', 
        desc: language.value === 'zh' ? '单次得分超过100' : 'Score over 100 points',
        date: new Date().toISOString() 
      })
    }
    
    saveToStorage()
  }
  
  // 获取统计数据
  const stats = computed(() => {
    const total = history.value.length
    const totalScore = history.value.reduce((sum, h) => sum + (h.score || 0), 0)
    const avgScore = total > 0 ? Math.round(totalScore / total) : 0
    const totalTime = history.value.reduce((sum, h) => sum + (h.duration || 0), 0)
    const allGames = Object.values(trainingModules).flatMap(m => m.games)
    const uniqueGames = new Set(history.value.map(h => h.gameId)).size
    
    return {
      total,
      totalScore,
      avgScore,
      totalTime,
      totalGames: allGames.length,
      completedGames: uniqueGames,
      achievements: achievements.value.length
    }
  })
  
  // 获取游戏历史
  function getGameHistory(gameId) {
    return history.value.filter(h => h.gameId === gameId)
  }
  
  // 清除数据
  function clearData() {
    history.value = []
    achievements.value = []
    highScores.value = {}
    saveToStorage()
  }
  
  // 加载数据
  loadFromStorage()
  
  return {
    history,
    currentSession,
    achievements,
    language,
    difficulty,
    soundEnabled,
    highScores,
    stats,
    trainingModules,
    contentLibrary,
    difficultySettings,
    recordResult,
    toggleLanguage,
    setDifficulty,
    toggleSound,
    playSound,
    loadFromStorage,
    getGameHistory,
    clearData
  }
})
