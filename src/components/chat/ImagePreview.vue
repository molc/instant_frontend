<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    @click="closePreview"
  >
    <div class="relative max-w-screen-lg max-h-screen-lg p-4">
      <!-- 关闭按钮 -->
      <button
        @click="closePreview"
        class="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <!-- 图片导航 -->
      <div v-if="images.length > 1" class="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
      
      <!-- 前一张按钮 -->
      <button
        v-if="images.length > 1 && currentIndex > 0"
        @click.stop="previousImage"
        class="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <!-- 后一张按钮 -->
      <button
        v-if="images.length > 1 && currentIndex < images.length - 1"
        @click.stop="nextImage"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <!-- 图片容器 -->
      <div
        class="relative overflow-hidden bg-transparent rounded-lg"
        @click.stop
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        ref="imageContainer"
      >
        <img
          :src="currentImage.url"
          :alt="currentImage.alt || '图片'"
          class="max-w-full max-h-full object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
          :style="imageStyle"
          @load="onImageLoad"
          @error="onImageError"
        />
        
        <!-- 加载状态 -->
        <div
          v-if="isLoading"
          class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        
        <!-- 错误状态 -->
        <div
          v-if="hasError"
          class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 text-white"
        >
          <div class="text-center">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p>图片加载失败</p>
          </div>
        </div>
      </div>
      
      <!-- 操作工具栏 -->
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 rounded-full p-2 flex items-center space-x-2">
        <!-- 放大 -->
        <button
          @click="zoomIn"
          class="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
          title="放大"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
        
        <!-- 缩小 -->
        <button
          @click="zoomOut"
          class="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
          title="缩小"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        
        <!-- 实际大小 -->
        <button
          @click="resetZoom"
          class="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
          title="实际大小"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        
        <!-- 下载 -->
        <button
          @click="downloadImage"
          class="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
          title="下载"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

interface ImageItem {
  url: string;
  alt?: string;
  filename?: string;
}

interface Props {
  show: boolean;
  images: ImageItem[];
  initialIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  images: () => [],
  initialIndex: 0
});

const emit = defineEmits<{
  close: [];
  change: [index: number];
}>();

const currentIndex = ref(0);
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isLoading = ref(false);
const hasError = ref(false);
const isDragging = ref(false);
const lastMouseX = ref(0);
const lastMouseY = ref(0);
const imageContainer = ref<HTMLElement | null>(null);

// 当前图片
const currentImage = computed(() => {
  return props.images[currentIndex.value] || { url: '', alt: '' };
});

// 图片样式
const imageStyle = computed(() => ({
  transform: `scale(${scale.value}) translate(${translateX.value}px, ${translateY.value}px)`,
  transformOrigin: 'center center'
}));

// 监听 props 变化
watch(() => props.show, (newValue) => {
  if (newValue) {
    currentIndex.value = props.initialIndex || 0;
    resetTransform();
  }
});

watch(() => props.initialIndex, (newValue) => {
  if (newValue !== undefined) {
    currentIndex.value = newValue;
    resetTransform();
  }
});

// 重置变换
const resetTransform = () => {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
  isLoading.value = true;
  hasError.value = false;
};

// 关闭预览
const closePreview = () => {
  emit('close');
};

// 上一张图片
const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    resetTransform();
    emit('change', currentIndex.value);
  }
};

// 下一张图片
const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
    resetTransform();
    emit('change', currentIndex.value);
  }
};

// 放大
const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, 5);
};

// 缩小
const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, 0.2);
};

// 重置缩放
const resetZoom = () => {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
};

// 滚轮缩放
const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  
  if (event.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
};

// 鼠标拖拽
const handleMouseDown = (event: MouseEvent) => {
  if (scale.value > 1) {
    isDragging.value = true;
    lastMouseX.value = event.clientX;
    lastMouseY.value = event.clientY;
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value && scale.value > 1) {
    const deltaX = event.clientX - lastMouseX.value;
    const deltaY = event.clientY - lastMouseY.value;
    
    translateX.value += deltaX;
    translateY.value += deltaY;
    
    lastMouseX.value = event.clientX;
    lastMouseY.value = event.clientY;
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
};

// 图片加载完成
const onImageLoad = () => {
  isLoading.value = false;
  hasError.value = false;
};

// 图片加载错误
const onImageError = () => {
  isLoading.value = false;
  hasError.value = true;
};

// 下载图片
const downloadImage = () => {
  if (!currentImage.value.url) return;
  
  const link = document.createElement('a');
  link.href = currentImage.value.url;
  link.download = currentImage.value.filename || 'image.jpg';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.show) return;
  
  switch (event.key) {
    case 'Escape':
      closePreview();
      break;
    case 'ArrowLeft':
      previousImage();
      break;
    case 'ArrowRight':
      nextImage();
      break;
    case '+':
    case '=':
      zoomIn();
      break;
    case '-':
      zoomOut();
      break;
    case '0':
      resetZoom();
      break;
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.max-w-screen-lg {
  max-width: 90vw;
}

.max-h-screen-lg {
  max-height: 90vh;
}

/* 防止图片被选中 */
img {
  user-select: none;
  -webkit-user-drag: none;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style> 