<template>
  <!-- 通知管理组件，不需要显示UI，只处理事件 -->
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { ElNotification, ElMessage } from 'element-plus';
import { websocketService } from '@/services/websocket';
import { useChatStore } from '@/stores/chat';
import type {
  MessageReceivedEvent,
  ConversationCreatedEvent,
  UserOnlineEvent,
  UserOfflineEvent,
  BroadcastReceivedEvent,
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

const chatStore = useChatStore();

// 事件处理器
const handlers = {
  // 即时消息通知
  handleMessageReceived: (data: MessageReceivedEvent) => {
    console.log('📩 收到即时消息通知:', data);
    
    // 如果不是当前会话，显示通知
    if (chatStore.currentConversation?.id !== data.conversation_id) {
      ElNotification({
        title: `来自 ${data.sender_name} 的消息`,
        message: data.content,
        type: 'info',
        duration: 5000,
        position: 'bottom-right'
      });
    }
  },

  // 会话创建通知
  handleConversationCreated: (data: ConversationCreatedEvent) => {
    console.log('🆕 收到会话创建通知:', data);
    
    ElNotification({
      title: '新会话',
      message: `${data.creator_name} 创建了会话: ${data.conversation_name}`,
      type: 'success',
      duration: 5000,
      position: 'bottom-right'
    });
  },

  // 用户上线通知
  handleUserOnline: (data: UserOnlineEvent) => {
    console.log('🟢 用户上线通知:', data);
    
    ElNotification({
      title: '用户上线',
      message: `${data.user_name} 已上线`,
      type: 'info',
      duration: 3000,
      position: 'bottom-right'
    });
  },

  // 用户下线通知
  handleUserOffline: (data: UserOfflineEvent) => {
    console.log('🔴 用户下线通知:', data);
    
    ElNotification({
      title: '用户下线',
      message: `${data.user_name} 已下线`,
      type: 'info',
      duration: 3000,
      position: 'bottom-right'
    });
  },

  // 广播通知
  handleBroadcastReceived: (data: BroadcastReceivedEvent) => {
    console.log('📢 收到广播通知:', data);
    
    const notificationType = data.priority === 'high' ? 'error' : 
                             data.priority === 'normal' ? 'warning' : 'info';
    
    ElNotification({
      title: data.title || '系统广播',
      message: data.content,
      type: notificationType,
      duration: data.priority === 'high' ? 0 : 8000, // 高优先级不自动关闭
      position: 'top-right'
    });
  },

  // 自定义事件通知
  handleCustomEvent: (data: CustomEventEvent) => {
    console.log('🎯 收到自定义事件:', data);
    
    ElNotification({
      title: '系统事件',
      message: `事件类型: ${data.event_type}`,
      type: 'info',
      duration: 5000,
      position: 'bottom-right'
    });
  },

  // 成员退出通知
  handleMemberLeft: (data: MemberLeftEvent) => {
    console.log('👋 成员退出通知:', data);
    
    const actionText = data.is_self_exit ? '退出了' : '被移出了';
    ElMessage({
      message: `用户 ${actionText}会话 ${data.conversation_name}`,
      type: 'warning',
      duration: 3000
    });
  },

  // 会话名称更新通知
  handleConversationNameUpdated: (data: ConversationNameUpdatedEvent) => {
    console.log('✏️ 会话名称更新通知:', data);
    
    ElMessage({
      message: `会话名称已更新为 "${data.conversation_name}"`,
      type: 'info',
      duration: 3000
    });
  },

  // 成员添加通知
  handleMemberAdded: (data: MemberAddedEvent) => {
    console.log('➕ 成员添加通知:', data);
    
    const memberCount = data.added_user_ids.length;
    ElMessage({
      message: `有 ${memberCount} 名新成员加入了会话`,
      type: 'success',
      duration: 4000
    });
  },

  // 成员移除通知
  handleMemberRemoved: (data: MemberRemovedEvent) => {
    console.log('➖ 成员移除通知:', data);
    
    const actionText = data.is_self_exit ? '退出了' : '被移除出';
    ElMessage({
      message: `有成员${actionText}会话`,
      type: 'warning',
      duration: 4000
    });
  },

  // 群组解散通知
  handleConversationDissolved: (data: ConversationDissolvedEvent) => {
    console.log('💥 群组解散通知:', data);
    
    ElNotification({
      title: '群组解散',
      message: `群组 ${data.conversation_name} 已被解散`,
      type: 'error',
      duration: 6000,
      position: 'top-right'
    });
  },

  // 群主转让通知
  handleOwnerTransferred: (data: OwnerTransferredEvent) => {
    console.log('👑 群主转让通知:', data);
    
    ElNotification({
      title: '群主变更',
      message: `群主权限已从 ${data.old_role} 转让为 ${data.new_role}`,
      type: 'warning',
      duration: 5000,
      position: 'bottom-right'
    });
  },

  // 水印更新通知
  handleWatermarkUpdated: (data: WatermarkUpdatedEvent) => {
    console.log('🏷️ 水印更新通知:', data);
    
    ElMessage({
      message: `会话水印已更新为: ${data.watermark_text}`,
      type: 'info',
      duration: 3000
    });
  },

  // 位置更新通知
  handleLocationUpdated: (data: LocationUpdatedEvent) => {
    console.log('📍 位置更新通知:', data);
    
    ElMessage({
      message: `用户位置已更新 (${data.latitude}, ${data.longitude})`,
      type: 'info',
      duration: 3000
    });
  }
};

// 注册事件监听器
const registerEventListeners = () => {
  websocketService.on('message_received', handlers.handleMessageReceived);
  websocketService.on('conversation_created', handlers.handleConversationCreated);
  websocketService.on('user_online', handlers.handleUserOnline);
  websocketService.on('user_offline', handlers.handleUserOffline);
  websocketService.on('broadcast_received', handlers.handleBroadcastReceived);
  websocketService.on('custom_event', handlers.handleCustomEvent);
  websocketService.on('member_left', handlers.handleMemberLeft);
  websocketService.on('conversation_name_updated', handlers.handleConversationNameUpdated);
  websocketService.on('member_added', handlers.handleMemberAdded);
  websocketService.on('member_removed', handlers.handleMemberRemoved);
  websocketService.on('conversation_dissolved', handlers.handleConversationDissolved);
  websocketService.on('owner_transferred', handlers.handleOwnerTransferred);
  websocketService.on('watermark_updated', handlers.handleWatermarkUpdated);
  websocketService.on('location_updated', handlers.handleLocationUpdated);
};

// 移除事件监听器
const removeEventListeners = () => {
  websocketService.off('message_received', handlers.handleMessageReceived);
  websocketService.off('conversation_created', handlers.handleConversationCreated);
  websocketService.off('user_online', handlers.handleUserOnline);
  websocketService.off('user_offline', handlers.handleUserOffline);
  websocketService.off('broadcast_received', handlers.handleBroadcastReceived);
  websocketService.off('custom_event', handlers.handleCustomEvent);
  websocketService.off('member_left', handlers.handleMemberLeft);
  websocketService.off('conversation_name_updated', handlers.handleConversationNameUpdated);
  websocketService.off('member_added', handlers.handleMemberAdded);
  websocketService.off('member_removed', handlers.handleMemberRemoved);
  websocketService.off('conversation_dissolved', handlers.handleConversationDissolved);
  websocketService.off('owner_transferred', handlers.handleOwnerTransferred);
  websocketService.off('watermark_updated', handlers.handleWatermarkUpdated);
  websocketService.off('location_updated', handlers.handleLocationUpdated);
};

onMounted(() => {
  registerEventListeners();
});

onUnmounted(() => {
  removeEventListeners();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 通知动画 */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.notification-enter-active {
  animation: slideInRight 0.3s ease-out;
}

.notification-leave-active {
  animation: slideOutRight 0.3s ease-out;
}
</style> 