<template>
  <div class="file-upload-container">
    <!-- 拖拽上传区域 -->
    <div
      ref="dropZoneRef"
      :class="[
        'drop-zone',
        'border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200',
        isDragOver 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      ]"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileSelect"
    >
      <input
        ref="fileInputRef"
        type="file"
        :multiple="allowMultiple"
        :accept="acceptedTypes"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <!-- 上传图标和文本 -->
      <div v-if="!uploadingFiles.length" class="upload-prompt">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          拖拽文件到这里上传
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          或者 <span class="text-blue-500 hover:text-blue-600 cursor-pointer">点击选择文件</span>
        </p>
        <div class="text-xs text-gray-400">
          <p>支持的文件类型：{{ supportedTypesText }}</p>
          <p>最大文件大小：{{ maxSizeMB }}MB</p>
        </div>
      </div>
    </div>

    <!-- 上传进度列表 -->
    <div v-if="uploadingFiles.length" class="upload-progress-list mt-4 space-y-3">
      <div
        v-for="file in uploadingFiles"
        :key="file.id"
        class="upload-item bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <!-- 文件图标 -->
            <div class="flex-shrink-0">
              <component :is="getFileIcon(file.file)" class="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            
            <!-- 文件信息 -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ file.file.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatFileSize(file.file.size) }}
              </p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center space-x-2">
            <button
              v-if="file.status === 'uploading'"
              @click="cancelUpload(file.id)"
              class="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="取消上传"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              v-else-if="file.status === 'error'"
              @click="retryUpload(file.id)"
              class="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              title="重试上传"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div
              v-else-if="file.status === 'completed'"
              class="p-1 text-green-500"
              title="上传完成"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 进度条 -->
        <div v-if="file.status === 'uploading'" class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="bg-blue-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${file.progress}%` }"
          ></div>
        </div>
        
        <!-- 状态信息 -->
        <div class="mt-2 text-xs">
          <span
            v-if="file.status === 'uploading'"
            class="text-blue-600 dark:text-blue-400"
          >
            上传中... {{ file.progress }}%
          </span>
          <span
            v-else-if="file.status === 'completed'"
            class="text-green-600 dark:text-green-400"
          >
            上传完成
          </span>
          <span
            v-else-if="file.status === 'error'"
            class="text-red-600 dark:text-red-400"
          >
            上传失败：{{ file.error }}
          </span>
          <span
            v-else
            class="text-gray-500 dark:text-gray-400"
          >
            等待上传...
          </span>
        </div>
      </div>
    </div>

    <!-- 上传统计 -->
    <div v-if="uploadStats.total > 0" class="upload-stats mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">
          上传进度：{{ uploadStats.completed }}/{{ uploadStats.total }}
        </span>
        <span class="text-gray-600 dark:text-gray-400">
          总大小：{{ formatFileSize(uploadStats.totalSize) }}
        </span>
      </div>
      <div v-if="uploadStats.uploading > 0" class="mt-2">
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="bg-blue-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${uploadStats.overallProgress}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useChatStore } from '@/stores/chat';

interface Props {
  allowMultiple?: boolean;
  maxSizeMB?: number;
  acceptedTypes?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  allowMultiple: true,
  maxSizeMB: 100,
  acceptedTypes: '*/*',
  disabled: false
});

const emit = defineEmits<{
  'file-uploaded': [file: File, fileId: string];
  'upload-progress': [fileId: string, progress: number];
  'upload-error': [fileId: string, error: string];
  'upload-complete': [results: Array<{ file: File; fileId: string; success: boolean }>];
}>();

// 引用
const dropZoneRef = ref<HTMLElement>();
const fileInputRef = ref<HTMLInputElement>();

// 状态
const isDragOver = ref(false);
const uploadingFiles = ref<Array<{
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  fileId?: string;
  abortController?: AbortController;
}>>([]);

const chatStore = useChatStore();

// 计算属性
const supportedTypesText = computed(() => {
  if (props.acceptedTypes === '*/*') return '所有文件类型';
  return props.acceptedTypes.replace(/\*/g, '').replace(/\./g, '');
});

const uploadStats = computed(() => {
  const total = uploadingFiles.value.length;
  const completed = uploadingFiles.value.filter(f => f.status === 'completed').length;
  const uploading = uploadingFiles.value.filter(f => f.status === 'uploading').length;
  const totalSize = uploadingFiles.value.reduce((sum, f) => sum + f.file.size, 0);
  const completedSize = uploadingFiles.value
    .filter(f => f.status === 'completed')
    .reduce((sum, f) => sum + f.file.size, 0);
  
  const overallProgress = total > 0 ? Math.round((completedSize / totalSize) * 100) : 0;
  
  return {
    total,
    completed,
    uploading,
    totalSize,
    overallProgress
  };
});

// 方法
const triggerFileSelect = () => {
  if (props.disabled) return;
  fileInputRef.value?.click();
};

const handleDragOver = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  
  // 只有当离开整个拖拽区域时才设置为false
  const rect = dropZoneRef.value?.getBoundingClientRect();
  if (rect) {
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      isDragOver.value = false;
    }
  }
};

const handleDrop = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  isDragOver.value = false;
  
  const files = Array.from(event.dataTransfer?.files || []);
  handleFiles(files);
};

const handleFileSelect = (event: Event) => {
  if (props.disabled) return;
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  handleFiles(files);
  
  // 清空input以允许重复选择同一文件
  target.value = '';
};

const handleFiles = (files: File[]) => {
  const validFiles = files.filter(file => validateFile(file));
  
  if (validFiles.length === 0) return;
  
  // 添加文件到上传队列
  validFiles.forEach(file => {
    const fileItem = {
      id: generateFileId(),
      file,
      status: 'pending' as const,
      progress: 0
    };
    
    uploadingFiles.value.push(fileItem);
  });
  
  // 开始上传
  nextTick(() => {
    validFiles.forEach((_, index) => {
      const fileItem = uploadingFiles.value[uploadingFiles.value.length - validFiles.length + index];
      startUpload(fileItem);
    });
  });
};

const validateFile = (file: File): boolean => {
  // 检查文件大小
  if (file.size > props.maxSizeMB * 1024 * 1024) {
    alert(`文件 "${file.name}" 超过最大大小限制 ${props.maxSizeMB}MB`);
    return false;
  }
  
  // 检查文件类型
  if (props.acceptedTypes !== '*/*') {
    const acceptedExtensions = props.acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedExtensions.some(ext => ext === '*/*' || ext === fileExtension || file.type.includes(ext.replace('*', '')))) {
      alert(`文件 "${file.name}" 类型不被支持`);
      return false;
    }
  }
  
  return true;
};

const startUpload = async (fileItem: any) => {
  fileItem.status = 'uploading';
  fileItem.abortController = new AbortController();
  
  try {
    // 模拟上传进度
    const simulateProgress = () => {
      const interval = setInterval(() => {
        if (fileItem.status !== 'uploading') {
          clearInterval(interval);
          return;
        }
        
        fileItem.progress += Math.random() * 15;
        if (fileItem.progress >= 90) {
          fileItem.progress = 90;
          clearInterval(interval);
        }
        
        emit('upload-progress', fileItem.id, fileItem.progress);
      }, 200);
      
      return interval;
    };
    
    const progressInterval = simulateProgress();
    
    // 实际上传文件
    const uploadResponse = await chatStore.uploadFile(fileItem.file);
    
    clearInterval(progressInterval);
    fileItem.progress = 100;
    fileItem.status = 'completed';
    fileItem.fileId = uploadResponse.file_id;
    
    emit('file-uploaded', fileItem.file, uploadResponse.file_id);
    emit('upload-progress', fileItem.id, 100);
    
  } catch (error: any) {
    fileItem.status = 'error';
    fileItem.error = error.message || '上传失败';
    emit('upload-error', fileItem.id, fileItem.error);
  }
};

const cancelUpload = (fileId: string) => {
  const fileItem = uploadingFiles.value.find(f => f.id === fileId);
  if (fileItem && fileItem.status === 'uploading') {
    fileItem.abortController?.abort();
    fileItem.status = 'error';
    fileItem.error = '用户取消';
  }
};

const retryUpload = (fileId: string) => {
  const fileItem = uploadingFiles.value.find(f => f.id === fileId);
  if (fileItem && fileItem.status === 'error') {
    fileItem.status = 'pending';
    fileItem.progress = 0;
    fileItem.error = undefined;
    startUpload(fileItem);
  }
};

const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (file: File) => {
  const type = file.type.toLowerCase();
  
  if (type.includes('image')) {
    return 'svg'; // 图片图标
  } else if (type.includes('video')) {
    return 'svg'; // 视频图标
  } else if (type.includes('audio')) {
    return 'svg'; // 音频图标
  } else if (type.includes('pdf')) {
    return 'svg'; // PDF图标
  } else {
    return 'svg'; // 默认文件图标
  }
};

// 清空上传列表
const clearUploadList = () => {
  uploadingFiles.value = [];
};

// 暴露方法供父组件使用
defineExpose({
  clearUploadList,
  uploadingFiles: uploadingFiles.value
});
</script>

<style scoped>
.drop-zone {
  cursor: pointer;
}

.drop-zone:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.dark .drop-zone:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.upload-item {
  transition: all 0.2s ease;
}

.upload-item:hover {
  shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark .upload-item:hover {
  shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style> 