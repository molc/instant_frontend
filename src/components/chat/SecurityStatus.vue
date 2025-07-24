<template>
  <div v-if="showStatus" class="security-status" :class="statusClass">
    <div class="status-content">
      <div class="status-indicator">
        <span class="status-icon">{{ statusIcon }}</span>
        <span class="status-text">{{ statusText }}</span>
      </div>
      
      <div v-if="!isSecure" class="status-details">
        <div class="current-env">
          <strong>当前环境:</strong> {{ currentUrl }}
        </div>
        <div class="recommendations">
          <strong>生产环境解决方案:</strong>
          <ul>
            <li>配置 SSL 证书 (推荐)</li>
            <li>使用 nginx HTTPS 反向代理</li>
            <li>通过域名访问而不是 IP</li>
          </ul>
        </div>
      </div>
      
      <button @click="hide" class="close-btn">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const showStatus = ref(false);

const isSecure = computed(() => window.isSecureContext);
const isProduction = computed(() => !window.location.hostname.includes('localhost'));
const currentUrl = computed(() => window.location.href);

const statusClass = computed(() => ({
  'status-secure': isSecure.value,
  'status-insecure': !isSecure.value,
  'status-production': isProduction.value
}));

const statusIcon = computed(() => {
  if (isSecure.value) return '🔒';
  return '⚠️';
});

const statusText = computed(() => {
  if (isSecure.value) {
    return '安全连接 - 所有功能可用';
  } else {
    return '非安全连接 - 截图功能被限制';
  }
});

const hide = () => {
  showStatus.value = false;
  localStorage.setItem('security-status-hidden', 'true');
};

onMounted(() => {
  // Show warning for insecure production environment
  const wasHidden = localStorage.getItem('security-status-hidden');
  if (!isSecure.value && isProduction.value && !wasHidden) {
    showStatus.value = true;
  }
});

// Expose method to show status manually
defineExpose({
  show: () => { showStatus.value = true; }
});
</script>

<style scoped>
.security-status {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  font-size: 14px;
}

.status-secure {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.status-insecure {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.status-production.status-insecure {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.status-content {
  padding: 16px;
  position: relative;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 12px;
}

.status-icon {
  font-size: 16px;
}

.status-details {
  font-size: 13px;
  line-height: 1.5;
}

.current-env {
  margin-bottom: 8px;
  word-break: break-all;
}

.recommendations ul {
  margin: 4px 0 0 0;
  padding-left: 20px;
}

.recommendations li {
  margin: 2px 0;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.close-btn:hover {
  opacity: 1;
}
</style> 