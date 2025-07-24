<template>
  <div class="performance-test-page h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部控制栏 -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">消息性能测试</h1>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">消息数量:</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ testMessages.length }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="generateTestMessages(1000)"
              class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
            >
              生成1000条消息
            </button>
            <button
              @click="generateTestMessages(10000)"
              class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
            >
              生成10000条消息
            </button>
            <button
              @click="clearTestMessages"
              class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              清空消息
            </button>
          </div>
          <div class="flex items-center space-x-2">
            <label class="flex items-center space-x-2">
              <input
                v-model="useVirtualScroll"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">虚拟滚动</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能统计 -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div class="grid grid-cols-4 gap-4 text-center">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div class="text-sm text-gray-600 dark:text-gray-400">渲染时间</div>
          <div class="text-lg font-semibold text-blue-600 dark:text-blue-400">{{ renderTime }}ms</div>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div class="text-sm text-gray-600 dark:text-gray-400">内存使用</div>
          <div class="text-lg font-semibold text-green-600 dark:text-green-400">{{ memoryUsage }}MB</div>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div class="text-sm text-gray-600 dark:text-gray-400">滚动FPS</div>
          <div class="text-lg font-semibold text-purple-600 dark:text-purple-400">{{ scrollFPS }}</div>
        </div>
        <div class="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
          <div class="text-sm text-gray-600 dark:text-gray-400">可见项目</div>
          <div class="text-lg font-semibold text-orange-600 dark:text-orange-400">{{ visibleItemCount }}</div>
        </div>
      </div>
    </div>

    <!-- 消息列表容器 -->
    <div class="flex-1 h-0">
      <!-- 虚拟滚动版本 -->
      <VirtualMessageList
        v-if="useVirtualScroll"
        :messages="testMessages"
        :current-user-id="currentUserId"
        :loading="isLoading"
        :has-more="hasMore"
        :container-height="600"
        :item-height="80"
        @load-more="handleLoadMore"
        @retry-message="handleRetryMessage"
        @copy-message="handleCopyMessage"
        @reply-message="handleReplyMessage"
        @forward-message="handleForwardMessage"
        @recall-message="handleRecallMessage"
        @delete-message="handleDeleteMessage"
      />
      
      <!-- 普通滚动版本 -->
      <div v-else class="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div class="p-4 space-y-2">
          <div
            v-for="(message, index) in testMessages"
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
              @retry="handleRetryMessage(message)"
              @copy="handleCopyMessage($event)"
              @reply="handleReplyMessage($event)"
              @forward="handleForwardMessage($event)"
              @recall="handleRecallMessage($event)"
              @delete="handleDeleteMessage($event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息栏 -->
    <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div class="text-center text-sm text-gray-600 dark:text-gray-400">
        <span v-if="useVirtualScroll">
          🚀 虚拟滚动模式：仅渲染可见消息，支持大量数据高性能滚动
        </span>
        <span v-else>
          ⚠️ 普通滚动模式：渲染所有消息，大量数据时性能较差
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import VirtualMessageList from '@/components/chat/VirtualMessageList.vue';
import MessageBubble from '@/components/chat/MessageBubble.vue';
import type { Message } from '@/types/chat';

// 状态
const testMessages = ref<Message[]>([]);
const useVirtualScroll = ref(true);
const isLoading = ref(false);
const hasMore = ref(true);
const currentUserId = ref(1);

// 性能统计
const renderTime = ref(0);
const memoryUsage = ref(0);
const scrollFPS = ref(0);
const visibleItemCount = ref(0);

// 计算属性
const totalMessages = computed(() => testMessages.value.length);

// 生成测试消息
const generateTestMessages = (count: number) => {
  const startTime = performance.now();
  
  const messages: Message[] = [];
  const userIds = [1, 2, 3, 4, 5]; // 5个用户
  const messageTypes = ['text', 'file', 'location'] as const;
  
  const textTemplates = [
    '你好，最近怎么样？',
    '今天天气不错呢！',
    '我刚刚看到一个很有趣的新闻',
    '你有空的时候我们聊聊吧',
    '这个项目进展如何？',
    '周末有什么计划吗？',
    '刚才的会议很有收获',
    '谢谢你的帮助！',
    '期待与你合作',
    '祝你一切顺利！'
  ];
  
  for (let i = 0; i < count; i++) {
    const senderId = userIds[Math.floor(Math.random() * userIds.length)];
    const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    const baseTime = new Date();
    baseTime.setTime(baseTime.getTime() - (count - i) * 60000); // 每条消息间隔1分钟
    
    let content = '';
    let file_id = undefined;
    let latitude = undefined;
    let longitude = undefined;
    let address = undefined;
    
    switch (messageType) {
      case 'text':
        content = textTemplates[Math.floor(Math.random() * textTemplates.length)];
        break;
      case 'file':
        content = `文件_${i + 1}.pdf`;
        file_id = `file_${i + 1}`;
        break;
      case 'location':
        content = '我的位置';
        latitude = (39.9042 + Math.random() * 0.1).toFixed(6);
        longitude = (116.4074 + Math.random() * 0.1).toFixed(6);
        address = `北京市朝阳区某街道${i + 1}号`;
        break;
    }
    
    messages.push({
      id: i + 1,
      conversation_id: 1,
      sender_id: senderId,
      message_type: messageType,
      content,
      file_id,
      latitude,
      longitude,
      address,
      status: Math.random() > 0.1 ? 'sent' : 'read',
      created_at: baseTime.toISOString(),
      updated_at: baseTime.toISOString(),
      reply_to_id: Math.random() > 0.9 && i > 0 ? Math.floor(Math.random() * i) + 1 : undefined,
      sender: {
        id: senderId,
        standard_id: `user_${senderId}`,
        nickname: `用户${senderId}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${senderId}`
      }
    });
  }
  
  testMessages.value = messages;
  
  const endTime = performance.now();
  renderTime.value = Math.round(endTime - startTime);
  
  // 模拟性能统计
  updatePerformanceStats();
};

// 清空测试消息
const clearTestMessages = () => {
  testMessages.value = [];
  renderTime.value = 0;
  updatePerformanceStats();
};

// 更新性能统计
const updatePerformanceStats = () => {
  // 模拟内存使用计算
  const messageCount = testMessages.value.length;
  memoryUsage.value = Math.round(messageCount * 0.5 + Math.random() * 10);
  
  // 计算可见项目数量
  if (useVirtualScroll.value) {
    visibleItemCount.value = Math.min(15, messageCount); // 虚拟滚动只渲染可见项
  } else {
    visibleItemCount.value = messageCount; // 普通滚动渲染所有项
  }
  
  // 模拟滚动FPS
  if (messageCount > 1000) {
    scrollFPS.value = useVirtualScroll.value ? 60 : Math.max(20, 60 - Math.floor(messageCount / 1000) * 10);
  } else {
    scrollFPS.value = 60;
  }
};

// 处理加载更多
const handleLoadMore = () => {
  console.log('加载更多消息');
  // 模拟加载更多
  setTimeout(() => {
    generateTestMessages(50);
  }, 1000);
};

// 消息处理函数
const handleRetryMessage = (message: Message) => {
  console.log('重试消息:', message.id);
};

const handleCopyMessage = (text: string) => {
  navigator.clipboard.writeText(text);
  console.log('复制消息:', text);
};

const handleReplyMessage = (message: Message) => {
  console.log('回复消息:', message.id);
};

const handleForwardMessage = (message: Message) => {
  console.log('转发消息:', message.id);
};

const handleRecallMessage = (messageId: number) => {
  console.log('撤回消息:', messageId);
};

const handleDeleteMessage = (messageId: number) => {
  console.log('删除消息:', messageId);
};

// 判断是否应该显示头像
const shouldShowAvatar = (message: Message, index: number): boolean => {
  if (index === 0) return true;
  
  const prevMessage = testMessages.value[index - 1];
  if (!prevMessage) return true;
  
  return (
    prevMessage.sender_id !== message.sender_id ||
    getTimeDifference(prevMessage.created_at, message.created_at) > 5 * 60 * 1000
  );
};

// 判断是否应该显示时间
const shouldShowTime = (message: Message, index: number): boolean => {
  if (index === testMessages.value.length - 1) return true;
  
  const nextMessage = testMessages.value[index + 1];
  if (!nextMessage) return true;
  
  return (
    nextMessage.sender_id !== message.sender_id ||
    getTimeDifference(message.created_at, nextMessage.created_at) > 5 * 60 * 1000
  );
};

// 判断是否应该显示日期分隔符
const shouldShowDateSeparator = (message: Message, index: number): boolean => {
  if (index === 0) return true;
  
  const prevMessage = testMessages.value[index - 1];
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

// 监听虚拟滚动切换
const handleVirtualScrollChange = () => {
  nextTick(() => {
    updatePerformanceStats();
  });
};

// 组件挂载时生成测试数据
onMounted(() => {
  generateTestMessages(100);
});
</script>

<style scoped>
.performance-test-page {
  display: flex;
  flex-direction: column;
}
</style> 