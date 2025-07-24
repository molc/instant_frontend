<template>
  <div
    :class="[
      'online-status relative w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
      isOnline ? 'bg-green-500' : 'bg-gray-400',
      'transition-all duration-300 ease-in-out'
    ]"
    :title="statusText"
  >
    <!-- 在线状态的脉冲动画 -->
    <div
      v-if="isOnline"
      class="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"
    />
    <!-- 离线状态的静态指示器 -->
    <div
      v-if="!isOnline"
      class="absolute inset-0.5 rounded-full bg-gray-300 dark:bg-gray-600"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  userId: number;
  onlineUsers: number[];
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  userId: 0,
  onlineUsers: () => [],
  showText: false,
  size: 'md'
});

// 计算用户是否在线
const isOnline = computed(() => {
  return props.onlineUsers.includes(props.userId);
});

// 状态文本
const statusText = computed(() => {
  return isOnline.value ? '在线' : '离线';
});

// 根据尺寸调整样式
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-2 h-2';
    case 'lg':
      return 'w-4 h-4';
    default:
      return 'w-3 h-3';
  }
});
</script>

<style scoped>
.online-status {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.online-status:hover {
  transform: scale(1.1);
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style> 