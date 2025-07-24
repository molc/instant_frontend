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
        @click="$emit('room-select', room)"
        :class="[
          'flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors',
          currentRoom?.id === room.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
        ]"
      >
        <div class="flex-shrink-0 relative">
          <img
            :src="room.avatar || '/default-avatar.png'"
            :alt="room.name || '未命名'"
            class="w-12 h-12 rounded-full object-cover"
          />
          <!-- 在线状态指示器 -->
          <div
            v-if="room.type === 'single'"
            :class="[
              'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
              isUserOnline(room) ? 'bg-green-500' : 'bg-gray-400'
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
            <h3 :class="[
              'text-sm font-semibold truncate',
              room.type === 'single' && isUserOnline(room) 
                ? 'text-green-600 font-bold' 
                : 'text-red-500 font-bold'
            ]">
              🔥{{ room.name || '未命名' }}{{ isUserOnline(room) ? ' [ONLINE]' : ' [OFFLINE]' }}
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
    </div>

    <!-- 无聊天室时的空状态 -->
    <div v-else class="p-8 text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无聊天</h3>
      <p class="text-gray-500 dark:text-gray-400">点击上方的"+"按钮开始新的对话</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import type { ConversationListItem } from '@/types/chat';

console.log('🚨🚨🚨 CHATROOM LIST COMPONENT LOADED - NEW VERSION! 🚨🚨🚨');
console.log('🚨🚨🚨 CHATROOM LIST COMPONENT LOADED - NEW VERSION! 🚨🚨🚨');
console.log('🚨🚨🚨 CHATROOM LIST COMPONENT LOADED - NEW VERSION! 🚨🚨🚨');
setTimeout(() => {
  console.log('🔥🔥🔥 TIMER TEST - Component is alive after 2 seconds! 🔥🔥🔥');
}, 2000);

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
}>();

const authStore = useAuthStore();
const chatStore = useChatStore();
const currentUserId = computed(() => authStore.user?.id || 0);

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