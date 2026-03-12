<template>
  <div class="profile">
    <h2>👤 个人资料</h2>

    <!-- 头像区域 -->
    <div class="avatar-section">
      <div class="avatar">{{ userInitials }}</div>
      <div class="user-info">
        <h3>{{ user.name || '用户' }}</h3>
        <p>已训练 {{ stats.total }} 次</p>
      </div>
    </div>

    <!-- 资料编辑 -->
    <div class="profile-form">
      <div class="form-group">
        <label>姓名</label>
        <input type="text" v-model="form.name" placeholder="请输入姓名" />
      </div>
      
      <div class="form-group">
        <label>年龄</label>
        <input type="number" v-model="form.age" min="40" max="100" />
      </div>
      
      <div class="form-group">
        <label>性别</label>
        <select v-model="form.gender">
          <option value="">请选择</option>
          <option value="male">男</option>
          <option value="female">女</option>
        </select>
      </div>

      <button class="save-btn" @click="saveProfile">保存修改</button>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3>⚡ 快捷操作</h3>
      <div class="actions-grid">
        <button class="action-item" @click="$router.push('/settings')">
          <span class="action-icon">⚙️</span>
          <span>设置</span>
        </button>
        <button class="action-item" @click="clearData">
          <span class="action-icon">🗑️</span>
          <span>清除数据</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useTrainingStore } from '../stores/training'

const userStore = useUserStore()
const trainingStore = useTrainingStore()

const form = ref({
  name: '',
  age: 60,
  gender: ''
})

const user = computed(() => userStore.user)
const stats = computed(() => trainingStore.stats)

const userInitials = computed(() => {
  if (form.value.name) return form.value.name.charAt(0).toUpperCase()
  return '👤'
})

onMounted(() => {
  form.value = {
    name: user.value.name || '',
    age: user.value.age || 60,
    gender: user.value.gender || ''
  }
})

function saveProfile() {
  userStore.updateProfile(form.value)
  alert('保存成功！')
}

function clearData() {
  if (confirm('确定要清除所有训练数据吗？此操作不可恢复。')) {
    localStorage.removeItem('jide_history')
    localStorage.removeItem('jide_achievements')
    trainingStore.loadFromStorage()
    alert('数据已清除')
  }
}
</script>

<style scoped>
.profile {
  max-width: 600px;
  margin: 0 auto;
}

.profile h2 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  color: #1e3a5f;
}

.avatar-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.avatar {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  font-weight: bold;
}

.user-info h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.user-info p {
  margin: 0.25rem 0 0;
  color: #888;
}

.profile-form {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.save-btn {
  width: 100%;
  padding: 0.875rem;
  background: #1e3a5f;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

.quick-actions {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
}

.quick-actions h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #333;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: #333;
}

.action-icon {
  font-size: 1.5rem;
}
</style>
