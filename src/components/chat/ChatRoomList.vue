<template>
  <div class="chat-room-list flex-1 overflow-y-auto">
    <!-- 加载状态 -->
    <div v-if="loading" class="p-4 text-center">
      <div class="flex items-center justify-center">
        <svg class="animate-spin h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm text-gray-500">加载中...</span>
      </div>
    </div>

    <!-- 聊天室列表 -->
    <div v-else-if="rooms.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
      <div
        v-for="room in rooms"
        :key="room.id"
        :class="[
          'flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
          currentRoom?.id === room.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
        ]"
      >
        <div 
          class="flex-1 flex items-center cursor-pointer"
          @click="$emit('room-select', room)"
        >
          <div class="flex-shrink-0 relative">
            <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <!-- 群聊图标 -->
              <svg v-if="room.type === 'group'" class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <!-- 单聊图标 -->
              <svg v-else class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <!-- 在线状态指示器 -->
            <div
              v-if="room.type === 'single'"
              :class="[
                'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
                'bg-green-500'
              ]"
            />
            <!-- 未读消息数量 -->
            <div
              v-if="(room.unread_count || 0) > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ (room.unread_count || 0) > 99 ? '99+' : (room.unread_count || 0) }}
            </div>
          </div>

          <div class="flex-1 min-w-0 ml-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold truncate text-gray-900 dark:text-white">
                {{ room.name || '未命名' }}
              </h3>
              <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                {{ formatTime(room.last_message_at || room.updated_at) }}
              </span>
            </div>
            
            <div class="flex items-center justify-between mt-1">
              <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                {{ getLastMessageText(room) }}
              </p>
              <!-- 在线状态文本 -->
              <div v-if="room.type === 'single'" class="flex items-center space-x-1 flex-shrink-0">
                <span :class="[
                  'text-xs',
                  isUserOnline(room) ? 'text-green-500' : 'text-gray-400'
                ]">
                  {{ isUserOnline(room) ? '在线' : '离线' }}
                </span>
              </div>
              <div v-else class="flex items-center space-x-1 flex-shrink-0">
                <span class="text-xs text-gray-400">
                  {{ room.member_count || room.participants?.length || 0 }} 人
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 三点菜单 -->
        <div class="flex-shrink-0 ml-2 relative">
          <button
            @click.stop="toggleMenu(room.id)"
            class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          <!-- 下拉菜单 -->
          <div
            v-if="activeMenuRoomId === room.id"
            v-click-outside="closeMenu"
            class="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1"
          >
            <!-- 群聊成员管理 (仅群聊显示) -->
            <button
              v-if="room.type === 'group' || room.name === 'test_user_2'"
              @click="handleMenuAction('members', room)"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>群聊成员</span>
            </button>
            
            <!-- 聊天设置 -->
            <button
              @click="handleMenuAction('settings', room)"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>聊天设置</span>
            </button>
            
            <!-- 清空聊天记录 -->
            <button
              @click="handleMenuAction('clear', room)"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>清空聊天记录</span>
            </button>
            
            <hr class="my-1 border-gray-200 dark:border-gray-600" />
            
            <!-- 退出群聊/删除会话 -->
            <button
              @click="handleMenuAction(room.type === 'group' ? 'leave' : 'delete', room)"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
            >
              <!-- 退出群聊图标 -->
              <svg v-if="room.type === 'group'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <!-- 删除会话图标 -->
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{{ room.type === 'group' ? '退出群聊' : '删除会话' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 无聊天室时的空状态 -->
    <div v-else class="p-8 text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无聊天</h3>
      <p class="text-gray-500 dark:text-gray-400">点击上方的"+"按钮开始新的对话</p>
    </div>

    <!-- 确认删除/退出对话框 -->
    <div
      v-if="showConfirmDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 mx-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ confirmTitle }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ confirmMessage }}
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelConfirm"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            取消
          </button>
          <button
            @click="confirmAction"
            :disabled="isProcessing"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {{ isProcessing ? '处理中...' : '确认' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { clickOutside } from '@/directives/clickOutside';
import type { ConversationListItem } from '@/types/chat';

// 注册指令
const vClickOutside = clickOutside;

// ChatRoomList component loaded

interface Props {
  rooms: ConversationListItem[];
  currentRoom: ConversationListItem | null;
  loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rooms: () => [],
  currentRoom: null,
  loading: false
});

const emit = defineEmits<{
  'room-select': [room: ConversationListItem];
  'room-settings': [room: ConversationListItem];
  'room-delete': [room: ConversationListItem];
  'room-leave': [room: ConversationListItem];
  'room-members': [room: ConversationListItem];
  'room-clear': [room: ConversationListItem];
}>();

const authStore = useAuthStore();
const chatStore = useChatStore();
const currentUserId = computed(() => authStore.user?.id || 0);

// 菜单状态
const activeMenuRoomId = ref<number | null>(null);
const showConfirmDialog = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const confirmCallback = ref<(() => void) | null>(null);
const isProcessing = ref(false);

// 菜单操作
const toggleMenu = (roomId: number) => {
  activeMenuRoomId.value = activeMenuRoomId.value === roomId ? null : roomId;
};

const closeMenu = () => {
  activeMenuRoomId.value = null;
};

const handleMenuAction = (action: string, room: ConversationListItem) => {
  closeMenu();
  
  switch (action) {
    case 'members':
      emit('room-members', room);
      break;
    case 'settings':
      emit('room-settings', room);
      break;
    case 'clear':
      showClearConfirm(room);
      break;
    case 'delete':
      showDeleteConfirm(room);
      break;
    case 'leave':
      showLeaveConfirm(room);
      break;
  }
};

const showDeleteConfirm = (room: ConversationListItem) => {
  confirmTitle.value = '删除会话';
  confirmMessage.value = `确定要删除与 "${room.name}" 的会话吗？此操作无法撤销，所有聊天记录将被清除。`;
  confirmCallback.value = () => deleteRoom(room);
  showConfirmDialog.value = true;
};

const showClearConfirm = (room: ConversationListItem) => {
  confirmTitle.value = '清空聊天记录';
  confirmMessage.value = `确定要清空与 "${room.name}" 的所有聊天记录吗？此操作无法撤销。`;
  confirmCallback.value = () => clearRoom(room);
  showConfirmDialog.value = true;
};

const showLeaveConfirm = (room: ConversationListItem) => {
  confirmTitle.value = '退出群聊';
  confirmMessage.value = `确定要退出群聊 "${room.name}" 吗？退出后将无法接收此群的消息。`;
  confirmCallback.value = () => leaveRoom(room);
  showConfirmDialog.value = true;
};

const deleteRoom = async (room: ConversationListItem) => {
  try {
    isProcessing.value = true;
    await chatStore.deleteConversation(room.id);
    emit('room-delete', room);
  } catch (error) {
    console.error('删除会话失败:', error);
    // 这里可以添加错误提示
  } finally {
    isProcessing.value = false;
    showConfirmDialog.value = false;
  }
};

const clearRoom = async (room: ConversationListItem) => {
  try {
    isProcessing.value = true;
    // 这里应该调用清空聊天记录的API
    // await chatStore.clearConversationHistory(room.id);
    emit('room-clear', room);
    console.log('清空聊天记录:', room.name);
  } catch (error) {
    console.error('清空聊天记录失败:', error);
    // 这里可以添加错误提示
  } finally {
    isProcessing.value = false;
    showConfirmDialog.value = false;
  }
};

const leaveRoom = async (room: ConversationListItem) => {
  try {
    isProcessing.value = true;
    await chatStore.leaveConversation(room.id, currentUserId.value);
    emit('room-leave', room);
  } catch (error) {
    console.error('退出群聊失败:', error);
    // 这里可以添加错误提示
  } finally {
    isProcessing.value = false;
    showConfirmDialog.value = false;
  }
};

const confirmAction = () => {
  if (confirmCallback.value) {
    confirmCallback.value();
  }
};

const cancelConfirm = () => {
  showConfirmDialog.value = false;
  confirmCallback.value = null;
  isProcessing.value = false;
};

// 监听在线用户列表变化
watch(() => chatStore.onlineUsers, (newOnlineUsers, oldOnlineUsers) => {
  console.log('🔄 在线用户列表发生变化:', {
    newOnlineUsers,
    oldOnlineUsers,
    newOnlineUsersLength: newOnlineUsers?.length,
    currentUserId: currentUserId.value,
    rooms: props.rooms?.map(room => ({
      id: room.id,
      name: room.name,
      type: room.type,
      participants: room.participants,
      participantIds: room.participants?.map(p => p.id)
    }))
  });
}, { deep: true, immediate: true });

// 监听rooms变化
watch(() => props.rooms, (newRooms) => {
  console.log('🏠 会话列表发生变化:', {
    roomsCount: newRooms?.length,
    rooms: newRooms?.map(room => ({
      id: room.id,
      name: room.name,
      type: room.type,
      participants: room.participants,
      participantIds: room.participants?.map(p => p.id)
    })),
    onlineUsers: chatStore.onlineUsers
  });
}, { deep: true, immediate: true });

// 获取对方用户ID的辅助函数
const getOtherUserId = (room: ConversationListItem): number => {
  if (room.type === 'single' && room.participants) {
    const otherUser = room.participants.find(participant => participant.id !== currentUserId.value);
    return otherUser?.id || 0;
  }
  return 0;
};

// 检查用户是否在线
const isUserOnline = (room: ConversationListItem): boolean => {
  if (room.type === 'group') return false; // 群组不显示在线状态
  
  const otherUserId = getOtherUserId(room);
  const result = otherUserId > 0 && chatStore.onlineUsers.includes(otherUserId);
  
  console.log('🔍 用户在线状态检查:', {
    roomId: room.id,
    roomName: room.name,
    roomType: room.type,
    participants: room.participants,
    currentUserId: currentUserId.value,
    otherUserId,
    onlineUsers: chatStore.onlineUsers,
    onlineUsersType: typeof chatStore.onlineUsers,
    otherUserIdType: typeof otherUserId,
    includes: chatStore.onlineUsers.includes(otherUserId),
    includesAsNumber: chatStore.onlineUsers.includes(Number(otherUserId)),
    isOnline: result
  });
  
  return result;
};

// 格式化时间
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 小于一天显示时间
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  // 小于一周显示星期
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
  }
  
  // 显示日期
  return date.toLocaleDateString('zh-CN', { 
    month: 'short', 
    day: 'numeric' 
  });
};

// 获取最后一条消息的文本
const getLastMessageText = (room: ConversationListItem): string => {
  // 由于ConversationListItem没有last_message属性，我们显示简单的状态
  if (room.type === 'group') {
    return `群组 • ${room.member_count || room.participants?.length || 0} 人`;
  }
  
  const otherUserId = getOtherUserId(room);
  if (otherUserId > 0) {
    const otherUser = room.participants?.find(p => p.id === otherUserId);
    return `与 ${otherUser?.name || '用户'} 的对话`;
  }
  
  return '暂无消息';
};
</script>

<style scoped>
.chat-room-list {
  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.chat-room-list::-webkit-scrollbar {
  width: 6px;
}

.chat-room-list::-webkit-scrollbar-track {
  background: transparent;
}

.chat-room-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.chat-room-list::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}
</style> 