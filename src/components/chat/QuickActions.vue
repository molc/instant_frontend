<template>
  <div class="quick-actions">
    <!-- 快速动作按钮 -->
    <div class="relative">
      <button
        @click="showActionsMenu = !showActionsMenu"
        class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="快速动作"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      
      <!-- 快速动作菜单 -->
      <div
        v-if="showActionsMenu"
        v-click-outside="closeActionsMenu"
        class="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
      >
        <div class="p-2">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2 px-2">快速动作</h3>
          
          <!-- 动作列表 -->
          <div class="space-y-1">
            <!-- 清空聊天记录 -->
            <button
              @click="clearChatHistory"
              class="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>清空聊天记录</span>
            </button>
            
            <!-- 导出聊天记录 -->
            <button
              @click="exportChatHistory"
              class="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>导出聊天记录</span>
            </button>
            
            <!-- 搜索消息 -->
            <button
              @click="searchMessages"
              class="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>搜索消息</span>
            </button>
            
            <!-- 消息统计 -->
            <button
              @click="showMessageStats"
              class="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>消息统计</span>
            </button>
            
            <!-- 快速回复 -->
            <button
              @click="showQuickReplies"
              class="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>快速回复</span>
            </button>
            
            <!-- 分割线 -->
            <div class="my-2 border-t border-gray-200 dark:border-gray-600"></div>
            
            <!-- 聊天室信息 -->
            <button
              @click="showRoomInfo"
              class="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>聊天室信息</span>
            </button>
            
            <!-- 举报 -->
            <button
              @click="reportUser"
              class="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>举报</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快速回复弹窗 -->
    <div
      v-if="showQuickReplyModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeQuickReplyModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速回复</h3>
        
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <button
            v-for="(reply, index) in quickReplies"
            :key="index"
            @click="sendQuickReply(reply)"
            class="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            {{ reply }}
          </button>
        </div>
        
        <div class="mt-4 flex justify-end">
          <button
            @click="closeQuickReplyModal"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
    
    <!-- 消息统计弹窗 -->
    <div
      v-if="showStatsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeStatsModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">消息统计</h3>
        
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">总消息数</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ messageStats.total }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">我发送的</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ messageStats.sent }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">我接收的</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ messageStats.received }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">今日消息</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ messageStats.today }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">平均字数</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ messageStats.averageLength }}</span>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end">
          <button
            @click="closeStatsModal"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
    
    <!-- 确认弹窗 -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeConfirmModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ confirmTitle }}</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ confirmMessage }}</p>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="closeConfirmModal"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmAction"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            确认
          </button>
        </div>
      </div>
    </div>
    
    <!-- 通知弹窗 -->
    <div
      v-if="showNotification"
      class="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 transition-all duration-300"
    >
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ notificationMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits<{
  'quick-reply': [message: string];
  'search-messages': [];
  'show-room-info': [];
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();

const showActionsMenu = ref(false);
const showQuickReplyModal = ref(false);
const showStatsModal = ref(false);
const showConfirmModal = ref(false);
const showNotification = ref(false);
const notificationMessage = ref('');

const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmCallback = ref<() => void>(() => {});

// 快速回复模板
const quickReplies = [
  '好的，我知道了',
  '谢谢！',
  '收到，稍后回复',
  '正在处理中...',
  '明白了，马上安排',
  '没问题！',
  '让我想想...',
  '辛苦了！',
  '好的，我会注意的',
  '等等，我再看看'
];

// 消息统计
const messageStats = computed(() => {
  const currentRoom = chatStore.currentRoom;
  if (!currentRoom) {
    return {
      total: 0,
      sent: 0,
      received: 0,
      today: 0,
      averageLength: 0
    };
  }
  
  const messages = chatStore.messages[currentRoom.id] || [];
  const currentUserId = authStore.user?.id || 'user2';
  const today = new Date().toDateString();
  
  const stats = {
    total: messages.length,
    sent: messages.filter(m => m.sender_id === currentUserId).length,
    received: messages.filter(m => m.sender_id !== currentUserId).length,
    today: messages.filter(m => new Date(m.created_at).toDateString() === today).length,
    averageLength: Math.round(messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length) || 0
  };
  
  return stats;
});

// 关闭菜单
const closeActionsMenu = () => {
  showActionsMenu.value = false;
};

// 清空聊天记录
const clearChatHistory = () => {
  confirmTitle.value = '清空聊天记录';
  confirmMessage.value = '确定要清空当前聊天室的所有消息吗？此操作不可恢复。';
  confirmCallback.value = () => {
    const currentRoom = chatStore.currentRoom;
    if (currentRoom) {
      chatStore.clearMessages(currentRoom.id);
      showNotificationMessage('聊天记录已清空');
    }
  };
  showConfirmModal.value = true;
  closeActionsMenu();
};

// 导出聊天记录
const exportChatHistory = () => {
  const currentRoom = chatStore.currentRoom;
  if (!currentRoom) return;
  
  const messages = chatStore.messages[currentRoom.id] || [];
  const exportData = {
    roomName: currentRoom.name,
    exportTime: new Date().toISOString(),
    messages: messages.map(msg => ({
      sender: msg.sender?.username || '未知用户',
      content: msg.content,
      timestamp: msg.created_at,
      type: msg.message_type
    }))
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `chat-history-${currentRoom.name}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  showNotificationMessage('聊天记录已导出');
  closeActionsMenu();
};

// 搜索消息
const searchMessages = () => {
  emit('search-messages');
  closeActionsMenu();
};

// 显示消息统计
const showMessageStats = () => {
  showStatsModal.value = true;
  closeActionsMenu();
};

// 显示快速回复
const showQuickReplies = () => {
  showQuickReplyModal.value = true;
  closeActionsMenu();
};

// 发送快速回复
const sendQuickReply = (message: string) => {
  emit('quick-reply', message);
  closeQuickReplyModal();
};

// 显示聊天室信息
const showRoomInfo = () => {
  emit('show-room-info');
  closeActionsMenu();
};

// 举报用户
const reportUser = () => {
  confirmTitle.value = '举报用户';
  confirmMessage.value = '确定要举报当前用户吗？我们会认真处理您的举报。';
  confirmCallback.value = () => {
    // 这里可以添加举报逻辑
    showNotificationMessage('举报已提交，感谢您的反馈');
  };
  showConfirmModal.value = true;
  closeActionsMenu();
};

// 关闭快速回复弹窗
const closeQuickReplyModal = () => {
  showQuickReplyModal.value = false;
};

// 关闭统计弹窗
const closeStatsModal = () => {
  showStatsModal.value = false;
};

// 关闭确认弹窗
const closeConfirmModal = () => {
  showConfirmModal.value = false;
};

// 确认操作
const confirmAction = () => {
  confirmCallback.value();
  closeConfirmModal();
};

// 显示通知消息
const showNotificationMessage = (message: string) => {
  notificationMessage.value = message;
  showNotification.value = true;
  
  setTimeout(() => {
    showNotification.value = false;
  }, 2000);
};
</script>

<style scoped>
/* 滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style> 