<template>
  <div class="user-online-status flex items-center space-x-2">
    <!-- 在线状态指示器 -->
    <OnlineStatus
      :user-id="userId"
      :online-users="onlineUsers"
      :size="size"
    />
    
    <!-- 状态文本 -->
    <div v-if="showText" class="flex flex-col">
      <span :class="textClasses">
        {{ statusText }}
      </span>
      <span v-if="lastSeenText && !isOnline" class="text-xs text-gray-400">
        {{ lastSeenText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import OnlineStatus from './OnlineStatus.vue';

interface Props {
  userId: number;
  onlineUsers: number[];
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  lastSeen?: string;
}

const props = withDefaults(defineProps<Props>(), {
  userId: 0,
  onlineUsers: () => [],
  showText: true,
  size: 'md',
  lastSeen: ''
});

// 计算用户是否在线
const isOnline = computed(() => {
  // 添加调试信息
  console.log('🔍 用户在线状态检查:', {
    userId: props.userId,
    onlineUsers: props.onlineUsers,
    isOnline: props.onlineUsers.includes(props.userId)
  });
  
  return props.onlineUsers.includes(props.userId);
});

// 状态文本
const statusText = computed(() => {
  return isOnline.value ? '在线' : '离线';
});

// 最后在线时间文本
const lastSeenText = computed(() => {
  if (!props.lastSeen || isOnline.value) return '';
  
  const lastSeenDate = new Date(props.lastSeen);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return '刚刚在线';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前在线`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}小时前在线`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}天前在线`;
  }
});

// 文本样式
const textClasses = computed(() => {
  const baseClasses = 'text-sm font-medium transition-colors duration-200';
  
  if (isOnline.value) {
    return `${baseClasses} text-green-600 dark:text-green-400`;
  } else {
    return `${baseClasses} text-gray-500 dark:text-gray-400`;
  }
});
</script>

<style scoped>
.user-online-status {
  transition: all 0.2s ease-in-out;
}
</style> 