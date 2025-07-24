<template>
  <div class="simple-screenshot">
    <!-- Screenshot dropdown menu -->
    <div class="screenshot-dropdown" v-if="showDropdown">
      <div class="dropdown-overlay" @click="closeDropdown"></div>
      <div class="dropdown-menu">
        <div class="dropdown-header">
          <h4>📷 截图方式</h4>
          <button @click="closeDropdown" class="close-btn">×</button>
        </div>
        
        <div class="dropdown-options">
          <!-- Option 1: Simple full screen -->
          <button @click="captureFullScreen" class="option-btn">
            <div class="option-icon">🖥️</div>
            <div class="option-content">
              <div class="option-title">一键截图</div>
              <div class="option-desc">直接截取整个屏幕</div>
            </div>
          </button>
          
          <!-- Option 2: System tools -->
          <div class="option-btn system-tools">
            <div class="option-icon">⌨️</div>
            <div class="option-content">
              <div class="option-title">系统截图工具</div>
              <div class="option-desc">
                <div class="system-shortcuts">
                  <div class="shortcut-item">
                    <strong>Windows:</strong> Win + Shift + S
                  </div>
                  <div class="shortcut-item">
                    <strong>Mac:</strong> Cmd + Shift + 4
                  </div>
                  <div class="shortcut-item">
                    <strong>然后粘贴:</strong> Ctrl/Cmd + V
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Option 3: Paste area highlight -->
          <div class="paste-reminder">
            <div class="paste-icon">📋</div>
            <div class="paste-text">
              截图后直接在聊天框中 <strong>粘贴 (Ctrl+V)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading overlay for simple capture -->
    <div v-if="isCapturing" class="capture-overlay">
      <div class="capture-content">
        <div class="spinner"></div>
        <div class="capture-text">正在截图...</div>
        <button @click="cancelCapture" class="cancel-capture-btn">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  'screenshot-taken': [blob: Blob];
  'show-dropdown': [];
  'hide-dropdown': [];
}>();

const showDropdown = ref(false);
const isCapturing = ref(false);

// 简单全屏截图
const captureFullScreen = async () => {
  closeDropdown();
  isCapturing.value = true;
  
  try {
    console.log('🎬 启动全屏截图...');
    
    // 检查浏览器支持
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('浏览器不支持屏幕捕获');
    }
    
    // 请求屏幕捕获，增加更多捕获选项
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser', // 尝试捕获浏览器窗口
        width: { ideal: 1920, max: 3840 },
        height: { ideal: 1080, max: 2160 },
        frameRate: { ideal: 30, max: 60 }
      },
      audio: false
    });
    
    console.log('✅ 获得屏幕流:', stream.getVideoTracks()[0].getSettings());
    
    // 创建视频元素并捕获
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    
    // 使用 Promise 确保视频加载和绘制
    const capturePromise = new Promise<Blob>((resolve, reject) => {
      video.addEventListener('loadedmetadata', async () => {
        console.log('📺 视频元数据已加载');
        
        try {
          // 等待视频就绪
          await new Promise(r => setTimeout(r, 500));
          
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('无法创建画布上下文');
          
          // 绘制视频帧
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // 停止媒体流
          stream.getTracks().forEach(track => track.stop());
          
          // 转换为 Blob
          canvas.toBlob((blob) => {
            if (blob) {
              console.log('✅ 成功捕获截图:', blob.size, '字节');
              resolve(blob);
            } else {
              reject(new Error('无法创建图像 Blob'));
            }
          }, 'image/png');
          
        } catch (drawError) {
          console.error('❌ 绘制截图失败:', drawError);
          reject(drawError);
        }
      });
      
      // 错误处理
      video.addEventListener('error', (e) => {
        console.error('❌ 视频加载错误:', e);
        reject(new Error('视频加载失败'));
      });
      
      // 超时处理
      setTimeout(() => reject(new Error('截图超时')), 15000);
    });
    
    // 播放视频并等待捕获
    await video.play();
    const capturedBlob = await capturePromise;
    
    // 发送截图
    emit('screenshot-taken', capturedBlob);
    
  } catch (error: any) {
    console.error('💥 截图失败:', error);
    
    // 详细错误处理
    if (error?.name === 'NotAllowedError') {
      alert(`🚫 需要屏幕共享权限

💡 截图步骤:
1. 点击浏览器共享对话框中的"共享"
2. 选择要截取的窗口或屏幕
3. 确认共享`);
    } else if (error.message.includes('black')) {
      alert(`⚫ 捕获到黑色画面

💡 可能原因:
• 选择了受保护的窗口
• 系统设置限制了屏幕捕获
• 浏览器权限问题

建议:
1. 尝试选择不同的窗口
2. 检查系统屏幕录制权限
3. 使用系统截图工具`);
    } else {
      alert(`❌ 截图失败: ${error.message}

💡 建议:
• 使用系统截图工具
• Windows: Win + Shift + S
• Mac: Cmd + Shift + 4
• 然后粘贴到聊天`);
    }
  } finally {
    isCapturing.value = false;
  }
};

const cancelCapture = () => {
  isCapturing.value = false;
  console.log('🚫 User cancelled capture');
};

const openDropdown = () => {
  showDropdown.value = true;
  emit('show-dropdown');
};

const closeDropdown = () => {
  showDropdown.value = false;
  emit('hide-dropdown');
};

// Expose methods
defineExpose({
  openDropdown,
  closeDropdown
});
</script>

<style scoped>
.simple-screenshot {
  position: relative;
}

.screenshot-dropdown {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.dropdown-menu {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  position: relative;
  z-index: 10001;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #eee;
}

.dropdown-header h4 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.dropdown-options {
  padding: 16px;
}

.option-btn {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  padding: 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  text-align: left;
}

.option-btn:hover {
  border-color: #00a6fb;
  background: #f8fdff;
  transform: translateY(-1px);
}

.option-btn.system-tools {
  cursor: default;
  background: #f8f9fa;
}

.option-btn.system-tools:hover {
  border-color: #dee2e6;
  background: #f8f9fa;
  transform: none;
}

.option-icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.option-content {
  flex: 1;
}

.option-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 16px;
}

.option-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.system-shortcuts {
  margin-top: 8px;
}

.shortcut-item {
  margin: 4px 0;
  padding: 4px 8px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
  font-size: 13px;
}

.paste-reminder {
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
  border: 1px solid #bbdefb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.paste-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.paste-text {
  color: #1565c0;
  font-size: 14px;
  line-height: 1.4;
}

.capture-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.capture-content {
  text-align: center;
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-left: 4px solid #00a6fb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.capture-text {
  font-size: 18px;
  margin-bottom: 20px;
}

.cancel-capture-btn {
  background: #666;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-capture-btn:hover {
  background: #555;
}
</style> 