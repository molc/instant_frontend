<template>
  <div class="sidebar">
    <div class="sidebar-card">
      <div class="sidebar-header">
        <h3>会话列表</h3>
        <el-button type="primary" size="small" @click="$emit('create-conversation')" class="new-chat-btn">
          <el-icon><Plus /></el-icon>
          新建会话
        </el-button>
      </div>
      
      <div class="search-section">
        <div class="search-container">
          <input
            v-model="searchText"
            type="text"
            placeholder="搜索会话..."
            class="search-input"
          />
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div class="conversation-list">
        <div
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          :class="['conversation-item', { active: currentConversation?.id === conversation.id }]"
          @click="$emit('select-conversation', conversation)"
          @contextmenu.prevent="$emit('context-menu', $event, conversation)"
        >
          <div class="conversation-avatar">
            <el-avatar 
              :size="40"
              :style="{
                backgroundColor: conversation.type === 'single' && isUserOnline(conversation) 
                  ? '#10b981' 
                  : '#6b7280',
                color: 'white'
              }"
            >
              {{ getConversationDisplayName(conversation).charAt(0).toUpperCase() }}
            </el-avatar>
          </div>
          <div class="conversation-info">
            <div class="conversation-name">{{ getConversationDisplayName(conversation) }}</div>
            <div class="conversation-last-message">
              {{ getLastMessageText(conversation) }}
            </div>
          </div>
          <div class="conversation-meta">
            <div class="conversation-time">{{ formatTime(conversation.updated_at) }}</div>
            <!-- 始终渲染未读气泡，未读数为0时隐藏但保留占位 -->
            <div
              class="unread-count"
              :style="{ visibility: getUnreadCount(conversation) === 0 ? 'hidden' : 'visible' }"
            >
              {{ getUnreadCount(conversation) }}
            </div>
            <div class="conversation-actions" @click.stop="">
              <el-dropdown trigger="click" placement="bottom-end" @click.stop="">
                <el-button size="small" class="action-btn" @click.stop="">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>

                    <!-- 清空聊天记录 -->
                    <el-dropdown-item
                      @click.stop="$emit('clear-conversation', conversation)"
                    >
                      <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
                        <path d="M832 64H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zM288 448h448v64H288v-64zm0 144h448v64H288v-64zm0-288h448v64H288v-64z"/>
                      </svg>
                      清空聊天记录
                    </el-dropdown-item>
                    <!-- 退出群聊/删除会话/管理群聊 -->
                    <el-dropdown-item @click.stop="handleActionClick(conversation)" divided>
                      <el-icon>
                        <UserFilled v-if="conversation.type === 'group' && isGroupOwner(conversation)" />
                        <Delete v-else />
                      </el-icon>
                      {{ getActionText(conversation) }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElButton, ElInput, ElIcon, ElAvatar, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { Plus, MoreFilled, Setting, Delete, UserFilled } from '@element-plus/icons-vue';
import { useChatStore } from '../../stores/chat';
import { useAuthStore } from '../../stores/auth';
import type { ConversationListItem, Conversation } from '../../types/chat';

interface Props {
  currentConversation?: Conversation | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'select-conversation': [conversation: ConversationListItem];
  'create-conversation': [];
  'context-menu': [event: MouseEvent, conversation: ConversationListItem];
  'delete-conversation': [conversation: ConversationListItem];
  'quit-conversation': [conversation: ConversationListItem];
  'manage-conversation': [conversation: ConversationListItem];
  'clear-conversation': [conversation: ConversationListItem];
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();
const searchText = ref('');

// 过滤会话列表
const filteredConversations = computed(() => {
  if (!searchText.value) return chatStore.conversations;
  
  return chatStore.conversations.filter(conversation => {
    const name = getConversationDisplayName(conversation);
    return name.toLowerCase().includes(searchText.value.toLowerCase());
  });
});

// 获取会话显示名称
const getConversationDisplayName = (conversation: ConversationListItem): string => {
  if (conversation.type === 'group') {
    return conversation.name || '群聊';
  }
  
  // 单聊：显示对方用户名
  const otherUser = conversation.participants?.find(p => p.id !== authStore.user?.id);
  return otherUser?.name || '未知用户';
};

// 检查用户是否在线
const isUserOnline = (conversation: ConversationListItem): boolean => {
  if (conversation.type !== 'single') return false;
  const otherUser = conversation.participants?.find(p => p.id !== authStore.user?.id);
  if (!otherUser) return false;
  return chatStore.onlineUsers.includes(otherUser.id);
};

// 获取最后一条消息文本
const getLastMessageText = (conversation: ConversationListItem): string => {
  const messages = chatStore.messages[conversation.id] || [];
  if (messages.length === 0) return '暂无消息';
  
  const lastMessage = messages[messages.length - 1];
  switch (lastMessage.message_type) {
    case 'text':
      return lastMessage.content || '';
    case 'file':
      return '[文件]';
    case 'location':
      return '[位置]';
    default:
      return '消息';
  }
};

// 格式化时间
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 24 * 60 * 60 * 1000) {
    // 今天
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    // 本周
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `周${weekdays[date.getDay()]}`;
  } else {
    // 更早
    return date.toLocaleDateString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit' 
    });
  }
};

// 获取未读消息数
const getUnreadCount = (conversation: ConversationListItem): number => {
  // 当前会话不显示未读数
  if (props.currentConversation?.id === conversation.id) {
    return 0;
  }

  // 优先使用会话的未读数（由后端或状态管理维护）
  if (typeof conversation.unread_count === 'number') {
    return conversation.unread_count;
  }

  // 退化方案：本地计算
  const messages = chatStore.messages[conversation.id] || [];
  return messages.filter(m => m.status !== 'read' && m.sender_id !== authStore.user?.id).length;
};

// 检查用户是否是群主
const isGroupOwner = (conversation: ConversationListItem): boolean => {
  if (conversation.type !== 'group') return false;
  return conversation.creator_id === authStore.user?.id;
};

// 获取操作按钮文本
const getActionText = (conversation: ConversationListItem): string => {
  if (conversation.type === 'group') {
    return isGroupOwner(conversation) ? '管理群聊' : '退出群聊';
  } else {
    return '删除会话';
  }
};

// 操作按钮点击处理
const handleActionClick = (conversation: ConversationListItem) => {
  if (conversation.type === 'group') {
    if (isGroupOwner(conversation)) {
      // 群主点击 - 打开群聊管理设置
      emit('manage-conversation', conversation);
    } else {
      // 普通成员点击 - 退出群聊
      emit('quit-conversation', conversation);
    }
  } else {
    // 单聊 - 删除会话
    emit('delete-conversation', conversation);
  }
};
</script>

<style scoped>
.sidebar {
  width: 320px;
  background: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.sidebar-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  height: 100%;
  overflow: hidden;
}

.sidebar-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 1.5rem;
  color: white;
  margin: -24px -24px 24px -24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.025em;
}

.new-chat-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 10px;
  font-size: 13px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  }
}

.search-section {
  margin-bottom: 24px;
  flex-shrink: 0;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  
  .search-input {
    width: 100%;
    padding: 12px 16px 12px 40px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 14px;
    background-color: #f8fafc;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      background-color: white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    &::placeholder {
      color: #94a3b8;
    }
  }
  
  .search-icon {
    position: absolute;
    left: 12px;
    width: 18px;
    height: 18px;
    color: #94a3b8;
    pointer-events: none;
  }
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  margin: 0 -8px;
  padding: 0 8px;
  /* 添加更好的滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.conversation-list::-webkit-scrollbar {
  width: 4px;
}

.conversation-list::-webkit-scrollbar-track {
  background: transparent;
}

.conversation-list::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}

.conversation-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 16px 12px;
  margin-bottom: 4px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.conversation-item:hover {
  background-color: #f8fafc;
}

.conversation-item.active {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%);
  border: 1px solid rgba(79, 172, 254, 0.3);
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.2);
  border-left: 4px solid #4facfe;
}

.conversation-item.active .conversation-name {
  color: #1e40af;
  font-weight: 600;
}

.conversation-item.active .conversation-last-message {
  color: #4b5563;
}

.conversation-avatar {
  margin-right: 12px;
  position: relative;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-name {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  margin-bottom: 4px;
}

.conversation-last-message {
  color: #6b7280;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.conversation-time {
  color: #9ca3af;
  font-size: 11px;
  margin-bottom: 4px;
}

.unread-count {
  background-color: #ef4444;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  margin-bottom: 4px;
}

.conversation-actions {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.conversation-item:hover .conversation-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px;
  border: none;
  background: transparent;
  color: #6b7280;
  border-radius: 4px;
}

.action-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}
</style> 