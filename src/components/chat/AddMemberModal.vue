<template>
  <div class="add-member-modal">
    <!-- 搜索用户 -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        搜索用户
      </label>
      <div class="relative">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="输入用户名或用户ID搜索..."
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div v-if="searching" class="absolute right-3 top-2.5">
          <svg class="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">搜索结果</h4>
      <div class="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
        <div
          v-for="user in searchResults"
          :key="user.id"
          class="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
        >
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">ID: {{ user.standard_id }}</div>
            </div>
          </div>
          <button
            @click="selectUser(user)"
            :disabled="selectedUsers.some((u: User) => u.id === user.id) || isUserAlreadyMember(user)"
            class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ isUserAlreadyMember(user) ? '已在群聊' : selectedUsers.some((u: User) => u.id === user.id) ? '已选择' : '选择' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 已选择的用户 -->
    <div v-if="selectedUsers.length > 0" class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        已选择的用户 ({{ selectedUsers.length }})
      </h4>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="user in selectedUsers"
          :key="user.id"
          class="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
        >
          <span>{{ user.name }}</span>
          <button
            @click="removeSelectedUser(user)"
            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="searchQuery && !searching && searchResults.length === 0" class="text-center py-8">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">未找到用户</h3>
      <p class="text-gray-500 dark:text-gray-400">尝试搜索其他关键词</p>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="$emit('cancel')"
        class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        取消
      </button>
      <button
        @click="handleAddMembers"
        :disabled="selectedUsers.length === 0 || adding"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ adding ? '添加中...' : `添加 ${selectedUsers.length} 个成员` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import type { User } from '@/types/auth';
import type { ConversationMember } from '@/types/chat';

interface Props {
  conversationId: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'cancel': [];
  'success': [updatedMembers?: ConversationMember[]];
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();

// 响应式数据
const searchQuery = ref('');
const searchResults = ref<User[]>([]);
const selectedUsers = ref<User[]>([]);
const members = ref<ConversationMember[]>([]);
const searching = ref(false);
const adding = ref(false);

// 计算属性
const currentUserId = computed(() => authStore.user?.id || 0);

// 方法
const loadMembers = async () => {
  try {
    members.value = await chatStore.fetchConversationMembers(props.conversationId);
  } catch (error) {
    console.error('加载群聊成员失败:', error);
  }
};

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  try {
    searching.value = true;
    const response = await api.get<User[]>('/users/search', {
      params: { keyword: searchQuery.value.trim() }
    });
    searchResults.value = response.data;
  } catch (error) {
    console.error('搜索用户失败:', error);
    searchResults.value = [];
  } finally {
    searching.value = false;
  }
};

const isUserAlreadyMember = (user: User): boolean => {
  return members.value.some(member => member.user_id === user.id);
};

const selectUser = (user: User) => {
  if (!selectedUsers.value.some((u: User) => u.id === user.id)) {
    selectedUsers.value.push(user);
  }
};

const removeSelectedUser = (user: User) => {
  const index = selectedUsers.value.findIndex((u: User) => u.id === user.id);
  if (index !== -1) {
    selectedUsers.value.splice(index, 1);
  }
};

const handleAddMembers = async () => {
  if (selectedUsers.value.length === 0) return;

  try {
    adding.value = true;
    
    const userIds = selectedUsers.value.map((user: User) => user.id);
    // 添加成员并获取更新后的成员列表
    const updatedMembers = await chatStore.addConversationMembers(props.conversationId, { user_ids: userIds });
    
    // 发送成功事件，并传递更新后的成员列表
    emit('success', updatedMembers);
  } catch (error) {
    console.error('添加成员失败:', error);
    // 这里可以添加错误提示
  } finally {
    adding.value = false;
  }
};

// 防抖搜索
let searchTimeout: number | undefined;
const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(handleSearch, 300);
};

// 生命周期
onMounted(() => {
  loadMembers();
});
</script>

<style scoped>
.add-member-modal {
  max-height: 80vh;
  overflow-y: auto;
}
</style> 