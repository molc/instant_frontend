<template>
  <div class="message-list flex-1 overflow-y-auto p-4" ref="messageContainer">
    <!-- 加载更多按钮 -->
    <div v-if="hasMore" class="text-center mb-4">
      <button
        @click="$emit('load-more')"
        :disabled="loading"
        class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        <span v-if="loading">加载中...</span>
        <span v-else>加载更多消息</span>
      </button>
    </div>

    <!-- 消息列表 -->
    <div class="space-y-4">
      <div
        v-for="(message, index) in messages"
        :key="message.id"
        :class="[
          'flex',
          message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
        ]"
      >
        <!-- 显示日期分隔符 -->
        <div
          v-if="shouldShowDateSeparator(message, index)"
          class="w-full flex justify-center my-6"
        >
          <span class="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
            {{ formatDate(message.created_at) }}
          </span>
        </div>

        <!-- 消息气泡 -->
        <MessageBubble
          :message="message"
          :is-own="message.sender_id === currentUserId"
          :show-avatar="shouldShowAvatar(message, index)"
          :show-time="shouldShowTime(message, index)"
          @retry="$emit('retry-message', message)"
          @copy="$emit('copy-message', $event)"
          @reply="$emit('reply-message', $event)"
          @forward="$emit('forward-message', $event)"
          @recall="$emit('recall-message', $event)"
          @delete="$emit('delete-message', $event)"
        />
      </div>
    </div>

    <!-- 无消息时的空状态 -->
    <div v-if="messages.length === 0 && !loading" class="text-center py-12">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无消息</h3>
      <p class="text-gray-500 dark:text-gray-400">开始发送消息吧</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue';
import MessageBubble from './MessageBubble.vue';
import type { Message } from '@/types/chat';

interface Props {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  hasMore?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  messages: () => [],
  currentUserId: '',
  loading: false,
  hasMore: false
});

const emit = defineEmits<{
  'load-more': [];
  'retry-message': [message: Message];
  'copy-message': [text: string];
  'reply-message': [message: Message];
  'forward-message': [message: Message];
  'recall-message': [messageId: number];
  'delete-message': [messageId: number];
}>();

const messageContainer = ref<HTMLElement>();

// 滚动到底部
const scrollToBottom = (smooth = true) => {
  if (!messageContainer.value) return;
  
  const container = messageContainer.value;
  const scrollOptions: ScrollToOptions = {
    top: container.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  };
  
  container.scrollTo(scrollOptions);
};

// 判断是否应该显示头像
const shouldShowAvatar = (message: Message, index: number): boolean => {
  if (index === 0) return true;
  
  const prevMessage = props.messages[index - 1];
  if (!prevMessage) return true;
  
  // 不同发送者或时间间隔超过5分钟则显示头像
  return (
    prevMessage.sender_id !== message.sender_id ||
    getTimeDifference(prevMessage.created_at, message.created_at) > 5 * 60 * 1000
  );
};

// 判断是否应该显示时间
const shouldShowTime = (message: Message, index: number): boolean => {
  if (index === props.messages.length - 1) return true;
  
  const nextMessage = props.messages[index + 1];
  if (!nextMessage) return true;
  
  // 不同发送者或时间间隔超过5分钟则显示时间
  return (
    nextMessage.sender_id !== message.sender_id ||
    getTimeDifference(message.created_at, nextMessage.created_at) > 5 * 60 * 1000
  );
};

// 判断是否应该显示日期分隔符
const shouldShowDateSeparator = (message: Message, index: number): boolean => {
  if (index === 0) return true;
  
  const prevMessage = props.messages[index - 1];
  if (!prevMessage) return true;
  
  const messageDate = new Date(message.created_at);
  const prevMessageDate = new Date(prevMessage.created_at);
  
  // 不同日期则显示日期分隔符
  return messageDate.toDateString() !== prevMessageDate.toDateString();
};

// 获取时间差（毫秒）
const getTimeDifference = (time1: string, time2: string): number => {
  return Math.abs(new Date(time2).getTime() - new Date(time1).getTime());
};

// 格式化日期
const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (messageDate.getTime() === today.getTime()) {
    return '今天';
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return '昨天';
  } else if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('zh-CN', { 
      month: 'long', 
      day: 'numeric' 
    });
  } else {
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

// 监听消息变化，自动滚动到底部
watch(() => props.messages, (newMessages, oldMessages) => {
  nextTick(() => {
    // 如果是新增消息（而不是加载历史消息），则滚动到底部
    if (newMessages.length > (oldMessages?.length || 0)) {
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.sender_id === props.currentUserId) {
        // 自己发送的消息，立即滚动
        scrollToBottom(false);
      } else {
        // 别人发送的消息，平滑滚动
        scrollToBottom(true);
      }
    }
  });
}, { deep: true });

// 组件挂载时滚动到底部
onMounted(() => {
  nextTick(() => {
    scrollToBottom(false);
  });
});
</script>

<style scoped>
.message-list {
  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}
</style> 