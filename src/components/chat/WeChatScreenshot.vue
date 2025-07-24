<template>
  <teleport to="body">
    <div v-if="isActive" class="wechat-screenshot-overlay" @keydown.esc="cancel">
      <div 
        class="screenshot-background" 
        :style="{ backgroundImage: capturedImage ? `url(${capturedImage})` : 'none' }"
        @mousedown="startSelection"
        @mousemove="updateSelection" 
        @mouseup="endSelection"
      >
        <!-- Dark overlay -->
        <div class="dark-overlay"></div>
        
        <!-- Selection area -->
        <div 
          v-if="selection.active"
          class="selection-area"
          :style="selectionStyle"
        >
          <!-- Selection border -->
          <div class="selection-border"></div>
          
          <!-- Corner handles -->
          <div class="selection-handle corner-tl"></div>
          <div class="selection-handle corner-tr"></div>
          <div class="selection-handle corner-bl"></div>
          <div class="selection-handle corner-br"></div>
        </div>
        
        <!-- Selection info -->
        <div 
          v-if="selection.active" 
          class="selection-info"
          :style="selectionInfoStyle"
        >
          {{ Math.abs(selection.width) }} × {{ Math.abs(selection.height) }}
        </div>
        
        <!-- Toolbar -->
        <div v-if="selection.active" class="screenshot-toolbar" :style="toolbarStyle">
          <button @click="confirm" class="toolbar-btn confirm-btn" title="发送">
            发送
          </button>
          <button @click="cancel" class="toolbar-btn cancel-btn" title="取消">
            取消
          </button>
        </div>
        
        <!-- Instructions -->
        <div v-if="!selection.active && !capturedImage" class="instructions">
          <div class="instructions-content">
            <div class="instructions-text">
              📋 请完成浏览器权限设置
            </div>
            <div class="instructions-subtext">
              <div class="permission-steps">
                <div class="step-item">
                  <span class="step-number">1</span>
                  <span>在浏览器<strong>顶部</strong>查找权限对话框</span>
                </div>
                <div class="step-item">
                  <span class="step-number">2</span>
                  <span>选择要截图的<strong>屏幕</strong>、<strong>窗口</strong>或<strong>标签页</strong></span>
                </div>
                <div class="step-item">
                  <span class="step-number">3</span>
                  <span>点击 <strong>"共享"</strong> 或 <strong>"Share"</strong> 按钮</span>
                </div>
              </div>
              <div class="help-text">
                💡 如果没看到对话框，请检查浏览器是否阻止了弹窗
              </div>
            </div>
            <div class="instruction-buttons">
              <button @click="cancel" class="cancel-instruction-btn">取消</button>
              <button @click="showTroubleshooting" class="help-instruction-btn">没看到对话框？</button>
            </div>
          </div>
        </div>
        
        <!-- Selection instructions -->
        <div v-if="capturedImage && !selection.active" class="instructions">
          <div class="instructions-content">
            <div class="instructions-text">
              🎯 拖拽选择截图区域
            </div>
            <div class="instructions-subtext">
              按住鼠标左键拖拽选择要截图的区域<br>
              按 ESC 取消
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';

interface Selection {
  active: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  height: number;
  isDragging: boolean;
}

const emit = defineEmits<{
  'screenshot-taken': [blob: Blob];
  'cancel': [];
}>();

const isActive = ref(false);
const capturedImage = ref('');
const selection = ref<Selection>({
  active: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  width: 0,
  height: 0,
  isDragging: false
});

// Reset selection when closing
const resetSelection = () => {
  selection.value = {
    active: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    width: 0,
    height: 0,
    isDragging: false
  };
};

// Computed styles
const selectionStyle = computed(() => {
  const sel = selection.value;
  const left = Math.min(sel.startX, sel.endX);
  const top = Math.min(sel.startY, sel.endY);
  const width = Math.abs(sel.width);
  const height = Math.abs(sel.height);
  
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`
  };
});

const selectionInfoStyle = computed(() => {
  const sel = selection.value;
  const left = Math.min(sel.startX, sel.endX);
  const top = Math.min(sel.startY, sel.endY);
  
  return {
    left: `${left}px`,
    top: `${Math.max(top - 30, 10)}px`
  };
});

const toolbarStyle = computed(() => {
  const sel = selection.value;
  const left = Math.min(sel.startX, sel.endX);
  const top = Math.min(sel.startY, sel.endY);
  const height = Math.abs(sel.height);
  
  return {
    left: `${left}px`,
    top: `${Math.min(top + height + 10, window.innerHeight - 60)}px`
  };
});

// Selection handling
const startSelection = (event: MouseEvent) => {
  if (!capturedImage.value) return;
  
  event.preventDefault();
  selection.value = {
    active: true,
    startX: event.clientX,
    startY: event.clientY,
    endX: event.clientX,
    endY: event.clientY,
    width: 0,
    height: 0,
    isDragging: true
  };
};

const updateSelection = (event: MouseEvent) => {
  if (!selection.value.isDragging) return;
  
  selection.value.endX = event.clientX;
  selection.value.endY = event.clientY;
  selection.value.width = selection.value.endX - selection.value.startX;
  selection.value.height = selection.value.endY - selection.value.startY;
};

const endSelection = (event: MouseEvent) => {
  selection.value.isDragging = false;
  
  // If selection is too small, cancel it
  if (Math.abs(selection.value.width) < 20 || Math.abs(selection.value.height) < 20) {
    selection.value.active = false;
  }
};

const confirm = async () => {
  try {
    console.log('📤 Send button clicked - starting crop process...');
    console.log('🔍 Selection state:', {
      active: selection.value.active,
      startX: selection.value.startX,
      startY: selection.value.startY,
      endX: selection.value.endX,
      endY: selection.value.endY,
      width: selection.value.width,
      height: selection.value.height
    });
    console.log('🖼️ Captured image exists:', !!capturedImage.value);
    console.log('📏 Captured image length:', capturedImage.value.length);
    
    // Validate selection
    const sel = selection.value;
    if (!sel.active || Math.abs(sel.width) < 10 || Math.abs(sel.height) < 10) {
      console.error('❌ Invalid selection area');
      alert('请先拖拽选择截图区域');
      return;
    }
    
    // Validate captured image
    if (!capturedImage.value) {
      console.error('❌ No captured image available');
      alert('截图数据丢失，请重新截图');
      return;
    }
    
    // Create canvas to crop the selected area
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('❌ Cannot get canvas context');
      alert('浏览器兼容性问题，请刷新重试');
      return;
    }
    
    const width = Math.abs(sel.width);
    const height = Math.abs(sel.height);
    const left = Math.min(sel.startX, sel.endX);
    const top = Math.min(sel.startY, sel.endY);
    
    console.log('🎨 Setting up canvas:', { width, height, left, top });
    
    canvas.width = width;
    canvas.height = height;
    
    // Load the captured image
    const img = new Image();
    img.onload = () => {
      console.log('🖼️ Original image loaded:', {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      });
      
      // Calculate the scaling factor (image size vs screen size)
      const scaleX = img.naturalWidth / window.innerWidth;
      const scaleY = img.naturalHeight / window.innerHeight;
      
      console.log('📐 Scaling factors:', { scaleX, scaleY });
      
      // Draw the cropped area
      ctx.drawImage(
        img,
        left * scaleX,
        top * scaleY,
        width * scaleX,
        height * scaleY,
        0,
        0,
        width,
        height
      );
      
      console.log('🎨 Canvas drawing completed');
      
      // Convert to blob and emit
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('✅ Cropped screenshot created:', blob.size, 'bytes');
          emit('screenshot-taken', blob);
          close();
        } else {
          console.error('❌ Failed to create blob from canvas');
          alert('截图处理失败，请重试');
        }
      }, 'image/png');
    };
    
    img.onerror = (error) => {
      console.error('❌ Failed to load captured image:', error);
      alert('截图数据损坏，请重新截图');
    };
    
    console.log('📥 Loading captured image...');
    img.src = capturedImage.value;
    
  } catch (error) {
    console.error('💥 Error in confirm function:', error);
    alert('截图处理出错，请重试');
    cancel();
  }
};

const cancel = () => {
  console.log('Screenshot cancelled');
  emit('cancel');
  close();
};

const showTroubleshooting = () => {
  alert(`🔍 权限对话框故障排除

常见位置:
• Chrome: 地址栏下方的蓝色权限栏
• Firefox: 地址栏左侧的摄像头图标
• Safari: 地址栏左侧的权限图标

如果没有看到:
1. 检查浏览器是否阻止了弹窗
2. 点击地址栏的🔒图标查看权限
3. 刷新页面重试
4. 确保使用最新版本的浏览器

替代方案:
• 使用系统截图工具 (Windows: Win+Shift+S, Mac: Cmd+Shift+4)
• 截图后粘贴到聊天框 (Ctrl+V)`);
};

const close = () => {
  console.log('🔄 Closing screenshot overlay');
  isActive.value = false;
  capturedImage.value = '';
  resetSelection();
  document.body.style.overflow = '';
  removeKeyboardHandler();
};

const startScreenshot = async () => {
  console.log('🎬 Starting WeChat-style screenshot...');
  
  try {
    // Show overlay first
    isActive.value = true;
    document.body.style.overflow = 'hidden';
    setupKeyboardHandler();
    
    console.log('🔍 Checking secure context and API support...');
    
    // Enhanced security context check
    if (!window.isSecureContext) {
      console.warn('⚠️ Not in secure context');
      alert('❌ 需要安全连接 (HTTPS) 才能使用截图功能');
      emit('cancel');
      close();
      return;
    }
    
    if (!navigator.mediaDevices?.getDisplayMedia) {
      console.error('❌ getDisplayMedia API not available');
      alert('❌ 浏览器不支持屏幕截图功能');
      emit('cancel');
      close();
      return;
    }
    
    console.log('📋 Requesting screen capture permission...');
    console.log('💡 Please look for browser permission dialog at top of screen!');
    
    // Request screen capture with timeout
    const streamPromise = navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });
    
    // Add timeout to prevent infinite waiting
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Permission timeout')), 30000); // 30 second timeout
    });
    
    const stream = await Promise.race([streamPromise, timeoutPromise]) as MediaStream;
    
    console.log('✅ Screen capture permission granted!');
    console.log('📹 Stream details:', {
      active: stream.active,
      tracks: stream.getVideoTracks().length
    });
    
    // Create video element to capture frame
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    
    // Use Promise to handle video loading
    const videoLoadPromise = new Promise<void>((resolve, reject) => {
      video.addEventListener('loadedmetadata', () => {
        console.log('📺 Video metadata loaded:', {
          width: video.videoWidth,
          height: video.videoHeight
        });
        
        // Small delay to ensure video is ready
        setTimeout(() => {
          try {
            // Create canvas to capture the frame
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }
            
            console.log('🎨 Drawing video frame to canvas...');
            ctx.drawImage(video, 0, 0);
            
            // Stop the stream
            console.log('🛑 Stopping video stream...');
            stream.getTracks().forEach(track => {
              console.log('🔇 Stopping track:', track.kind);
              track.stop();
            });
            
            // Convert to data URL and show for selection
            const dataURL = canvas.toDataURL('image/png');
            capturedImage.value = dataURL;
            console.log('🖼️ Image captured! Size:', dataURL.length, 'chars');
            console.log('🎯 Ready for area selection!');
            
            resolve();
          } catch (error) {
            reject(error);
          }
        }, 100);
      });
      
      video.addEventListener('error', (e) => {
        console.error('❌ Video error:', e);
        reject(new Error('Video loading failed'));
      });
      
      // Timeout for video loading
      setTimeout(() => {
        reject(new Error('Video loading timeout'));
      }, 10000);
    });
    
    console.log('▶️ Starting video playback...');
    await video.play();
    await videoLoadPromise;
    
  } catch (error: any) {
    console.error('💥 Screenshot failed:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message
    });
    
    if (error?.name === 'NotAllowedError') {
      console.log('🚫 User cancelled screen share');
      alert(`🚫 屏幕截图已取消

💡 重新尝试:
1. 再次点击截图按钮
2. 在权限对话框中点击"共享"
3. 选择要截图的屏幕或窗口`);
    } else if (error.message === 'Permission timeout') {
      console.log('⏰ Permission dialog timeout');
      alert(`⏰ 权限对话框超时

💡 请重试:
1. 确保看到浏览器顶部的权限对话框
2. 及时点击"共享"按钮
3. 如果没看到对话框，请检查浏览器设置`);
    } else {
      console.error('🚨 Unexpected error:', error);
      alert(`🚨 截图功能错误: ${error.message}

🔧 请尝试:
1. 刷新页面重试
2. 检查浏览器权限设置`);
    }
    
    emit('cancel');
    close();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isActive.value) {
    event.preventDefault();
    event.stopPropagation();
    console.log('🔑 ESC key pressed - cancelling screenshot');
    cancel();
  }
};

// Add global keyboard handler when component is active
const setupKeyboardHandler = () => {
  document.addEventListener('keydown', handleKeydown, true); // Use capture phase
  console.log('⌨️ Keyboard handler added');
};

const removeKeyboardHandler = () => {
  document.removeEventListener('keydown', handleKeydown, true);
  console.log('⌨️ Keyboard handler removed');
};

onUnmounted(() => {
  removeKeyboardHandler();
  document.body.style.overflow = '';
});

// Expose methods
defineExpose({
  startScreenshot
});
</script>

<style scoped>
.wechat-screenshot-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  cursor: crosshair;
  user-select: none;
}

.screenshot-background {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.dark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.selection-area {
  position: absolute;
  background: transparent;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  cursor: move;
}

.selection-border {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid #00a6fb;
  pointer-events: none;
}

.selection-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #00a6fb;
  border: 1px solid #fff;
  border-radius: 2px;
}

.corner-tl { top: -4px; left: -4px; cursor: nw-resize; }
.corner-tr { top: -4px; right: -4px; cursor: ne-resize; }
.corner-bl { bottom: -4px; left: -4px; cursor: sw-resize; }
.corner-br { bottom: -4px; right: -4px; cursor: se-resize; }

.selection-info {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

.screenshot-toolbar {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px 16px;
  border-radius: 6px;
  backdrop-filter: blur(10px);
}

.toolbar-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.confirm-btn {
  background: #00a6fb;
  color: white;
}

.confirm-btn:hover {
  background: #0095e0;
}

.cancel-btn {
  background: #666;
  color: white;
}

.cancel-btn:hover {
  background: #555;
}

.instructions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.instructions-content {
  text-align: center;
  color: white;
  background: rgba(0, 0, 0, 0.9);
  padding: 30px;
  border-radius: 12px;
  min-width: 300px;
  backdrop-filter: blur(10px);
}

.instructions-text {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 12px;
}

.instructions-subtext {
  font-size: 14px;
  opacity: 0.8;
}

.permission-steps {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 15px;
  text-align: left;
}

.step-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 16px;
}

.step-number {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  border-radius: 50%;
  background-color: #00a6fb;
  color: white;
  font-weight: bold;
  margin-right: 10px;
  text-align: center;
}

.help-text {
  font-size: 14px;
  color: #ccc;
  margin-top: 15px;
}

.instruction-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.cancel-instruction-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background: #666;
  color: white;
  transition: background 0.2s ease;
}

.cancel-instruction-btn:hover {
  background: #555;
}

.help-instruction-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background: #00a6fb;
  color: white;
  transition: background 0.2s ease;
}

.help-instruction-btn:hover {
  background: #0095e0;
}
</style> 