<template>
  <div class="login-form">
    <!-- 标题区域 -->
    <div class="form-header">
      <h2 class="form-title">登录</h2>
      <p class="form-subtitle">欢迎回来！请输入您的账户信息</p>
    </div>

    <!-- 登录表单 -->
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="rules"
      class="login-form-content"
      @submit.prevent="handleLogin"
    >
      <!-- 用户标准ID输入 -->
      <el-form-item prop="username" class="form-item">
        <label class="form-label">用户标准ID</label>
        <el-input
          v-model="loginForm.username"
          type="text"
          placeholder="请输入用户标准ID"
          size="large"
          class="form-input"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 密码输入 -->
      <el-form-item prop="password" class="form-item">
        <label class="form-label">密码</label>
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          size="large"
          class="form-input"
          show-password
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 选项区域 -->
      <div class="form-options">
        <el-checkbox v-model="rememberMe" class="remember-checkbox">
          记住我
        </el-checkbox>
        <el-link 
          type="primary" 
          @click="$emit('forgot-password')"
          class="forgot-link"
        >
          忘记密码?
        </el-link>
      </div>

      <!-- 登录按钮 -->
      <el-form-item class="form-item">
        <el-button
          type="primary"
          size="large"
          class="login-button"
          :loading="isLoading"
          native-type="submit"
          block
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 分割线 -->
    <div class="divider">
      <span class="divider-text">或者</span>
    </div>

    <!-- 注册链接 -->
    <div class="register-section">
      <p class="register-text">
        还没有账户？
        <el-link 
          type="primary" 
          @click="$emit('switch-to-register')"
          class="register-link"
        >
          立即注册
        </el-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import type { LoginCredentials } from '@/types/auth';

// 定义事件
const emit = defineEmits<{
  'forgot-password': [];
  'switch-to-register': [];
}>();

// 响应式数据
const loginFormRef = ref<FormInstance>();
const authStore = useAuthStore();
const router = useRouter();

const loginForm = reactive<LoginCredentials>({
  username: '',
  password: '',
});

const rememberMe = ref(false);
const isLoading = ref(false);

// 表单验证规则
const rules = reactive<FormRules<LoginCredentials>>({
  username: [
    { required: true, message: '请输入用户标准ID', trigger: 'blur' },
    { min: 1, max: 20, message: '用户标准ID长度在 1 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度在 6 到 100 个字符', trigger: 'blur' },
  ],
});

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    await loginFormRef.value.validate();
    isLoading.value = true;
    
    await authStore.login(loginForm);
    
    ElMessage.success({
      message: '登录成功！',
      duration: 2000,
      showClose: true,
      offset: 100 // 设置消息距离顶部的偏移量
    });
    
    // 延迟跳转，让用户看到成功消息
    setTimeout(() => {
      const redirect = router.currentRoute.value.query.redirect as string;
      router.push(redirect || '/chat');
    }, 800);
    
  } catch (error: any) {
    console.error('Login failed:', error);
    
    // 详细的错误处理
    let errorMessage = '登录失败';
    
    if (error.response?.status === 400) {
      errorMessage = '用户名或密码错误';
    } else if (error.response?.status === 422) {
      errorMessage = '请输入正确的用户名和密码格式';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    ElMessage.error({
      message: errorMessage,
      duration: 4000,
      showClose: true,
      offset: 100 // 设置消息距离顶部的偏移量
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.login-form {
  width: 100%;
  
  /* 标题区域 */
  .form-header {
    text-align: center;
    margin-bottom: 1.2rem; /* 减少标题底部间距 */
    
    .form-title {
      font-size: 1.4rem; /* 减小标题字体 */
      font-weight: 600;
      color: #4facfe;
      margin: 0 0 0.2rem; /* 减少标题间距 */
    }
    
    .form-subtitle {
      color: #666;
      font-size: 0.8rem; /* 减小副标题字体 */
      margin: 0;
      line-height: 1.3;
    }
  }
  
  /* 表单内容 */
  .login-form-content {
    .form-item {
      margin-bottom: 2rem; /* 增加间距为错误提示留出空间 */
      position: relative; /* 为绝对定位的错误信息提供相对定位的父元素 */
      
      .form-label {
        display: block;
        color: #333;
        font-weight: 500;
        margin-bottom: 0.4rem; /* 减少标签到输入框的间距 */
        font-size: 0.9rem; /* 减小标签字体 */
      }
      
      :deep(.el-form-item__content) {
        line-height: normal;
      }
      
      :deep(.el-form-item__error) {
        position: absolute !important; /* 绝对定位避免影响布局 */
        top: 100% !important; /* 位于表单项底部 */
        left: 0 !important;
        right: 0 !important;
        margin-top: 0.2rem; /* 与输入框的间距 */
        font-size: 0.75rem;
        color: #f56c6c;
        line-height: 1.2;
        z-index: 10; /* 确保在其他元素之上 */
        background: white; /* 添加白色背景避免重叠 */
        padding: 0 0.2rem; /* 添加小内边距 */
      }
    }
    
    /* 输入框样式 */
    .form-input {
      :deep(.el-input__wrapper) {
        background: #f8f9fa;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 1rem 1.25rem; /* 增加内边距 */
        transition: all 0.3s ease;
        min-height: 50px; /* 增加最小高度 */
        
        &:hover {
          border-color: #4facfe;
        }
        
        &.is-focus {
          border-color: #4facfe;
          box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
        }
        
        .el-input__inner {
          background: transparent;
          border: none;
          color: #333;
          font-size: 1rem;
          height: 24px;
          line-height: 24px;
          padding: 0 0 0 2rem;
          
          &::placeholder {
            color: #999;
          }
        }
        
        .el-input__prefix {
          color: #999;
          font-size: 1.1rem;
        }
        
        .el-input__suffix {
          color: #999;
          
          .el-input__password {
            color: #999;
            
            &:hover {
              color: #4facfe;
            }
          }
        }
      }
    }
    
    /* 选项区域 */
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.2rem; /* 减少选项区域底部间距 */
      margin-top: -0.8rem; /* 减少顶部间距，因为选项不需要错误提示空间 */
      
      .remember-checkbox {
        :deep(.el-checkbox__label) {
          color: #666;
          font-size: 0.8rem; /* 减小复选框字体 */
        }
        
        :deep(.el-checkbox__input) {
          .el-checkbox__inner {
            border-color: #ddd;
            
            &:hover {
              border-color: #4facfe;
            }
          }
          
          &.is-checked .el-checkbox__inner {
            background-color: #4facfe;
            border-color: #4facfe;
          }
        }
      }
      
      .forgot-link {
        color: #4facfe;
        font-size: 0.8rem; /* 减小忘记密码链接字体 */
        
        &:hover {
          color: #3b8bfe;
        }
      }
    }
    
    /* 按钮表单项间距调整 */
    .form-item:has(.login-button) {
      margin-top: -0.8rem; /* 减少按钮顶部间距 */
    }
    
    /* 登录按钮 */
    .login-button {
      width: 100%;
      height: 45px; /* 减小按钮高度 */
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      border: none;
      border-radius: 22px; /* 相应调整圆角 */
      color: white;
      font-size: 0.95rem; /* 减小按钮字体 */
      font-weight: 600;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(79, 172, 254, 0.3);
      }
      
      &:active {
        transform: translateY(0);
      }
      
      &.is-loading {
        opacity: 0.8;
      }
    }
  }
  
  /* 分割线 */
  .divider {
    position: relative;
    text-align: center;
    margin: 1.5rem 0; /* 减少分割线上下间距 */
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e9ecef;
      transform: translateY(-50%);
    }
    
    .divider-text {
      background: white;
      color: #999;
      padding: 0 1rem;
      font-size: 0.8rem; /* 减小分割线字体 */
      position: relative;
      z-index: 1;
    }
  }
  
  /* 注册区域 */
  .register-section {
    text-align: center;
    
    .register-text {
      color: #666;
      font-size: 0.8rem; /* 减小注册文字字体 */
      margin: 0;
      
      .register-link {
        color: #4facfe;
        font-weight: 500;
        margin-left: 0.5rem;
        
        &:hover {
          color: #3b8bfe;
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-form {
    .form-header {
      margin-bottom: 1rem;
      
      .form-title {
        font-size: 1.2rem; /* 移动端进一步减小 */
      }
      
      .form-subtitle {
        font-size: 0.75rem; /* 移动端进一步减小 */
      }
    }
    
    .login-form-content {
      .form-item {
        margin-bottom: 1rem;
        
        .form-label {
          font-size: 0.8rem; /* 移动端减小标签字体 */
        }
      }
      
      .form-input {
        :deep(.el-input__wrapper) {
          padding: 0.6rem 1rem;
          
          .el-input__inner {
            font-size: 0.9rem;
            padding: 0 0 0 1.8rem;
          }
        }
      }
      
      .login-button {
        height: 42px; /* 移动端减小按钮高度 */
        font-size: 0.9rem; /* 移动端减小按钮字体 */
        border-radius: 21px;
      }
    }
    
    .divider {
      margin: 1.2rem 0;
      
      .divider-text {
        font-size: 0.75rem; /* 移动端减小分割线字体 */
      }
    }
    
    .register-section {
      .register-text {
        font-size: 0.75rem; /* 移动端减小注册文字字体 */
      }
    }
  }
}
</style> 