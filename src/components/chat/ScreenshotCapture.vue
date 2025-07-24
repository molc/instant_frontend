<template>
  <div class="screenshot-capture" style="background: lime; padding: 5px; margin: 0 5px;">
    <!-- 截图按钮 -->
    <button
      @click="handleScreenshot"
      class="p-2 rounded-lg text-white bg-green-500 hover:bg-green-600 border-2 border-yellow-400"
      title="截图"
      style="background-color: #10b981 !important; border: 3px solid yellow !important; font-size: 16px;"
    >
      📷 截图
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

console.log('🎯 ScreenshotCapture.vue - Loading component...');

const emit = defineEmits<{
  'screenshot-captured': [file: File];
}>();

const handleScreenshot = () => {
  console.log('🎯 Screenshot button clicked!');
  alert('截图功能已点击！这个按钮现在可见了！');
};

onMounted(() => {
  console.log('🎯 [ScreenshotCapture] Component mounted successfully - THIS SHOULD BE VISIBLE!');
  
  // Force update DOM to ensure visibility
  const element = document.querySelector('.screenshot-capture');
  if (element) {
    console.log('🎯 Screenshot component found in DOM:', element);
  } else {
    console.error('🎯 Screenshot component NOT found in DOM!');
  }
});
</script>

<style scoped>
.screenshot-capture {
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
  z-index: 9999 !important;
}
</style> 