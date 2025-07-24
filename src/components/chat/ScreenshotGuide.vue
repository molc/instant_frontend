<template>
  <div v-if="isVisible" class="screenshot-guide-overlay" @click="close">
    <div class="guide-modal" @click.stop>
      <div class="guide-header">
        <h3>📱 WeChat风格截图使用指南</h3>
        <button @click="close" class="close-btn">×</button>
      </div>
      
      <div class="guide-content">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>点击截图按钮 📷</h4>
            <p>点击聊天输入框旁边的蓝色相机图标</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>查找权限对话框 🔍</h4>
            <p class="important">在浏览器<strong>顶部</strong>会出现"共享屏幕"对话框</p>
            <div class="browser-examples">
              <div class="browser-example">
                <strong>Chrome:</strong> 地址栏下方会显示权限栏
              </div>
              <div class="browser-example">
                <strong>Firefox:</strong> 左上角会出现权限图标
              </div>
            </div>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>选择要共享的内容 🖥️</h4>
            <p>在弹出窗口中选择:</p>
            <ul>
              <li><strong>整个屏幕</strong> - 截图整个桌面</li>
              <li><strong>应用窗口</strong> - 截图特定程序窗口</li>
              <li><strong>浏览器标签页</strong> - 截图网页内容</li>
            </ul>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4>点击"共享"按钮 ✅</h4>
            <p>选择好内容后，点击<strong>"共享"</strong>或<strong>"Share"</strong>按钮</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">5</div>
          <div class="step-content">
            <h4>拖拽选择区域 🎯</h4>
            <p>在截图上拖拽鼠标选择要发送的区域</p>
          </div>
        </div>
        
        <div class="troubleshooting">
          <h4>🚨 常见问题</h4>
          <div class="problem">
            <strong>没有看到权限对话框?</strong>
            <ul>
              <li>检查浏览器是否阻止了弹窗</li>
              <li>确保使用的是 HTTPS 或 localhost</li>
              <li>刷新页面重试</li>
            </ul>
          </div>
          <div class="problem">
            <strong>权限被拒绝?</strong>
            <ul>
              <li>点击地址栏的🔒图标重新授权</li>
              <li>在浏览器设置中允许屏幕共享</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="guide-footer">
        <button @click="testNow" class="test-btn">🧪 立即测试</button>
        <button @click="close" class="got-it-btn">明白了</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isVisible = ref(false);

const emit = defineEmits<{
  'test-screenshot': [];
}>();

const show = () => {
  isVisible.value = true;
};

const close = () => {
  isVisible.value = false;
};

const testNow = () => {
  close();
  emit('test-screenshot');
};

defineExpose({
  show
});
</script>

<style scoped>
.screenshot-guide-overlay {
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
  backdrop-filter: blur(4px);
}

.guide-modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.guide-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
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
  background: #f0f0f0;
}

.guide-content {
  padding: 24px;
}

.step {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #00a6fb;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.step-content p {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.6;
}

.step-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.step-content li {
  margin: 4px 0;
  color: #666;
  line-height: 1.5;
}

.important {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 12px;
  border-radius: 6px;
  color: #856404 !important;
}

.browser-examples {
  margin-top: 12px;
}

.browser-example {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  margin: 4px 0;
  font-size: 14px;
  color: #495057;
}

.troubleshooting {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 24px;
}

.troubleshooting h4 {
  margin: 0 0 16px 0;
  color: #dc3545;
}

.problem {
  margin-bottom: 16px;
}

.problem strong {
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.problem ul {
  margin: 0;
  padding-left: 20px;
}

.problem li {
  margin: 4px 0;
  color: #666;
  line-height: 1.5;
}

.guide-footer {
  padding: 20px 24px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.test-btn {
  background: #00a6fb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.test-btn:hover {
  background: #0095e0;
}

.got-it-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.got-it-btn:hover {
  background: #5a6268;
}
</style> 