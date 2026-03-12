<template>
  <div class="settings">
    <h2>⚙️ 设置</h2>

    <!-- 声音设置 -->
    <div class="settings-section">
      <h3>🔊 声音设置</h3>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">语音播报</span>
          <span class="setting-desc">游戏过程中语音提示</span>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="settings.voiceEnabled" />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">音效</span>
          <span class="setting-desc">游戏操作音效</span>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="settings.soundEnabled" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- 显示设置 -->
    <div class="settings-section">
      <h3>👁️ 显示设置</h3>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">大字体模式</span>
          <span class="setting-desc">更大的文字便于阅读</span>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="settings.largeFont" />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">高对比度</span>
          <span class="setting-desc">增强视觉对比度</span>
        </div>
        <label class="toggle">
          <input type="checkbox" v-model="settings.highContrast" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- 训练设置 -->
    <div class="settings-section">
      <h3>🎯 训练设置</h3>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-label">每日目标</span>
          <span class="setting-desc">每天训练次数</span>
        </div>
        <select v-model="settings.dailyTarget" class="setting-select">
          <option :value="1">1次</option>
          <option :value="2">2次</option>
          <option :value="3">3次</option>
          <option :value="5">5次</option>
          <option :value="10">10次</option>
        </select>
      </div>
    </div>

    <!-- 关于 -->
    <div class="settings-section">
      <h3>ℹ️ 关于</h3>
      <div class="about-info">
        <p><strong>Jide</strong> - 阿尔兹海默症大脑训练系统</p>
        <p>版本: 1.0.0</p>
        <p class="copyright">用科技守护记忆，让爱不被遗忘 ❤️</p>
      </div>
    </div>

    <button class="save-btn" @click="saveSettings">保存设置</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const settings = ref({
  voiceEnabled: true,
  soundEnabled: true,
  largeFont: false,
  highContrast: false,
  dailyTarget: 3
})

// 从localStorage加载设置
const saved = localStorage.getItem('jide_settings')
if (saved) {
  settings.value = { ...settings.value, ...JSON.parse(saved) }
}

function saveSettings() {
  localStorage.setItem('jide_settings', JSON.stringify(settings.value))
  
  // 应用大字体
  if (settings.value.largeFont) {
    document.body.classList.add('large-font')
  } else {
    document.body.classList.remove('large-font')
  }
  
  // 应用高对比度
  if (settings.value.highContrast) {
    document.body.classList.add('high-contrast')
  } else {
    document.body.classList.remove('high-contrast')
  }
  
  alert('设置已保存！')
}
</script>

<style scoped>
.settings {
  max-width: 600px;
  margin: 0 auto;
}

.settings h2 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  color: #1e3a5f;
}

.settings-section {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.settings-section h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #333;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
}

.setting-label {
  font-size: 1rem;
  color: #333;
}

.setting-desc {
  font-size: 0.85rem;
  color: #888;
}

/* 开关样式 */
.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: #4CAF50;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

.setting-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
}

.about-info {
  color: #666;
  line-height: 1.8;
}

.about-info .copyright {
  margin-top: 1rem;
  color: #888;
  font-size: 0.9rem;
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
}
</style>
