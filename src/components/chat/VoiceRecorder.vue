<template>
  <div class="voice-recorder">
    <!-- 录音按钮 -->
    <div class="relative">
      <button
        @mousedown="startRecording"
        @mouseup="stopRecording"
        @mouseleave="stopRecording"
        @touchstart="startRecording"
        @touchend="stopRecording"
        :disabled="!isSupported"
        :class="[
          'p-3 rounded-full transition-all duration-200',
          isRecording 
            ? 'bg-red-500 text-white scale-110 animate-pulse' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600',
          !isSupported && 'opacity-50 cursor-not-allowed'
        ]"
        :title="isSupported ? '按住录音' : '设备不支持录音'"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z" />
          <path d="M19 10v1a7 7 0 01-14 0v-1m7 9v3m-3 0h6" />
        </svg>
      </button>
      
      <!-- 录音指示器 -->
      <div
        v-if="isRecording"
        class="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"
      />
    </div>
    
    <!-- 录音时的浮动提示 -->
    <div
      v-if="isRecording"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z" />
              <path d="M19 10v1a7 7 0 01-14 0v-1m7 9v3m-3 0h6" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            正在录音...
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ formatDuration(recordingDuration) }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            松开按钮结束录音
          </p>
        </div>
      </div>
    </div>
    
    <!-- 录音播放预览 -->
    <div
      v-if="audioBlob && !isRecording"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            录音完成
          </h3>
          
          <!-- 播放控制 -->
          <div class="flex items-center justify-center space-x-4 mb-4">
            <button
              @click="playRecording"
              class="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <svg v-if="!isPlaying" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatDuration(recordingDuration) }}
            </div>
          </div>
          
          <!-- 波形显示 -->
          <div class="flex items-center justify-center mb-4">
            <div class="flex items-end space-x-1">
              <div
                v-for="n in 20"
                :key="n"
                class="w-1 bg-blue-500 rounded-full transition-all duration-150"
                :style="{ height: `${Math.random() * 20 + 4}px` }"
                :class="isPlaying ? 'animate-pulse' : ''"
              />
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex space-x-3">
            <button
              @click="cancelRecording"
              class="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              @click="sendRecording"
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 隐藏的音频元素 -->
    <audio ref="audioPlayer" @ended="onAudioEnded" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits<{
  send: [audioBlob: Blob, duration: number];
}>();

const isSupported = ref(false);
const isRecording = ref(false);
const isPlaying = ref(false);
const recordingDuration = ref(0);
const audioBlob = ref<Blob | null>(null);
const audioPlayer = ref<HTMLAudioElement | null>(null);

let mediaRecorder: MediaRecorder | null = null;
let recordingStream: MediaStream | null = null;
let recordingTimer: NodeJS.Timeout | null = null;
let recordingStartTime: number = 0;

// 检查设备支持
const checkSupport = () => {
  isSupported.value = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// 开始录音
const startRecording = async () => {
  if (!isSupported.value || isRecording.value) return;
  
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(recordingStream);
    
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
      audioBlob.value = new Blob(chunks, { type: 'audio/wav' });
      if (recordingStream) {
        recordingStream.getTracks().forEach(track => track.stop());
      }
    };
    
    mediaRecorder.start();
    isRecording.value = true;
    recordingStartTime = Date.now();
    
    // 开始计时
    recordingTimer = setInterval(() => {
      recordingDuration.value = Math.floor((Date.now() - recordingStartTime) / 1000);
    }, 100);
    
  } catch (error) {
    console.error('获取麦克风权限失败:', error);
    alert('无法获取麦克风权限，请检查浏览器设置');
  }
};

// 停止录音
const stopRecording = () => {
  if (!isRecording.value || !mediaRecorder) return;
  
  mediaRecorder.stop();
  isRecording.value = false;
  
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
};

// 播放录音
const playRecording = () => {
  if (!audioBlob.value || !audioPlayer.value) return;
  
  if (isPlaying.value) {
    audioPlayer.value.pause();
    isPlaying.value = false;
  } else {
    const url = URL.createObjectURL(audioBlob.value);
    audioPlayer.value.src = url;
    audioPlayer.value.play();
    isPlaying.value = true;
  }
};

// 音频播放结束
const onAudioEnded = () => {
  isPlaying.value = false;
};

// 发送录音
const sendRecording = () => {
  if (!audioBlob.value) return;
  
  emit('send', audioBlob.value, recordingDuration.value);
  cancelRecording();
};

// 取消录音
const cancelRecording = () => {
  audioBlob.value = null;
  recordingDuration.value = 0;
  isPlaying.value = false;
  
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value.src = '';
  }
};

// 格式化时长
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 生命周期
onMounted(() => {
  checkSupport();
});

onUnmounted(() => {
  if (recordingTimer) {
    clearInterval(recordingTimer);
  }
  if (recordingStream) {
    recordingStream.getTracks().forEach(track => track.stop());
  }
});
</script>

<style scoped>
/* 录音动画 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.animate-pulse {
  animation: pulse 1s ease-in-out infinite;
}

/* 波形动画 */
@keyframes waveform {
  0%, 100% {
    height: 4px;
  }
  50% {
    height: 20px;
  }
}

.waveform-bar {
  animation: waveform 1s ease-in-out infinite;
}

.waveform-bar:nth-child(2) {
  animation-delay: 0.1s;
}

.waveform-bar:nth-child(3) {
  animation-delay: 0.2s;
}

.waveform-bar:nth-child(4) {
  animation-delay: 0.3s;
}

.waveform-bar:nth-child(5) {
  animation-delay: 0.4s;
}
</style> 