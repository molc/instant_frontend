<template>
  <div ref="containerRef" class="virtual-message-list" @scroll="handleScroll">
    <!-- 顶部加载更多指示器 -->
    <div v-if="loading && hasMore" class="load-more-indicator">
      <div class="flex items-center justify-center py-4">
        <svg class="animate-spin h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm text-gray-600 dark:text-gray-400">加载更多消息...</span>
      </div>
    </div>

    <!-- 虚拟滚动容器 -->
    <div 
      class="virtual-list-container"
      :style="{ 
        height: `${containerHeight}px`,
        paddingTop: `${offsetTop}px`,
        paddingBottom: `${offsetBottom}px`
      }"
    >
      <!-- 渲染的消息项 -->
      <div
        v-for="(item, index) in visibleItems"
        :key="item.message.id"
        :data-index="item.index"
        class="virtual-item"
      >
        <!-- 日期分隔符 -->
        <div
          v-if="item.showDateSeparator"
          class="w-full flex justify-center my-6"
        >
          <span class="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
            {{ formatDate(item.message.created_at) }}
          </span>
        </div>

        <!-- 消息气泡 -->
        <div 
          :class="[
            'flex',
            item.message.sender_id === currentUserId ? 'justify-end' : 'justify-start',
            'mb-2'
          ]"
        >
          <MessageBubble
            :message="item.message"
            :is-own="item.message.sender_id === currentUserId"
            :show-avatar="item.showAvatar"
            :show-time="item.showTime"
            @retry="$emit('retry-message', item.message)"
            @copy="$emit('copy-message', $event)"
            @reply="$emit('reply-message', $event)"
            @forward="$emit('forward-message', $event)"
            @recall="$emit('recall-message', $event)"
            @delete="$emit('delete-message', $event)"
          />
        </div>
      </div>
    </div>

    <!-- 底部滚动到底部按钮 -->
    <Transition name="fade">
      <button
        v-if="showScrollToBottom"
        @click="scrollToBottom"
        class="fixed bottom-20 right-6 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors z-10"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </Transition>

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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import MessageBubble from './MessageBubble.vue';
import type { Message } from '@/types/chat';

interface Props {
  messages: Message[];
  currentUserId: number;
  loading: boolean;
  hasMore?: boolean;
  itemHeight?: number; // 预估的消息项高度
  containerHeight?: number; // 容器高度
  overscan?: number; // 额外渲染的项目数量
}

const props = withDefaults(defineProps<Props>(), {
  messages: () => [],
  currentUserId: 0,
  loading: false,
  hasMore: false,
  itemHeight: 80,
  containerHeight: 600,
  overscan: 5
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

// 引用
const containerRef = ref<HTMLElement>();

// 状态
const scrollTop = ref(0);
const showScrollToBottom = ref(false);
const itemHeights = ref<Map<number, number>>(new Map());

// 计算属性
const totalHeight = computed(() => {
  return props.messages.length * props.itemHeight;
});

const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight) - props.overscan;
  const end = Math.ceil((scrollTop.value + props.containerHeight) / props.itemHeight) + props.overscan;
  
  return {
    start: Math.max(0, start),
    end: Math.min(props.messages.length, end)
  };
});

const visibleItems = computed(() => {
  const items = [];
  
  for (let i = visibleRange.value.start; i < visibleRange.value.end; i++) {
    const message = props.messages[i];
    if (!message) continue;
    
    items.push({
      index: i,
      message,
      showAvatar: shouldShowAvatar(message, i),
      showTime: shouldShowTime(message, i),
      showDateSeparator: shouldShowDateSeparator(message, i)
    });
  }
  
  return items;
});

const offsetTop = computed(() => {
  return visibleRange.value.start * props.itemHeight;
});

const offsetBottom = computed(() => {
  return (props.messages.length - visibleRange.value.end) * props.itemHeight;
});

// 方法
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  scrollTop.value = target.scrollTop;
  
  // 显示/隐藏滚动到底部按钮
  const isNearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 100;
  showScrollToBottom.value = !isNearBottom;
  
  // 检查是否需要加载更多
  if (target.scrollTop === 0 && props.hasMore && !props.loading) {
    emit('load-more');
  }
};

const scrollToBottom = (smooth = true) => {
  if (!containerRef.value) return;
  
  const container = containerRef.value;
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

// 清理事件监听器
onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
.virtual-message-list {
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.virtual-list-container {
  position: relative;
}

.virtual-item {
  position: relative;
}

.load-more-indicator {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 0 0 12px 12px;
}

.dark .load-more-indicator {
  background: rgba(31, 41, 55, 0.95);
}

/* 滚动条样式 */
.virtual-message-list::-webkit-scrollbar {
  width: 6px;
}

.virtual-message-list::-webkit-scrollbar-track {
  background: transparent;
}

.virtual-message-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.virtual-message-list::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 