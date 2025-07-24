<template>
  <div class="chat-view">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="geometric-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
        <div class="shape shape-6"></div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="chatStore.isLoading" class="loading-container">
      <div class="loading-card">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>正在连接...</p>
        </div>
      </div>
    </div>
    
    <!-- 主聊天界面 -->
    <div v-else class="chat-container">
      <!-- 顶部状态栏 -->
      <div class="status-bar">
        <div class="status-card">
          <div class="left-section">
            <h2>即时通讯</h2>
            <span :class="['connection-status', chatStore.connectionStatus]">
              <div :class="['status-dot', chatStore.connectionStatus]"></div>
              {{ chatStore.connectionStatus === 'connected' ? '已连接' : '连接中...' }}
            </span>
          </div>
          <div class="right-section">
            <div class="user-info">
              <el-avatar :size="32">
                {{ authStore.user?.name?.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="username">{{ authStore.user?.name }}</span>
            </div>
            <el-button type="primary" size="small" @click="logout" class="logout-btn">
              <el-icon style="margin-right: 0.5rem;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </el-icon>
              退出
            </el-button>
          </div>
        </div>
      </div>

      <div class="main-content">
        <!-- 左侧会话列表 -->
        <ConversationList
          :currentConversation="chatStore.currentConversation"
          @select-conversation="selectConversation"
          @create-conversation="showCreateRoomDialog"
          @context-menu="showConversationContextMenu"
          @delete-conversation="handleDeleteConversation"
          @quit-conversation="handleQuitConversation"
          @clear-conversation="handleClearMessages"
          @manage-conversation="handleManageConversation"
        />

        <!-- 右侧消息区域 -->
        <div class="message-area">
          <div class="message-area-card">
            <div v-if="!chatStore.currentConversation" class="no-conversation-selected">
              <div class="welcome-message">
                <div class="welcome-icon">
                  <svg class="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3>选择一个会话开始聊天</h3>
                <p>从左侧选择或创建新的聊天会话</p>
              </div>
            </div>
            
            <div v-else class="conversation-content">
              <!-- 聊天头部 -->
              <div class="chat-header">
                <div class="chat-header-info">
                  <div class="avatar-container">
                    <el-avatar 
                      :size="36"
                      :style="{
                        backgroundColor: chatStore.currentConversation.type === 'single' && isUserOnline(chatStore.currentConversation) 
                          ? '#10b981' 
                          : '#6b7280',
                        color: 'white'
                      }"
                    >
                      {{ getConversationDisplayName(chatStore.currentConversation).charAt(0).toUpperCase() }}
                    </el-avatar>
                  </div>
                  <div class="chat-title">
                    <h3>{{ getConversationDisplayName(chatStore.currentConversation) }}</h3>
                  </div>
                </div>
                <div class="conversation-actions">
                  <!-- 群聊成员按钮 (仅群聊显示) -->
                  <button 
                    v-if="chatStore.currentConversation?.type === 'group'"
                    class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    @click="showMembersModal = true"
                    title="群聊成员"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  
                  <!-- 聊天设置组件 -->
                  <ChatSettings />
                </div>
              </div>

              <!-- 消息列表 -->
              <div ref="messagesContainer" class="messages-container">
                <div
                  v-for="message in chatStore.currentMessages"
                  :key="message.id"
                  :class="['message-wrapper', { 'own-message': isOwnMessage(message) }]"
                >
                  <div class="message-bubble">
                    <!-- 显示发送者头像（非自己发送的消息） -->
                    <div v-if="!isOwnMessage(message)" class="sender-avatar">
                      <el-avatar 
                        :size="28"
                        :style="{
                          backgroundColor: isUserOnlineById(message.sender_id) ? '#10b981' : '#6b7280',
                          color: 'white'
                        }"
                      >
                        {{ getSenderName(message)?.charAt(0).toUpperCase() || 'U' }}
                      </el-avatar>
                      <!-- 在线状态指示器 -->
                      <div 
                        v-if="chatStore.currentConversation?.type === 'group'"
                        :class="['online-indicator', isUserOnlineById(message.sender_id) ? 'online' : 'offline']"
                      ></div>
                    </div>
                    
                  <div class="message-content">
                      <!-- 显示发送者姓名（群聊中的非自己发送的消息） -->
                      <div v-if="!isOwnMessage(message) && chatStore.currentConversation?.type === 'group'" class="sender-name">
                        {{ getSenderName(message) }}
                      </div>
                    <!-- 替换原始文本显示，支持文件消息 -->
                    <template v-if="isFileMessage(message)">
                      <div :class="[
                        'file-message flex items-center space-x-2 rounded border',
                        isOwnMessage(message) 
                          ? 'bg-white/20 border-white/30' 
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                      ]">
                        <!-- 根据文件类型显示不同图标 -->
                        <div class="flex-shrink-0">
                          <!-- 图片文件图标 -->
                          <svg v-if="isImageFile(getFileName(message))" class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <!-- 视频文件图标 -->
                          <svg v-else-if="isVideoFile(getFileName(message))" class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <!-- 音频文件图标 -->
                          <svg v-else-if="isAudioFile(getFileName(message))" class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          <!-- PDF文件图标 -->
                          <svg v-else-if="isPdfFile(getFileName(message))" class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <!-- Markdown文件图标 -->
                          <svg v-else-if="isMarkdownFile(getFileName(message))" class="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2 3h20a1 1 0 011 1v16a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1zm1 2v14h18V5H3zm2 2h2l2 4 2-4h2v10h-2v-6l-2 4-2-4v6H5V7z"/>
                          </svg>
                          <!-- Word文档图标 -->
                          <svg v-else-if="isDocumentFile(getFileName(message))" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <!-- Excel表格图标 -->
                          <svg v-else-if="isSpreadsheetFile(getFileName(message))" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4 4 4-4" />
                          </svg>
                          <!-- PPT演示图标 -->
                          <svg v-else-if="isPresentationFile(getFileName(message))" class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                          </svg>
                          <!-- 通用文件图标 -->
                          <svg v-else class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span :class="[
                          'text-sm font-medium flex-1',
                          isOwnMessage(message) ? 'text-white' : 'text-gray-900 dark:text-white'
                        ]">
                          {{ getFileName(message) || '未知文件' }}
                        </span>
                        <span :class="[
                          'text-xs',
                          isOwnMessage(message) ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        ]">
                          {{ formatFileSize(getFileSize(message)) }}
                        </span>
                        <button
                          v-if="getFileId(message)"
                          @click="downloadFile(getFileId(message)!, getFileName(message))"
                          :class="[
                            'ml-2 px-2 py-1 text-xs rounded transition-colors',
                            isOwnMessage(message) 
                              ? 'bg-white/20 text-white hover:bg-white/30' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          ]"
                        >下载</button>
                      </div>
                    </template>
                    <!-- 文本消息 -->
                    <template v-else>
                      <div class="message-text">{{ message.content }}</div>
                    </template>
                    <div class="message-time">{{ formatTime(message.created_at) }}</div>
                    </div>
                  </div>
                </div>
                
                <!-- 打字指示器 -->
                <div v-if="isTyping" class="typing-indicator">
                  <div class="typing-avatar">
                    <el-avatar 
                      :size="28"
                      :style="{
                        backgroundColor: '#10b981',
                        color: 'white'
                      }"
                    >
                      {{ getConversationDisplayName(chatStore.currentConversation).charAt(0).toUpperCase() }}
                    </el-avatar>
                    <!-- 在线状态指示器 -->
                    <div class="online-indicator online"></div>
                  </div>
                  <div class="typing-bubble">
                  <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  </div>
                </div>
              </div>

              <!-- 消息输入 -->
              <div class="message-input-container">
                <div class="input-wrapper">
                  <div class="input-section">
                    <!-- 🔧 调试：两个文件上传按钮 -->
                              <button class="attachment-btn" @click="handleFileUpload" title="文件上传">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <!-- 简单截图按钮 -->
          <button class="screenshot-btn" @click="handleScreenshot" title="简单截图">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
                    
                    <input
                      ref="fileInput"
                      type="file"
                      multiple
                      style="display: none"
                      @change="handleFileSelect"
                    />
                    <div class="input-wrapper-inner">
                      <input
                    v-model="newMessage"
                    placeholder="输入消息... (💡 截图后可直接粘贴 Ctrl+V)"
                    class="message-input"
                        @keydown.enter.prevent="sendMessage"
                    @input="handleTyping"
                    @paste="handlePaste"
                  />
                    </div>
                    <button 
                    @click="sendMessage" 
                    :disabled="!newMessage.trim()"
                    class="send-btn"
                  >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建会话对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建新会话" width="600px">
      <el-form :model="createConversationForm" label-width="80px">
        <el-form-item label="会话类型">
          <el-radio-group v-model="createConversationForm.type">
            <el-radio value="single">私聊</el-radio>
            <el-radio value="group">群聊</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="createConversationForm.type === 'group'" label="群组名称">
          <el-input v-model="createConversationForm.name" placeholder="请输入群组名称" />
        </el-form-item>
        
        <el-form-item v-if="createConversationForm.type === 'single'" label="选择用户">
          <UserSearch @user-selected="handleUserSelected" ref="userSearchRef" />
        </el-form-item>
        
        <el-form-item v-if="createConversationForm.type === 'group'" label="添加成员">
          <UserSearch :multiple="true" @users-selected="handleUsersSelected" ref="groupUserSearchRef" />
        </el-form-item>
        
        <el-form-item v-if="createConversationForm.type === 'group'" label="群组描述">
          <el-input v-model="createConversationForm.description" type="textarea" placeholder="请输入群组描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelCreateConversation">取消</el-button>
        <el-button type="primary" @click="createConversation" :disabled="!canCreateConversation">创建</el-button>
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

    <!-- 添加成员模态框 -->
    <el-dialog
      v-model="showAddMemberModal"
      title="添加群聊成员"
      width="500px"
      center
    >
      <AddMemberModal
        v-if="chatStore.currentConversation && showAddMemberModal"
        :conversation-id="chatStore.currentConversation.id"
        @cancel="showAddMemberModal = false"
        @success="handleAddMemberSuccess"
      />
    </el-dialog>

    <!-- 通知管理器 - 处理所有WebSocket事件通知 -->
    <NotificationManager />
    
    <!-- 简单截图 -->
    <SimpleScreenshot 
      ref="simpleScreenshotRef"
      @screenshot-taken="handleSimpleScreenshot"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Setting, Delete, Right } from '@element-plus/icons-vue';
import ChatSettings from '@/components/chat/ChatSettings.vue';
import AddMemberModal from '@/components/chat/AddMemberModal.vue';
import type { ConversationListItem } from '@/types/chat';
import type { User } from '@/types/auth';
import UserSearch from '@/components/chat/UserSearch.vue';
import NotificationManager from '@/components/chat/NotificationManager.vue';
import ConversationList from '@/components/chat/ConversationList.vue';
import GroupMembersList from '@/components/chat/GroupMembersList.vue';
import SimpleScreenshot from '@/components/chat/SimpleScreenshot.vue';
import type { Message } from '@/types/chat';

const authStore = useAuthStore();
const chatStore = useChatStore();
const router = useRouter();

// 响应式数据
const newMessage = ref('');
const showCreateDialog = ref(false);
const showMembersModal = ref(false);
const showAddMemberModal = ref(false);
const messagesContainer = ref<HTMLElement>();
const fileInput = ref<HTMLInputElement>();
const simpleScreenshotRef = ref<InstanceType<typeof SimpleScreenshot>>();

// 创建会话表单
const createConversationForm = ref({
  type: 'single' as 'single' | 'group',
  name: '',
  description: '',
  targetUserId: null as number | null,
  selectedUser: null as User | null,
  selectedUsers: [] as User[]
});

// 用户搜索组件引用
const userSearchRef = ref();
const groupUserSearchRef = ref();

// 计算属性
const isDevelopment = computed(() => {
  return import.meta.env.DEV || location.hostname === 'localhost';
});

const isTyping = computed(() => {
  const currentConvId = chatStore.currentConversation?.id;
  if (!currentConvId) return false;
  
  const typingUsers = chatStore.typing[currentConvId] || [];
  return typingUsers.length > 0;
});

const canCreateConversation = computed(() => {
  const form = createConversationForm.value;
  
  if (form.type === 'single') {
    return form.selectedUser !== null;
  } else {
    return form.name.trim() !== '' && form.selectedUsers.length > 0;
  }
});

// 检查用户是否在线 - 仅用于聊天头部
const isUserOnline = (conversation: any): boolean => {
  if (conversation.type !== 'single') return false;
  
  // 获取对方用户ID
  const otherUser = conversation.participants?.find((p: any) => p.id !== authStore.user?.id);
  if (!otherUser) return false;
  
  return chatStore.onlineUsers.includes(otherUser.id);
};

// 检查指定用户ID是否在线 - 用于群聊消息发送者状态
const isUserOnlineById = (userId: number): boolean => {
  return chatStore.onlineUsers.includes(userId);
};

// 方法
const selectConversation = async (conversation: ConversationListItem) => {
  // 如果已经是当前会话，避免重复加载
  if (chatStore.currentConversation?.id === conversation.id) {
    return;
  }
  
  try {
    await chatStore.switchConversation(conversation);
    
    // 延迟滚动避免DOM未更新
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('切换会话失败:', error);
    ElMessage.error('切换会话失败');
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !chatStore.currentConversation) return;
  
  try {
    await chatStore.sendTextMessage({
      conversation_id: chatStore.currentConversation.id,
      content: newMessage.value.trim()
    });
    
    newMessage.value = '';
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送消息失败');
  }
};

const handleTyping = () => {
  if (!chatStore.currentConversation) return;
  
  chatStore.sendTypingIndicator({
    conversation_id: chatStore.currentConversation.id,
    is_typing: true
  }).catch(error => {
    console.warn('发送打字指示器失败:', error);
  });
};

// 处理粘贴事件（支持图片粘贴 - 推荐方式）
const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items || !chatStore.currentConversation) return;
  
  console.log('📋 检测到粘贴事件');
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log('📄 剪贴板内容类型:', item.type);
    
    // 检查是否为图片
    if (item.type.indexOf('image') !== -1) {
      event.preventDefault();
      
      const file = item.getAsFile();
      if (file) {
        try {
          console.log('🖼️ 检测到图片粘贴:', file.size, 'bytes', file.type);
          
          // 创建一个更友好的文件名
          const timestamp = new Date().toLocaleString('zh-CN').replace(/[\/\s:]/g, '-');
          const renamedFile = new File([file], `截图-${timestamp}.png`, { type: file.type });
          
          // 友好的提示消息
          ElMessage.info('📋 检测到截图，正在上传... (推荐方式！)');
          
          // 上传文件并发送
          const uploadResponse = await chatStore.uploadFile(renamedFile);
          
          await chatStore.sendFileMessage(
            chatStore.currentConversation.id,
            uploadResponse.file_id,
            uploadResponse.file_name,
            uploadResponse.file_size
          );
          
          ElMessage.success('🎉 截图发送成功！使用粘贴是最简单的方式！');
          
          // 滚动到底部
          await nextTick();
          scrollToBottom();
          
        } catch (error) {
          console.error('粘贴图片失败:', error);
          ElMessage.error('粘贴图片失败，请重试');
        }
        break;
      }
    }
  }
};



const isOwnMessage = (message: any): boolean => {
  return message.sender_id === authStore.user?.id;
};

const getSenderName = (message: any): string => {
  // 优先使用消息中的发送者姓名
  if (message.sender_name) {
    return message.sender_name;
  }
  
  // 如果没有发送者姓名，根据sender_id判断
  if (message.sender_id === authStore.user?.id) {
    return authStore.user?.name || '我';
  }
  
  // 从对话列表中查找当前对话的参与者信息
  if (chatStore.currentConversation) {
    const conversationItem = chatStore.conversations.find(conv => conv.id === chatStore.currentConversation!.id);
    if (conversationItem?.participants) {
      const participant = conversationItem.participants.find((p: any) => p.id === message.sender_id);
      if (participant) {
        return participant.name || participant.standard_id;
      }
    }
  }
  
  // 如果消息有sender_standard_id，使用它
  if (message.sender_standard_id) {
    return message.sender_standard_id;
  }
  
  // 最后的备选方案 - 显示更友好的名称
  return `用户${message.sender_id}`;
};

const formatTime = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('zh-CN', { 
      weekday: 'short',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
};

const getConversationDisplayName = (conversation: ConversationListItem): string => {
  // 如果有设置的名称，直接返回
  if (conversation.name && conversation.name.trim()) {
    return conversation.name;
  }
  
  // 对于单聊，显示对方的名称
  if (conversation.type === 'single' && conversation.participants && conversation.participants.length > 0) {
    // 找到不是当前用户的参与者
    const currentUserId = authStore.user?.id;
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
    
    if (otherParticipant) {
      return otherParticipant.name || otherParticipant.standard_id;
    }
  }
  
  // 默认返回未命名会话
  return '未命名会话';
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const showCreateRoomDialog = () => {
  showCreateDialog.value = true;
  createConversationForm.value = {
    type: 'single',
    name: '',
    description: '',
    targetUserId: null,
    selectedUser: null,
    selectedUsers: []
  };
};

// 处理删除会话
const handleDeleteConversation = async (conversation: ConversationListItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除与"${getConversationDisplayName(conversation)}"的会话吗？`,
      '删除会话',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await chatStore.deleteConversation(conversation.id);
    ElMessage.success('会话已删除');
    
    // 如果删除的是当前会话，清空当前会话
    if (chatStore.currentConversation?.id === conversation.id) {
      chatStore.currentConversation = null;
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除会话失败:', error);
      ElMessage.error('删除会话失败');
    }
  }
};

// 退出群聊
const handleQuitConversation = async (conversation: ConversationListItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要退出群聊\n\n${getConversationDisplayName(conversation)}`,
      '退出群聊',
      {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await chatStore.leaveConversation(conversation.id, authStore.user!.id);
    ElMessage.success('已退出群聊');
  } catch {}
};

// 处理群聊管理
const handleManageConversation = async (conversation: ConversationListItem) => {
  try {
    // 先选择这个会话
    await selectConversation(conversation);
    
    // 打开群聊成员管理模态框
    showMembersModal.value = true;
  } catch (error) {
    console.error('打开群聊管理失败:', error);
    ElMessage.error('打开群聊管理失败');
  }
};

// 处理用户选择
const handleUserSelected = (user: User) => {
  createConversationForm.value.selectedUser = user;
  createConversationForm.value.targetUserId = user.id;
};

// 处理多用户选择
const handleUsersSelected = (users: User[]) => {
  createConversationForm.value.selectedUsers = users;
};

// 取消创建会话
const cancelCreateConversation = () => {
  showCreateDialog.value = false;
  createConversationForm.value = {
    type: 'single',
    name: '',
    description: '',
    targetUserId: null,
    selectedUser: null,
    selectedUsers: []
  };
  
  // 清除搜索组件状态
  if (userSearchRef.value) {
    userSearchRef.value.clearSearch();
  }
  if (groupUserSearchRef.value) {
    groupUserSearchRef.value.clearSearch();
  }
};

const createConversation = async () => {
  try {
    const form = createConversationForm.value;
    
    console.log('🔄 开始创建会话:', form);
    
    if (form.type === 'single') {
      if (!form.selectedUser) {
        ElMessage.error('请选择目标用户');
        return;
      }
      
      console.log('📞 创建单聊:', form.selectedUser);
      const conversation = await chatStore.createSingleChat(form.selectedUser.id);
      console.log('✅ 单聊创建成功:', conversation);
      
      await chatStore.switchConversation(conversation);
    } else {
      if (!form.name?.trim()) {
        ElMessage.error('请输入群组名称');
        return;
      }
      
      if (form.selectedUsers.length === 0) {
        ElMessage.error('请至少选择一个成员');
        return;
      }
      
      console.log('👥 创建群聊:', { name: form.name, members: form.selectedUsers });
      const conversation = await chatStore.createGroupChat({
        name: form.name,
        description: form.description,
        member_ids: form.selectedUsers.map(user => user.id),
        max_members: 500,
        allow_invite: true,
        allow_member_modify: false
      });
      console.log('✅ 群聊创建成功:', conversation);
      
      await chatStore.switchConversation(conversation);
    }
    
    cancelCreateConversation();
    ElMessage.success('会话创建成功！');
  } catch (error: any) {
    console.error('❌ 创建会话失败:', error);
    
    const errorMessage = error.response?.data?.detail || error.message || '创建会话失败';
    ElMessage.error(`创建会话失败: ${errorMessage}`);
  }
};

// 处理会话操作
const handleConversationAction = async (command: { action: string; conversation: ConversationListItem }) => {
  const { action, conversation } = command;
  
  try {
    if (action === 'delete') {
      await ElMessageBox.confirm(
        `确定要删除会话"${getConversationDisplayName(conversation)}"吗？此操作不可恢复。`,
        '删除会话',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      );
      
      await chatStore.deleteConversation(conversation.id);
      ElMessage.success('会话已删除');
      
    } else if (action === 'leave') {
      await ElMessageBox.confirm(
        `确定要退出群聊"${getConversationDisplayName(conversation)}"吗？`,
        '退出群聊',
        {
          confirmButtonText: '退出',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
      
      const currentUserId = authStore.user?.id;
      if (!currentUserId) {
        ElMessage.error('无法获取当前用户信息');
        return;
      }
      
      await chatStore.leaveConversation(conversation.id, currentUserId);
      ElMessage.success('已退出群聊');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('操作失败:', error);
      const errorMessage = error.response?.data?.detail || error.message || '操作失败';
      ElMessage.error(errorMessage);
    }
  }
};

// 显示会话右键菜单
const showConversationContextMenu = (event: MouseEvent, conversation: ConversationListItem) => {
  // 显示会话设置选项
  showConversationSettings(conversation);
};

// 显示会话设置
const showConversationSettings = async (conversation: ConversationListItem) => {
  try {
    if (conversation.type === 'group') {
      // 群聊设置 - 打开群聊管理
      await selectConversation(conversation);
      showMembersModal.value = true;
    } else {
      // 单聊设置
      const options = ['修改备注名', '清空聊天记录', '删除会话'];
      const { value } = await ElMessageBox.prompt(
        `选择要执行的操作：\n\n1. 修改备注名\n2. 清空聊天记录\n3. 删除会话`,
        `设置 - ${getConversationDisplayName(conversation)}`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '请输入选项编号 (1-3)',
          inputValidator: (value: string) => {
            const num = parseInt(value);
            if (!value || isNaN(num) || num < 1 || num > 3) {
              return '请输入有效的选项编号 (1-3)';
            }
            return true;
          }
        }
      );
      
      const option = parseInt(value);
      switch (option) {
        case 1:
          await handleRenameConversation(conversation);
          break;
        case 2:
          await handleClearMessages(conversation);
          break;
        case 3:
          await handleDeleteConversation(conversation);
          break;
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('会话设置操作失败:', error);
    }
  }
};

// 重命名会话
const handleRenameConversation = async (conversation: ConversationListItem) => {
  try {
    const { value } = await ElMessageBox.prompt(
      '请输入新的备注名',
      '修改备注名',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: getConversationDisplayName(conversation),
        inputPlaceholder: '请输入备注名'
      }
    );
    
    if (value && value.trim()) {
      // 这里应该调用API更新会话名称
      // await chatStore.updateConversation(conversation.id, { name: value.trim() });
      ElMessage.success('备注名修改成功');
      console.log('重命名会话:', conversation.id, '新名称:', value.trim());
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重命名失败:', error);
    }
  }
};

// 清空聊天记录
const handleClearMessages = async (conversation: ConversationListItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要清空与"${getConversationDisplayName(conversation)}"的聊天记录吗？此操作无法撤销。`,
      '清空聊天记录',
      {
        confirmButtonText: '清空',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 这里应该调用API清空消息
    // await chatStore.clearMessages(conversation.id);
    await chatStore.clearConversationMessages(conversation.id);
    // 本地会话消息已在 store 方法中清空
    
    ElMessage.success('聊天记录已清空');
    console.log('清空聊天记录:', conversation.id);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空聊天记录失败:', error);
    }
  }
};

const logout = async () => {
  try {
    await authStore.logout();
    chatStore.clearChat();
    router.push('/auth');
  } catch (error) {
    console.error('登出失败:', error);
  }
};

// 文件上传处理
const handleFileUpload = () => {
  console.log('🔧 handleFileUpload 被调用');
  console.log('🔧 fileInput.value:', fileInput.value);
  
  if (!fileInput.value) {
    console.error('❌ fileInput.value 为空!');
    alert('文件输入元素未找到，请刷新页面重试');
    return;
  }
  
  try {
    console.log('🔧 尝试点击文件输入...');
    fileInput.value.click();
    console.log('✅ 文件输入点击成功');
  } catch (error) {
    console.error('❌ 点击文件输入失败:', error);
    alert('文件选择器打开失败: ' + error);
  }
};

// 浏览器兼容性诊断
const diagnoseBrowserSupport = () => {
  const userAgent = navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);
  
  console.log('🔍 浏览器诊断信息:');
  console.log('User Agent:', userAgent);
  console.log('浏览器类型:', { isChrome, isFirefox, isSafari, isEdge });
  console.log('安全上下文:', window.isSecureContext);
  console.log('协议:', location.protocol);
  console.log('主机名:', location.hostname);
  console.log('navigator.mediaDevices 存在:', !!navigator.mediaDevices);
  console.log('getDisplayMedia 存在:', !!(navigator.mediaDevices?.getDisplayMedia));
  
  return {
    hasMediaDevices: !!navigator.mediaDevices,
    hasGetDisplayMedia: !!(navigator.mediaDevices?.getDisplayMedia),
    isSecureContext: window.isSecureContext,
    browserInfo: { isChrome, isFirefox, isSafari, isEdge },
    protocol: location.protocol,
    hostname: location.hostname
  };
};

// 简单截图功能处理  
const handleScreenshot = async () => {
  console.log('📷 简单截图功能被调用');
  
  try {
    if (simpleScreenshotRef.value) {
      simpleScreenshotRef.value.openDropdown();
    } else {
      console.error('SimpleScreenshot 组件引用未找到');
      ElMessage.error('截图组件初始化失败，请刷新页面重试');
    }
  } catch (error: any) {
    console.error('截图组件调用失败:', error);
    ElMessage.error('截图功能启动失败，请刷新页面重试');
  }
};

// 简单截图完成处理
const handleSimpleScreenshot = async (blob: Blob) => {
  if (!chatStore.currentConversation) return;
  
  try {
    // 创建File对象
    const timestamp = new Date().toLocaleString('zh-CN').replace(/[\/\s:]/g, '-');
    const file = new File([blob], `截图-${timestamp}.png`, { type: 'image/png' });
    
    ElMessage.info('正在上传截图...');
    
    // 上传文件并发送
    const uploadResponse = await chatStore.uploadFile(file);
    
    await chatStore.sendFileMessage(
      chatStore.currentConversation.id,
      uploadResponse.file_id,
      uploadResponse.file_name,
      uploadResponse.file_size
    );
    
    ElMessage.success('截图发送成功！');
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
    
  } catch (error) {
    console.error('发送截图失败:', error);
    ElMessage.error('发送截图失败，请重试');
  }
};

// 显示截图替代方案
const showScreenshotAlternatives = () => {
  ElMessageBox.alert(
    `
    <div style="text-align: left;">
      <h4 style="margin-bottom: 12px; color: #409EFF;">📷 截图替代方案：</h4>
      <div style="line-height: 1.6;">
        <p><strong>🖥 系统截图快捷键：</strong></p>
        <ul style="margin-left: 20px; margin-bottom: 12px;">
          <li><strong>Windows:</strong> Win + Shift + S 或 PrtSc</li>
          <li><strong>Mac:</strong> Cmd + Shift + 4 或 Cmd + Shift + 3</li>
          <li><strong>Linux:</strong> Ctrl + Shift + PrtSc</li>
        </ul>
        
        <p><strong>📱 手机截图：</strong></p>
        <ul style="margin-left: 20px; margin-bottom: 12px;">
          <li><strong>iPhone:</strong> 侧边键 + 音量上键</li>
          <li><strong>Android:</strong> 电源键 + 音量下键</li>
        </ul>
        
        <p><strong>💡 使用建议：</strong></p>
        <ul style="margin-left: 20px;">
          <li>截图后可直接粘贴到输入框（Ctrl+V）</li>
          <li>或点击附件按钮上传截图文件</li>
          <li>建议使用最新版 Chrome 浏览器以获得最佳体验</li>
        </ul>
      </div>
    </div>
    `,
    '截图功能使用指南',
    {
      confirmButtonText: '我知道了',
      dangerouslyUseHTMLString: true,
      customClass: 'screenshot-alternatives-dialog'
    }
  );
};

// 显示浏览器诊断信息
const showBrowserDiagnosis = (diagnosis: any) => {
  const { hasMediaDevices, hasGetDisplayMedia, isSecureContext, browserInfo, protocol, hostname } = diagnosis;
  
  let browserName = 'Unknown';
  if (browserInfo.isChrome) browserName = 'Chrome';
  else if (browserInfo.isFirefox) browserName = 'Firefox';
  else if (browserInfo.isSafari) browserName = 'Safari';
  else if (browserInfo.isEdge) browserName = 'Edge';
  
  const securityStatus = isSecureContext ? '✅ 安全' : '❌ 不安全';
  const mediaDevicesStatus = hasMediaDevices ? '✅ 支持' : '❌ 不支持';
  const getDisplayMediaStatus = hasGetDisplayMedia ? '✅ 支持' : '❌ 不支持';
  
  ElMessageBox.alert(
    `
    <div style="text-align: left; font-family: monospace;">
      <h4 style="margin-bottom: 16px; color: #409EFF;">🔍 浏览器兼容性诊断</h4>
      
      <div style="background: #f5f7fa; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
        <p><strong>🌐 浏览器信息：</strong></p>
        <ul style="margin-left: 20px; line-height: 1.8;">
          <li><strong>浏览器：</strong> ${browserName}</li>
          <li><strong>连接协议：</strong> ${protocol}</li>
          <li><strong>主机名：</strong> ${hostname}</li>
          <li><strong>安全上下文：</strong> ${securityStatus}</li>
        </ul>
      </div>
      
      <div style="background: #f5f7fa; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
        <p><strong>🔧 API 支持情况：</strong></p>
        <ul style="margin-left: 20px; line-height: 1.8;">
          <li><strong>MediaDevices API：</strong> ${mediaDevicesStatus}</li>
          <li><strong>getDisplayMedia：</strong> ${getDisplayMediaStatus}</li>
        </ul>
      </div>
      
      <div style="background: #fff7e6; padding: 12px; border-radius: 6px;">
        <p><strong>💡 建议解决方案：</strong></p>
        <ul style="margin-left: 20px; line-height: 1.6;">
          ${!hasMediaDevices ? '<li>• 请升级浏览器到最新版本</li>' : ''}
          ${!hasGetDisplayMedia ? '<li>• Chrome 需要 72+ 版本，Firefox 需要 66+ 版本</li>' : ''}
          ${!isSecureContext ? '<li>• 请使用 HTTPS 连接或 localhost 开发环境</li>' : ''}
          <li>• 或使用系统截图快捷键后粘贴 (Ctrl+V)</li>
          <li>• 或使用附件上传功能</li>
        </ul>
      </div>
    </div>
    `,
    '浏览器诊断报告',
    {
      confirmButtonText: '我知道了',
      dangerouslyUseHTMLString: true,
      customClass: 'browser-diagnosis-dialog'
    }
  );
  
  // 同时提供传统的替代方案
  setTimeout(() => {
    showScreenshotAlternatives();
  }, 500);
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (!files || files.length === 0 || !chatStore.currentConversation) {
    return;
  }
  
  try {
    for (const file of files) {
      // 上传文件
      const uploadResponse = await chatStore.uploadFile(file);
      
      // 发送文件消息
      await chatStore.sendFileMessage(
        chatStore.currentConversation.id,
        uploadResponse.file_id,
        uploadResponse.file_name || uploadResponse.original_name || file.name,
        uploadResponse.file_size || file.size
      );
    }
    
    // 清空文件输入
    target.value = '';
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
  } catch (error: any) {
    console.error('文件上传失败:', error);
    
    // 显示详细的错误信息
    let errorMessage = '文件上传失败';
    if (error.response?.data?.detail) {
      // 后端API错误
      if (Array.isArray(error.response.data.detail)) {
        errorMessage = `文件上传失败: ${error.response.data.detail.map((e: any) => e.msg || e).join(', ')}`;
      } else {
        errorMessage = `文件上传失败: ${error.response.data.detail}`;
      }
    } else if (error.response) {
      // HTTP错误响应
      errorMessage = `文件上传失败: ${error.response.status} - ${error.response.statusText}`;
    } else if (error.message) {
      // 其他错误
      errorMessage = `文件上传失败: ${error.message}`;
    }
    
    ElMessage.error(errorMessage);
  }
};

// ====== 文件消息辅助函数 ======

const getMessageType = (msg: Message): string => {
  if (typeof msg.message_type === 'string') return msg.message_type;
  const map: Record<number, string> = {
    0: 'text', 1: 'file', 2: 'file', 3: 'file', 4: 'file', 5: 'file', 6: 'file', 7: 'file', 8: 'file', 9: 'file', 10: 'file', 11: 'file'
  };
  return map[msg.message_type as number] || 'text';
};

const isFileMessage = (msg: Message): boolean => getMessageType(msg) === 'file';

const getFileName = (msg: Message): string => {
  return msg.file_info?.name || msg.file_name || '未知文件';
};

const getFileSize = (msg: Message): number => {
  return msg.file_info?.size || msg.file_size || 0;
};

const getFileId = (msg: Message): string | undefined => {
  return msg.file_info?.file_id || msg.file_id;
};

const formatFileSize = (size: number): string => {
  if (!size) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  let s = size;
  while (s >= 1024 && index < units.length - 1) {
    s /= 1024;
    index++;
  }
  return `${s.toFixed(1)} ${units[index]}`;
};

const downloadFile = (fileId: string, fileName: string) => {
  if (!fileId) return;
  chatStore.downloadFile(fileId, fileName)
    .then(() => {
      // 下载成功，不显示任何消息
      console.log('文件下载成功');
    })
    .catch(err => {
      // 只有在真正失败时才显示错误
      console.error('文件下载失败:', err);
      ElMessage.error(err.message || '文件下载失败');
    });
};

// ====== 文件类型检测函数 ======
const isImageFile = (fileName?: string): boolean => {
  if (!fileName) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const isVideoFile = (fileName?: string): boolean => {
  if (!fileName) return false;
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
  return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const isAudioFile = (fileName?: string): boolean => {
  if (!fileName) return false;
  const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma'];
  return audioExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const isPdfFile = (fileName?: string): boolean => {
  if (!fileName) return false;
  return fileName.toLowerCase().endsWith('.pdf');
};

const isMarkdownFile = (fileName?: string): boolean => {
  if (!fileName) return false;
  const markdownExtensions = ['.md', '.markdown', '.mdown', '.mkd'];
  return markdownExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const isDocumentFile = (fileName?: string): boolean => {
  if (!fileName) return false;
  const docExtensions = ['.doc', '.docx', '.txt', '.rtf'];
  return docExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const isSpreadsheetFile = (fileName?: string): boolean => {
  if (!fileName) return false;
  const spreadsheetExtensions = ['.xls', '.xlsx', '.csv'];
  return spreadsheetExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const isPresentationFile = (fileName?: string): boolean => {
  if (!fileName) return false;
  const presentationExtensions = ['.ppt', '.pptx', '.odp'];
  return presentationExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

// 生命周期
onMounted(async () => {
  try {
    // 检查认证状态
    if (!authStore.isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    // 初始化聊天
    await chatStore.initialize();
  } catch (error) {
    console.error('初始化聊天失败:', error);
    ElMessage.error('初始化聊天失败');
  }
});

onBeforeUnmount(() => {
  chatStore.disconnectWebSocket();
});

// 在生命周期与方法定义之间为当前会话消息添加监听，收到新消息后自动滚动到底部
// 自动滚动：监听当前会话消息数量变化，若有新增消息则滚动到底部
watch(
  () => chatStore.currentMessages.length,
  (newLen, oldLen) => {
    if (newLen > oldLen) {
      // 等待 DOM 更新完成后再滚动
      nextTick(() => {
        scrollToBottom();
      });
    }
  }
);

// 群聊成员管理相关函数
const handleAddMember = () => {
  console.log('添加群聊成员');
  showAddMemberModal.value = true;
};

const handleAddMemberSuccess = (updatedMembers?: any) => {
  console.log('成员添加成功', updatedMembers);
  showAddMemberModal.value = false;
  
  // 重要：刷新群聊成员列表
  if (showMembersModal.value) {
    // 触发GroupMembersList重新加载成员
    // 通过重新打开模态框来刷新数据
    showMembersModal.value = false;
    nextTick(() => {
      showMembersModal.value = true;
    });
  }
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
</script>

<style scoped lang="scss">
.chat-view {
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  
  .geometric-shapes {
    position: relative;
    width: 100%;
    height: 100%;
    
    .shape {
      position: absolute;
      background: rgba(79, 172, 254, 0.05);
      border-radius: 20px;
      animation: float 6s ease-in-out infinite;
      
      &.shape-1 {
        width: 200px;
        height: 150px;
        top: 10%;
        left: 5%;
        transform: rotate(15deg);
        animation-delay: 0s;
      }
      
      &.shape-2 {
        width: 150px;
        height: 200px;
        top: 60%;
        left: 15%;
        transform: rotate(-10deg);
        animation-delay: 1s;
      }
      
      &.shape-3 {
        width: 180px;
        height: 120px;
        top: 20%;
        right: 20%;
        transform: rotate(25deg);
        animation-delay: 2s;
      }
      
      &.shape-4 {
        width: 120px;
        height: 180px;
        bottom: 20%;
        right: 5%;
        transform: rotate(-15deg);
        animation-delay: 3s;
      }
      
      &.shape-5 {
        width: 100px;
        height: 100px;
        top: 40%;
        left: 30%;
        transform: rotate(45deg);
        animation-delay: 4s;
      }
      
      &.shape-6 {
        width: 80px;
        height: 80px;
        bottom: 40%;
        right: 40%;
        transform: rotate(-30deg);
        animation-delay: 5s;
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(var(--rotation, 0deg));
  }
  50% {
    transform: translateY(-20px) rotate(var(--rotation, 0deg));
  }
}

.loading-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  
  .loading-card {
    background: white;
    border-radius: 20px;
    padding: 3rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 400px;
    
    .loading-spinner {
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4facfe;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }
      
      p {
        color: #666;
        font-size: 1rem;
        margin: 0;
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.chat-container {
  position: relative;
  z-index: 2;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  box-sizing: border-box;
}

.status-bar {
  .status-card {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    border-radius: 20px;
    padding: 1.5rem 2rem;
    box-shadow: 0 4px 20px rgba(79, 172, 254, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid rgba(79, 172, 254, 0.1);
    
    .left-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      
      h2 {
        margin: 0;
        color: white;
        font-size: 1.75rem;
        font-weight: 700;
        letter-spacing: -0.025em;
      }
      
      .connection-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          
          &.connected {
            background: #10b981;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
          }
          
          &.connecting {
            background: #f59e0b;
            animation: pulse 2s infinite;
          }
        }
      }
    }
    
    .right-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        
        .username {
          font-weight: 600;
          color: white;
        }
      }
      
      .logout-btn {
        background: #ef4444;
        border: 1px solid #dc2626;
        color: white;
        border-radius: 12px;
        padding: 0.625rem 1.25rem;
        font-weight: 500;
        font-size: 0.875rem;
        transition: all 0.2s ease;
        
        &:hover {
          background: #dc2626;
          border-color: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.main-content {
  flex: 1;
  display: flex;
  gap: 1rem;
  min-height: 0;
  height: 100%;
  align-items: stretch;
}

.sidebar {
  width: 320px;
  flex-shrink: 0;
  
  .sidebar-card {
    height: 100%;
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
}

.message-area {
  flex: 1;
  
  .message-area-card {
    height: 100%;
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.05);
    
    .no-conversation-selected {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .welcome-message {
        text-align: center;
        padding: 2rem;
        
        .welcome-icon {
          margin-bottom: 1.5rem;
          
          svg {
            width: 4rem;
            height: 4rem;
            color: #4facfe;
          }
        }
        
        h3 {
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        p {
          color: #666;
          font-size: 1rem;
        }
      }
    }
    
    .conversation-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      
      .chat-header {
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        padding: 1.5rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          
          .chat-title {
            h3 {
              margin: 0;
              font-size: 1.25rem;
              font-weight: 600;
              color: #1e293b;
            }
            
            .chat-status {
              margin: 0;
              font-size: 0.875rem;
              color: #64748b;
              margin-top: 2px;
            }
          }
        }
        
        .conversation-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          
          .action-btn {
            background: white;
            border: 1px solid #e2e8f0;
            color: #475569;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s ease;
            
            &:hover {
              background: #f1f5f9;
              border-color: #cbd5e1;
              transform: translateY(-1px);
            }
          }
        }
      }
      
      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        background: #f8f9fa;
        
        .message-wrapper {
          margin-bottom: 1rem;
          display: flex;
          
          &.own-message {
            justify-content: flex-end;
            
            .message-bubble {
              flex-direction: row-reverse;
            
            .message-content {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              color: white;
              border-radius: 15px 15px 5px 15px;
              margin-left: auto; /* Force right alignment */
              
              .message-text {
                word-break: normal !important;
                overflow-wrap: break-word !important;
                word-wrap: normal !important;
                white-space: pre-wrap;
                min-width: 120px; /* Set minimum width to align with file messages */
              }
              
              .file-message {
                /* Reset all custom spacing - use parent container spacing only */
                margin: 0;
                padding: 0;
                width: 100%;
                min-width: unset;
              }
            }
            }
          }
          
          &:not(.own-message) {
            justify-content: flex-start;
            
            .message-bubble {
              display: flex;
              gap: 0.5rem;
              
                      .sender-avatar {
          flex-shrink: 0;
          position: relative;
          
          .online-indicator {
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 2px solid white;
            
            &.online {
              background-color: #10b981;
              box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
            }
            
            &.offline {
              background-color: #6b7280;
            }
          }
        }
            
            .message-content {
              background: white;
              color: #333;
              border: 1px solid #e9ecef;
                border-radius: 5px 15px 15px 15px;
              }
            }
          }
          
          .message-content {
            max-width: 85%;
            padding: 0.75rem 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            
            .sender-name {
              font-size: 0.75rem;
              font-weight: 600;
              color: #4facfe;
              margin-bottom: 0.25rem;
            }
            
            .message-text {
              margin-bottom: 0.25rem;
              line-height: 1.4;
              word-break: normal !important;
              overflow-wrap: break-word !important;
              hyphens: auto;
              word-wrap: normal !important;
              white-space: pre-wrap;
              min-width: 120px; /* Set minimum width to align with file messages */
            }
            
            .message-time {
              font-size: 0.7rem;
              opacity: 0.7;
            }
          }
        }
        
        .typing-indicator {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          margin-bottom: 1rem;
          
          .typing-avatar {
            flex-shrink: 0;
            position: relative;
            
            .online-indicator {
              position: absolute;
              bottom: -2px;
              right: -2px;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              border: 2px solid white;
              
              &.online {
                background-color: #10b981;
                box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
              }
              
              &.offline {
                background-color: #6b7280;
              }
            }
          }
          
          .typing-bubble {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 5px 15px 15px 15px;
            padding: 0.75rem 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          
          .typing-dots {
            display: flex;
            gap: 0.25rem;
            
            span {
              width: 6px;
              height: 6px;
              background: #4facfe;
              border-radius: 50%;
              animation: typing-animation 1.4s infinite ease-in-out;
              
              &:nth-child(1) { animation-delay: -0.32s; }
              &:nth-child(2) { animation-delay: -0.16s; }
              &:nth-child(3) { animation-delay: 0s; }
              }
            }
          }
        }
      }
      
      .message-input-container {
        padding: 1.5rem 2rem;
        background: white;
        border-top: 1px solid #e2e8f0;
        
        .input-wrapper {
          .input-section {
          display: flex;
            align-items: center;
          gap: 1rem;
            
            .attachment-btn {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              color: #64748b;
              border-radius: 12px;
              width: 44px;
              height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
              cursor: pointer;
              
              &:hover {
                background: #f1f5f9;
                border-color: #cbd5e1;
              }
            }
            
            .screenshot-button-group {
              display: flex;
              gap: 4px;
              align-items: center;
            }
            
            .screenshot-group {
              display: flex;
              gap: 4px;
              align-items: center;
            }
            
            .screenshot-btn {
              background: #f0f9ff;
              border: 1px solid #e0f2fe;
              color: #0284c7;
              border-radius: 12px;
              width: 44px;
              height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
              cursor: pointer;
              
              &:hover {
                background: #e0f2fe;
                border-color: #7dd3fc;
                color: #0369a1;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
              }
              
              svg {
                transition: all 0.2s ease;
              }
              
              &:hover svg {
                transform: scale(1.1);
              }
            }
            
            .help-btn {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              color: #6c757d;
              border-radius: 8px;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
              cursor: pointer;
              
              &:hover {
                background: #e9ecef;
                border-color: #dee2e6;
                color: #495057;
                transform: translateY(-1px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              }
              
              svg {
                transition: all 0.2s ease;
              }
              
              &:hover svg {
                transform: scale(1.1);
              }
            }
            
            .diagnosis-btn {
              background: #fef3c7;
              border: 1px solid #fde68a;
              color: #d97706;
              border-radius: 8px;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              transition: all 0.2s ease;
              cursor: pointer;
              
              &:hover {
                background: #fde68a;
                border-color: #fbbf24;
                color: #b45309;
                transform: scale(1.1);
              }
            }
            
            // 截图指南对话框样式
            :global(.screenshot-alternatives-dialog) {
              .el-message-box__content {
                padding: 0;
              }
              
              .el-message-box__message {
                margin: 0;
                
                ul {
                  list-style-type: disc;
                  padding-left: 20px;
                  
                  li {
                    margin: 4px 0;
                    
                    strong {
                      color: #303133;
                    }
                  }
                }
                
                p {
                  margin: 8px 0;
                  font-weight: 500;
                  color: #606266;
                }
                
                h4 {
                  margin: 0 0 12px 0;
                  font-size: 16px;
                  font-weight: 600;
                }
              }
            }
            
            // 浏览器诊断对话框样式
            :global(.browser-diagnosis-dialog) {
              .el-message-box {
                width: 520px;
                max-width: 90vw;
              }
              
              .el-message-box__content {
                padding: 0;
              }
              
              .el-message-box__message {
                margin: 0;
                font-size: 13px;
                
                ul {
                  list-style-type: none;
                  padding-left: 0;
                  
                  li {
                    margin: 6px 0;
                    padding: 2px 0;
                  }
                }
                
                p {
                  margin: 8px 0 4px 0;
                  font-weight: 600;
                  color: #303133;
                }
                
                h4 {
                  margin: 0 0 16px 0;
                  font-size: 16px;
                  font-weight: 600;
                  text-align: center;
                }
              }
            }
            
            .input-wrapper-inner {
            flex: 1;
            
              .message-input {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 1px solid #e2e8f0;
              border-radius: 12px;
                background: #f8fafc;
                font-size: 0.9rem;
                transition: all 0.2s ease;
                height: 44px;
                line-height: 1.5;
              font-family: inherit;
              
              &:focus {
                  outline: none;
                border-color: #4facfe;
                  background: white;
                box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
              }
                
                &::placeholder {
                  color: #94a3b8;
                }
            }
          }
          
          .send-btn {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            border: none;
            color: white;
            border-radius: 12px;
              width: 44px;
              height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
              cursor: pointer;
            
            &:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
            }
            
            &:disabled {
                background: #e2e8f0;
                color: #94a3b8;
              cursor: not-allowed;
              transform: none;
              box-shadow: none;
              }
            }
          }
        }
      }
    }
  }
}

@keyframes typing-animation {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .sidebar {
    width: 280px;
  }
  
  .main-content {
    gap: 0.75rem;
  }
}

@media (max-width: 1024px) {
  .chat-container {
    padding: 0.5rem;
  }
  
  .main-content {
    flex-direction: row;
    gap: 0.5rem;
  }
  
  .sidebar {
    width: 260px;
    min-width: 260px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .sidebar {
    width: 100%;
    height: 200px;
    min-width: unset;
    
    .sidebar-card .conversation-list .conversation-item {
      padding: 0.75rem;
    }
  }
}

@media (max-width: 768px) {
  .chat-container {
    padding: 0.25rem;
  }
  
  .status-bar .status-card {
    padding: 0.75rem 1rem;
    
    .left-section h2 {
      font-size: 1.2rem;
    }
    
    .right-section {
      gap: 0.5rem;
      
      .user-info .username {
        display: none;
      }
    }
  }
}

/* 滚动条样式 */
.conversation-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.conversation-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.conversation-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
  
  &:hover {
    background: #a8a8a8;
  }
}

/* 其他现有样式保持不变 */
  // ... existing styles for dialogs, forms, etc.
</style> 
