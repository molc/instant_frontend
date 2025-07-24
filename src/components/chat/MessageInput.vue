<template>
  <div class="message-input bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 relative">
    <div class="flex items-end space-x-3">
      <!-- 附件和截图按钮 -->
      <div class="flex-shrink-0 flex items-center space-x-1">
        <!-- 🔧 临时修复：直接文件选择器 -->
        <input
          ref="directFileInputRef"
          type="file"
          multiple
          accept="*/*"
          @change="handleDirectFileSelect"
          class="hidden"
        />
        
        <button
          @click="triggerDirectFileUpload"
          class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="上传文件"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        
        <!-- 截图组件 -->
        <div style="background: red; color: white; padding: 10px; font-weight: bold;">🚨 DEBUG: ScreenshotCapture should be here 🚨</div>
        <ScreenshotCapture @screenshot-captured="handleScreenshotCaptured" />
        
        <!-- 原始附件按钮（备用） -->
        <button
          @click="showAttachmentMenu = !showAttachmentMenu"
          class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="高级文件上传"
        >
          📎
        </button>
        
        <!-- 附件菜单 -->
        <div
          v-if="showAttachmentMenu"
          class="attachment-menu absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50 min-w-max"
        >
          <button
            @click="triggerFileUpload('image')"
            class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
          >
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>图片</span>
          </button>
          <button
            @click="triggerFileUpload('file')"
            class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
          >
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>文件</span>
          </button>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          @keydown="handleKeyDown"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          :placeholder="placeholder"
          :disabled="disabled"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows="1"
        />
        
        <!-- 字数统计 -->
        <div
          v-if="showCharCount"
          class="absolute bottom-2 right-2 text-xs text-gray-400"
        >
          {{ inputText.length }}/{{ maxLength }}
        </div>
      </div>
      
      <!-- 表情按钮 -->
      <div class="flex-shrink-0 relative">
        <button
          @click="showEmojiPicker = !showEmojiPicker"
          class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        <!-- 表情选择器 -->
        <div
          v-if="showEmojiPicker"
          class="emoji-picker absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 w-80"
        >
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">选择表情</div>
          <div class="grid grid-cols-8 gap-1 max-h-60 overflow-y-auto">
            <button
              v-for="emoji in emojiList"
              :key="emoji.char"
              @click="insertEmoji(emoji.char)"
              class="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              :title="emoji.name"
            >
              {{ emoji.char }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 发送按钮 -->
      <div class="flex-shrink-0">
        <button
          @click="sendMessage"
          :disabled="!canSend || disabled"
          :class="[
            'p-3 rounded-lg transition-colors',
            canSend && !disabled
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 文件上传隐藏输入 -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="fileAccept"
      @change="handleFileSelect"
      class="hidden"
      multiple
    />

    <!-- 文件上传对话框 -->
    <teleport to="body">
      <div
        v-if="showFileUploadModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="closeFileUploadModal"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          @click.stop
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">文件上传</h3>
            <button
              @click="closeFileUploadModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <FileUpload
            ref="fileUploadRef"
            :allow-multiple="true"
            :max-size-m-b="50"
            :accepted-types="uploadType === 'image' ? 'image/*' : '*/*'"
            @file-uploaded="handleFileUploaded"
            @upload-complete="handleUploadComplete"
          />
          
          <div class="flex justify-end mt-4 space-x-3">
            <button
              @click="closeFileUploadModal"
              class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              @click="sendUploadedFiles"
              :disabled="uploadedFiles.length === 0"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              发送文件 ({{ uploadedFiles.length }})
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';
import FileUpload from './FileUpload.vue';
import ScreenshotCapture from './ScreenshotCapture.vue';
import { useChatStore } from '@/stores/chat';

interface Props {
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: '输入消息...',
  maxLength: 5000,
  showCharCount: false
});

const emit = defineEmits<{
  'send-message': [content: string];
  'typing': [isTyping: boolean];
  'file-upload': [files: File[]];
}>();

const inputText = ref('');
const textareaRef = ref<HTMLTextAreaElement>();
const fileInputRef = ref<HTMLInputElement>();
const fileUploadRef = ref<InstanceType<typeof FileUpload>>();
const showAttachmentMenu = ref(false);
const showEmojiPicker = ref(false);
const showFileUploadModal = ref(false);
const isTyping = ref(false);
const fileAccept = ref('*/*');
const uploadType = ref<'image' | 'file'>('file');
const uploadedFiles = ref<Array<{ file: File; fileId: string }>>([]);

let typingTimer: ReturnType<typeof setTimeout> | null = null;

// 点击外部关闭菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  
  // 检查是否点击了附件菜单外部
  if (showAttachmentMenu.value && !target.closest('.attachment-menu')) {
    showAttachmentMenu.value = false;
  }
  
  // 检查是否点击了表情选择器外部
  if (showEmojiPicker.value && !target.closest('.emoji-picker')) {
    showEmojiPicker.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 常用Emoji列表
const emojiList = [
  { char: '😀', name: 'grinning face' },
  { char: '😃', name: 'grinning face with big eyes' },
  { char: '😄', name: 'grinning face with smiling eyes' },
  { char: '😁', name: 'beaming face with smiling eyes' },
  { char: '😆', name: 'grinning squinting face' },
  { char: '😅', name: 'grinning face with sweat' },
  { char: '😂', name: 'face with tears of joy' },
  { char: '🤣', name: 'rolling on the floor laughing' },
  { char: '😊', name: 'smiling face with smiling eyes' },
  { char: '😇', name: 'smiling face with halo' },
  { char: '🙂', name: 'slightly smiling face' },
  { char: '🙃', name: 'upside-down face' },
  { char: '😉', name: 'winking face' },
  { char: '😌', name: 'relieved face' },
  { char: '😍', name: 'smiling face with heart-eyes' },
  { char: '🥰', name: 'smiling face with hearts' },
  { char: '😘', name: 'face blowing a kiss' },
  { char: '😗', name: 'kissing face' },
  { char: '😙', name: 'kissing face with smiling eyes' },
  { char: '😚', name: 'kissing face with closed eyes' },
  { char: '😋', name: 'face savoring food' },
  { char: '😛', name: 'face with tongue' },
  { char: '😜', name: 'winking face with tongue' },
  { char: '🤪', name: 'zany face' },
  { char: '😝', name: 'squinting face with tongue' },
  { char: '🤑', name: 'money-mouth face' },
  { char: '🤗', name: 'hugging face' },
  { char: '🤭', name: 'face with hand over mouth' },
  { char: '🤫', name: 'shushing face' },
  { char: '🤔', name: 'thinking face' },
  { char: '🤐', name: 'zipper-mouth face' },
  { char: '🤨', name: 'face with raised eyebrow' },
  { char: '😐', name: 'neutral face' },
  { char: '😑', name: 'expressionless face' },
  { char: '😶', name: 'face without mouth' },
  { char: '😏', name: 'smirking face' },
  { char: '😒', name: 'unamused face' },
  { char: '🙄', name: 'face with rolling eyes' },
  { char: '😬', name: 'grimacing face' },
  { char: '🤥', name: 'lying face' },
  { char: '😔', name: 'pensive face' },
  { char: '😪', name: 'sleepy face' },
  { char: '🤤', name: 'drooling face' },
  { char: '😴', name: 'sleeping face' },
  { char: '😷', name: 'face with medical mask' },
  { char: '🤒', name: 'face with thermometer' },
  { char: '🤕', name: 'face with head-bandage' },
  { char: '🤢', name: 'nauseated face' },
  { char: '🤮', name: 'face vomiting' },
  { char: '🤧', name: 'sneezing face' },
  { char: '🥵', name: 'hot face' },
  { char: '🥶', name: 'cold face' },
  { char: '🥴', name: 'woozy face' },
  { char: '😵', name: 'dizzy face' },
  { char: '🤯', name: 'exploding head' },
  { char: '🤠', name: 'cowboy hat face' },
  { char: '🥳', name: 'partying face' },
  { char: '😎', name: 'smiling face with sunglasses' },
  { char: '🤓', name: 'nerd face' },
  { char: '🧐', name: 'face with monocle' },
  { char: '😕', name: 'confused face' },
  { char: '😟', name: 'worried face' },
  { char: '🙁', name: 'slightly frowning face' },
  { char: '☹️', name: 'frowning face' },
  { char: '😮', name: 'face with open mouth' },
  { char: '😯', name: 'hushed face' },
  { char: '😲', name: 'astonished face' },
  { char: '😳', name: 'flushed face' },
  { char: '🥺', name: 'pleading face' },
  { char: '😦', name: 'frowning face with open mouth' },
  { char: '😧', name: 'anguished face' },
  { char: '😨', name: 'fearful face' },
  { char: '😰', name: 'anxious face with sweat' },
  { char: '😥', name: 'sad but relieved face' },
  { char: '😢', name: 'crying face' },
  { char: '😭', name: 'loudly crying face' },
  { char: '😱', name: 'face screaming in fear' },
  { char: '😖', name: 'confounded face' },
  { char: '😣', name: 'persevering face' },
  { char: '😞', name: 'disappointed face' },
  { char: '😓', name: 'downcast face with sweat' },
  { char: '😩', name: 'weary face' },
  { char: '😫', name: 'tired face' },
  { char: '🥱', name: 'yawning face' },
  { char: '😤', name: 'face with steam from nose' },
  { char: '😡', name: 'pouting face' },
  { char: '😠', name: 'angry face' },
  { char: '🤬', name: 'face with symbols on mouth' },
  { char: '😈', name: 'smiling face with horns' },
  { char: '👿', name: 'angry face with horns' },
  { char: '💀', name: 'skull' },
  { char: '☠️', name: 'skull and crossbones' },
  { char: '👹', name: 'ogre' },
  { char: '👺', name: 'goblin' },
  { char: '🤡', name: 'clown face' },
  { char: '👻', name: 'ghost' },
  { char: '👽', name: 'alien' },
  { char: '🛸', name: 'flying saucer' },
  { char: '🤖', name: 'robot' },
  { char: '💩', name: 'pile of poo' },
  { char: '👋', name: 'waving hand' },
  { char: '🤚', name: 'raised back of hand' },
  { char: '🖐️', name: 'hand with fingers splayed' },
  { char: '✋', name: 'raised hand' },
  { char: '🖖', name: 'vulcan salute' },
  { char: '👌', name: 'OK hand' },
  { char: '🤏', name: 'pinching hand' },
  { char: '✌️', name: 'victory hand' },
  { char: '🤞', name: 'crossed fingers' },
  { char: '🤟', name: 'love-you gesture' },
  { char: '🤘', name: 'sign of the horns' },
  { char: '🤙', name: 'call me hand' },
  { char: '👈', name: 'backhand index pointing left' },
  { char: '👉', name: 'backhand index pointing right' },
  { char: '👆', name: 'backhand index pointing up' },
  { char: '🖕', name: 'middle finger' },
  { char: '👇', name: 'backhand index pointing down' },
  { char: '☝️', name: 'index pointing up' },
  { char: '👍', name: 'thumbs up' },
  { char: '👎', name: 'thumbs down' },
  { char: '✊', name: 'raised fist' },
  { char: '👊', name: 'oncoming fist' },
  { char: '🤛', name: 'left-facing fist' },
  { char: '🤜', name: 'right-facing fist' },
  { char: '👏', name: 'clapping hands' },
  { char: '🙌', name: 'raising hands' },
  { char: '👐', name: 'open hands' },
  { char: '🤲', name: 'palms up together' },
  { char: '🤝', name: 'handshake' },
  { char: '🙏', name: 'folded hands' },
  { char: '❤️', name: 'red heart' },
  { char: '🧡', name: 'orange heart' },
  { char: '💛', name: 'yellow heart' },
  { char: '💚', name: 'green heart' },
  { char: '💙', name: 'blue heart' },
  { char: '💜', name: 'purple heart' },
  { char: '🖤', name: 'black heart' },
  { char: '🤍', name: 'white heart' },
  { char: '🤎', name: 'brown heart' },
  { char: '💔', name: 'broken heart' },
  { char: '❣️', name: 'heart exclamation' },
  { char: '💕', name: 'two hearts' },
  { char: '💞', name: 'revolving hearts' },
  { char: '💓', name: 'beating heart' },
  { char: '💗', name: 'growing heart' },
  { char: '💖', name: 'sparkling heart' },
  { char: '💘', name: 'heart with arrow' },
  { char: '💝', name: 'heart with ribbon' },
  { char: '💟', name: 'heart decoration' },
  { char: '🔥', name: 'fire' },
  { char: '✨', name: 'sparkles' },
  { char: '💫', name: 'dizzy' },
  { char: '⭐', name: 'star' },
  { char: '🌟', name: 'glowing star' },
  { char: '💥', name: 'collision' },
  { char: '💢', name: 'anger symbol' },
  { char: '💨', name: 'dashing away' },
  { char: '💦', name: 'sweat droplets' },
  { char: '💤', name: 'zzz' }
];

// 插入Emoji到输入框
const insertEmoji = (emoji: string) => {
  const input = textareaRef.value;
  if (input) {
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const text = inputText.value;
    
    inputText.value = text.slice(0, start) + emoji + text.slice(end);
    showEmojiPicker.value = false;
    
    // 重新聚焦到输入框并设置光标位置
    nextTick(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
      autoResize();
    });
  }
};

const triggerFileUpload = (type: 'image' | 'file') => {
  uploadType.value = type;
  showFileUploadModal.value = true;
  showAttachmentMenu.value = false;
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (files && files.length > 0) {
    emit('file-upload', Array.from(files));
  }
  
  // 清空文件输入
  target.value = '';
};

const handleFileUploaded = (file: File, fileId: string) => {
  uploadedFiles.value.push({ file, fileId });
};

const handleUploadComplete = () => {
  showFileUploadModal.value = false;
  uploadedFiles.value = [];
};

const sendUploadedFiles = async () => {
  if (!uploadedFiles.value.length) return;
  
  const chatStore = useChatStore();
  const currentConversation = chatStore.currentConversation;
  
  if (!currentConversation) {
    alert('请选择一个会话');
    return;
  }
  
  try {
    // 发送所有已上传的文件
    for (const uploadedFile of uploadedFiles.value) {
      await chatStore.sendFileMessage(
        currentConversation.id,
        uploadedFile.fileId,
        uploadedFile.file.name,
        uploadedFile.file.size
      );
    }
    
    // 清空上传列表并关闭模态框
    uploadedFiles.value = [];
    closeFileUploadModal();
    
  } catch (error: any) {
    console.error('发送文件消息失败:', error);
    alert(error.message || '发送文件消息失败');
  }
};

const closeFileUploadModal = () => {
  showFileUploadModal.value = false;
};

// 临时修复：直接文件选择器
const directFileInputRef = ref<HTMLInputElement>();
const triggerDirectFileUpload = () => {
  directFileInputRef.value?.click();
};

const handleDirectFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (files && files.length > 0) {
    emit('file-upload', Array.from(files));
  }
  
  // 清空文件输入
  target.value = '';
};

// 处理截图文件
const handleScreenshotCaptured = (file: File) => {
  emit('file-upload', [file]);
};

// 计算属性
const canSend = computed(() => {
  return inputText.value.trim().length > 0 && inputText.value.length <= props.maxLength;
});

// 方法
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      // Shift+Enter 换行
      return;
    } else {
      // Enter 发送
      event.preventDefault();
      sendMessage();
    }
  }
};

const handleInput = () => {
  autoResize();
  handleTyping();
};

const handleFocus = () => {
  emit('typing', true);
};

const handleBlur = () => {
  emit('typing', false);
};

const handleTyping = () => {
  if (!isTyping.value) {
    isTyping.value = true;
    emit('typing', true);
  }
  
  if (typingTimer) {
    clearTimeout(typingTimer);
  }
  
  typingTimer = setTimeout(() => {
    isTyping.value = false;
    emit('typing', false);
  }, 1000);
};

const autoResize = () => {
  if (!textareaRef.value) return;
  
  textareaRef.value.style.height = 'auto';
  const scrollHeight = textareaRef.value.scrollHeight;
  const maxHeight = 120; // 最大高度
  
  if (scrollHeight > maxHeight) {
    textareaRef.value.style.height = `${maxHeight}px`;
    textareaRef.value.style.overflowY = 'auto';
  } else {
    textareaRef.value.style.height = `${scrollHeight}px`;
    textareaRef.value.style.overflowY = 'hidden';
  }
};

const sendMessage = () => {
  if (!canSend.value || props.disabled) return;
  
  const content = inputText.value.trim();
  if (content) {
    emit('send-message', content);
    inputText.value = '';
    nextTick(() => {
      autoResize();
    });
  }
};

// 监听文本变化，自动调整高度
watch(inputText, () => {
  nextTick(() => {
    autoResize();
  });
});
</script>

<style scoped>
/* 确保 textarea 的基本样式 */
textarea {
  min-height: 44px;
  max-height: 120px;
  line-height: 1.5;
}

/* 点击外部关闭菜单的指令样式 */
.v-click-outside {
  position: relative;
}
</style> 