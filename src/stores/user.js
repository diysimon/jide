import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    id: null,
    name: '',
    age: 60,
    gender: '',
    avatar: '',
    createdAt: null
  })

  const isLoggedIn = computed(() => !!user.value.id)

  function setUser(userData) {
    user.value = { ...user.value, ...userData }
    saveToStorage()
  }

  function updateProfile(data) {
    user.value = { ...user.value, ...data }
    saveToStorage()
  }

  function saveToStorage() {
    localStorage.setItem('jide_user', JSON.stringify(user.value))
  }

  function loadFromStorage() {
    const saved = localStorage.getItem('jide_user')
    if (saved) {
      user.value = JSON.parse(saved)
    } else {
      // 创建新用户
      user.value.id = Date.now().toString()
      user.value.createdAt = new Date().toISOString()
      saveToStorage()
    }
  }

  // 初始化时加载
  loadFromStorage()

  return {
    user,
    isLoggedIn,
    setUser,
    updateProfile,
    loadFromStorage
  }
})
