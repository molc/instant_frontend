<template>
  <div class="typing-indicator p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
    <div class="flex items-center space-x-3">
      <div class="flex-shrink-0">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div class="flex-1">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ getTypingText() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  typingUsers: string[];
  roomId: string;
}

const props = withDefaults(defineProps<Props>(), {
  typingUsers: () => [],
  roomId: ''
});

// 获取正在输入的文本
const getTypingText = (): string => {
  const count = props.typingUsers.length;
  
  if (count === 0) return '';
  
  if (count === 1) {
    return `${getUserName(props.typingUsers[0])} 正在输入...`;
  } else if (count === 2) {
    return `${getUserName(props.typingUsers[0])} 和 ${getUserName(props.typingUsers[1])} 正在输入...`;
  } else {
    return `${getUserName(props.typingUsers[0])} 等 ${count} 人正在输入...`;
  }
};

// 获取用户名（这里简化处理，实际应该从用户信息中获取）
const getUserName = (userId: string): string => {
  // 这里可以从用户信息缓存或store中获取用户名
  return userId.slice(0, 8) + '...'; // 简化显示
};
</script>

<style scoped>
.typing-dots {
  display: flex;
  align-items: center;
  space-x: 2px;
}

.typing-dots span {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #9ca3af;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(1) {
  animation-delay: 0ms;
}

.typing-dots span:nth-child(2) {
  animation-delay: 200ms;
}

.typing-dots span:nth-child(3) {
  animation-delay: 400ms;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.dark .typing-dots span {
  background-color: #6b7280;
}
</style> 