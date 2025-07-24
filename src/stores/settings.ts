import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Theme, Settings } from '@/types/common'

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const settings = ref<Settings>({
    theme: 'light',
    language: 'zh-CN',
    notifications: true,
    soundEnabled: true,
    fontSize: 'medium'
  })

  // 计算属性
  const theme = computed(() => settings.value.theme)
  const isDarkMode = computed(() => settings.value.theme === 'dark')

  // 方法
  const setTheme = (newTheme: Theme) => {
    settings.value.theme = newTheme
    localStorage.setItem('theme', newTheme)
    
    // 应用主题到document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    setTheme(settings.value.theme === 'light' ? 'dark' : 'light')
  }

  const updateSettings = (newSettings: Partial<Settings>) => {
    settings.value = { ...settings.value, ...newSettings }
    localStorage.setItem('settings', JSON.stringify(settings.value))
  }

  const loadSettings = () => {
    // 从本地存储加载设置
    const savedSettings = localStorage.getItem('settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        settings.value = { ...settings.value, ...parsed }
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }

    // 应用主题
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }

  // 初始化
  loadSettings()

  return {
    settings,
    theme,
    isDarkMode,
    setTheme,
    toggleTheme,
    updateSettings,
    loadSettings
  }
}) 