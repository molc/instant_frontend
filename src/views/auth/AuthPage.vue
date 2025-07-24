<template>
  <div class="auth-page">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <!-- 几何图形背景 -->
      <div class="geometric-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
        <div class="shape shape-6"></div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="auth-container">
      <!-- 左侧插画区域 -->
      <div class="illustration-section">
        <div class="character-scene">
          <!-- 工作桌 -->
          <div class="desk">
            <div class="desk-surface"></div>
            <div class="desk-legs"></div>
            <div class="laptop"></div>
            <div class="coffee-cup"></div>
          </div>
          
          <!-- 角色 -->
          <div class="character">
            <div class="character-body">
              <div class="head">
                <div class="face"></div>
                <div class="glasses"></div>
                <div class="hair"></div>
              </div>
              <div class="torso"></div>
              <div class="arms">
                <div class="arm arm-left"></div>
                <div class="arm arm-right"></div>
              </div>
            </div>
            <div class="chair">
              <div class="chair-back"></div>
              <div class="chair-seat"></div>
              <div class="chair-legs"></div>
            </div>
          </div>
          
          <!-- 植物装饰 -->
          <div class="plants">
            <div class="plant plant-1">
              <div class="pot pot-orange"></div>
              <div class="plant-leaves"></div>
            </div>
            <div class="plant plant-2">
              <div class="pot pot-yellow"></div>
              <div class="plant-leaves small"></div>
            </div>
            <div class="plant plant-3">
              <div class="pot pot-green"></div>
              <div class="plant-leaves tall"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="form-section">
        <div class="auth-card">
          <!-- 表单内容 -->
          <div class="auth-content">
            <transition name="fade" mode="out-in">
              <LoginForm
                v-if="activeTab === 'login'"
                @switch-to-register="activeTab = 'register'"
                @forgot-password="handleForgotPassword"
              />
              <RegisterForm
                v-else
                @switch-to-login="activeTab = 'login'"
              />
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- 忘记密码对话框 -->
    <el-dialog
      v-model="showForgotPassword"
      title="重置密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="forgotPasswordFormRef"
        :model="forgotPasswordForm"
        :rules="forgotPasswordRules"
        @submit="handleResetPassword"
      >
        <el-form-item prop="email">
          <el-input
            v-model="forgotPasswordForm.email"
            type="email"
            placeholder="请输入注册邮箱"
            size="large"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showForgotPassword = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="resetPasswordLoading"
            @click="handleResetPassword"
          >
            发送重置邮件
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { Message } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import LoginForm from '@/components/auth/LoginForm.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';
import type { FormInstance, FormRules } from 'element-plus';

// 响应式数据
const activeTab = ref<'login' | 'register'>('login');
const authStore = useAuthStore();
const router = useRouter();

// 忘记密码相关
const showForgotPassword = ref(false);
const forgotPasswordFormRef = ref<FormInstance>();
const resetPasswordLoading = ref(false);
const forgotPasswordForm = reactive({
  email: '',
});

const forgotPasswordRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
});

// 处理忘记密码
const handleForgotPassword = () => {
  showForgotPassword.value = true;
};

const handleResetPassword = async () => {
  if (!forgotPasswordFormRef.value) return;
  
  try {
    await forgotPasswordFormRef.value.validate();
    resetPasswordLoading.value = true;
    
    // 暂时模拟重置密码功能，因为API文档中没有定义此接口
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    ElMessage.success({
      message: '重置密码邮件已发送，请查收',
      offset: 100
    });
    showForgotPassword.value = false;
    forgotPasswordForm.email = '';
    
  } catch (error: any) {
    console.error('Reset password failed:', error);
    ElMessage.error({
      message: error.message || '发送重置邮件失败',
      offset: 100
    });
  } finally {
    resetPasswordLoading.value = false;
  }
};

// 页面加载时检查是否已经登录
onMounted(() => {
  // 添加特殊class防止滚动条
  document.body.classList.add('auth-page-active');
  
  if (authStore.isAuthenticated) {
    router.push('/');
  }
});

// 页面销毁时移除特殊class
onBeforeUnmount(() => {
  document.body.classList.remove('auth-page-active');
});
</script>

<style scoped lang="scss">
/* 主页面样式 */
.auth-page {
  height: 100vh;
  max-height: 100vh;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  
  .geometric-shapes {
    position: relative;
    width: 100%;
    height: 100%;
    
    .shape {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      
      &.shape-1 {
        width: 200px;
        height: 150px;
        top: 10%;
        left: 5%;
        transform: rotate(15deg);
      }
      
      &.shape-2 {
        width: 150px;
        height: 200px;
        top: 60%;
        left: 15%;
        transform: rotate(-10deg);
      }
      
      &.shape-3 {
        width: 180px;
        height: 120px;
        top: 20%;
        right: 20%;
        transform: rotate(25deg);
      }
      
      &.shape-4 {
        width: 120px;
        height: 180px;
        bottom: 20%;
        right: 5%;
        transform: rotate(-15deg);
      }
      
      &.shape-5 {
        width: 100px;
        height: 100px;
        top: 40%;
        left: 30%;
        transform: rotate(45deg);
      }
      
      &.shape-6 {
        width: 80px;
        height: 80px;
        bottom: 40%;
        right: 40%;
        transform: rotate(-30deg);
      }
    }
  }
}

/* 主容器 */
.auth-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-height: 100vh;
  padding: 1rem 2rem;
  gap: 2rem;
  box-sizing: border-box;
}

/* 左侧插画区域 */
.illustration-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .character-scene {
    position: relative;
    width: 400px;
    height: 400px;
    
    /* 工作桌 */
    .desk {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      
      .desk-surface {
        width: 200px;
        height: 12px;
        background: #d4a574;
        border-radius: 6px;
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #b8935f;
          border-radius: 1px;
        }
      }
      
      .desk-legs {
        position: absolute;
        bottom: -40px;
        left: 20px;
        width: 160px;
        height: 40px;
        
        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 40px;
          background: #d4a574;
        }
        
        &::before {
          left: 0;
        }
        
        &::after {
          right: 0;
        }
      }
      
      .laptop {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 40px;
        background: #e8e8e8;
        border-radius: 4px;
        
        &::before {
          content: '';
          position: absolute;
          top: -25px;
          left: 0;
          width: 60px;
          height: 25px;
          background: #333;
          border-radius: 4px 4px 0 0;
        }
        
        &::after {
          content: '';
          position: absolute;
          top: -20px;
          left: 5px;
          width: 50px;
          height: 15px;
          background: #4facfe;
          border-radius: 2px;
        }
      }
      
      .coffee-cup {
        position: absolute;
        top: -12px;
        right: 20px;
        width: 20px;
        height: 15px;
        background: white;
        border-radius: 0 0 10px 10px;
        
        &::before {
          content: '';
          position: absolute;
          top: -3px;
          left: 0;
          width: 20px;
          height: 3px;
          background: #8b4513;
          border-radius: 2px;
        }
        
        &::after {
          content: '';
          position: absolute;
          top: 3px;
          right: -5px;
          width: 8px;
          height: 8px;
          border: 2px solid white;
          border-radius: 50%;
          border-left: none;
        }
      }
    }
    
    /* 角色 */
    .character {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      
      .character-body {
        position: relative;
        z-index: 2;
        
        .head {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          
          .face {
            width: 50px;
            height: 60px;
            background: #fdbcb4;
            border-radius: 25px 25px 20px 20px;
            position: relative;
            
            &::before {
              content: '';
              position: absolute;
              top: 20px;
              left: 15px;
              width: 4px;
              height: 4px;
              background: #333;
              border-radius: 50%;
              box-shadow: 16px 0 0 #333;
            }
            
            &::after {
              content: '';
              position: absolute;
              top: 35px;
              left: 20px;
              width: 10px;
              height: 3px;
              background: #d4a574;
              border-radius: 2px;
            }
          }
          
          .glasses {
            position: absolute;
            top: 15px;
            left: 5px;
            width: 40px;
            height: 20px;
            border: 3px solid #333;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            
            &::before {
              content: '';
              position: absolute;
              top: -3px;
              left: 15px;
              width: 10px;
              height: 3px;
              background: #333;
            }
          }
          
          .hair {
            position: absolute;
            top: -15px;
            left: 5px;
            width: 40px;
            height: 25px;
            background: #8b4513;
            border-radius: 20px 20px 0 0;
            
            &::before {
              content: '';
              position: absolute;
              top: 5px;
              left: -5px;
              width: 15px;
              height: 20px;
              background: #8b4513;
              border-radius: 10px;
            }
            
            &::after {
              content: '';
              position: absolute;
              top: 5px;
              right: -5px;
              width: 15px;
              height: 20px;
              background: #8b4513;
              border-radius: 10px;
            }
          }
        }
        
        .torso {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 60px;
          background: #ffd700;
          border-radius: 30px 30px 10px 10px;
        }
        
        .arms {
          .arm {
            position: absolute;
            width: 15px;
            height: 40px;
            background: #ffd700;
            border-radius: 8px;
            
            &.arm-left {
              bottom: 50px;
              left: 20px;
              transform: rotate(20deg);
            }
            
            &.arm-right {
              bottom: 50px;
              right: 20px;
              transform: rotate(-20deg);
            }
          }
        }
      }
      
      .chair {
        position: relative;
        z-index: 1;
        
        .chair-back {
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 40px;
          background: #2c3e50;
          border-radius: 8px 8px 0 0;
        }
        
        .chair-seat {
          position: absolute;
          bottom: 50px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 12px;
          background: #2c3e50;
          border-radius: 6px;
        }
        
        .chair-legs {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 50px;
          
          &::before,
          &::after {
            content: '';
            position: absolute;
            width: 6px;
            height: 50px;
            background: #2c3e50;
          }
          
          &::before {
            left: 5px;
          }
          
          &::after {
            right: 5px;
          }
        }
      }
    }
    
    /* 植物装饰 */
    .plants {
      .plant {
        position: absolute;
        
        .pot {
          width: 30px;
          height: 25px;
          border-radius: 0 0 8px 8px;
          
          &.pot-orange {
            background: #ff6b35;
          }
          
          &.pot-yellow {
            background: #f7931e;
          }
          
          &.pot-green {
            background: #4caf50;
          }
        }
        
        .plant-leaves {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          
          &::before,
          &::after {
            content: '';
            position: absolute;
            background: #4caf50;
            border-radius: 50%;
          }
          
          &::before {
            width: 20px;
            height: 30px;
            top: -25px;
            left: -10px;
          }
          
          &::after {
            width: 15px;
            height: 25px;
            top: -20px;
            right: -8px;
          }
          
          &.small {
            &::before {
              width: 15px;
              height: 20px;
              top: -18px;
            }
            
            &::after {
              width: 12px;
              height: 18px;
              top: -15px;
            }
          }
          
          &.tall {
            &::before {
              width: 25px;
              height: 40px;
              top: -35px;
            }
            
            &::after {
              width: 20px;
              height: 35px;
              top: -30px;
            }
          }
        }
        
        &.plant-1 {
          bottom: 20px;
          left: 20px;
        }
        
        &.plant-2 {
          bottom: 40px;
          right: 30px;
        }
        
        &.plant-3 {
          bottom: 60px;
          left: 60px;
        }
      }
    }
  }
}

/* 右侧表单区域 */
.form-section {
  flex: 0 0 500px; /* 增加宽度从400px到500px */
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 100vh; /* 确保不超过视口高度 */
  
  .auth-card {
    background: white;
    border-radius: 20px;
    padding: 2rem; /* 增加内边距 */
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); /* 加强阴影效果 */
    width: 100%;
    max-width: 500px; /* 增加最大宽度 */
    max-height: calc(100vh - 4rem);
    overflow: hidden; /* 防止滚动条 */
    

    
    .auth-content {
      margin-top: 0; /* 移除顶部间距 */
      max-height: calc(100vh - 8rem); /* 增加可用高度，因为没有标签了 */
      overflow: hidden; /* 禁止滚动 */
    }
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .form-section {
    flex: 0 0 450px; /* 中等屏幕稍微减少宽度 */
    
    .auth-card {
      max-width: 450px;
    }
  }
}

@media (max-width: 1024px) {
  .auth-page {
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
  }
  
  .auth-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    height: 100vh;
    max-height: 100vh;
  }
  
  .illustration-section {
    flex: 0 0 200px; /* 减少插画区域高度 */
    
    .character-scene {
      width: 250px;
      height: 200px;
      transform: scale(0.7);
    }
  }
  
  .form-section {
    flex: 1;
    width: 100%;
    max-width: 600px; /* 在平板上增加最大宽度 */
    max-height: calc(100vh - 250px); /* 为插画留出空间 */
    
    .auth-card {
      max-width: 600px;
      max-height: calc(100vh - 280px);
      
      .auth-content {
        max-height: calc(100vh - 330px); /* 减少高度因为没有标签了 */
      }
    }
  }
}

@media (max-width: 768px) {
  .auth-container {
    padding: 0.5rem;
    justify-content: center;
  }
  
  .illustration-section {
    display: none; /* 手机上隐藏插画 */
  }
  
  .form-section {
    flex: 1;
    max-height: calc(100vh - 1rem);
    max-width: 100%;
    
    .auth-card {
      padding: 1.5rem;
      border-radius: 15px;
      max-height: calc(100vh - 2rem);
      margin: 0;
      max-width: 100%;
      
      .auth-content {
        max-height: calc(100vh - 120px); /* 减少高度因为没有标签了 */
      }
    }
  }
}

@media (max-width: 480px) {
  .form-section {
    .auth-card {
      padding: 1rem;
      border-radius: 10px;
      
      .auth-content {
        max-height: calc(100vh - 160px);
      }
    }
  }
}
</style> 
