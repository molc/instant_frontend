<template>
  <div 
    :id="`message-${message.id}`"
    :class="['flex w-full', isOwn ? 'justify-end' : 'justify-start', 'group mb-4']"
    @contextmenu.prevent="showContextMenu"
  >
    <!-- 头像 -->
    <div v-if="!isOwn && showAvatar" class="flex-shrink-0 mr-3">
      <img
        :src="'/default-avatar.png'"
        :alt="message.sender_name || '用户'"
        class="w-8 h-8 rounded-full object-cover"
      />
    </div>
    
    <!-- 消息内容 -->
    <div :class="['flex flex-col', isOwn ? 'items-end max-w-[70%]' : 'items-start max-w-[70%]']">
      <!-- 发送者名称 -->
      <div v-if="!isOwn && showAvatar" class="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
        {{ message.sender_name || '用户' }}
      </div>
      
      <!-- 消息操作按钮 -->
      <div 
        v-if="!contextMenuVisible && !isRecalled"
        :class="['flex items-center space-x-1 mb-1 opacity-0 group-hover:opacity-100 transition-opacity', isOwn ? 'flex-row-reverse' : 'flex-row']"
      >
        <button
          @click="copyMessage"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="复制"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          @click="replyToMessage"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="回复"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          v-if="isOwn && canRecall"
          @click="recallMessage"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="撤回"
        >
          <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
        </button>
        <button
          v-if="isOwn && !canRecall"
          @click="deleteMessage"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="删除"
        >
          <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      <!-- 消息气泡 -->
      <div
        :class="[
          'relative rounded-lg break-words transition-all duration-200 min-w-0',
          isOwn 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:shadow-md',
          isRecalled ? 'opacity-60' : '',
          message.status === 'failed' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : '',
          // 根据消息类型调整padding
          isFileMessage(message) ? 'p-2' : 'px-4 py-2'
        ]"
      >
        
        <!-- 撤回消息提示 -->
        <div v-if="isRecalled" class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">

          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 14c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>{{ message.content }}</span>
        </div>
        
        <!-- 正常消息内容 -->
        <div v-else>
          
          <!-- 回复的消息 -->
          <div v-if="message.reply_to_id" class="mb-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-sm">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">回复消息</div>
            <div class="text-gray-700 dark:text-gray-300 truncate">回复消息ID: {{ message.reply_to_id }}</div>
          </div>
          
          <!-- 文本消息 -->
          <div v-if="getMessageType(message) === 'text'" class="whitespace-pre-wrap">
            {{ message.content }}
          </div>
          
          <!-- 文件消息 -->
          <div v-else-if="isFileMessage(message)" 
               :class="[
                 'flex items-center space-x-3 p-2 rounded-lg border',
                 isOwn 
                   ? 'bg-blue-400/30 border-blue-300' 
                   : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
               ]">
            <div class="flex-shrink-0">
              <!-- 根据文件类型显示不同图标 -->
              <svg v-if="isImageFile(fileName)" class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg v-else-if="isVideoFile(fileName)" class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else-if="isAudioFile(fileName)" class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <svg v-else-if="isPdfFile(fileName)" class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <!-- Markdown文件图标 -->
              <svg v-else-if="isMarkdownFile(fileName)" class="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 3h20a1 1 0 011 1v16a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1zm1 2v14h18V5H3zm2 2h2l2 4 2-4h2v10h-2v-6l-2 4-2-4v6H5V7z"/>
              </svg>
              <!-- Word文档图标 -->
              <svg v-else-if="isDocumentFile(fileName)" class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <!-- Excel表格图标 -->
              <svg v-else-if="isSpreadsheetFile(fileName)" class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4 4 4-4" />
              </svg>
              <!-- PPT演示图标 -->
              <svg v-else-if="isPresentationFile(fileName)" class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
              </svg>
              <!-- 通用文件图标 -->
              <svg v-else class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p :class="[
                'text-sm font-medium mb-1',
                isOwn ? 'text-white' : 'text-gray-900 dark:text-white'
              ]">
                📎 {{ fileName || '文件名获取失败' }}
              </p>
              <p :class="[
                'text-xs',
                isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              ]">
                {{ formatFileSize(fileSize) }}
              </p>
            </div>
            <button
              v-if="fileId"
              @click="downloadFile(fileId, fileName)"
              :class="[
                'flex-shrink-0 p-2 rounded-lg transition-colors',
                isOwn 
                  ? 'bg-white/20 text-white hover:bg-white/30' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              ]"
              title="下载文件"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
          
          <!-- 位置消息 -->
          <div v-else-if="getMessageType(message) === 'location'" class="space-y-2">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-sm font-medium">位置信息</span>
            </div>
            <div v-if="message.address" class="text-sm text-gray-600 dark:text-gray-300">
              {{ message.address }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              经度: {{ message.longitude }}, 纬度: {{ message.latitude }}
            </div>
          </div>
          
          <!-- 系统消息 -->
          <div v-else-if="getMessageType(message) === 'system'" class="text-sm text-gray-500 dark:text-gray-400 italic">
            {{ message.content }}
          </div>
          
          <!-- 未知类型消息 -->
          <div v-else class="text-sm text-gray-500 dark:text-gray-400">
            不支持的消息类型: {{ message.message_type }} (解析为: {{ getMessageType(message) }})
          </div>
        </div>
        
        <!-- 消息状态指示器 -->
        <div v-if="isOwn && !isRecalled" class="flex items-center justify-end space-x-1 mt-1">
          <!-- 发送失败 -->
          <div v-if="message.status === 'failed'" class="flex items-center space-x-1">
            <button
              @click="$emit('retry')"
              class="flex items-center space-x-1 px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
              title="发送失败，点击重试"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span class="text-xs">重试</span>
            </button>
          </div>
          
          <!-- 待发送 -->
          <div v-else-if="message.status === 'pending'" class="flex items-center space-x-1" title="等待发送">
            <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-xs text-gray-400">待发送</span>
          </div>
          
          <!-- 发送中 -->
          <div v-else-if="message.status === 'sending'" class="flex items-center space-x-1" title="发送中">
            <svg class="animate-spin h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-xs text-blue-400">发送中</span>
          </div>
          
          <!-- 已发送 -->
          <div v-else-if="message.status === 'sent'" class="flex items-center space-x-1" title="已发送">
            <svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span class="text-xs text-gray-400">已发送</span>
          </div>
          
          <!-- 已送达 -->
          <div v-else-if="message.status === 'delivered'" class="flex items-center space-x-1" title="已送达">
            <div class="flex -space-x-1">
              <svg class="w-3 h-3 text-blue-400 z-10" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <svg class="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="text-xs text-blue-400">已送达</span>
          </div>
          
          <!-- 已读 -->
          <div v-else-if="message.status === 'read'" class="flex items-center space-x-1" title="已读">
            <div class="flex -space-x-1">
              <svg class="w-3 h-3 text-blue-500 z-10" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <svg class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="text-xs text-blue-500">已读</span>
          </div>
          
          <!-- 已撤回 -->
          <div v-else-if="message.status === 'recalled'" class="flex items-center space-x-1" title="已撤回">
            <svg class="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            <span class="text-xs text-orange-400">已撤回</span>
          </div>
          
          <!-- 已编辑 -->
          <div v-else-if="message.status === 'edited'" class="flex items-center space-x-1" title="已编辑">
            <svg class="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span class="text-xs text-green-400">已编辑</span>
          </div>
        </div>
      </div>
      
      <!-- 时间戳 -->
      <div v-if="showTime" :class="[
        'text-xs text-gray-500 dark:text-gray-400 mt-1',
        isOwn ? 'text-right' : 'text-left'
      ]">
        {{ formatTime(message.created_at) }}
      </div>
    </div>
    
    <!-- 右键菜单 -->
    <div
      v-if="contextMenuVisible"
      v-click-outside="hideContextMenu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
      class="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50 min-w-40"
    >
      <button
        v-if="!isRecalled"
        @click="copyMessage"
        class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span>复制</span>
      </button>
      
      <button
        v-if="!isRecalled"
        @click="replyToMessage"
        class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span>回复</span>
      </button>
      
      <button
        v-if="!isRecalled"
        @click="forwardMessage"
        class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span>转发</span>
      </button>
      
      <hr v-if="isOwn" class="my-2 border-gray-200 dark:border-gray-600" />
      
      <button
        v-if="isOwn && canRecall && !isRecalled"
        @click="recallMessage"
        class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 text-orange-500"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
        </svg>
        <span>撤回</span>
      </button>
      
      <button
        v-if="isOwn && (!canRecall || isRecalled)"
        @click="deleteMessage"
        class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 text-red-500"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>删除</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Message } from '@/types/chat';
import { useChatStore } from '@/stores/chat';

interface Props {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showTime: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOwn: false,
  showAvatar: true,
  showTime: true
});

const emit = defineEmits<{
  retry: [];
  copy: [text: string];
  reply: [message: Message];
  forward: [message: Message];
  recall: [messageId: number];
  delete: [messageId: number];
}>();

const chatStore = useChatStore();

// 消息类型兼容性处理函数
const getMessageType = (message: Message): string => {
  // 如果message_type是字符串，直接返回
  if (typeof message.message_type === 'string') {
    return message.message_type;
  }
  
  // 如果是数字，转换为字符串类型
  const typeMap: { [key: number]: string } = {
    0: 'text',        // 文本消息
    1: 'file',        // 语音文件
    2: 'file',        // 图片文件
    3: 'file',        // 文本文档（如.md, .txt）
    4: 'file',        // PDF文件
    5: 'file',        // DOC文件
    6: 'file',        // EXCEL文件
    7: 'file',        // PPT文件
    8: 'file',        // 音频文件
    9: 'file',        // 视频文件
    10: 'file',       // 压缩文件
    11: 'file',       // 未知类型文件
  };
  
  return typeMap[message.message_type as number] || 'text';
};

// 判断是否为文件消息
const isFileMessage = (message: Message): boolean => {
  return getMessageType(message) === 'file';
};

const isPlaying = ref(false);

// 🚨 FIRST: 检查组件是否真的在运行
console.log('🚨 MessageBubble.vue 组件已加载! 消息ID:', props.message.id);

// 文件信息计算属性 - 兼容新旧API格式
const fileId = computed(() => {
  return props.message.file_info?.file_id || props.message.file_id;
});

const fileName = computed(() => {
  return props.message.file_info?.name || props.message.file_name || '未知文件';
});

const fileSize = computed(() => {
  return props.message.file_info?.size || props.message.file_size || 0;
});
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

// 计算属性
const isRecalled = computed(() => props.message.status === 'recalled');

const canRecall = computed(() => {
  if (!props.isOwn || isRecalled.value) return false;
  
  // 只有2分钟内的消息可以撤回
  const messageTime = new Date(props.message.created_at).getTime();
  const now = new Date().getTime();
  const timeDiff = now - messageTime;
  const twoMinutes = 2 * 60 * 1000;
  
  return timeDiff < twoMinutes;
});

// 右键菜单
const showContextMenu = (event: MouseEvent) => {
  contextMenuVisible.value = true;
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
};

const hideContextMenu = () => {
  contextMenuVisible.value = false;
};

// 消息操作
const copyMessage = () => {
  if (props.message.message_type === 'text' && !isRecalled.value && props.message.content) {
    navigator.clipboard.writeText(props.message.content);
  }
  hideContextMenu();
};

const replyToMessage = () => {
  if (!isRecalled.value) {
    emit('reply', props.message);
  }
  hideContextMenu();
};

const forwardMessage = () => {
  if (!isRecalled.value) {
    emit('forward', props.message);
  }
  hideContextMenu();
};

const recallMessage = () => {
  if (canRecall.value) {
    emit('recall', props.message.id);
  }
  hideContextMenu();
};

const deleteMessage = () => {
  emit('delete', props.message.id);
  hideContextMenu();
};

// 格式化时间
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// 格式化文件大小
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '未知大小';
  
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

// 格式化音频时长
const formatDuration = (seconds?: number): string => {
  if (!seconds) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 打开图片预览
const openImagePreview = (url?: string) => {
  if (!url) return;
  // 这里可以实现图片预览功能
  window.open(url, '_blank');
};

// 下载文件
const downloadFile = async (file_id?: string, filename?: string) => {
  if (!file_id) return;
  
  try {
    await chatStore.downloadFile(file_id, filename);
    console.log('文件下载成功');
  } catch (error: any) {
    console.error('下载文件失败:', error);
    // 使用 ElMessage 替代 alert，提供更好的用户体验
    import('element-plus').then(({ ElMessage }) => {
      ElMessage.error(error.message || '下载文件失败');
    });
  }
};

// 播放/暂停音频
const toggleAudio = () => {
  isPlaying.value = !isPlaying.value;
  // 这里可以实现音频播放功能
};

// 文件类型判断方法
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
  const presentationExtensions = ['.ppt', '.pptx'];
  return presentationExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};
</script>

<style scoped>
/* 消息气泡动画 */
.message-bubble {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 消息气泡箭头 */
.message-bubble::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.message-bubble.own::before {
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 8px 0 8px 8px;
  border-color: transparent transparent transparent #3b82f6;
}

.message-bubble.other::before {
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 8px 8px 8px 0;
  border-color: transparent #ffffff transparent transparent;
}

.dark .message-bubble.other::before {
  border-color: transparent #374151 transparent transparent;
}

/* 消息高亮动画 */
.highlight-message {
  animation: highlight 2s ease-in-out;
}

@keyframes highlight {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(59, 130, 246, 0.1);
  }
  100% {
    background-color: transparent;
  }
}

/* 深色模式下的高亮 */
.dark .highlight-message {
  animation: highlight-dark 2s ease-in-out;
}

@keyframes highlight-dark {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(59, 130, 246, 0.2);
  }
  100% {
    background-color: transparent;
  }
}
</style> 