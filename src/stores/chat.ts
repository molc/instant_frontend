import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  ChatState,
  Conversation,
  ConversationListItem,
  ConversationListResponse,
  ConversationMember,
  ConversationMemberListResponse,
  Message,
  MessageListResponse,
  TextMessageCreate,
  FileMessageCreate,
  LocationMessageCreate,
  MessageReadReceiptCreate,
  TypingMessage,
  MessageStatus,
  MessageSearchParams,
  SingleChatCreate,
  GroupChatCreate,
  ConversationUpdate,
  ConversationMemberAdd,
  ConversationMemberUpdate,
  WebSocketMessage,
  OnlineUsersResponse,
  UserStatusResponse,
  FileUploadResponse,
  FileDownloadInfo,
  // 新增的WebSocket事件类型
  NewMessageEvent,
  MessageReceivedEvent,
  ConversationCreatedEvent,
  UserOnlineEvent,
  UserOfflineEvent,
  UserStatusChangedEvent,
  BroadcastReceivedEvent,
  ConversationUpdatedEvent,
  ConversationDeletedEvent,
  RoleChangedEvent,
  TypingIndicatorEvent,
  ConnectionEstablishedEvent,
  HeartbeatEvent,
  PongEvent,
  CustomEventEvent,
  MemberLeftEvent,
  ConversationNameUpdatedEvent,
  MemberAddedEvent,
  MemberRemovedEvent,
  ConversationDissolvedEvent,
  OwnerTransferredEvent,
  WatermarkUpdatedEvent,
  LocationUpdatedEvent
} from '@/types/chat';
import api from '@/services/api';
import { websocketService } from '@/services/websocket';
import { ElNotification, ElMessage } from 'element-plus';
import { useAuthStore } from './auth';

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore();
  // 状态 - 根据API文档调整
  const currentConversation = ref<Conversation | null>(null);
  const conversations = ref<ConversationListItem[]>([]);
  const messages = ref<Record<number, Message[]>>({});
  const isLoading = ref(false);
  const isConnected = ref(false);
  const typing = ref<Record<number, number[]>>({});
  // 每个会话已记录未读消息ID，避免重复累加
  const unreadMessageIds = ref<Record<number, Set<number>>>({});
  const onlineUsers = ref<number[]>([]);
  const error = ref<string | null>(null);
  const searchQuery = ref('');
  const searchResults = ref<Message[]>([]);
  const connectionStatus = ref<'connected' | 'connecting' | 'disconnected' | 'reconnecting'>('disconnected');

  // 计算属性
  const currentMessages = computed(() => {
    return currentConversation.value ? messages.value[currentConversation.value.id] || [] : [];
  });

  const totalUnreadCount = computed(() => {
    return conversations.value.reduce((total, conv) => total + (conv.unread_count || 0), 0);
  });

  // 获取会话列表 - 根据API文档 GET /conversations
  const fetchConversations = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      
      console.log('🔄 获取会话列表...');
      const response = await api.get<ConversationListItem[]>('/conversations');
      
      // API返回直接数组，不是包装在conversations属性中
      console.log('✅ 会话列表响应:', response.data);
      
      // 同步未读计数到本地状态
      response.data.forEach(conversation => {
        // 如果后端返回的未读计数大于0，说明有离线期间收到的消息
        if (conversation.unread_count && conversation.unread_count > 0) {
          // 确保本地未读消息ID集合存在
          if (!unreadMessageIds.value[conversation.id]) {
            unreadMessageIds.value[conversation.id] = new Set<number>();
          }
          console.log(`📊 会话 ${conversation.id} 有 ${conversation.unread_count} 条未读消息`);
        }
      });
      
      conversations.value = response.data;
      console.log('✅ 已设置会话列表，共', conversations.value.length, '个会话');
      
    } catch (err: any) {
      console.error('❌ 获取会话列表失败:', err);
      error.value = err.response?.data?.detail || '获取会话列表失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 获取单个会话详情 - 根据API文档 GET /conversations/{conversation_id}
  const fetchConversation = async (conversationId: number): Promise<Conversation> => {
    try {
      const response = await api.get<Conversation>(`/conversations/${conversationId}`);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || '获取会话详情失败';
      throw err;
    }
  };

  // 获取会话成员列表 - 根据API文档 GET /conversations/{conversation_id}/members
  const fetchConversationMembers = async (conversationId: number): Promise<ConversationMember[]> => {
    try {
      console.log('🔍 [fetchConversationMembers] 开始请求，会话ID:', conversationId);
      
      const response = await api.get<any>(`/conversations/${conversationId}/members`).catch(async (err) => {
        // 如果返回404，尝试备用端点 /conversation_members?conversation_id=
        if (err.response && err.response.status === 404) {
          console.warn('[fetchConversationMembers] primary endpoint 404, fallback to /conversation_members');
          return await api.get<any>(`/conversation_members`, { params: { conversation_id: conversationId } });
        }
        throw err;
      });
      
      console.log('📋 [fetchConversationMembers] API响应状态:', response.status);
      console.log('📋 [fetchConversationMembers] API响应数据:', response.data);
      console.log('📋 [fetchConversationMembers] 响应数据类型:', typeof response.data);
      console.log('📋 [fetchConversationMembers] 是否有members属性:', 'members' in response.data);
      
      // 检查响应数据结构
      if (response.data && typeof response.data === 'object') {
        if ('members' in response.data) {
          const membersData = response.data as any;
          console.log('✅ [fetchConversationMembers] 找到members属性');
          console.log('✅ [fetchConversationMembers] members数据:', membersData.members);
          return membersData.members || [];
        } else if (Array.isArray(response.data)) {
          console.log('⚠️ [fetchConversationMembers] API返回直接数组，长度:', response.data.length);
          return response.data as ConversationMember[];
        } else {
          console.warn('⚠️ [fetchConversationMembers] 未知的响应数据结构:', Object.keys(response.data));
          return [];
        }
      } else {
        console.warn('⚠️ [fetchConversationMembers] 响应数据不是对象:', response.data);
        return [];
      }
    } catch (err: any) {
      console.error('❌ [fetchConversationMembers] 请求失败:', err);
      console.error('❌ [fetchConversationMembers] 错误详情:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      error.value = err.response?.data?.detail || '获取会话成员失败';
      throw err;
    }
  };

  // 创建单聊 - 根据API文档 POST /conversations/single
  const createSingleChat = async (targetUserId: number): Promise<Conversation> => {
    try {
      const payload: SingleChatCreate = {
        target_user_id: targetUserId
      };
      
      const response = await api.post<Conversation>('/conversations/single', payload);
      const newConversation = response.data;
      
      // 添加到会话列表
      await fetchConversations();
      
      return newConversation;
    } catch (err: any) {
      error.value = err.response?.data?.detail || '创建单聊失败';
      throw err;
    }
  };

  // 创建群聊 - 根据API文档 POST /conversations/group
  const createGroupChat = async (data: GroupChatCreate): Promise<Conversation> => {
    try {
      const response = await api.post<Conversation>('/conversations/group', data);
      const newConversation = response.data;
      
      // 添加到会话列表
      await fetchConversations();
      
      return newConversation;
    } catch (err: any) {
      error.value = err.response?.data?.detail || '创建群聊失败';
      throw err;
    }
  };

  // 更新会话信息 - 根据API文档 PUT /conversations/{conversation_id}
  const updateConversation = async (conversationId: number, data: ConversationUpdate): Promise<Conversation> => {
    try {
      const response = await api.put<Conversation>(`/conversations/${conversationId}`, data);
      
      // 更新本地数据
      if (currentConversation.value && currentConversation.value.id === conversationId) {
        currentConversation.value = response.data;
      }
      
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || '更新会话信息失败';
      throw err;
    }
  };

  // 添加会话成员 - 根据API文档 POST /conversations/{conversation_id}/members
  const addConversationMembers = async (conversationId: number, data: ConversationMemberAdd): Promise<ConversationMember[]> => {
    try {
      await api.post(`/conversations/${conversationId}/members`, data);
      
      // 刷新会话信息
      await fetchConversations();
      
      // 重要：返回更新后的成员列表，让组件可以刷新
      return await fetchConversationMembers(conversationId);
    } catch (err: any) {
      error.value = err.response?.data?.detail || '添加成员失败';
      throw err;
    }
  };

  // 移除会话成员 - 根据API文档 DELETE /conversations/{conversation_id}/members/{user_id}
  const removeConversationMember = async (conversationId: number, userId: number): Promise<void> => {
    try {
      await api.delete(`/conversations/${conversationId}/members/${userId}`);
      
      // 刷新会话信息
      await fetchConversations();
    } catch (err: any) {
      error.value = err.response?.data?.detail || '移除成员失败';
      throw err;
    }
  };

  // 更新会话成员信息 - 根据API文档 PUT /conversations/{conversation_id}/members/{user_id}
  const updateConversationMember = async (conversationId: number, userId: number, data: ConversationMemberUpdate): Promise<void> => {
    try {
      await api.put(`/conversations/${conversationId}/members/${userId}`, data);
    } catch (err: any) {
      error.value = err.response?.data?.detail || '更新成员信息失败';
      throw err;
    }
  };

  // 删除会话 - 根据API文档 DELETE /conversations/{conversation_id}
  const deleteConversation = async (conversationId: number): Promise<void> => {
    try {
      await api.delete(`/conversations/${conversationId}`);
      
      // 从本地列表中移除该会话
      conversations.value = conversations.value.filter(conv => conv.id !== conversationId);
      
      // 如果删除的是当前会话，清空当前会话
      if (currentConversation.value && currentConversation.value.id === conversationId) {
        currentConversation.value = null;
      }
      
      // 清除该会话的消息
      delete messages.value[conversationId];
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || '删除会话失败';
      throw err;
    }
  };

  // 退出会话（群聊） - 根据API文档和协议文档
  const leaveConversation = async (conversationId: number, userId: number): Promise<void> => {
    try {
      // 调用移除成员接口，移除指定用户（通常是当前用户）
      await removeConversationMember(conversationId, userId);
      
      // 从本地列表中移除该会话
      conversations.value = conversations.value.filter(conv => conv.id !== conversationId);
      
      // 如果退出的是当前会话，清空当前会话
      if (currentConversation.value && currentConversation.value.id === conversationId) {
        currentConversation.value = null;
      }
      
      // 清除该会话的消息
      delete messages.value[conversationId];
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || '退出会话失败';
      throw err;
    }
  };

  // 添加清空聊天记录 - 根据API文档 POST /conversations/{conversation_id}/clear
  const clearConversationMessages = async (conversationId: number): Promise<void> => {
    try {
      await api.post(`/conversations/${conversationId}/clear`);
      // 本地清空消息
      delete messages.value[conversationId];
    } catch (err: any) {
      error.value = err.response?.data?.detail || '清空聊天记录失败';
      throw err;
    }
  };

  // 获取消息列表（可选是否显示全页加载指示）
  const fetchMessages = async (
    conversationId: number,
    before?: number,
    after?: number,
    limit: number = 50,
    showLoading: boolean = true
  ): Promise<void> => {
    try {
      if (showLoading) isLoading.value = true;
      error.value = null;
      
      const params: Record<string, any> = { limit };
      if (before) params.before = before;
      if (after) params.after = after;
      
      console.log('🔄 获取消息列表...', { conversationId, before, after, limit });
      const response = await api.get<MessageListResponse>(`/messages/conversation/${conversationId}`, { params });
      
      console.log('✅ 消息列表响应:', response.data);
      if (!messages.value[conversationId]) {
        messages.value[conversationId] = [];
      }
      
      // 合并消息列表并去重
      const existingIds = new Set(messages.value[conversationId].map(m => m.id));
      const newMessages = response.data.messages.filter(m => !existingIds.has(m.id));
      messages.value[conversationId] = [...messages.value[conversationId], ...newMessages];
      
      // 按时间排序
      messages.value[conversationId].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
    } catch (err: any) {
      console.error('❌ 获取消息列表失败:', err);
      error.value = err.response?.data?.detail || '获取消息列表失败';
      throw err;
    } finally {
      if (showLoading) isLoading.value = false;
    }
  };

  // 优化版分页加载消息
  const loadMoreMessages = async (conversationId: number, direction: 'before' | 'after' = 'before'): Promise<boolean> => {
    try {
      const conversationMessages = messages.value[conversationId] || [];
      
      if (conversationMessages.length === 0) {
        // 首次加载
        await fetchMessages(conversationId);
        return conversationMessages.length > 0;
      }
      
      let targetMessageId: number;
      
      if (direction === 'before') {
        // 加载更早的消息
        targetMessageId = conversationMessages[0].id;
      } else {
        // 加载更新的消息
        targetMessageId = conversationMessages[conversationMessages.length - 1].id;
      }
      
      const beforeCount = conversationMessages.length;
      
      if (direction === 'before') {
        await fetchMessages(conversationId, targetMessageId, undefined, 50);
      } else {
        await fetchMessages(conversationId, undefined, targetMessageId, 50);
      }
      
      const afterCount = messages.value[conversationId]?.length || 0;
      
      // 返回是否加载了新消息
      return afterCount > beforeCount;
      
    } catch (err: any) {
      console.error('加载更多消息失败:', err);
      return false;
    }
  };

  // 预加载相邻消息 - 性能优化
  const preloadMessages = async (conversationId: number): Promise<void> => {
    try {
      const conversationMessages = messages.value[conversationId] || [];
      
      // 如果消息少于50条，预加载更多
      if (conversationMessages.length < 50) {
        await loadMoreMessages(conversationId, 'before');
      }
    } catch (error) {
      console.warn('预加载消息失败:', error);
    }
  };

  // 发送文本消息 - 根据API文档 POST /messages/text
  const sendTextMessage = async (data: TextMessageCreate): Promise<Message> => {
    try {
      const response = await api.post<Message>('/messages/text', data);
      
      // 使用统一的消息处理函数
      if (addMessageToStore(response.data)) {
        updateConversationLastMessage(response.data);
      }
      
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || '发送消息失败';
      throw err;
    }
  };

  // 发送文件消息 - 根据API文档 POST /messages/file
  const sendFileMessage = async (conversationId: number, fileId: string, fileName: string, fileSize: number): Promise<Message> => {
    try {
      const messageData: FileMessageCreate = {
        conversation_id: conversationId,
        file_id: fileId,
        file_name: fileName,
        file_size: fileSize
      };
      
      console.log('📤 发送文件消息:', messageData);
      
      const response = await api.post<Message>('/messages/file', messageData);
      
      console.log('✅ 文件消息发送成功:', response.data);
      console.log('🔍 后端返回的原始数据:');
      console.log('  - 完整响应:', JSON.stringify(response.data, null, 2));
      console.log('  - 所有字段名:', Object.keys(response.data));
      console.log('🔍 消息详细信息:');
      console.log('  - message_type:', response.data.message_type);
      console.log('  - file_info:', response.data.file_info);
      console.log('  - 从file_info提取的file_id:', response.data.file_info?.file_id);
      console.log('  - 从file_info提取的name:', response.data.file_info?.name);
      console.log('  - 从file_info提取的size:', response.data.file_info?.size);
      console.log('  - content length:', response.data.content?.length || 0);
      console.log('  - content preview:', response.data.content?.substring(0, 100));
      
      // 添加到本地消息列表
      if (!messages.value[conversationId]) {
        messages.value[conversationId] = [];
      }
      messages.value[conversationId].push(response.data);
      
             // 更新会话的最后消息时间  
       const conversation = conversations.value.find(c => c.id === conversationId);
       if (conversation) {
         conversation.last_message_at = response.data.created_at;
       }
      
      return response.data;
    } catch (err: any) {
      console.error('❌ 发送文件消息失败:', err);
      throw new Error(err.response?.data?.detail || '发送文件消息失败');
    }
  };

  // 发送位置消息 - 根据API文档 POST /messages/location
  const sendLocationMessage = async (data: LocationMessageCreate): Promise<Message> => {
    try {
      const response = await api.post<Message>('/messages/location', data);
      
      // 使用统一的消息处理函数
      if (addMessageToStore(response.data)) {
        updateConversationLastMessage(response.data);
      }
      
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || '发送位置消息失败';
      throw err;
    }
  };

  // 撤回消息 - 根据API文档 POST /messages/{message_id}/recall
  const recallMessage = async (messageId: number): Promise<void> => {
    try {
      await api.post(`/messages/${messageId}/recall`);
      
      // 更新本地消息状态
      Object.keys(messages.value).forEach(conversationId => {
        const messageIndex = messages.value[Number(conversationId)].findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          messages.value[Number(conversationId)][messageIndex].status = 'recalled';
        }
      });
    } catch (err: any) {
      error.value = err.response?.data?.detail || '撤回消息失败';
      throw err;
    }
  };

  // 标记消息已读 - 根据API文档 POST /messages/mark-read
  const markMessagesAsRead = async (data: MessageReadReceiptCreate): Promise<void> => {
    try {
      await api.post('/messages/mark-read', data);
      
      // 更新本地消息状态
      const conversationMessages = messages.value[data.conversation_id] || [];
      conversationMessages.forEach(message => {
        if (data.message_ids.includes(message.id)) {
          message.status = 'read';
        }
      });
      
      // 更新会话未读数
      const convIndex = conversations.value.findIndex(c => c.id === data.conversation_id);
      if (convIndex !== -1) {
        conversations.value[convIndex].unread_count = 0;
      }
      // 清除已读ID并重置未读计数
      if (unreadMessageIds.value[data.conversation_id]) {
        data.message_ids.forEach(id => unreadMessageIds.value[data.conversation_id].delete(id));
        const convIndex = conversations.value.findIndex(c => c.id === data.conversation_id);
        if (convIndex !== -1) {
          conversations.value[convIndex].unread_count = unreadMessageIds.value[data.conversation_id].size;
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || '标记已读失败';
      throw err;
    }
  };

  // 发送正在输入 - 根据API文档 POST /messages/typing
  const sendTypingIndicator = async (data: TypingMessage): Promise<void> => {
    try {
      await api.post('/messages/typing', data);
    } catch (err: any) {
      // 输入状态失败不需要显示错误
      console.warn('发送输入状态失败:', err);
    }
  };

  // 搜索消息 - 根据API文档 GET /messages/search
  const searchMessages = async (params: MessageSearchParams): Promise<Message[]> => {
    try {
      const response = await api.get<Message[]>('/messages/search', { params });
      searchResults.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || '搜索消息失败';
      throw err;
    }
  };

  // 文件上传 - 根据API文档 POST /files/upload
  const uploadFile = async (file: File): Promise<FileUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📁 上传文件:', file.name, '大小:', file.size);
      
      const response = await api.post<FileUploadResponse>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ 文件上传成功:');
      console.log('🔍 上传API返回的原始数据:');
      console.log('  - 完整响应:', JSON.stringify(response.data, null, 2));
      console.log('  - 所有字段名:', Object.keys(response.data));
      console.log('  - file_id字段:', response.data.file_id);
      console.log('  - original_name字段:', response.data.original_name);
      console.log('  - file_size字段:', response.data.file_size);
      
      // 🔧 字段映射兼容性处理
      const rawData: any = response.data;
      const mappedData: FileUploadResponse = {
        ...rawData,  // 使用原始数据作为基础
        // 添加兼容性字段
        original_name: rawData.file_name || rawData.original_name,
        file_url: rawData.file_path || rawData.file_url
      };
      
      console.log('🔧 映射后的数据:');
      console.log('  - file_id:', mappedData.file_id);
      console.log('  - file_name:', mappedData.file_name);
      console.log('  - original_name:', mappedData.original_name);
      console.log('  - file_size:', mappedData.file_size);
      
      return mappedData;
    } catch (err: any) {
      console.error('❌ 文件上传失败:', err);
      
      // 处理详细错误信息
      let errorMessage = '文件上传失败';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map((e: any) => e.msg || e.message || String(e)).join(', ');
        } else {
          errorMessage = String(err.response.data.detail);
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  // 下载文件
  const downloadFile = async (fileId: string, fileName?: string): Promise<void> => {
    try {
      console.log('📥 下载文件:', fileId, fileName);
      
      let response;
      let lastError;
      
      // 方法1：尝试通过文件下载信息获取静态文件路径
      try {
        console.log('尝试获取文件下载信息...');
        const info = await getFileDownloadInfo(fileId);
        console.log('文件下载信息:', info);
        
        // 如果有下载URL，直接使用
        if (info.download_url) {
          response = await api.get(info.download_url, { 
            responseType: 'blob',
            baseURL: '' // 不使用API base URL
          });
          console.log('✅ 方法1成功 - 通过文件下载信息');
        } else {
          throw new Error('无下载URL信息');
        }
      } catch (infoErr) {
        lastError = infoErr;
        console.warn('方法1失败:', infoErr);
         
        // 方法2：尝试使用静态文件路径 /uploads/{path}
        try {
          // 尝试从当前消息中找到文件路径信息
          let filePath = null;
          if (messages.value) {
            for (const conversationId in messages.value) {
              const msgs = messages.value[conversationId];
              const msg = msgs.find(m => m.file_info?.file_id === fileId || m.file_id === fileId);
              if (msg?.file_info?.path) {
                filePath = msg.file_info.path;
                break;
              }
            }
          }
          
          if (filePath) {
            console.log('使用文件路径下载:', filePath);
            response = await api.get(`/uploads/${filePath}`, { 
              responseType: 'blob',
              baseURL: '' // 直接使用静态路径
            });
            console.log('✅ 方法2成功 - 通过文件路径');
          } else {
            throw new Error('未找到文件路径信息');
          }
        } catch (pathErr) {
          lastError = pathErr;
          console.warn('方法2失败:', pathErr);
           
          // 方法3：尝试API路径下载
          try {
            const downloadUrl = `/files/download/${fileId}`;
            response = await api.get(downloadUrl, { responseType: 'blob' });
            console.log('✅ 方法3成功 - 通过API下载');
          } catch (apiErr) {
            lastError = apiErr;
            console.warn('方法3失败:', apiErr);
            
            // 方法4：最后尝试直接使用fileId作为路径
            try {
              const staticUrl = `/uploads/${fileId}`;
              response = await api.get(staticUrl, { 
                responseType: 'blob',
                baseURL: '' // 直接使用静态路径
              });
              console.log('✅ 方法4成功 - 通过fileId静态路径');
            } catch (finalErr) {
              lastError = finalErr;
              console.warn('方法4失败:', finalErr);
              // 所有方法都失败了，抛出最后一个错误
              throw lastError;
            }
          }
        }
      }
      
      // 如果到这里，说明成功获取到了response
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `file_${fileId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // 清除之前可能的错误状态
      error.value = null;
      console.log('✅ 文件下载完成');
    } catch (err: any) {
      console.error('❌ 文件下载失败:', err);
      // 提供更详细的错误信息
      let errorMessage = '文件下载失败';
      if (err.response?.data?.detail) {
        errorMessage = `文件下载失败: ${err.response.data.detail}`;
      } else if (err.response?.status === 404) {
        errorMessage = '文件不存在或已被删除';
      } else if (err.response?.status) {
        errorMessage = `文件下载失败: HTTP ${err.response.status}`;
      } else if (err.message) {
        errorMessage = `文件下载失败: ${err.message}`;
      }
      console.error('具体错误:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  // 获取文件下载信息 - 根据API文档 GET /files/download-info/{file_id}
  const getFileDownloadInfo = async (fileId: string): Promise<FileDownloadInfo> => {
    try {
      const response = await api.get<FileDownloadInfo>(`/files/download-info/${fileId}`);
      return response.data;
    } catch (err: any) {
      // 不设置全局错误状态，让调用者处理错误
      throw err;
    }
  };

  // 获取在线用户 - 根据API文档 GET /realtime/online-users
  const fetchOnlineUsers = async (): Promise<void> => {
    try {
      const response = await api.get<OnlineUsersResponse>('/realtime/online-users');
      onlineUsers.value = response.data.online_users;
      console.log('📊 获取在线用户列表成功:', {
        onlineUsers: response.data.online_users,
        count: response.data.count
      });
    } catch (err: any) {
      console.warn('❌ 获取在线用户失败:', err);
    }
  };

  // 获取用户状态 - 根据API文档 GET /realtime/user-status/{user_id}
  const getUserStatus = async (userId: number): Promise<UserStatusResponse> => {
    try {
      const response = await api.get<UserStatusResponse>(`/realtime/user-status/${userId}`);
      return response.data;
    } catch (err: any) {
      console.warn('获取用户状态失败:', err);
      throw err;
    }
  };

  // 将消息加入 store，返回 true 表示是新消息
  const addMessageToStore = (message: Message): boolean => {
    if (!messages.value[message.conversation_id]) {
      messages.value[message.conversation_id] = [];
    }
    const conversationMessages = messages.value[message.conversation_id];
    const existingMessageIndex = conversationMessages.findIndex(m => m.id === message.id);
    let isNew = false;
    if (existingMessageIndex !== -1) {
      conversationMessages[existingMessageIndex] = message;
    } else {
      conversationMessages.push(message);
      isNew = true;
    }
    conversationMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return isNew;
  };

  // 切换当前会话
  const switchConversation = async (conversation: ConversationListItem | Conversation): Promise<void> => {
    try {
      const conversationId = conversation.id;

      // 获取完整会话信息（如果需要）
      const fullConversation = 'max_members' in conversation ? (conversation as Conversation) : await fetchConversation(conversationId);
      currentConversation.value = fullConversation;

      // 加载消息历史（不显示全页加载指示，避免页面闪烁）
      await fetchMessages(conversationId, undefined, undefined, 50, false);

      // 标记所有消息为已读
      const conversationMsgs = messages.value[conversationId] || [];
      const unreadMsgs = conversationMsgs.filter(m => m.status !== 'read');

      if (unreadMsgs.length > 0) {
        await markMessagesAsRead({
          conversation_id: conversationId,
          message_ids: unreadMsgs.map(m => m.id)
        });
      }

      // 将未读计数重置为0
      const convIndex = conversations.value.findIndex(c => c.id === conversationId);
      if (convIndex !== -1) {
        conversations.value[convIndex].unread_count = 0;
      }
      // 清空未读ID集合
      if (unreadMessageIds.value[conversationId]) {
        unreadMessageIds.value[conversationId].clear();
      }
    } catch (err: any) {
      console.error('切换会话失败:', err);
      // 如果只是网络瞬断，不抛全局错误，避免误提示
    }
  };

  // WebSocket 连接管理
  // 防止重复注册监听器的标志位
  let isListenersRegistered = false;
  
  const connectWebSocket = (): void => {
    console.log('🔗 开始连接WebSocket...');
    connectionStatus.value = 'connecting';
    
    websocketService.connect();
    
    // 防止重复注册事件监听器
    if (isListenersRegistered) {
      return;
    }
    isListenersRegistered = true;
    
    // ===== 原有事件处理 =====
    websocketService.on('connect', () => {
      console.log('✅ 聊天系统WebSocket连接成功');
      connectionStatus.value = 'connected';
      isConnected.value = true;
      
      // 重置重连计数
      resetReconnectionAttempts();
      
      // 连接成功后获取在线用户
      fetchOnlineUsers();
      
      // 同步可能错过的消息
      if (currentConversation.value) {
        syncMissedMessages(currentConversation.value.id);
      }
    });
    
    websocketService.on('disconnect', () => {
      console.log('⚠️ 聊天系统WebSocket连接断开');
      connectionStatus.value = 'disconnected';
      isConnected.value = false;
      
      // 清空在线用户列表，所有单聊联系人置为离线
      onlineUsers.value = [];
      
      // 开始重连
      startReconnection();
    });
    
    websocketService.on('message', (data: Message) => {
      // 处理新消息
      if (addMessageToStore(data)) {
        updateConversationLastMessage(data);
      }
    });
    
    websocketService.on('mark_read', (data: { conversation_id: number; message_ids: number[] }) => {
      // 处理已读回执
      if (messages.value[data.conversation_id]) {
        messages.value[data.conversation_id].forEach(message => {
          if (data.message_ids.includes(message.id)) {
            message.status = 'read';
          }
        });
      }
      // 清除已读ID并重置未读计数
      if (unreadMessageIds.value[data.conversation_id]) {
        data.message_ids.forEach(id => unreadMessageIds.value[data.conversation_id].delete(id));
        const convIndex = conversations.value.findIndex(c => c.id === data.conversation_id);
        if (convIndex !== -1) {
          conversations.value[convIndex].unread_count = unreadMessageIds.value[data.conversation_id].size;
        }
      }
    });
    
    websocketService.on('message_status', (data: { message_id: number; status: string }) => {
      // 处理消息状态更新
      updateMessageStatus(data.message_id, data.status as MessageStatus);
    });
    
    websocketService.on('typing', (data: { conversation_id: number; user_id: number; is_typing: boolean }) => {
      if (data.is_typing) {
        if (!typing.value[data.conversation_id]) {
          typing.value[data.conversation_id] = [];
        }
        if (!typing.value[data.conversation_id].includes(data.user_id)) {
          typing.value[data.conversation_id].push(data.user_id);
        }
      } else {
        if (typing.value[data.conversation_id]) {
          typing.value[data.conversation_id] = typing.value[data.conversation_id].filter(id => id !== data.user_id);
        }
      }
    });
    
    // 监听用户状态变化事件 (后端实际发送的事件类型)
    websocketService.on('user_status_changed', (data: UserStatusChangedEvent) => {
      console.log('📊 用户状态变化事件:', data);
      
      if (data.is_online) {
        // 用户上线
        if (!onlineUsers.value.includes(data.user_id)) {
          onlineUsers.value.push(data.user_id);
          console.log('🟢 用户上线:', { user_id: data.user_id, onlineUsers: onlineUsers.value });
        }
      } else {
        // 用户下线
        onlineUsers.value = onlineUsers.value.filter(id => id !== data.user_id);
        console.log('🔴 用户下线:', { user_id: data.user_id, onlineUsers: onlineUsers.value });
      }
    });
    
    // 移除重复的用户状态监听器，只保留主要的 user_status_changed 处理

    // ===== 新增的API事件数据处理 =====
    
    // 新消息事件数据处理
    websocketService.on('new_message', (data: NewMessageEvent) => {
      console.log('📩 收到新消息事件:', data);
      
      // 构建消息对象
      const message: Message = {
        id: data.message_id,
        conversation_id: data.conversation_id,
        sender_id: data.sender_id,
        message_type: data.message_type,
        content: data.content,
        status: 'delivered',
        created_at: data.timestamp,
        updated_at: data.timestamp,
        file_id: data.file_id,
        file_info: data.file_info
      };
      
      // 添加到消息列表
      if (addMessageToStore(message)) updateConversationLastMessage(message);
    });
    
    // 即时消息通知数据处理
    websocketService.on('message_received', (data: MessageReceivedEvent) => {
      console.log('📩 收到即时消息通知:', data);
      
      // 构建消息对象
      const message: Message = {
        id: data.message_id,
        conversation_id: data.conversation_id,
        sender_id: data.sender_id,
        message_type: data.message_type,
        content: data.content,
        status: 'delivered',
        created_at: data.created_at,
        updated_at: data.created_at,
        sender_name: data.sender_name,
        file_id: data.file_id,
        file_info: data.file_info
      };
      
      // 添加到消息列表
      if (addMessageToStore(message)) updateConversationLastMessage(message);
    });

    // 会话创建通知数据处理
    websocketService.on('conversation_created', (data: ConversationCreatedEvent) => {
      console.log('�� 收到会话创建通知:', data);
      
      // 刷新会话列表
      fetchConversations();
    });

    // 成员退出通知数据处理
    websocketService.on('member_left', (data: MemberLeftEvent) => {
      console.log('👋 成员退出通知:', data);
      
      // 如果是当前会话，刷新成员列表
      if (currentConversation.value?.id === data.conversation_id) {
        fetchConversations();
      }
    });

    // 会话名称更新通知数据处理
    websocketService.on('conversation_name_updated', (data: ConversationNameUpdatedEvent) => {
      console.log('✏️ 会话名称更新通知:', data);
      
      // 更新本地会话名称
      const convIndex = conversations.value.findIndex(c => c.id === data.conversation_id);
      if (convIndex !== -1) {
        conversations.value[convIndex].name = data.conversation_name;
      }
      
      // 如果是当前会话，也更新当前会话信息
      if (currentConversation.value && currentConversation.value.id === data.conversation_id) {
        currentConversation.value.name = data.conversation_name;
      }
    });

    // 成员添加通知数据处理
    websocketService.on('member_added', (data: MemberAddedEvent) => {
      console.log('➕ 成员添加通知:', data);
      
      // 刷新会话列表和成员信息
      fetchConversations();
    });

    // 成员移除通知数据处理
    websocketService.on('member_removed', (data: MemberRemovedEvent) => {
      console.log('➖ 成员移除通知:', data);
      
      // 刷新会话列表
      fetchConversations();
    });

    // 群组解散通知数据处理
    websocketService.on('conversation_dissolved', (data: ConversationDissolvedEvent) => {
      console.log('💥 群组解散通知:', data);
      
      // 从本地列表中移除该会话
      conversations.value = conversations.value.filter(conv => conv.id !== data.conversation_id);
      
      // 如果是当前会话，清空当前会话
      if (currentConversation.value && currentConversation.value.id === data.conversation_id) {
        currentConversation.value = null;
      }
      
      // 清除该会话的消息
      delete messages.value[data.conversation_id];
    });

    // 群主转让通知数据处理
    websocketService.on('owner_transferred', (data: OwnerTransferredEvent) => {
      console.log('👑 群主转让通知:', data);
      
      // 刷新会话信息
      fetchConversations();
    });

    // ===== 补充的API文档事件处理 =====
    
    // 会话更新通知处理
    websocketService.on('conversation_updated', (data: ConversationUpdatedEvent) => {
      console.log('📝 会话更新通知:', data);
      
      // 刷新会话信息
      fetchConversations();
    });

    // 会话删除通知处理
    websocketService.on('conversation_deleted', (data: ConversationDeletedEvent) => {
      console.log('🗑️ 会话删除通知:', data);
      
      // 从本地列表中移除该会话
      conversations.value = conversations.value.filter(conv => conv.id !== data.conversation_id);
      
      // 如果是当前会话，清空当前会话
      if (currentConversation.value && currentConversation.value.id === data.conversation_id) {
        currentConversation.value = null;
      }
      
      // 清除该会话的消息
      delete messages.value[data.conversation_id];
    });

    // 角色变更通知处理
    websocketService.on('role_changed', (data: RoleChangedEvent) => {
      console.log('🔄 角色变更通知:', data);
      
      // 刷新会话信息和成员列表
      fetchConversations();
    });

    // 正在输入指示处理
    websocketService.on('typing_indicator', (data: TypingIndicatorEvent) => {
      console.log('✍️ 正在输入指示:', data);
      
      if (data.is_typing) {
        if (!typing.value[data.conversation_id]) {
          typing.value[data.conversation_id] = [];
        }
        if (!typing.value[data.conversation_id].includes(data.sender_id)) {
          typing.value[data.conversation_id].push(data.sender_id);
        }
      } else {
        if (typing.value[data.conversation_id]) {
          typing.value[data.conversation_id] = typing.value[data.conversation_id].filter(id => id !== data.sender_id);
        }
      }
    });

    // 连接建立确认处理
    websocketService.on('connection_established', (data: ConnectionEstablishedEvent) => {
      console.log('🔗 连接建立确认:', data);
      // 连接确认后重新同步会话列表和未读消息状态
      fetchConversations().then(() => {
        syncUnreadMessageStatus();
      }).catch(error => {
        console.warn('重连后同步会话列表失败:', error);
      });
    });

    // 心跳包处理
    websocketService.on('heartbeat', (data: HeartbeatEvent) => {
      console.log('💓 心跳包:', data);
      // 心跳包处理，保持连接活跃
    });

    // Pong响应处理
    websocketService.on('pong', (data: PongEvent) => {
      console.log('🏓 Pong响应:', data);
      // Pong响应处理
    });

    // 广播通知处理（已在API文档中定义但未实现）
    websocketService.on('broadcast_received', (data: BroadcastReceivedEvent) => {
      console.log('📢 收到广播通知:', data);
      
      // 可以在这里添加全局通知或消息提示
      // 例如显示系统公告等
    });

    // 水印更新通知处理
    websocketService.on('watermark_updated', (data: WatermarkUpdatedEvent) => {
      console.log('🏷️ 水印更新通知:', data);
      
      // 刷新当前会话信息
      if (currentConversation.value && currentConversation.value.id === data.conversation_id) {
        fetchConversation(data.conversation_id).then(conv => {
          currentConversation.value = conv;
        });
      }
    });

    // 位置更新通知处理
    websocketService.on('location_updated', (data: LocationUpdatedEvent) => {
      console.log('📍 位置更新通知:', data);
      
      // 可以在这里更新用户位置信息
      // 或者在地图组件中显示位置变化
    });
  };

  // 更新会话最后消息时间
  const updateConversationLastMessage = (message: Message): void => {
    const convIndex = conversations.value.findIndex(c => c.id === message.conversation_id);
    if (convIndex !== -1) {
      conversations.value[convIndex].last_message_at = message.created_at;
      const myUserId = (authStore.user as any)?.id;
      
      // 如果消息不是当前用户发送的，并且不在当前打开的会话中，则增加未读计数
      if (message.sender_id !== myUserId && currentConversation.value?.id !== message.conversation_id) {
        if (!unreadMessageIds.value[message.conversation_id]) {
          unreadMessageIds.value[message.conversation_id] = new Set<number>();
        }
        const set = unreadMessageIds.value[message.conversation_id];
        if (!set.has(message.id)) {
          set.add(message.id);
          conversations.value[convIndex].unread_count = (conversations.value[convIndex].unread_count || 0) + 1;
          console.log(`📈 会话 ${message.conversation_id} 未读计数更新为: ${conversations.value[convIndex].unread_count}`);
        }
      } else if (currentConversation.value?.id === message.conversation_id) {
        // 当前会话的消息自动标记已读，重置未读计数
        conversations.value[convIndex].unread_count = 0;
        if (unreadMessageIds.value[message.conversation_id]) {
          unreadMessageIds.value[message.conversation_id].clear();
        }
      }
    }
  };

  // 更新消息状态
  const updateMessageStatus = (messageId: number, status: MessageStatus): void => {
    Object.values(messages.value).forEach(conversationMessages => {
      const messageIndex = conversationMessages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        conversationMessages[messageIndex].status = status;
      }
    });
  };

  // 同步错过的消息
  const syncMissedMessages = async (conversationId: number): Promise<void> => {
    try {
      const conversationMessages = messages.value[conversationId] || [];
      if (conversationMessages.length > 0) {
        const lastMessage = conversationMessages[conversationMessages.length - 1];
        // 获取最后一条消息后的新消息
        await fetchMessages(conversationId, undefined, lastMessage.id, 50);
      }
    } catch (error) {
      console.warn('同步错过的消息失败:', error);
    }
  };

  // 同步所有会话的未读消息状态
  const syncUnreadMessageStatus = async (): Promise<void> => {
    try {
      console.log('🔄 开始同步未读消息状态...');
      
      // 遍历所有有未读计数的会话
      for (const conversation of conversations.value) {
        if (conversation.unread_count && conversation.unread_count > 0) {
          // 如果本地没有该会话的未读消息ID记录，需要获取最新的消息来建立正确的未读状态
          if (!unreadMessageIds.value[conversation.id] || unreadMessageIds.value[conversation.id].size === 0) {
            console.log(`📥 会话 ${conversation.id} 需要同步 ${conversation.unread_count} 条未读消息`);
            
            // 获取该会话的最新消息（不显示加载状态，避免界面闪烁）
            await fetchMessages(conversation.id, undefined, undefined, 20, false);
            
            // 根据后端返回的未读计数，标记相应数量的最新消息为未读
            const conversationMessages = messages.value[conversation.id] || [];
            const myUserId = (authStore.user as any)?.id;
            
            // 从最新的消息开始，标记非自己发送的消息为未读
            let unreadCount = 0;
            for (let i = conversationMessages.length - 1; i >= 0 && unreadCount < conversation.unread_count; i--) {
              const message = conversationMessages[i];
              if (message.sender_id !== myUserId) {
                if (!unreadMessageIds.value[conversation.id]) {
                  unreadMessageIds.value[conversation.id] = new Set<number>();
                }
                unreadMessageIds.value[conversation.id].add(message.id);
                unreadCount++;
              }
            }
            
            console.log(`✅ 会话 ${conversation.id} 已同步 ${unreadCount} 条未读消息`);
          }
        }
      }
      
      console.log('✅ 未读消息状态同步完成');
    } catch (error) {
      console.warn('⚠️ 同步未读消息状态失败:', error);
    }
  };

  // 重连机制 - 使用WebSocket服务内置的重连
  const startReconnection = (): void => {
    connectionStatus.value = 'reconnecting';
    // WebSocket服务会自动处理重连
  };

  // 检查连接状态并在需要时重连
  const checkConnectionAndReconnect = (): void => {
    const state = websocketService.getConnectionState();
    if (!state.isConnected && !state.isReconnecting) {
      console.log('🔍 检测到连接断开，触发重连...');
      websocketService.checkConnection();
    }
  };

  // 手动重连
  const manualReconnect = (): void => {
    console.log('🔄 手动重连WebSocket...');
    websocketService.reconnect();
  };

  // 重置重连计数
  const resetReconnectionAttempts = (): void => {
    websocketService.resetReconnectAttempts();
  };

  const disconnectWebSocket = (): void => {
    websocketService.disconnect();
    connectionStatus.value = 'disconnected';
    isConnected.value = false;
    isListenersRegistered = false; // 重置监听器标志位
  };

  // 清理聊天数据
  const clearChat = (): void => {
    currentConversation.value = null;
    conversations.value = [];
    messages.value = {};
    typing.value = {};
    onlineUsers.value = [];
    searchResults.value = [];
    error.value = null;
    unreadMessageIds.value = {};
  };

  let heartbeatIntervalId: number | null = null;

  const initialize = async (): Promise<void> => {
    try {
      await fetchConversations();
      
      // 同步未读消息状态，确保离线期间的消息正确显示
      await syncUnreadMessageStatus();
      
      connectWebSocket();

      // 每 5 秒检查一次连接状态，必要时触发重连
      if (!heartbeatIntervalId) {
        heartbeatIntervalId = window.setInterval(() => {
          checkConnectionAndReconnect();
        }, 5000);
      }
    } catch (err) {
      console.error('Chat initialization failed:', err);
    }
  };

  // 在浏览器刷新或页面卸载时清理计时器
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (heartbeatIntervalId) clearInterval(heartbeatIntervalId);
    });
  }

  return {
    // 状态
    currentConversation,
    conversations,
    messages,
    isLoading,
    isConnected,
    typing,
    onlineUsers,
    error,
    searchQuery,
    searchResults,
    connectionStatus,
    
    // 计算属性
    currentMessages,
    totalUnreadCount,
    
    // 方法
    fetchConversations,
    fetchConversation,
    fetchConversationMembers,
    createSingleChat,
    createGroupChat,
    updateConversation,
    addConversationMembers,
    removeConversationMember,
    updateConversationMember,
    deleteConversation,
    leaveConversation,
    clearConversationMessages,
    fetchMessages,
    loadMoreMessages,
    preloadMessages,
    sendTextMessage,
    sendFileMessage,
    sendLocationMessage,
    recallMessage,
    markMessagesAsRead,
    sendTypingIndicator,
    searchMessages,
    uploadFile,
    getFileDownloadInfo,
    fetchOnlineUsers,
    getUserStatus,
    switchConversation,
    connectWebSocket,
    disconnectWebSocket,
    clearChat,
    initialize,
    
    // 消息同步优化
    addMessageToStore,
    updateConversationLastMessage,
    updateMessageStatus,
    syncMissedMessages,
    syncUnreadMessageStatus,
    resetReconnectionAttempts,
    
    // 连接管理
    checkConnectionAndReconnect,
    manualReconnect,
    downloadFile
  };
}); 