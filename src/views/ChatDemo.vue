<template>
  <div class="chat-demo">
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

    <div class="chat-page flex h-screen bg-gray-100 dark:bg-gray-900">
      <!-- 聊天室列表 -->
      <div class="chat-sidebar">
        <div class="sidebar-card">
          <!-- 头部 -->
          <div class="chat-header">
            <div class="header-content">
              <h2 class="header-title">聊天</h2>
              <div class="header-actions">
                <button class="add-btn">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <div class="connection-status">
                  <div class="status-dot connected"></div>
                  <span class="status-text">已连接</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 搜索框 -->
          <div class="search-section">
            <div class="search-container">
                             <input
                 type="text"
                 placeholder="搜索聊天记录..."
                 class="search-input"
               />
              <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- 聊天室列表 -->
          <div class="room-list">
                         <div
               v-for="room in demoRooms"
               :key="room.id"
               @click="selectRoom(room)"
               :class="['room-item', { active: selectedRoom?.id === room.id }]"
             >
              <div class="room-avatar">
                <img :src="room.avatar" :alt="room.name" />
                <div v-if="room.isOnline" class="online-indicator"></div>
              </div>
              <div class="room-info">
                <div class="room-name">{{ room.name }}</div>
                <div class="last-message">{{ room.lastMessage }}</div>
              </div>
                             <div class="room-meta">
                 <div class="time">{{ room.lastMessageTime }}</div>
                 <div v-if="room.unreadCount > 0" class="unread-badge">
                   {{ room.unreadCount }}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 消息区域 -->
      <div class="chat-main">
        <div class="chat-main-card">
          <div v-if="selectedRoom" class="chat-content">
            <!-- 聊天头部 -->
            <div class="chat-header-main">
              <div class="chat-user-info">
                <div class="user-avatar">
                  <img :src="selectedRoom.avatar" :alt="selectedRoom.name" />
                  <div v-if="selectedRoom.isOnline" class="online-indicator"></div>
                </div>
                <div class="user-details">
                  <h3 class="user-name">{{ selectedRoom.name }}</h3>
                  <p class="user-status">
                    {{ selectedRoom.isOnline ? '在线' : '最后在线：1小时前' }}
                  </p>
                </div>
              </div>
              <div class="chat-actions">
                <button class="action-btn">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button class="action-btn">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 消息列表 -->
            <div class="messages-container">
              <div v-for="message in selectedRoom.messages" :key="message.id" :class="['message-wrapper', { 'own-message': message.isOwn }]">
                <div class="message-bubble">
                  <div v-if="!message.isOwn" class="sender-avatar">
                    <img :src="selectedRoom.avatar" :alt="selectedRoom.name" />
                  </div>
                  <div class="message-content">
                    <div v-if="message.type === 'text'" class="message-text">{{ message.content }}</div>
                    <div v-else-if="message.type === 'image'" class="message-image">
                      <img :src="message.content" alt="图片" />
                    </div>
                    <div class="message-time">{{ message.time }}</div>
                  </div>
                </div>
              </div>

                             <!-- 打字指示器 -->
               <div v-if="showTyping" class="typing-indicator">
                <div class="typing-avatar">
                  <img :src="selectedRoom.avatar" :alt="selectedRoom.name" />
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
            <div class="message-input-section">
              <div class="input-container">
                <button class="attachment-btn">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <div class="input-wrapper">
                  <input
                    v-model="newMessage"
                    @keyup.enter="sendMessage"
                    type="text"
                    placeholder="输入消息..."
                    class="message-input"
                  />
                </div>
                <button
                  @click="sendMessage"
                  :disabled="!newMessage.trim()"
                  class="send-button"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 未选择聊天室时的欢迎页面 -->
          <div v-else class="welcome-screen">
            <div class="welcome-content">
              <div class="welcome-icon">
                <svg class="welcome-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 class="welcome-title">选择一个聊天</h3>
              <p class="welcome-subtitle">从左侧列表选择聊天室开始对话</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface DemoRoom {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messageStatus?: boolean;
  messages: {
    id: string;
    content: string;
    isOwn: boolean;
    time: string;
    type: 'text' | 'image';
  }[];
}

const selectedRoom = ref<DemoRoom | null>(null);
const newMessage = ref('');
const showTyping = ref(false);

const demoRooms = ref<DemoRoom[]>([
  {
    id: '1',
    name: '张三',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    unreadCount: 3,
    lastMessage: '你好，有时间聊聊吗？',
    lastMessageTime: '刚才',
    messageStatus: true,
    messages: [
      { id: '1', content: '你好！', isOwn: false, time: '10:30', type: 'text' },
      { id: '2', content: '你好，很高兴认识你！', isOwn: true, time: '10:31', type: 'text' },
      { id: '3', content: '有时间聊聊吗？', isOwn: false, time: '10:32', type: 'text' },
      { id: '4', content: '当然可以，有什么想聊的？', isOwn: true, time: '10:33', type: 'text' },
      { id: '5', content: '你好，有时间聊聊吗？', isOwn: false, time: '10:34', type: 'text' },
    ]
  },
  {
    id: '2',
    name: '李四',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isOnline: false,
    unreadCount: 0,
    lastMessage: '明天见！',
    lastMessageTime: '昨天',
    messageStatus: false,
    messages: [
      { id: '1', content: '明天的会议准备好了吗？', isOwn: false, time: '昨天 15:30', type: 'text' },
      { id: '2', content: '已经准备好了，明天见！', isOwn: true, time: '昨天 15:31', type: 'text' },
      { id: '3', content: '明天见！', isOwn: false, time: '昨天 15:32', type: 'text' },
    ]
  },
  {
    id: '3',
    name: '王五',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0e4?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    unreadCount: 1,
    lastMessage: '[图片]',
    lastMessageTime: '2小时前',
    messageStatus: true,
    messages: [
      { id: '1', content: '看看这个！', isOwn: false, time: '2小时前', type: 'text' },
      { id: '2', content: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=200&fit=crop', isOwn: false, time: '2小时前', type: 'image' },
      { id: '3', content: '哇，好漂亮的风景！', isOwn: true, time: '2小时前', type: 'text' },
    ]
  },
  {
    id: '4',
    name: '项目组',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    unreadCount: 0,
    lastMessage: '大家辛苦了！',
    lastMessageTime: '1天前',
    messageStatus: false,
    messages: [
      { id: '1', content: '今天的工作进展如何？', isOwn: false, time: '1天前 14:00', type: 'text' },
      { id: '2', content: '进展顺利，预计明天能完成', isOwn: true, time: '1天前 14:05', type: 'text' },
      { id: '3', content: '很好，大家辛苦了！', isOwn: false, time: '1天前 14:10', type: 'text' },
    ]
  }
]);

const selectRoom = (room: DemoRoom) => {
  selectedRoom.value = room;
  // 清除未读消息
  room.unreadCount = 0;
  
  // 模拟打字指示器
  if (room.isOnline) {
    setTimeout(() => {
      showTyping.value = true;
      setTimeout(() => {
        showTyping.value = false;
      }, 2000);
    }, 1000);
  }
};

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedRoom.value) return;
  
  const message = {
    id: Date.now().toString(),
    content: newMessage.value.trim(),
    isOwn: true,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    type: 'text' as const
  };
  
  selectedRoom.value.messages.push(message);
  selectedRoom.value.lastMessage = message.content;
  selectedRoom.value.lastMessageTime = '刚才';
  
  newMessage.value = '';
  
  // 模拟对方回复
  setTimeout(() => {
    if (selectedRoom.value && selectedRoom.value.isOnline) {
      const responses = ['好的！', '收到', '明白了', '没问题', '👍'];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const replyMessage = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        isOwn: false,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        type: 'text' as const
      };
      
      selectedRoom.value.messages.push(replyMessage);
      selectedRoom.value.lastMessage = replyMessage.content;
      selectedRoom.value.lastMessageTime = '刚才';
    }
  }, 1000 + Math.random() * 2000);
};

onMounted(() => {
  // 默认选择第一个聊天室
  selectRoom(demoRooms.value[0]);
});
</script>

<style scoped lang="scss">
.chat-demo {
  height: 100vh;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
      background: rgba(255, 255, 255, 0.1);
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

.chat-page {
  position: relative;
  z-index: 2;
  height: 100vh;
  display: flex;
  padding: 1rem;
  gap: 1rem;
  box-sizing: border-box;
}

/* 侧边栏样式 */
.chat-sidebar {
  width: 320px;
  
  .sidebar-card {
    height: 100%;
    background: white;
    border-radius: 15px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .chat-header {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      padding: 1.5rem;
      color: white;
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .header-title {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          
          .add-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            border-radius: 8px;
            padding: 0.5rem;
            transition: all 0.3s ease;
            cursor: pointer;
            
            &:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          }
          
          .connection-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            
            .status-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              
              &.connected {
                background: #10b981;
                box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
              }
            }
            
            .status-text {
              font-size: 0.85rem;
              opacity: 0.9;
            }
          }
        }
      }
    }
    
    .search-section {
      padding: 1rem;
      
      .search-container {
        position: relative;
        
        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          background: white;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          
          &:focus {
            outline: none;
            border-color: #4facfe;
            box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
          }
          
          &::placeholder {
            color: #adb5bd;
          }
        }
        
        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1rem;
          height: 1rem;
          color: #adb5bd;
        }
      }
    }
    
    .room-list {
      flex: 1;
      overflow-y: auto;
      
      .room-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        border-bottom: 1px solid #f0f0f0;
        gap: 1rem;
        
        &:hover {
          background: #f8f9fa;
        }
        
        &.active {
          background: rgba(79, 172, 254, 0.1);
          border-right: 3px solid #4facfe;
        }
        
        .room-avatar {
          position: relative;
          flex-shrink: 0;
          
          img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
          }
          
          .online-indicator {
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background: #10b981;
            border: 2px solid white;
            border-radius: 50%;
          }
        }
        
        .room-info {
          flex: 1;
          min-width: 0;
          
          .room-name {
            font-weight: 500;
            color: #333;
            margin-bottom: 0.25rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .last-message {
            color: #666;
            font-size: 0.85rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        
        .room-meta {
          text-align: right;
          flex-shrink: 0;
          
          .time {
            color: #999;
            font-size: 0.75rem;
            margin-bottom: 0.25rem;
          }
          
          .unread-badge {
            background: #ff4757;
            color: white;
            border-radius: 10px;
            padding: 0.2rem 0.5rem;
            font-size: 0.7rem;
            font-weight: 600;
            min-width: 18px;
            text-align: center;
          }
        }
      }
    }
  }
}

/* 主聊天区域样式 */
.chat-main {
  flex: 1;
  
  .chat-main-card {
    height: 100%;
    background: white;
    border-radius: 15px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .chat-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      
      .chat-header-main {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        padding: 1rem 1.5rem;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .chat-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          
          .user-avatar {
            position: relative;
            
            img {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              object-fit: cover;
            }
            
            .online-indicator {
              position: absolute;
              bottom: -2px;
              right: -2px;
              width: 10px;
              height: 10px;
              background: #10b981;
              border: 2px solid white;
              border-radius: 50%;
            }
          }
          
          .user-details {
            .user-name {
              margin: 0;
              font-size: 1.1rem;
              font-weight: 600;
            }
            
            .user-status {
              margin: 0;
              font-size: 0.85rem;
              opacity: 0.9;
            }
          }
        }
        
        .chat-actions {
          display: flex;
          gap: 0.5rem;
          
          .action-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            border-radius: 8px;
            padding: 0.5rem;
            transition: all 0.3s ease;
            cursor: pointer;
            
            &:hover {
              background: rgba(255, 255, 255, 0.3);
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
            
            .message-bubble .message-content {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              color: white;
              border-radius: 15px 15px 5px 15px;
            }
          }
          
          &:not(.own-message) {
            justify-content: flex-start;
            
            .message-bubble {
              display: flex;
              gap: 0.5rem;
              
              .sender-avatar {
                img {
                  width: 28px;
                  height: 28px;
                  border-radius: 50%;
                  object-fit: cover;
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
            max-width: 70%;
            padding: 0.75rem 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            
            .message-text {
              margin-bottom: 0.25rem;
              line-height: 1.4;
              word-wrap: break-word;
            }
            
            .message-image img {
              max-width: 200px;
              border-radius: 8px;
              margin-bottom: 0.25rem;
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
          
          .typing-avatar img {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            object-fit: cover;
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
      
      .message-input-section {
        padding: 1rem;
        background: white;
        border-top: 1px solid #e9ecef;
        
        .input-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          
          .attachment-btn {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            color: #6c757d;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            cursor: pointer;
            
            &:hover {
              background: #e9ecef;
              color: #495057;
            }
          }
          
          .input-wrapper {
            flex: 1;
            
            .message-input {
              width: 100%;
              padding: 0.75rem 1rem;
              border: 2px solid #e9ecef;
              border-radius: 25px;
              background: #f8f9fa;
              font-size: 0.9rem;
              transition: all 0.3s ease;
              
              &:focus {
                outline: none;
                border-color: #4facfe;
                background: white;
                box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
              }
              
              &::placeholder {
                color: #adb5bd;
              }
            }
          }
          
          .send-button {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            border: none;
            color: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            cursor: pointer;
            
            &:hover:not(:disabled) {
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(79, 172, 254, 0.3);
            }
            
            &:disabled {
              background: #e9ecef;
              color: #adb5bd;
              cursor: not-allowed;
              transform: none;
              box-shadow: none;
            }
          }
        }
      }
    }
    
    .welcome-screen {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .welcome-content {
        text-align: center;
        padding: 2rem;
        
        .welcome-icon {
          margin-bottom: 1.5rem;
          
          .welcome-svg {
            width: 4rem;
            height: 4rem;
            color: #4facfe;
          }
        }
        
        .welcome-title {
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .welcome-subtitle {
          color: #666;
          font-size: 1rem;
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

/* 滚动条样式 */
.room-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.room-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.room-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
  
  &:hover {
    background: #a8a8a8;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .chat-page {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .chat-sidebar {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .chat-page {
    flex-direction: column;
    padding: 0.25rem;
  }
  
  .chat-sidebar {
    width: 100%;
    height: 250px;
    
    .sidebar-card .room-list .room-item {
      padding: 0.75rem;
    }
  }
  
  .chat-main {
    flex: 1;
  }
}
</style> 