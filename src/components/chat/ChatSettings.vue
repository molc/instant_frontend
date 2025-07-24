<template>
  <!-- 设置按钮 -->
  <button
    @click.stop="showSettingsModal = !showSettingsModal"
    class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    title="设置"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </button>
  
  <!-- 设置面板：使用 Teleport 渲染到 body，避免被父级 overflow 隐藏 -->
  <Teleport to="body">
    <div
      v-if="showSettingsModal"
      v-click-outside="closeSettings"
      class="fixed top-16 right-4 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
    >
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">聊天设置</h3>
        </div>
        
        <div class="p-4 space-y-4">
          <!-- 主题设置 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              主题模式
            </label>
            <div class="flex space-x-2">
              <button
                @click="setTheme('light')"
                :class="[
                  'flex-1 p-2 rounded-lg border text-sm transition-colors',
                  theme === 'light' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                ]"
              >
                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span class="ml-2">浅色</span>
              </button>
              <button
                @click="setTheme('dark')"
                :class="[
                  'flex-1 p-2 rounded-lg border text-sm transition-colors',
                  theme === 'dark' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                ]"
              >
                <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span class="ml-2">深色</span>
              </button>
            </div>
          </div>
          
          <!-- 通知设置 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              通知设置
            </label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="settings.soundEnabled"
                  type="checkbox"
                  class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">消息提示音</span>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.desktopNotifications"
                  type="checkbox"
                  class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">桌面通知</span>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.autoMarkRead"
                  type="checkbox"
                  class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">自动标记已读</span>
              </label>
            </div>
          </div>
          
          <!-- 聊天设置 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              聊天功能
            </label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="settings.showOnlineStatus"
                  type="checkbox"
                  class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">显示在线状态</span>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.showTypingIndicator"
                  type="checkbox"
                  class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">显示正在输入</span>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.showReadReceipts"
                  type="checkbox"
                  class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">显示已读回执</span>
              </label>
            </div>
          </div>
          
          <!-- 字体大小 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              字体大小
            </label>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">小</span>
              <input
                v-model="settings.fontSize"
                type="range"
                min="12"
                max="18"
                step="1"
                class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span class="text-sm text-gray-600 dark:text-gray-400">大</span>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              当前大小: {{ settings.fontSize }}px
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
          <button
            @click="resetSettings"
            class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            重置
          </button>
          <button
            @click="saveSettings"
            class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
    </div>
  </Teleport>
  
  <!-- 通知弹窗 -->
  <div
    v-if="showNotification"
    class="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 transition-all duration-300"
    :class="showNotification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
  >
    <div class="flex items-center space-x-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>{{ notificationMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { clickOutside } from '@/directives/clickOutside';

// 注册指令
const vClickOutside = clickOutside;

interface ChatSettings {
  soundEnabled: boolean;
  desktopNotifications: boolean;
  autoMarkRead: boolean;
  showOnlineStatus: boolean;
  showTypingIndicator: boolean;
  showReadReceipts: boolean;
  fontSize: number;
}

const showSettingsModal = ref(false);
const showNotification = ref(false);
const notificationMessage = ref('');
const theme = ref('light');

const settings = reactive<ChatSettings>({
  soundEnabled: true,
  desktopNotifications: true,
  autoMarkRead: true,
  showOnlineStatus: true,
  showTypingIndicator: true,
  showReadReceipts: true,
  fontSize: 14
});

// 加载设置
const loadSettings = () => {
  const savedSettings = localStorage.getItem('chatSettings');
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings);
    Object.assign(settings, parsed);
  }
  
  const savedTheme = localStorage.getItem('theme') || 'light';
  theme.value = savedTheme;
  applyTheme(savedTheme);
};

// 保存设置
const saveSettings = () => {
  localStorage.setItem('chatSettings', JSON.stringify(settings));
  showNotification.value = true;
  notificationMessage.value = '设置已保存';
  
  setTimeout(() => {
    showNotification.value = false;
  }, 2000);
  
  showSettingsModal.value = false;
};

// 重置设置
const resetSettings = () => {
  Object.assign(settings, {
    soundEnabled: true,
    desktopNotifications: true,
    autoMarkRead: true,
    showOnlineStatus: true,
    showTypingIndicator: true,
    showReadReceipts: true,
    fontSize: 14
  });
  
  showNotification.value = true;
  notificationMessage.value = '设置已重置';
  
  setTimeout(() => {
    showNotification.value = false;
  }, 2000);
};

// 主题切换
const setTheme = (newTheme: 'light' | 'dark') => {
  theme.value = newTheme;
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
};

const applyTheme = (newTheme: string) => {
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// 关闭设置面板
const closeSettings = () => {
  showSettingsModal.value = false;
};

// 监听字体大小变化
watch(() => settings.fontSize, (newSize) => {
  document.documentElement.style.setProperty('--chat-font-size', `${newSize}px`);
});

// 初始化
loadSettings();
</script>

<style scoped>
.chat-settings {
  position: relative;
}

/* 自定义滑块样式 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

/* 通知动画 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-enter-active {
  animation: slideIn 0.3s ease-out;
}

.notification-leave-active {
  animation: slideIn 0.3s ease-out reverse;
}
</style> 