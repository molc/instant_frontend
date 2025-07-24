// 聊天相关的类型定义 - 根据API文档规范

// 消息状态枚举 - 根据API文档
export type MessageStatus = 
  | 'pending'     // 待发送（前端状态）
  | 'sending'     // 发送中（前端状态）
  | 'sent'        // 已发送
  | 'delivered'   // 已送达
  | 'read'        // 已读
  | 'failed'      // 发送失败
  | 'recalled'    // 已撤回
  | 'edited';     // 已编辑

// 消息类型 - 支持字符串和数字格式以兼容不同API版本
export type MessageType = 'text' | 'file' | 'location' | 'system' | number;

// 会话类型 - 根据API文档
export type ConversationType = 'single' | 'group';

// 会话状态 - 根据API文档
export type ConversationStatus = 'active' | 'inactive' | 'archived';

// 成员角色 - 根据API文档
export type MemberRole = 'owner' | 'admin' | 'member' | '群主' | '管理员' | '成员';

// 成员状态 - 根据API文档
export type MemberStatus = 'active' | 'inactive' | 'muted' | 'banned';

// 消息定义 - 根据API文档 schemas.MessageResponse
// 文件信息结构 - 根据实际API响应
export interface MessageFileInfo {
  id: number;
  file_id: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

export interface Message {
  id: number;                      // 消息ID
  conversation_id: number;         // 会话ID
  sender_id: number;               // 发送者ID
  message_type: MessageType;       // 消息类型
  content: string | null;          // 消息内容
  content_data?: any;              // 额外内容数据
  status: MessageStatus;           // 消息状态
  created_at: string;              // 创建时间
  updated_at: string;              // 更新时间
  recalled_at?: string | null;     // 撤回时间
  reply_to_id?: number | null;     // 回复消息ID
  
  // 文件消息字段 - 根据实际API响应
  file_info?: MessageFileInfo;     // 文件信息对象
  
  // 位置消息字段
  latitude?: string | null;        // 纬度（位置消息）
  longitude?: string | null;       // 经度（位置消息）
  address?: string | null;         // 地址（位置消息）
  
  // 发送者信息
  sender_name?: string | null;     // 发送者姓名（根据API文档）
  sender_standard_id?: string | null; // 发送者标准ID（前端扩展）
  
  // 兼容性字段（向后兼容）
  file_id?: string;                // 兼容旧版本
  file_name?: string;              // 兼容旧版本
  file_size?: number;              // 兼容旧版本
}

// 会话定义 - 根据API文档 schemas.ConversationResponse
export interface Conversation {
  id: number;                      // 会话ID
  type: ConversationType;          // 会话类型
  name: string;                    // 会话名称
  avatar?: string;                 // 会话头像
  max_members: number;             // 最大成员数
  allow_invite: boolean;           // 是否允许邀请
  allow_member_modify: boolean;    // 是否允许成员修改
  description?: string;            // 会话描述
  status: ConversationStatus;      // 会话状态
  creator_id: number;              // 创建者ID
  created_at: string;              // 创建时间
  updated_at: string;              // 更新时间
}

// 会话列表项 - 根据实际API响应
export interface ConversationListItem {
  id: number;
  name: string | null;             // API返回可能为null
  type: ConversationType;
  description?: string | null;
  avatar?: string | null;
  max_members: number;
  allow_invite: boolean;
  allow_member_modify: boolean;
  status: ConversationStatus;
  creator_id: number;
  created_at: string;
  updated_at: string;
  member_count?: number | null;    // API返回可能为null
  last_message_at?: string | null; // API返回可能为null
  unread_count?: number;           // 未读消息数（前端计算）
  participants?: Array<{           // API实际返回的参与者数据
    id: number;
    name: string;
    standard_id: string;
    is_active: boolean;
  }>;
}

// 会话列表响应包装 - 根据API文档
export interface ConversationListResponse {
  conversations: ConversationListItem[];
  total: number;
  page: number;
  page_size: number;
}

// 会话成员 - 兼容多种数据格式
export interface ConversationMember {
  id: number;                      // 成员记录ID
  conversation_id: number;         // 会话ID
  user_id: number;                 // 用户ID
  role: MemberRole;                // 角色
  status: MemberStatus;            // 状态
  joined_at: string;               // 加入时间
  nickname?: string;               // 群昵称
  muted_until?: string;            // 禁言截止时间
  
  // 支持平铺结构（API直接返回）
  user_name?: string;              // 用户姓名
  user_standard_id?: string;       // 用户标准ID
  
  // 支持嵌套结构（前端处理后）
  user?: {
    id: number;
    name: string;
    standard_id: string;
    is_active: boolean;
  };
}

// 会话成员列表响应 - 根据API文档
export interface ConversationMemberListResponse {
  members: ConversationMember[];
  total: number;
}

// 创建单聊请求 - 根据API文档 schemas.SingleChatCreate
export interface SingleChatCreate {
  target_user_id: number;
}

// 创建群聊请求 - 根据API文档 schemas.GroupChatCreate
export interface GroupChatCreate {
  name: string;
  description?: string;
  member_ids: number[];
  max_members?: number;
  allow_invite?: boolean;
  allow_member_modify?: boolean;
}

// 更新会话请求 - 根据API文档 schemas.ConversationUpdate
export interface ConversationUpdate {
  name?: string;
  description?: string;
  avatar?: string;
}

// 添加成员请求 - 根据API文档 schemas.ConversationMemberAdd
export interface ConversationMemberAdd {
  user_ids: number[];
  role?: MemberRole;
}

// 更新成员请求 - 根据API文档 schemas.ConversationMemberUpdate
export interface ConversationMemberUpdate {
  role?: MemberRole;
  nickname?: string;
  status?: MemberStatus;
  muted_until?: string;
}

// 发送文本消息请求 - 根据API文档 schemas.TextMessageCreate
export interface TextMessageCreate {
  conversation_id: number;
  content: string;
  reply_to_id?: number;
}

// 发送文件消息请求 - 根据API文档 schemas.FileMessageCreate
export interface FileMessageCreate {
  conversation_id: number;
  file_id: string;
  file_name: string;
  file_size: number;
  content?: string;
}

// 发送位置消息请求 - 根据API文档 schemas.LocationMessageCreate
export interface LocationMessageCreate {
  conversation_id: number;
  latitude: string;
  longitude: string;
  address?: string;
}

// 消息列表响应 - 根据API文档 schemas.MessageListResponse
export interface MessageListResponse {
  messages: Message[];
  has_more: boolean;
  limit: number;
}

// 消息更新请求 - 根据API文档 schemas.MessageUpdate
export interface MessageUpdate {
  content?: string;
  status?: MessageStatus;
}

// 消息已读回执创建 - 根据API文档 schemas.MessageReadReceiptCreate
export interface MessageReadReceiptCreate {
  conversation_id: number;
  message_ids: number[];
}

// 消息已读回执响应 - 根据API文档 schemas.MessageReadReceiptResponse
export interface MessageReadReceiptResponse {
  id: number;
  message_id: number;
  user_id: number;
  read_at: string;
  user: {
    id: number;
    standard_id: string;
    nickname: string;
    avatar?: string;
  };
}

// 正在输入消息 - 根据API文档 schemas.TypingMessage
export interface TypingMessage {
  conversation_id: number;
  is_typing: boolean;
}

// 文件上传响应 - 根据实际API响应
export interface FileUploadResponse {
  id: number;
  file_id: string;
  file_name: string;      // 实际API返回 file_name，不是 original_name
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  uploader_id: number;
  
  // 兼容性字段
  file_url?: string;
  original_name?: string;
  mime_type?: string;
}

// 文件信息 - 根据API文档 schemas.FileInfo
export interface FileInfo {
  id: number;
  file_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  uploader_id: number;
}

// 文件下载信息 - 根据API文档 schemas.FileDownloadInfo
export interface FileDownloadInfo {
  file_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  download_url: string;
}

// 文件列表响应 - 根据API文档 schemas.FileListResponse
export interface FileListResponse {
  files: FileInfo[];
  total: number;
  skip: number;
  limit: number;
}

// 在线用户响应 - 根据API文档 /realtime/online-users
export interface OnlineUsersResponse {
  online_users: number[];
  count: number;                     // 根据API文档，字段名应该是count
}

// 用户状态响应 - 根据API文档 /realtime/user-status/{user_id}
export interface UserStatusResponse {
  user_id: number;
  is_online: boolean;                // 根据API文档
  last_seen: string;                 // 根据API文档
}

// 连接统计响应 - 根据API文档 /realtime/connection-stats
export interface ConnectionStats {
  total_online_users: number;
  total_connections: number;
  [key: string]: any;
}

// WebSocket 消息类型
export interface WebSocketMessage {
  type: 'connection_established' | 'heartbeat' | 'message' | 'typing' | 'mark_read' | 'message_status' | 'user_online' | 'user_offline';
  payload: any;
  timestamp: string;
}

// 聊天状态管理
export interface ChatState {
  currentConversation: Conversation | null;
  conversations: ConversationListItem[];
  messages: Record<number, Message[]>;
  isLoading: boolean;
  isConnected: boolean;
  typing: Record<number, number[]>;        // conversation_id -> user_ids
  onlineUsers: number[];
  error: string | null;
  searchQuery: string;
  searchResults: Message[];
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
}

// 消息搜索参数
export interface MessageSearchParams {
  conversation_id: number;
  keyword: string;
  limit?: number;
} 

// ===== WebSocket事件类型定义 - 根据API文档事件通知章节 =====

// 新消息事件 - API事件类型: new_message
export interface NewMessageEvent {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: MessageType;
  timestamp: string;
  file_id?: string;
  file_info?: MessageFileInfo;
}

// 即时消息通知 - API事件类型: message_received
export interface MessageReceivedEvent {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: MessageType;
  created_at: string;
  sender_name: string;
  sender_standard_id: string;
  file_id?: string;
  file_info?: MessageFileInfo;
}

// 会话创建通知 - API事件类型: conversation_created
export interface ConversationCreatedEvent {
  conversation_id: number;
  conversation_type: ConversationType;
  conversation_name: string;
  creator_id: number;
  creator_name: string;
  participant_ids: number[];
  created_at: string;
}

// 用户上线通知 - API事件类型: user_online
export interface UserOnlineEvent {
  user_id: number;
  user_name: string;
  standard_id: string;
  is_online: boolean;
  timestamp: string;
}

// 用户下线通知 - API事件类型: user_offline
export interface UserOfflineEvent {
  user_id: number;
  user_name: string;
  standard_id: string;
  is_online: boolean;
  timestamp: string;
}

// 广播通知 - API事件类型: broadcast_received
export interface BroadcastReceivedEvent {
  broadcast_id: number;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high';
  sent_at: string;
}

// 自定义事件通知 - API事件类型: custom_event
export interface CustomEventEvent {
  event_type: string;
  event_data: Record<string, any>;
  triggered_at: string;
}

// 退出会话通知 - API事件类型: member_left
export interface MemberLeftEvent {
  conversation_id: number;
  conversation_name: string;
  removed_user_id: number;
  operator_id: number;
  is_self_exit: boolean;
  participant_ids: number[];
  timestamp: string;
}

// 会话名称修改通知 - API事件类型: conversation_name_updated
export interface ConversationNameUpdatedEvent {
  conversation_id: number;
  conversation_name: string;
  updater_id: number;
  update_type: string;
  participant_ids: number[];
  timestamp: string;
}

// 添加成员通知 - API事件类型: member_added
export interface MemberAddedEvent {
  conversation_id: number;
  operator_id: number;
  added_user_ids: number[];
  participant_ids: number[];
  timestamp: string;
}

// 移除成员通知 - API事件类型: member_removed
export interface MemberRemovedEvent {
  conversation_id: number;
  operator_id: number;
  removed_user_id: number;
  participant_ids: number[];
  is_self_exit: boolean;
  timestamp: string;
}

// 群组解散通知 - API事件类型: conversation_dissolved
export interface ConversationDissolvedEvent {
  conversation_id: number;
  conversation_name: string;
  operator_id: number;
  participant_ids: number[];
  dissolved_at: string;
}

// 群主转让通知 - API事件类型: owner_transferred
export interface OwnerTransferredEvent {
  conversation_id: number;
  operator_id: number;
  target_user_id: number;
  old_role: string;
  new_role: string;
  participant_ids: number[];
  timestamp: string;
}

// 水印修改通知 - API事件类型: watermark_updated
export interface WatermarkUpdatedEvent {
  conversation_id: number;
  operator_id: number;
  watermark_text: string;
  participant_ids: number[];
  timestamp: string;
}

// 位置上报通知 - API事件类型: location_updated
export interface LocationUpdatedEvent {
  user_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

// 用户状态变化事件
export interface UserStatusChangedEvent {
  user_id: number;
  is_online: boolean;
  timestamp: string;
}

// 会话更新事件
export interface ConversationUpdatedEvent {
  conversation_id: number;
  updater_id: number;
  update_type: string;
  participant_ids: number[];
  timestamp: string;
}

// 会话删除事件
export interface ConversationDeletedEvent {
  conversation_id: number;
  operator_id: number;
  conversation_type: ConversationType;
  participant_ids: number[];
  timestamp: string;
}

// 角色变更事件
export interface RoleChangedEvent {
  conversation_id: number;
  operator_id: number;
  target_user_id: number;
  old_role: string;
  new_role: string;
  participant_ids: number[];
  timestamp: string;
}

// 正在输入指示事件
export interface TypingIndicatorEvent {
  conversation_id: number;
  sender_id: number;
  is_typing: boolean;
  timestamp: string;
}

// 连接建立确认事件
export interface ConnectionEstablishedEvent {
  connection_id: string;
  user_id: number;
  timestamp: string;
}

// 心跳包事件
export interface HeartbeatEvent {
  timestamp: string;
}

// Pong响应事件
export interface PongEvent {
  timestamp: string;
}

// 完整的WebSocket消息类型扩展
export interface ExtendedWebSocketMessage {
  type: 'connection_established' | 'heartbeat' | 'message' | 'typing' | 'mark_read' | 'message_status' 
        | 'user_online' | 'user_offline' | 'user_status_changed' | 'message_received' | 'conversation_created' 
        | 'broadcast_received' | 'custom_event' | 'member_left' | 'conversation_name_updated'
        | 'member_added' | 'member_removed' | 'conversation_dissolved' | 'owner_transferred'
        | 'watermark_updated' | 'location_updated' | 'new_message' | 'conversation_updated'
        | 'conversation_deleted' | 'role_changed' | 'typing_indicator' | 'pong';
  event?: string; // API文档中的event字段
  data?: any;     // API文档中的data字段
  payload?: any;  // 兼容原有格式
  timestamp?: string;
}

// WebSocket事件映射类型，用于类型安全的事件处理
export type WebSocketEventMap = {
  // 原有事件（更新为正确的类型）
  connection_established: ConnectionEstablishedEvent;
  heartbeat: HeartbeatEvent;
  message: Message;
  typing: { conversation_id: number; user_id: number; is_typing: boolean };
  mark_read: { conversation_id: number; message_ids: number[] };
  message_status: { message_id: number; status: string };
  online: number[]; // 兼容旧版本
  connect: undefined;
  disconnect: undefined;
  
  // 新增的API事件类型
  new_message: NewMessageEvent;
  message_received: MessageReceivedEvent;
  conversation_created: ConversationCreatedEvent;
  user_online: UserOnlineEvent;
  user_offline: UserOfflineEvent;
  user_status_changed: UserStatusChangedEvent;
  broadcast_received: BroadcastReceivedEvent;
  custom_event: CustomEventEvent;
  member_left: MemberLeftEvent;
  conversation_name_updated: ConversationNameUpdatedEvent;
  member_added: MemberAddedEvent;
  member_removed: MemberRemovedEvent;
  conversation_dissolved: ConversationDissolvedEvent;
  owner_transferred: OwnerTransferredEvent;
  watermark_updated: WatermarkUpdatedEvent;
  location_updated: LocationUpdatedEvent;
  
  // 补充的API文档事件类型
  conversation_updated: ConversationUpdatedEvent;
  conversation_deleted: ConversationDeletedEvent;
  role_changed: RoleChangedEvent;
  typing_indicator: TypingIndicatorEvent;
  pong: PongEvent;
}; 