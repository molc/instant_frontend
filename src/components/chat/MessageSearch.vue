<template>
  <div class="message-search">
    <!-- 搜索输入框 -->
    <div class="relative mb-4">
      <input
        v-model="searchQuery"
        @input="handleSearch"
        @keyup.enter="handleSearch"
        type="text"
        placeholder="搜索消息内容..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 搜索选项 -->
    <div class="flex items-center space-x-4 mb-4">
      <label class="flex items-center space-x-2">
        <input
          v-model="searchOptions.caseSensitive"
          type="checkbox"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span class="text-sm text-gray-700 dark:text-gray-300">区分大小写</span>
      </label>
      <label class="flex items-center space-x-2">
        <input
          v-model="searchOptions.wholeWord"
          type="checkbox"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span class="text-sm text-gray-700 dark:text-gray-300">全词匹配</span>
      </label>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-flex items-center space-x-2">
        <svg class="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm text-gray-600 dark:text-gray-400">搜索中...</span>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-else-if="searchResults.length > 0" class="space-y-2">
      <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
        <span>找到 {{ searchResults.length }} 条消息</span>
        <button
          @click="clearSearch"
          class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          清空搜索
        </button>
      </div>
      
      <div
        v-for="result in searchResults"
        :key="result.id"
        @click="$emit('jump-to-message', result)"
        class="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div class="flex items-start space-x-3">
          <img
            :src="result.sender?.avatar || '/default-avatar.png'"
            :alt="result.sender?.nickname || '用户'"
            class="w-8 h-8 rounded-full object-cover"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ result.sender?.nickname || '用户' }}
              </div>
              <div class="text-xs text-gray-400">
                {{ formatTime(result.created_at) }}
              </div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">
              <span v-html="highlightText(result.content, searchQuery)"></span>
            </div>
            <div class="flex items-center space-x-2 mt-2">
              <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span class="text-xs text-gray-400">点击跳转到消息</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="hasSearched && searchResults.length === 0" class="text-center py-8">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400">没有找到匹配的消息</p>
    </div>

    <!-- 初始状态 -->
    <div v-else class="text-center py-8">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400">输入关键词搜索消息</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useChatStore } from '@/stores/chat';
import type { Message } from '@/types/chat';

interface Props {
  conversationId?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'jump-to-message': [message: Message];
}>();

const chatStore = useChatStore();

// 状态
const searchQuery = ref('');
const searchResults = ref<Message[]>([]);
const loading = ref(false);
const hasSearched = ref(false);
const searchOptions = reactive({
  caseSensitive: false,
  wholeWord: false
});

// 搜索防抖
let searchTimeout: NodeJS.Timeout | null = null;

// 搜索方法
const handleSearch = async () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(async () => {
    await performSearch();
  }, 300);
};

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    hasSearched.value = false;
    return;
  }

  loading.value = true;
  hasSearched.value = true;

  try {
    if (props.conversationId) {
      // 搜索特定会话的消息
      const results = await chatStore.searchMessages({
        conversation_id: props.conversationId,
        keyword: searchQuery.value.trim(),
        limit: 50
      });
      searchResults.value = results;
    } else {
      // 搜索所有消息
      const results: Message[] = [];
      
      // 搜索本地消息
      Object.values(chatStore.messages).forEach(conversationMessages => {
        const filtered = conversationMessages.filter(message => {
          if (message.message_type !== 'text') return false;
          
          let content = message.content;
          let query = searchQuery.value.trim();
          
          if (!searchOptions.caseSensitive) {
            content = content.toLowerCase();
            query = query.toLowerCase();
          }
          
          if (searchOptions.wholeWord) {
            const regex = new RegExp(`\\b${escapeRegExp(query)}\\b`, 'g');
            return regex.test(content);
          } else {
            return content.includes(query);
          }
        });
        
        results.push(...filtered);
      });
      
      // 按时间排序（最新的在前）
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      searchResults.value = results.slice(0, 50); // 限制结果数量
    }
  } catch (error) {
    console.error('搜索失败:', error);
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

// 清空搜索
const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  hasSearched.value = false;
  loading.value = false;
};

// 高亮搜索结果
const highlightText = (text: string, query: string): string => {
  if (!query.trim()) return text;
  
  let searchText = text;
  let searchQuery = query.trim();
  
  if (!searchOptions.caseSensitive) {
    searchText = text.toLowerCase();
    searchQuery = searchQuery.toLowerCase();
  }
  
  const regex = searchOptions.wholeWord 
    ? new RegExp(`\\b(${escapeRegExp(searchQuery)})\\b`, 'gi')
    : new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
  
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
};

// 转义正则表达式特殊字符
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 格式化时间
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) { // 1分钟内
    return '刚刚';
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`;
  } else if (diff < 604800000) { // 1周内
    return `${Math.floor(diff / 86400000)}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
};

// 监听会话变化，清空搜索
watch(() => props.conversationId, () => {
  clearSearch();
});
</script>

<style scoped>
.message-search {
  max-height: 70vh;
  overflow-y: auto;
}

/* 自定义滚动条 */
.message-search::-webkit-scrollbar {
  width: 6px;
}

.message-search::-webkit-scrollbar-track {
  background: transparent;
}

.message-search::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.message-search::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}

/* 高亮标记样式 */
:deep(mark) {
  background-color: #fef08a;
  padding: 0.125rem;
  border-radius: 0.25rem;
}

:deep(.dark mark) {
  background-color: #a16207;
  color: #fef3c7;
}
</style> 