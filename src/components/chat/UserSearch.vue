<template>
  <div class="user-search">
    <!-- 搜索输入框 -->
    <el-input
      v-model="searchKeyword"
      placeholder="搜索用户（输入姓名或ID）"
      clearable
      :loading="isSearching"
      @input="handleSearchInput"
      @clear="clearSearch"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <!-- 已选择的用户（多选模式） -->
    <div v-if="props.multiple && selectedUsers.length > 0" class="selected-users">
      <div class="selected-users-header">
        <span>已选择 {{ selectedUsers.length }} 个用户</span>
        <el-button size="small" text @click="clearSelectedUsers">清空</el-button>
      </div>
      <div class="selected-users-list">
        <el-tag
          v-for="user in selectedUsers"
          :key="user.id"
          closable
          @close="removeSelectedUser(user)"
          class="selected-user-tag"
        >
          {{ user.name }}
        </el-tag>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div class="results-header">
        <span class="results-count">找到 {{ searchResults.length }} 个用户</span>
      </div>
      <div class="user-list">
        <div
          v-for="user in searchResults"
          :key="user.id"
          :class="['user-item', { selected: isUserSelected(user) }]"
          @click="selectUser(user)"
        >
          <div class="user-avatar">
            <el-avatar :size="36">
              {{ user.name.charAt(0).toUpperCase() }}
            </el-avatar>
          </div>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-id">ID: {{ user.standard_id }}</div>
          </div>
          <div class="user-status">
            <div v-if="props.multiple && isUserSelected(user)" class="selected-icon">
              <el-icon color="#1976d2"><Check /></el-icon>
            </div>
            <div 
              :class="['status-dot', { online: isUserOnline(user.id) }]"
              :title="isUserOnline(user.id) ? '在线' : '离线'"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索状态 -->
    <div v-else-if="searchKeyword && !isSearching && searchPerformed" class="no-results">
      <el-empty 
        :image-size="60" 
        description="未找到匹配的用户"
      >
        <template #description>
          <p>没有找到与 "{{ searchKeyword }}" 匹配的用户</p>
          <p class="search-tip">提示：尝试输入完整的姓名或用户ID</p>
        </template>
      </el-empty>
    </div>

    <!-- 搜索建议 -->
    <div v-else-if="!searchKeyword" class="search-tips">
      <div class="tip-item">
        <el-icon><UserFilled /></el-icon>
        <span>输入用户姓名搜索</span>
      </div>
      <div class="tip-item">
        <el-icon><Key /></el-icon>
        <span>输入用户ID精确查找</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, UserFilled, Key, Check } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import type { User } from '@/types/auth';

// Props 和 Emits
interface Props {
  multiple?: boolean; // 是否支持多选
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false
});

const emit = defineEmits<{
  'user-selected': [user: User];
  'users-selected': [users: User[]];
}>();

// 响应式数据
const authStore = useAuthStore();
const chatStore = useChatStore();

const searchKeyword = ref('');
const searchResults = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const selectedUsers = ref<User[]>([]);
const isSearching = ref(false);
const searchPerformed = ref(false);
const searchTimer = ref<number>();

// 计算属性
const isUserOnline = computed(() => {
  return (userId: number) => {
    return chatStore.onlineUsers.includes(userId);
  };
});

const isUserSelected = (user: User) => {
  if (props.multiple) {
    return selectedUsers.value.some(u => u.id === user.id);
  } else {
    return selectedUser.value?.id === user.id;
  }
};

// 方法
const handleSearchInput = () => {
  // 防抖处理
  if (searchTimer.value) {
    clearTimeout(searchTimer.value);
  }

  searchTimer.value = window.setTimeout(() => {
    performSearch();
  }, 500);
};

const performSearch = async () => {
  const keyword = searchKeyword.value.trim();
  
  if (!keyword) {
    searchResults.value = [];
    searchPerformed.value = false;
    return;
  }

  try {
    isSearching.value = true;
    searchPerformed.value = false;

    const users = await authStore.searchUsers({
      keyword,
      limit: 10
    });

    // 过滤掉当前用户
    searchResults.value = users.filter(user => user.id !== authStore.user?.id);
    searchPerformed.value = true;

  } catch (error: any) {
    console.error('搜索用户失败:', error);
    ElMessage.error('搜索用户失败');
    searchResults.value = [];
    searchPerformed.value = true;
  } finally {
    isSearching.value = false;
  }
};

const selectUser = (user: User) => {
  if (props.multiple) {
    // 多选模式
    const index = selectedUsers.value.findIndex(u => u.id === user.id);
    if (index > -1) {
      selectedUsers.value.splice(index, 1);
    } else {
      selectedUsers.value.push(user);
    }
    emit('users-selected', selectedUsers.value);
  } else {
    // 单选模式
    selectedUser.value = user;
    emit('user-selected', user);
  }
};

const clearSearch = () => {
  searchKeyword.value = '';
  searchResults.value = [];
  searchPerformed.value = false;
  selectedUser.value = null;
  selectedUsers.value = [];
};

const clearSelectedUsers = () => {
  selectedUsers.value = [];
  emit('users-selected', selectedUsers.value);
};

const removeSelectedUser = (userToRemove: User) => {
  const index = selectedUsers.value.findIndex(u => u.id === userToRemove.id);
  if (index > -1) {
    selectedUsers.value.splice(index, 1);
    emit('users-selected', selectedUsers.value);
  }
};

// 暴露方法
defineExpose({
  clearSearch,
  selectedUser,
  selectedUsers
});
</script>

<style scoped lang="scss">
.user-search {
  .search-results {
    margin-top: 1rem;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    background: white;
    max-height: 300px;
    overflow-y: auto;

    .results-header {
      padding: 0.75rem;
      border-bottom: 1px solid #f0f0f0;
      background: #f8f9fa;
      
      .results-count {
        font-size: 0.875rem;
        color: #666;
      }
    }

    .user-list {
      .user-item {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background: #f5f5f5;
        }

        &.selected {
          background: #e3f2fd;
          border-left: 3px solid #1976d2;
        }

        .user-avatar {
          margin-right: 0.75rem;
        }

        .user-info {
          flex: 1;
          min-width: 0;

          .user-name {
            font-weight: 500;
            color: #333;
            margin-bottom: 0.25rem;
          }

          .user-id {
            font-size: 0.875rem;
            color: #666;
          }
        }

        .user-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .selected-icon {
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ccc;
            transition: background-color 0.2s;

            &.online {
              background: #52c41a;
            }
          }
        }
      }
    }
  }

  .no-results {
    margin-top: 1rem;
    padding: 2rem;
    text-align: center;

    .search-tip {
      color: #999;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
  }

  .search-tips {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;

    .tip-item {
      display: flex;
      align-items: center;
      color: #666;
      margin-bottom: 0.5rem;

      &:last-child {
        margin-bottom: 0;
      }

      .el-icon {
        margin-right: 0.5rem;
        color: #999;
      }
    }
  }

  .selected-users {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e1e5e9;

    .selected-users-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      color: #666;
      font-size: 0.875rem;
    }

    .selected-users-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;

      .selected-user-tag {
        margin: 0;
      }
    }
  }
}

/* 滚动条样式 */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;

  &:hover {
    background: #a1a1a1;
  }
}
</style> 