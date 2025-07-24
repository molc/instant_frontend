<template>
  <div class="chat-page flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- 聊天室列表 -->
    <div class="chat-sidebar w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <!-- 头部 -->
      <div class="chat-header p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">聊天</h2>
          <div class="flex items-center space-x-2">
            <button
              @click="showNewChatModal = true"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <div class="flex items-center space-x-1">
              <div 
                :class="[
                  'w-2 h-2 rounded-full',
                  connectionStatusColor
                ]"
              />
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ connectionStatusText }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索聊天记录..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- 搜索结果 -->
        <div v-if="searchResults.length > 0" class="mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div
            v-for="result in searchResults"
            :key="result.id"
            @click="jumpToMessage(result)"
            class="p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ getRoomName(result.room_id) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {{ result.content }}
                </div>
              </div>
              <div class="text-xs text-gray-400 ml-2">
                {{ formatSearchTime(result.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 对话列表容器 -->
      <div class="flex-1 overflow-hidden">
        <ChatRoomList
          :rooms="filteredRooms"
          :current-room="chatStore.currentConversation"
          :loading="chatStore.isLoading"
          @room-select="handleRoomSelect"
          @room-settings="handleRoomSettings"
          @room-delete="handleRoomDelete"
          @room-leave="handleRoomLeave"
        />
      </div>
    </div>

    <!-- 消息区域 -->
    <div class="chat-main flex-1 flex flex-col">
      <div v-if="chatStore.currentConversation" class="flex flex-col h-full">
        <!-- 聊天头部 -->
        <div class="chat-header p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <img
                  :src="chatStore.currentConversation.avatar || '/default-avatar.png'"
                  :alt="chatStore.currentConversation.name"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <OnlineStatus
                  v-if="chatStore.currentConversation.type === 'single'"
                  :user-id="getOtherUserId(chatStore.currentConversation)"
                  :online-users="chatStore.onlineUsers"
                  class="absolute -bottom-1 -right-1"
                />
              </div>
              <div>
                <div class="flex items-center space-x-2">
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ chatStore.currentConversation.name }}</h3>
                  <span
                    v-if="chatStore.currentConversation.type === 'group'"
                    class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                  >
                    群聊
                  </span>
                </div>
                <UserOnlineStatus
                  v-if="chatStore.currentConversation.type === 'single'"
                  :user-id="getOtherUserId(chatStore.currentConversation)"
                  :online-users="chatStore.onlineUsers"
                  :show-text="true"
                  size="sm"
                  class="mt-1"
                />
                <div
                  v-else
                  class="text-xs text-gray-500 dark:text-gray-400 mt-1"
                >
                  {{ chatStore.currentConversation.member_count || chatStore.currentConversation.participants?.length || 0 }} 名成员
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <!-- 调试信息 -->
              <div class="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">
                {{ chatStore.currentConversation?.type || 'undefined' }}
              </div>
              
              <!-- 群聊成员管理按钮 -->
              <button
                v-if="chatStore.currentConversation?.type === 'group'"
                @click="showMembersModal = true"
                class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="群聊成员"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              
              <!-- 临时群聊成员按钮 (调试用) 已移除 -->
              <button
                @click="showSearchModal = true"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="搜索消息"
              >
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button 
                @click="handleVoiceCall"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="语音通话"
              >
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button 
                @click="handleVideoCall"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="视频通话"
              >
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              
              <!-- 聊天设置组件 -->
              <ChatSettings />

              <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 消息列表 -->
        <MessageList
          :messages="chatStore.currentMessages"
          :current-user-id="currentUserId"
          :loading="chatStore.isLoading"
          :has-more="hasMore"
          @load-more="handleLoadMore"
          @retry-message="handleRetryMessage"
          @copy-message="handleCopyMessage"
          @reply-message="handleReplyMessage"
          @forward-message="handleForwardMessage"
          @recall-message="handleRecallMessage"
          @delete-message="handleDeleteMessage"
          class="flex-1"
        />

        <!-- 打字指示器 -->
        <TypingIndicator
          v-if="chatStore.currentConversation && chatStore.typing[chatStore.currentConversation.id]?.length > 0"
          :typing-users="chatStore.typing[chatStore.currentConversation.id]"
          :room-id="chatStore.currentConversation.id"
        />

        <!-- 消息输入框 -->
        <MessageInput
          :disabled="!chatStore.isConnected"
          :reply-to="replyToMessage"
          @send-message="handleSendMessage"
          @send-file="handleSendFile"
          @typing="handleTyping"
          @cancel-reply="replyToMessage = null"
        />
      </div>

      <!-- 未选择聊天室时的欢迎页面 -->
      <div v-else class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <svg class="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">选择一个聊天</h3>
          <p class="text-gray-500 dark:text-gray-400">从左侧列表选择聊天室开始对话</p>
        </div>
      </div>
    </div>

    <!-- 新建聊天对话框 -->
    <el-dialog
      v-model="showNewChatModal"
      title="新建聊天"
      width="30%"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">用户ID</label>
          <input
            v-model="newChatUserId"
            type="text"
            placeholder="输入用户ID"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNewChatModal = false">取消</el-button>
          <el-button type="primary" @click="handleCreateChat">创建</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 消息搜索对话框 -->
    <el-dialog
      v-model="showSearchModal"
      title="搜索消息"
      width="60%"
      class="search-dialog"
    >
      <MessageSearch
        :conversation-id="chatStore.currentConversation?.id"
        @jump-to-message="handleJumpToMessage"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSearchModal = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 群聊成员管理对话框 -->
    <el-dialog
      v-model="showMembersModal"
      title="群聊成员管理"
      width="50%"
      class="members-dialog"
    >
      <GroupMembersList
        v-if="chatStore.currentConversation && showMembersModal"
        :conversation-id="chatStore.currentConversation.id"
        @close="showMembersModal = false"
        @add-member="handleAddMember"
        @member-removed="handleMemberRemoved"
        @member-updated="handleMemberUpdated"
      />
    </el-dialog>

    <!-- 添加成员对话框 -->
    <el-dialog
      v-model="showAddMemberModal"
      title="添加群聊成员"
      width="40%"
      class="add-member-dialog"
    >
      <AddMemberModal
        v-if="chatStore.currentConversation && showAddMemberModal"
        :conversation-id="chatStore.currentConversation.id"
        @cancel="showAddMemberModal = false"
        @success="handleAddMemberSuccess"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import ChatRoomList from './ChatRoomList.vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import TypingIndicator from './TypingIndicator.vue';
import OnlineStatus from './OnlineStatus.vue';
import UserOnlineStatus from './UserOnlineStatus.vue';
import MessageSearch from './MessageSearch.vue'; // Added import for MessageSearch
import GroupMembersList from './GroupMembersList.vue';
import AddMemberModal from './AddMemberModal.vue';
import ChatSettings from './ChatSettings.vue';
import type { ConversationListItem, Message, MessageType, TextMessageCreate, FileMessageCreate } from '@/types/chat';

const chatStore = useChatStore();
const authStore = useAuthStore();

// 状态
const searchQuery = ref('');
const searchResults = ref<(Message & { room_id: string })[]>([]);
const messageSearchQuery = ref('');
const messageSearchResults = ref<Message[]>([]);
const showNewChatModal = ref(false);
const showSearchModal = ref(false);
const showMembersModal = ref(false);
const showAddMemberModal = ref(false);
const newChatUserId = ref('');
const replyToMessage = ref<Message | null>(null);
const hasMore = ref(true);

// 计算属性
const currentUserId = computed(() => authStore.user?.id || 2);

const filteredRooms = computed(() => {
  if (!searchQuery.value) return chatStore.conversations;
  return chatStore.conversations.filter(room => 
    room.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const connectionStatusColor = computed(() => {
  switch (chatStore.connectionStatus) {
    case 'connected':
      return 'bg-green-500';
    case 'connecting':
      return 'bg-yellow-500';
    case 'reconnecting':
      return 'bg-orange-500';
    case 'disconnected':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
});

const connectionStatusText = computed(() => {
  switch (chatStore.connectionStatus) {
    case 'connected':
      return '已连接';
    case 'connecting':
      return '连接中';
    case 'reconnecting':
      return '重连中';
    case 'disconnected':
      return '未连接';
    default:
      return '未知状态';
  }
});

// 方法
const handleRoomSelect = async (room: ConversationListItem) => {
  await chatStore.switchConversation(room);
  hasMore.value = true;
};

const handleSendMessage = async (content: string, messageType: MessageType = 'text') => {
  if (!chatStore.currentConversation) return;
  
  const messageData: TextMessageCreate = {
    conversation_id: chatStore.currentConversation.id,
    content,
    reply_to_id: replyToMessage.value?.id
  };
  
  try {
    await chatStore.sendTextMessage(messageData);
    
    // 清除回复状态
    replyToMessage.value = null;
    
    // 模拟对方回复（演示功能）
    if (chatStore.currentConversation.type === 'single') {
      setTimeout(() => {
        simulateReply(content);
      }, 1000 + Math.random() * 2000);
    }
  } catch (error) {
    console.error('发送消息失败:', error);
  }
};

const handleSendFile = async (file: File) => {
  if (!chatStore.currentConversation) return;
  
  try {
    // 先上传文件
    const uploadResponse = await chatStore.uploadFile(file);
    
    // 发送文件消息
    const messageData: FileMessageCreate = {
      conversation_id: chatStore.currentConversation.id,
      file_url: uploadResponse.file_url,
      file_name: uploadResponse.file_name,
      file_size: uploadResponse.file_size,
      file_type: uploadResponse.file_type
    };
    
    await chatStore.sendFileMessage(messageData);
  } catch (error) {
    console.error('发送文件失败:', error);
  }
};

const handleRetryMessage = async (message: Message) => {
  try {
    // 重试发送消息
    if (message.message_type === 'text') {
      await chatStore.sendTextMessage({
        conversation_id: message.conversation_id,
        content: message.content,
        reply_to_id: message.reply_to_id
      });
    }
  } catch (error) {
    console.error('重试消息失败:', error);
  }
};

const handleRecallMessage = async (messageId: number) => {
  try {
    await chatStore.recallMessage(messageId);
  } catch (error) {
    console.error('撤回消息失败:', error);
  }
};

const handleDeleteMessage = async (messageId: number) => {
  try {
    // 这里应该调用删除消息的API
    console.log('删除消息:', messageId);
  } catch (error) {
    console.error('删除消息失败:', error);
  }
};

const handleReplyMessage = (message: Message) => {
  replyToMessage.value = message;
};

const handleForwardMessage = (message: Message) => {
  // 这里应该实现消息转发功能
  console.log('转发消息:', message);
};

const handleCopyMessage = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    console.log('复制成功');
  });
};

const handleJumpToMessage = (message: Message & { room_id: string }) => {
  // 关闭搜索对话框
  showSearchModal.value = false;
  
  // 如果消息不在当前会话，切换到对应会话
  if (chatStore.currentConversation?.id !== message.conversation_id) {
    const targetConversation = chatStore.conversations.find(c => c.id === message.conversation_id);
    if (targetConversation) {
      chatStore.switchConversation(targetConversation);
    }
  }
  
  // 滚动到指定消息
  setTimeout(() => {
    const messageElement = document.getElementById(`message-${message.id}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // 高亮显示消息
      messageElement.classList.add('highlight-message');
      setTimeout(() => {
        messageElement.classList.remove('highlight-message');
      }, 2000);
    }
  }, 500);
};

const getFileType = (file: File): MessageType => {
  // 根据MessageType定义，文件类型统一为'file'
  return 'file';
};

// 模拟对方回复的功能
const simulateReply = (originalMessage: string) => {
  if (!chatStore.currentConversation) return;
  
  const replies = [
    '收到！',
    '好的',
    '了解',
    '明白了',
    '谢谢',
    '没问题',
    '很有意思',
    '不错',
    '很好'
  ];
  
  let reply = '';
  if (originalMessage.includes('？') || originalMessage.includes('?')) {
    reply = ['是的', '没错', '当然', '应该是这样的'][Math.floor(Math.random() * 4)];
  } else if (originalMessage.includes('谢谢') || originalMessage.includes('感谢')) {
    reply = ['不客气', '不用谢', '应该的'][Math.floor(Math.random() * 3)];
  } else if (originalMessage.includes('再见') || originalMessage.includes('拜拜')) {
    reply = ['再见', '拜拜', '下次见'][Math.floor(Math.random() * 3)];
  } else {
    reply = replies[Math.floor(Math.random() * replies.length)];
  }
  
  const otherUserId = getOtherUserId(chatStore.currentConversation);
  
  const replyMessage: Message = {
    id: Date.now(),
    conversation_id: chatStore.currentConversation.id,
    content: reply,
    sender_id: otherUserId,
    message_type: 'text',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_read: false,
    status: 'sent',
    sender: {
      id: otherUserId,
      username: chatStore.currentConversation.name,
      avatar: chatStore.currentConversation.avatar || ''
    }
  };
  
  chatStore.addMessageToStore(replyMessage);
};

const handleTyping = (isTyping: boolean) => {
  if (!chatStore.currentConversation) return;
  chatStore.sendTypingIndicator(chatStore.currentConversation.id, isTyping);
};

const handleLoadMore = async () => {
  if (!chatStore.currentConversation) return;
  
  try {
    const currentCount = chatStore.currentMessages.length;
    const page = Math.floor(currentCount / 50) + 1;
    await chatStore.fetchMessages(chatStore.currentConversation.id, page);
    
    // 如果返回的消息数量少于50，说明没有更多消息了
    const newCount = chatStore.currentMessages.length;
    if (newCount - currentCount < 50) {
      hasMore.value = false;
    }
  } catch (error) {
    console.error('加载更多消息失败:', error);
  }
};

const handleCreateChat = async () => {
  if (!newChatUserId.value.trim()) return;
  
  try {
    await chatStore.createRoom([newChatUserId.value.trim()]);
    showNewChatModal.value = false;
    newChatUserId.value = '';
  } catch (error) {
    console.error('创建聊天失败:', error);
  }
};

// 修复getOtherUserId函数，确保返回正确的用户ID类型
const getOtherUserId = (room: ConversationListItem): number => {
  console.log('🔍 获取对方用户ID:', {
    roomType: room.type,
    participants: room.participants,
    currentUserId: currentUserId.value
  });
  
  if (room.type === 'single' && room.participants) {
    // 查找不是当前用户的另一个用户
    const otherUser = room.participants.find(participant => participant.id !== currentUserId.value);
    const otherUserId = otherUser?.id || 0;
    
    console.log('🔍 找到对方用户ID:', { otherUser, otherUserId });
    return otherUserId;
  }
  return 0;
};

// 完善最后在线时间显示
const getLastSeenText = (room: ConversationListItem): string => {
  if (room.type === 'group') {
    return `${room.member_count || room.participants?.length || 0} 位成员`;
  }
  
  const otherUserId = getOtherUserId(room);
  if (otherUserId && chatStore.onlineUsers.includes(otherUserId)) {
    return '在线';
  }
  
  // 这里可以根据实际的最后在线时间来显示
  // 目前显示为离线状态
  return '离线';
};

// 添加获取用户在线状态的辅助函数
const getUserOnlineStatus = (userId: number): boolean => {
  return chatStore.onlineUsers.includes(userId);
};

// 添加获取在线状态文本的辅助函数
const getOnlineStatusText = (userId: number): string => {
  return getUserOnlineStatus(userId) ? '在线' : '离线';
};

// 搜索功能
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  const query = searchQuery.value.toLowerCase();
  const results: (Message & { room_id: string })[] = [];
  
  // 搜索所有房间的消息
  Object.entries(chatStore.messages).forEach(([roomId, messages]) => {
    const filteredMessages = messages.filter(message => 
      message.message_type === 'text' && 
      message.content.toLowerCase().includes(query)
    );
    
    // 为每个消息添加房间ID
    filteredMessages.forEach(message => {
      results.push({
        ...message,
        room_id: roomId
      });
    });
  });
  
  // 按时间排序（最新的在前）
  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  searchResults.value = results.slice(0, 10); // 限制结果数量
};

const handleMessageSearch = async () => {
  if (!messageSearchQuery.value.trim()) {
    messageSearchResults.value = [];
    return;
  }
  
  try {
    const result = await chatStore.searchMessages({
      query: messageSearchQuery.value,
      room_id: chatStore.currentConversation?.id,
      limit: 20
    });
    
    messageSearchResults.value = result.messages;
  } catch (error) {
    console.error('搜索消息失败:', error);
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
};

const jumpToMessage = (message: Message & { room_id: string }) => {
  // 找到对应的房间并切换
  const room = chatStore.rooms.find(r => r.id === message.room_id);
  if (room) {
    chatStore.switchRoom(room);
    // 清空搜索
    searchQuery.value = '';
    searchResults.value = [];
    showSearchModal.value = false;
    messageSearchQuery.value = '';
    messageSearchResults.value = [];
  }
};

const getRoomName = (roomId: string): string => {
  const room = chatStore.rooms.find(r => r.id === roomId);
  return room ? room.name : '未知聊天室';
};

const formatSearchTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return '刚才';
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}天前`;
  }
};

// 监听器
watch(searchQuery, () => {
  if (searchQuery.value.trim()) {
    handleSearch();
  } else {
    searchResults.value = [];
  }
}, { debounce: 300 });

watch(messageSearchQuery, () => {
  if (messageSearchQuery.value.trim()) {
    handleMessageSearch();
  } else {
    messageSearchResults.value = [];
  }
}, { debounce: 300 });

// 生命周期
onMounted(async () => {
  await chatStore.initialize();
});

onUnmounted(() => {
  chatStore.disconnectWebSocket();
});

// New method for MessageSearch component
const handleJumpToMessage = (message: Message) => {
  jumpToMessage(message);
};

// 群聊成员管理相关处理函数
const handleAddMember = () => {
  showAddMemberModal.value = true;
};

const handleMemberRemoved = (member: any) => {
  console.log('成员已移除:', member);
  // 刷新会话列表以更新成员数量
  chatStore.fetchConversations();
};

const handleMemberUpdated = (member: any) => {
  console.log('成员信息已更新:', member);
  // 可以在这里添加成功提示或其他逻辑
};

const handleAddMemberSuccess = () => {
  console.log('成员添加成功');
  showAddMemberModal.value = false;
  // 刷新会话列表和成员列表
  chatStore.fetchConversations();
};

// 新增的房间操作处理函数
const handleRoomSettings = (room: ConversationListItem) => {
  console.log('打开房间设置:', room);
  // 可以在这里打开房间设置模态框
  if (room.type === 'group') {
    showMembersModal.value = true;
  } else {
    // 单聊设置（待实现）
    console.log('单聊设置功能待实现');
  }
};

const handleRoomDelete = (room: ConversationListItem) => {
  console.log('房间已删除:', room);
  // 如果删除的是当前房间，清空当前选择
  if (chatStore.currentConversation?.id === room.id) {
    chatStore.currentConversation = null;
  }
};

const handleRoomLeave = (room: ConversationListItem) => {
  console.log('已退出房间:', room);
  // 如果退出的是当前房间，清空当前选择
  if (chatStore.currentConversation?.id === room.id) {
    chatStore.currentConversation = null;
  }
};

// 通话相关功能
const handleVoiceCall = () => {
  console.log('发起语音通话');
  // 这里可以实现语音通话功能
  alert('语音通话功能正在开发中...');
};

const handleVideoCall = () => {
  console.log('发起视频通话');
  // 这里可以实现视频通话功能
  alert('视频通话功能正在开发中...');
};
</script>

<style scoped>
.chat-page {
  max-height: 100vh;
  overflow: hidden;
}

.chat-sidebar {
  min-width: 320px;
  max-width: 400px;
  transition: all 0.3s ease;
}

.chat-main {
  min-width: 0;
  transition: all 0.3s ease;
}

/* 聊天室列表动画 */
.chat-sidebar .chat-room-item {
  transition: all 0.2s ease;
}

.chat-sidebar .chat-room-item:hover {
  transform: translateX(2px);
}

/* 消息输入框样式 */
.message-input {
  transition: all 0.3s ease;
}

.message-input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 连接状态指示器动画 */
.connection-indicator {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 消息气泡动画 */
.message-bubble {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 打字指示器动画 */
.typing-indicator {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 搜索结果样式 */
.search-results {
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style> 