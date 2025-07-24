/* eslint-disable @typescript-eslint/ban-ts-comment */
import mitt from 'mitt';
import type { Emitter } from 'mitt';
import { useAuthStore } from '@/stores/auth';
import type { Message, WebSocketEventMap, ExtendedWebSocketMessage } from '@/types/chat';

class WebSocketService {
  private socket: WebSocket | null = null;
  private emitter: Emitter<WebSocketEventMap> = mitt<WebSocketEventMap>();
  private reconnectTimer: number | null = null;
  private reconnectDelay = 1000; // 初始1s
  private readonly maxReconnectDelay = 30000; // 最大30s
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10; // 增加重连次数
  private heartbeatTimer: number | null = null;
  private readonly heartbeatInterval = 30000; // 30s心跳检测
  private isReconnecting = false;
  private isManualDisconnect = false;

  public connect() {
    // 避免并发connect
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // 每次真正尝试前复位标志
    this.isManualDisconnect = false;
    this.isReconnecting = false;

    const authStore = useAuthStore();
    const token = authStore.token;
    const user = authStore.user;
    
    if (!token || !user) {
      console.warn('⚠️  No auth token or user found, skip websocket connection');
      return;
    }

    // --------------- 生成 WebSocket URL ---------------
    // 根据API文档使用 /ws/{user_id}?token={jwt_token} 格式
    const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://172.19.103.122:8000';
    const WS_PATH = `/ws/${user.id}`;
    
    // 构建WebSocket URL - 根据API文档使用token参数
    const wsUrl = `${WS_BASE_URL}${WS_PATH}?token=${encodeURIComponent(token)}&v=${Date.now()}`;
    
    console.log('🔗 WebSocket连接配置:', {
      WS_BASE_URL,
      WS_PATH,
      user_id: user.id,
      token_length: token.length,
      wsUrl: wsUrl.replace(token, '***') // 隐藏token用于日志
    });

    this.socket = new WebSocket(wsUrl);

    this.socket.addEventListener('open', () => {
      console.log('✅ WebSocket连接成功');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // 重置退避
      this.isReconnecting = false;
      this.startHeartbeat(); // 开始心跳检测
      this.emitter.emit('connect', undefined);
    });

    this.socket.addEventListener('message', (event) => {
      try {
        const data: ExtendedWebSocketMessage = JSON.parse(event.data);
        
        // 支持两种格式：新的API格式（event+data）和旧格式（type+payload）
        const eventType = data.event || data.type;
        const eventData = data.data || data.payload;
        
        console.log('📨 WebSocket收到消息:', { eventType, eventData });
        
        switch (eventType) {
          // 原有事件类型
          case 'connection_established':
            this.emitter.emit('connection_established', eventData);
            break;
          case 'heartbeat':
            this.emitter.emit('heartbeat', eventData);
            break;
          case 'message':
            this.emitter.emit('message', eventData as Message);
            break;
          case 'typing':
            this.emitter.emit('typing', eventData as { conversation_id: number; user_id: number; is_typing: boolean });
            break;
          case 'mark_read':
            this.emitter.emit('mark_read', eventData);
            break;
          case 'message_status':
            this.emitter.emit('message_status', eventData);
            break;
          case 'online':
            // 兼容旧版本
            this.emitter.emit('online', eventData as number[]);
            break;
            
          // ===== 新增的API事件类型 =====
          case 'new_message':
            console.log('📩 收到新消息:', eventData);
            this.emitter.emit('new_message', eventData);
            break;
          case 'message_received':
            console.log('📩 收到即时消息通知:', eventData);
            this.emitter.emit('message_received', eventData);
            break;
          case 'conversation_created':
            console.log('🆕 收到会话创建通知:', eventData);
            this.emitter.emit('conversation_created', eventData);
            break;
          case 'user_online':
            console.log('🟢 用户上线通知:', eventData);
            this.emitter.emit('user_online', eventData);
            break;
          case 'user_offline':
            console.log('🔴 用户下线通知:', eventData);
            this.emitter.emit('user_offline', eventData);
            break;
          case 'user_status_changed':
            console.log('📊 用户状态变化通知:', eventData);
            this.emitter.emit('user_status_changed', eventData);
            break;
          case 'broadcast_received':
            console.log('📢 收到广播通知:', eventData);
            this.emitter.emit('broadcast_received', eventData);
            break;
          case 'custom_event':
            console.log('🎯 收到自定义事件:', eventData);
            this.emitter.emit('custom_event', eventData);
            break;
          case 'member_left':
            console.log('👋 成员退出通知:', eventData);
            this.emitter.emit('member_left', eventData);
            break;
          case 'conversation_name_updated':
            console.log('✏️ 会话名称更新通知:', eventData);
            this.emitter.emit('conversation_name_updated', eventData);
            break;
          case 'member_added':
            console.log('➕ 成员添加通知:', eventData);
            this.emitter.emit('member_added', eventData);
            break;
          case 'member_removed':
            console.log('➖ 成员移除通知:', eventData);
            this.emitter.emit('member_removed', eventData);
            break;
          case 'conversation_dissolved':
            console.log('💥 群组解散通知:', eventData);
            this.emitter.emit('conversation_dissolved', eventData);
            break;
          case 'owner_transferred':
            console.log('👑 群主转让通知:', eventData);
            this.emitter.emit('owner_transferred', eventData);
            break;
          case 'watermark_updated':
            console.log('🏷️ 水印更新通知:', eventData);
            this.emitter.emit('watermark_updated', eventData);
            break;
          case 'location_updated':
            console.log('📍 位置更新通知:', eventData);
            this.emitter.emit('location_updated', eventData);
            break;
          
          // 补充缺失的API文档事件
          case 'conversation_updated':
            console.log('📝 会话更新通知:', eventData);
            this.emitter.emit('conversation_updated', eventData);
            break;
          case 'conversation_deleted':
            console.log('🗑️ 会话删除通知:', eventData);
            this.emitter.emit('conversation_deleted', eventData);
            break;
          case 'role_changed':
            console.log('🔄 角色变更通知:', eventData);
            this.emitter.emit('role_changed', eventData);
            break;
          case 'typing_indicator':
            console.log('✍️ 正在输入指示:', eventData);
            this.emitter.emit('typing_indicator', eventData);
            break;
          case 'pong':
            console.log('🏓 Pong响应:', eventData);
            this.emitter.emit('pong', eventData);
            break;
            
          default:
            console.warn('⚠️ 未知的WebSocket事件类型:', eventType, eventData);
        }
      } catch (e) {
        console.error('❌ WebSocket消息解析错误:', e);
      }
    });

    this.socket.addEventListener('close', (event) => {
      console.log('🔗 WebSocket连接关闭:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        isManualDisconnect: this.isManualDisconnect
      });
      
      this.stopHeartbeat();
      this.resetSocket();
      this.emitter.emit('disconnect', undefined);
      
      if (!this.isManualDisconnect) this.scheduleReconnect();
    });

    this.socket.addEventListener('error', (event) => {
      console.error('🔗 WebSocket连接错误:', {
        error: event,
        readyState: this.socket?.readyState,
        reconnectAttempts: this.reconnectAttempts,
        url: wsUrl.replace(token, '***')
      });
      this.socket?.close();
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat(); // 清除已有的心跳
    
    this.heartbeatTimer = window.setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        // 发送心跳包
        this.send({ type: 'ping' });
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.isManualDisconnect) return;
    if (this.reconnectTimer) return; // 已排队

    const delay = this.reconnectDelay;
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);

    console.log(`🔄 WebSocket重连尝试 ${this.reconnectAttempts+1}，${delay}ms后重试`);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isManualDisconnect) this.connect();
    }, delay);
  }

  public disconnect() {
    this.stopHeartbeat(); // 停止心跳
    this.isReconnecting = false; // 标记不再重连
    this.isManualDisconnect = true; // 标记为手动断开
    
    if (this.socket) {
      this.socket.close();
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.reconnectAttempts = 0; // 重置重连次数
  }

  public on<K extends keyof WebSocketEventMap>(type: K, handler: (payload: WebSocketEventMap[K]) => void) {
    this.emitter.on(type, handler);
  }

  public off<K extends keyof WebSocketEventMap>(type: K, handler: (payload: WebSocketEventMap[K]) => void) {
    this.emitter.off(type, handler);
  }

  public send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  public resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }

  public getConnectionState() {
    return {
      readyState: this.socket?.readyState,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      isReconnecting: this.isReconnecting,
      isConnected: this.socket?.readyState === WebSocket.OPEN
    };
  }

  // 手动重连
  public reconnect() {
    console.log('🔄 手动触发重连...');
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  // 检查连接状态并在需要时重连
  public checkConnection() {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      console.log('🔍 检测到连接断开，开始重连...');
      this.reconnect();
    }
  }

  // 统一在close/error后调用
  private resetSocket() {
    if (this.socket) {
      try { this.socket.close(); } catch {}
    }
    this.socket = null;
  }
}

export const websocketService = new WebSocketService(); 