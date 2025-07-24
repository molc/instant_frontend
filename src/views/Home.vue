<template>
  <div class="home-page">
    <div class="welcome-section">
      <h1>欢迎使用即时通讯</h1>
      <p>连接世界，从这里开始</p>
      
      <div class="user-info" v-if="authStore.isAuthenticated">
        <el-card class="user-card">
          <div class="user-avatar">
            <el-avatar :size="80">
              {{ authStore.user?.name?.charAt(0).toUpperCase() }}
            </el-avatar>
          </div>
          <div class="user-details">
            <h3>{{ authStore.user?.name }}</h3>
            <p>ID: {{ authStore.user?.standard_id }}</p>
            <el-button type="primary" @click="router.push('/chat')">
              开始聊天
            </el-button>
          </div>
        </el-card>
      </div>
      
      <div class="guest-actions" v-else>
        <el-button type="primary" size="large" @click="router.push('/auth')">
          立即开始
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.welcome-section {
  text-align: center;
  color: white;
  
  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }
}

.user-card {
  max-width: 400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  
  .user-avatar {
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .user-details {
    text-align: center;
    
    h3 {
      color: var(--el-text-color-primary);
      margin-bottom: 0.5rem;
    }
    
    p {
      color: var(--el-text-color-regular);
      margin-bottom: 1rem;
    }
  }
}

.guest-actions {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .welcome-section {
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
}
</style> 