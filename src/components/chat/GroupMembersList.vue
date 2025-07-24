<template>
  <div class="group-members-list">
    <!-- 头部 -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        群聊成员 ({{ members.length }})
      </h3>
      <div class="flex items-center space-x-2">
        <button
          v-if="canAddMembers"
          @click="handleAddMember"
          class="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          添加成员
        </button>
        <button
          v-if="canLeaveGroup"
          @click="showLeaveGroupConfirm"
          class="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          退出群聊
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="p-8 text-center">
      <div class="flex items-center justify-center">
        <svg class="animate-spin h-6 w-6 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-gray-500">加载中...</span>
      </div>
    </div>

    <!-- 成员列表 -->
    <div v-if="members.length > 0">
      <div class="max-h-96 overflow-y-auto overflow-x-visible">
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="member in members"
          :key="member.id"
          class="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <!-- 头像 -->
            <div class="relative">
              <img
                :src="getAvatarUrl(member)"
                :alt="getMemberName(member)"
                class="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-600"
                @error="handleImageError"
              />
              <!-- 在线状态指示器 -->
              <div
                :class="[
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
                  isUserOnline(member.user_id) ? 'bg-green-500' : 'bg-gray-400'
                ]"
              />
            </div>
            
            <!-- 用户信息 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ getMemberName(member) }}
                </h4>
                <!-- 角色标签 -->
                <span
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                    getRoleStyles(member.role)
                  ]"
                >
                  {{ getRoleText(member.role) }}
                </span>
              </div>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  ID: {{ getMemberStandardId(member) }}
                </span>
                <span
                  v-if="member.nickname"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  昵称: {{ member.nickname }}
                </span>
              </div>
              <div class="text-xs text-gray-400 mt-1">
                加入时间: {{ formatJoinTime(member.joined_at) }}
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center space-x-2">
            <!-- 在线状态文本 -->
            <span
              :class="[
                'text-xs',
                isUserOnline(member.user_id) ? 'text-green-500' : 'text-gray-400'
              ]"
            >
              {{ isUserOnline(member.user_id) ? '在线' : '离线' }}
            </span>
            
            <!-- 操作菜单 -->
            <div v-if="canManageMember(member)" class="relative">
              <button
                @click.stop="toggleMemberMenu(member.id)"
                class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                :style="{ backgroundColor: activeMenuMemberId === member.id ? '#3b82f6' : '' }"
              >
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              <!-- 下拉菜单 -->
              <div
                v-if="activeMenuMemberId === member.id"
                v-click-outside="() => closeMenu()"
                class="absolute right-0 top-8 z-[9999] w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1"
                style="z-index: 9999;"
              >
                <button
                  v-if="member.role !== 'owner' && (currentUserRole === 'owner' || currentUserRole === 'admin')"
                  @click="handleChangeRole(member)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {{ member.role === 'admin' ? '设为普通成员' : '设为管理员' }}
                </button>
                
                <button
                  v-if="member.role !== 'owner' && member.user_id !== currentUserId"
                  @click="handleSetNickname(member)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  设置群昵称
                </button>
                
                <hr v-if="canRemoveMember(member)" class="my-1 border-gray-200 dark:border-gray-600" />
                
                <button
                  v-if="canRemoveMember(member)"
                  @click="removeMember(member)"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  移除成员
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="p-8 text-center">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无成员</h3>
      <p class="text-gray-500 dark:text-gray-400">此群聊暂时没有成员</p>
    </div>

    <!-- 确认删除对话框 -->
    <div
      v-if="showRemoveConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 mx-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          确认移除成员
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          确定要移除成员 "{{ removingMember ? getMemberName(removingMember) : '' }}" 吗？此操作无法撤销。
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelRemove"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            取消
          </button>
          <button
            @click="confirmRemove"
            :disabled="removing"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {{ removing ? '移除中...' : '确认移除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 确认退出群聊对话框 -->
    <div
      v-if="showLeaveConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 mx-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          确认退出群聊
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          确定要退出此群聊吗？退出后将无法接收此群的消息，需要重新邀请才能加入。
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelLeaveGroup"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            取消
          </button>
          <button
            @click="confirmLeaveGroup"
            :disabled="leaving"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {{ leaving ? '退出中...' : '确认退出' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, withDefaults, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import { clickOutside } from '@/directives/clickOutside';
import type { ConversationMember, MemberRole, ConversationMemberUpdate } from '@/types/chat';

// 注册指令
const vClickOutside = clickOutside;

interface Props {
  conversationId: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  'close': [];
  'add-member': [];
  'member-removed': [member: ConversationMember];
  'member-updated': [member: ConversationMember];
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();

// 响应式数据
const members = ref<ConversationMember[]>([]);
const activeMenuMemberId = ref<number | null>(null);
const showRemoveConfirm = ref(false);
const removingMember = ref<ConversationMember | null>(null);
const removing = ref(false);
const showLeaveConfirm = ref(false);
const leaving = ref(false);

// 辅助函数 - 获取成员用户名（兼容不同数据格式）
const getMemberName = (member: ConversationMember): string => {
  return member.user_name || member.user?.name || 'Unknown User';
};

// 辅助函数 - 获取成员标准ID（兼容不同数据格式）  
const getMemberStandardId = (member: ConversationMember): string => {
  return member.user_standard_id || member.user?.standard_id || '';
};

// 计算属性
const currentUserId = computed(() => authStore.user?.id || 0);
const currentUserMember = computed(() => 
  members.value.find(member => member.user_id === currentUserId.value)
);
const currentUserRole = computed(() => currentUserMember.value?.role || 'member');

const canAddMembers = computed(() => {
  const role = currentUserRole.value;
  return role === 'owner' || role === 'admin';
});

const canLeaveGroup = computed(() => {
  // 群主不能直接退出群聊，需要先转让群主权限
  const role = currentUserRole.value;
  return role !== 'owner';
});

// 方法
const loadMembers = async () => {
  try {
    const membersList = await chatStore.fetchConversationMembers(props.conversationId);
    members.value = membersList;
  } catch (error) {
    console.error('加载群聊成员失败:', error);
  }
};

const toggleMemberMenu = async (memberId: number) => {
  if (activeMenuMemberId.value === memberId) {
    activeMenuMemberId.value = null;
  } else {
    activeMenuMemberId.value = memberId;
    await nextTick();
  }
};



const closeMenu = () => {
  activeMenuMemberId.value = null;
};

const canManageMember = (member: ConversationMember): boolean => {
  if (member.user_id === currentUserId.value) return false; // 不能操作自己
  if (member.role === 'owner') return false; // 不能操作群主
  
  const userRole = currentUserRole.value;
  if (userRole === 'owner') return true; // 群主可以操作所有人
  if (userRole === 'admin' && member.role === 'member') return true; // 管理员可以操作普通成员
  
  return false;
};

const canRemoveMember = (member: ConversationMember): boolean => {
  return canManageMember(member);
};

const getRoleText = (role: MemberRole): string => {
  switch (role) {
    case 'owner':
      return '群主';
    case 'admin':
      return '管理员';
    case 'member':
      return '成员';
    default:
      return '未知';
  }
};

const getRoleStyles = (role: MemberRole): string => {
  switch (role) {
    case 'owner':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'admin':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'member':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const formatJoinTime = (joinTime: string): string => {
  try {
    const date = new Date(joinTime);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return joinTime;
  }
};

// 缓存头像URL以防止闪烁
const avatarCache = new Map<number, string>();

const getAvatarUrl = (member: ConversationMember): string => {
  // 检查缓存
  if (avatarCache.has(member.user_id)) {
    return avatarCache.get(member.user_id)!;
  }
  
  // 简单的头像生成逻辑
  const name = getMemberName(member);
  const firstLetter = name.charAt(0).toUpperCase();
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#6366f1'];
  const colorIndex = member.user_id % colors.length;
  
  // 返回一个SVG数据URL (修复 UTF-8 字符编码问题)
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'>
      <rect width='40' height='40' fill='${colors[colorIndex]}' />
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='20' font-family='Inter, sans-serif' fill='white'>${firstLetter}</text>
    </svg>
  `;

  // 使用 UTF-8 安全的方式进行 base64 编码
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  const url = `data:image/svg+xml;base64,${encoded}`;
  avatarCache.set(member.user_id, url);
  return url;
};

const handleImageError = (event: Event) => {
  // 图片加载失败时的处理
};

const isUserOnline = (userId: number): boolean => {
  return chatStore.onlineUsers.includes(userId);
};

const handleAddMember = () => {
  emit('add-member');
};

const handleChangeRole = async (member: ConversationMember) => {
  closeMenu();
  
  try {
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    await chatStore.updateConversationMember(props.conversationId, member.user_id, { role: newRole });
    
    // 更新本地成员数据
    const memberIndex = members.value.findIndex(m => m.id === member.id);
    if (memberIndex !== -1) {
      members.value[memberIndex].role = newRole;
    }
    
    emit('member-updated', members.value[memberIndex]);
  } catch (error) {
    console.error('更新成员角色失败:', error);
    // 这里可以添加错误提示
  }
};

const handleSetNickname = async (member: ConversationMember) => {
  closeMenu();
  
  const newNickname = prompt('请输入新的群昵称:', member.nickname || getMemberName(member));
  if (newNickname === null || newNickname.trim() === '') return;
  
  try {
    await chatStore.updateConversationMember(props.conversationId, member.user_id, { nickname: newNickname.trim() });
    
    // 更新本地成员数据
    const memberIndex = members.value.findIndex(m => m.id === member.id);
    if (memberIndex !== -1) {
      members.value[memberIndex].nickname = newNickname.trim();
    }
    
    emit('member-updated', members.value[memberIndex]);
  } catch (error) {
    console.error('更新成员昵称失败:', error);
    // 这里可以添加错误提示
  }
};

const removeMember = async (member: ConversationMember) => {
  removingMember.value = member;
  showRemoveConfirm.value = true;
  closeMenu();
};

const confirmRemove = async () => {
  if (!removingMember.value) return;
  
  removing.value = true;
  try {
    await chatStore.removeConversationMember(props.conversationId, removingMember.value.user_id);
    
    // 从本地列表中移除
    members.value = members.value.filter(m => m.id !== removingMember.value!.id);
    
    emit('member-removed', removingMember.value);
    showRemoveConfirm.value = false;
    removingMember.value = null;
  } catch (error) {
    console.error('移除成员失败:', error);
  } finally {
    removing.value = false;
  }
};

const cancelRemove = () => {
  showRemoveConfirm.value = false;
  removingMember.value = null;
};

// 退出群聊相关方法
const showLeaveGroupConfirm = () => {
  showLeaveConfirm.value = true;
};

const cancelLeaveGroup = () => {
  showLeaveConfirm.value = false;
};

const confirmLeaveGroup = async () => {
  try {
    leaving.value = true;
    await chatStore.leaveConversation(props.conversationId, currentUserId.value);
    
    // 退出成功后关闭模态框并通知父组件
    showLeaveConfirm.value = false;
    emit('close');
    
    // 可以添加成功提示
    console.log('成功退出群聊');
  } catch (error) {
    console.error('退出群聊失败:', error);
    // 这里可以添加错误提示
  } finally {
    leaving.value = false;
  }
};

// 生命周期
watch(
  () => props.conversationId,
  () => {
    members.value = [];
    loadMembers();
  },
  { immediate: true }
);

// 暴露方法供父组件调用
defineExpose({
  loadMembers,
  refreshMembers: loadMembers
});
</script>

<style scoped>
/* 自定义滚动条 */
.max-h-96::-webkit-scrollbar {
  width: 6px;
}

.max-h-96::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-96::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}

/* 暗色主题滚动条 */
.dark .max-h-96::-webkit-scrollbar-thumb {
  background-color: #4a5568;
}

.dark .max-h-96::-webkit-scrollbar-thumb:hover {
  background-color: #2d3748;
}
</style> 