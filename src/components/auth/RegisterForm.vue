<template>
  <div class="register-form">
    <div class="form-header">
      <h1 class="title">创建账户</h1>
      <p class="subtitle">加入我们的社区</p>
    </div>

    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="rules"
      class="register-form-content"
      @submit="handleRegister"
    >
      <el-form-item prop="standard_id" class="form-item">
        <label class="form-label">用户标准ID</label>
        <el-input
          v-model="registerForm.standard_id"
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

      <el-form-item prop="name" class="form-item">
        <label class="form-label">用户姓名</label>
        <el-input
          v-model="registerForm.name"
          type="text"
          placeholder="请输入您的姓名"
          size="large"
          class="form-input"
        >
          <template #prefix>
            <el-icon><Message /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password" class="form-item">
        <label class="form-label">密码</label>
        <el-input
          v-model="registerForm.password"
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

      <el-form-item prop="confirm_password" class="form-item">
        <label class="form-label">确认密码</label>
        <el-input
          v-model="registerForm.confirm_password"
          type="password"
          placeholder="请再次输入密码"
          size="large"
          class="form-input"
          show-password
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="agreement">
        <el-checkbox v-model="agreement" class="agreement-checkbox">
          我已阅读并同意
          <el-link type="primary" @click="showTerms = true">
            服务条款
          </el-link>
          和
          <el-link type="primary" @click="showPrivacy = true">
            隐私政策
          </el-link>
        </el-checkbox>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          size="large"
          class="register-button"
          :loading="isLoading"
          native-type="submit"
        >
          {{ isLoading ? '注册中...' : '创建账户' }}
        </el-button>
      </el-form-item>
    </el-form>

    <div class="form-footer">
      <p>
        已有账户？
        <el-link type="primary" @click="$emit('switch-to-login')">
          立即登录
        </el-link>
      </p>
    </div>

    <!-- 服务条款对话框 -->
    <el-dialog
      v-model="showTerms"
      title="服务条款"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="terms-content">
        <h3>欢迎使用我们的即时通讯服务</h3>
        <p>在使用我们的服务之前，请仔细阅读以下条款...</p>
        <!-- 这里可以放置具体的服务条款内容 -->
      </div>
      <template #footer>
        <el-button @click="showTerms = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 隐私政策对话框 -->
    <el-dialog
      v-model="showPrivacy"
      title="隐私政策"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="privacy-content">
        <h3>我们如何保护您的隐私</h3>
        <p>您的隐私对我们很重要，我们承诺保护您的个人信息...</p>
        <!-- 这里可以放置具体的隐私政策内容 -->
      </div>
      <template #footer>
        <el-button @click="showPrivacy = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Lock, Message } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import type { RegisterCredentials, RegisterFormData } from '@/types/auth';

// 定义事件
const emit = defineEmits<{
  'switch-to-login': [];
}>();

// 响应式数据
const registerFormRef = ref<FormInstance>();
const authStore = useAuthStore();
const router = useRouter();

const registerForm = reactive<RegisterFormData>({
  standard_id: '',
  name: '',
  password: '',
  confirm_password: '',
});

const agreement = ref(false);
const isLoading = ref(false);
const showTerms = ref(false);
const showPrivacy = ref(false);

// 自定义验证函数
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const validateAgreement = (rule: any, value: boolean, callback: any) => {
  if (!agreement.value) {
    callback(new Error('请同意服务条款和隐私政策'));
  } else {
    callback();
  }
};

// 表单验证规则
const rules = reactive<FormRules<RegisterFormData & { agreement: boolean }>>({
  standard_id: [
    { required: true, message: '请输入用户标准ID', trigger: 'blur' },
    { min: 1, max: 20, message: '用户标准ID长度在 1 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户标准ID只能包含字母、数字、下划线', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入用户姓名', trigger: 'blur' },
    { min: 1, max: 100, message: '用户姓名长度在 1 到 100 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度在 6 到 100 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字', trigger: 'blur' },
  ],
  confirm_password: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' },
  ],
});

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return;
  
  try {
    await registerFormRef.value.validate();
    isLoading.value = true;
    
    // 转换表单数据为API要求的格式
    const registerData: RegisterCredentials = {
      standard_id: registerForm.standard_id,
      name: registerForm.name,
      password: registerForm.password
    };
    
    await authStore.register(registerData);
    
    // 注册成功，显示成功消息
    ElMessage.success({
      message: '注册成功！正在为您自动登录...',
      duration: 3000,
      showClose: true,
      offset: 100 // 设置消息距离顶部的偏移量
    });
    
    // 延迟跳转，让用户看到成功消息
    setTimeout(() => {
      router.push('/chat');
    }, 1500);
    
  } catch (error: any) {
    console.error('Register failed:', error);
    
    // 详细的错误处理
    let errorMessage = '注册失败';
    
    if (error.response?.status === 400) {
      errorMessage = error.response.data?.detail || '用户已存在，请使用其他标准ID';
    } else if (error.response?.status === 422) {
      errorMessage = '输入信息格式不正确，请检查后重试';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    ElMessage.error({
      message: errorMessage,
      duration: 5000,
      showClose: true,
      offset: 100 // 设置消息距离顶部的偏移量
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.register-form {
  width: 100%;
  
  /* 表单标题 */
  .form-header {
    text-align: center;
    margin-bottom: 1.2rem; /* 进一步减少标题底部间距 */
    
    .title {
      font-size: 1.4rem; /* 减小标题字体 */
      font-weight: 600;
      color: #4facfe;
      margin: 0 0 0.2rem; /* 减少标题间距 */
    }
    
    .subtitle {
      color: #666;
      font-size: 0.8rem; /* 减小副标题字体 */
      margin: 0;
      line-height: 1.3;
    }
  }
  
  /* 表单内容 */
  .register-form-content {
    .form-item {
      margin-bottom: 2rem; /* 增加间距为错误提示留出空间 */
      position: relative; /* 为绝对定位的错误信息提供相对定位的父元素 */
      
      .form-label {
        display: block;
        color: #333;
        font-weight: 500;
        margin-bottom: 0.4rem; /* 减少标签间距 */
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
        padding: 1rem 1.25rem;
        transition: all 0.3s ease;
        min-height: 50px;
        
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
    
    /* 同意协议复选框 */
    .agreement-checkbox {
      margin-bottom: 1rem; /* 进一步减少复选框底部间距 */
      margin-top: -0.8rem; /* 减少顶部间距，因为复选框不需要错误提示空间 */
      
      :deep(.el-checkbox__label) {
        color: #666;
        font-size: 0.8rem; /* 减小复选框字体 */
        line-height: 1.3; /* 减少行高 */
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
    
    /* 按钮表单项间距调整 */
    .form-item:has(.register-button) {
      margin-top: -0.8rem; /* 减少按钮顶部间距 */
    }
    
    /* 注册按钮 */
    .register-button {
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
  
  /* 表单底部 */
  .form-footer {
    text-align: center;
    margin-top: 1.2rem; /* 进一步减少顶部间距 */
    
    p {
      color: #666;
      font-size: 0.8rem; /* 减小底部文字字体 */
      margin: 0;
      
      .el-link {
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

/* 对话框内容样式 */
.terms-content,
.privacy-content {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
  
  h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-form {
    .form-header {
      margin-bottom: 1rem;
      
      .title {
        font-size: 1.2rem; /* 移动端进一步减小 */
      }
      
      .subtitle {
        font-size: 0.75rem; /* 移动端进一步减小 */
      }
    }
    
    .register-form-content {
      .form-item {
        margin-bottom: 1rem;
        
        .form-label {
          font-size: 0.8rem; /* 移动端减小标签字体 */
          margin-bottom: 0.3rem;
        }
      }
      
      .form-input {
        :deep(.el-input__wrapper) {
          padding: 0.75rem 1rem;
          min-height: 46px;
          
          .el-input__inner {
            font-size: 0.9rem;
            padding: 0 0 0 1.8rem;
          }
        }
      }
      
      .agreement-checkbox {
        margin-bottom: 1rem;
        
        :deep(.el-checkbox__label) {
          font-size: 0.75rem; /* 移动端减小复选框字体 */
        }
      }
      
      .register-button {
        height: 42px; /* 移动端减小按钮高度 */
        font-size: 0.9rem; /* 移动端减小按钮字体 */
        border-radius: 21px;
      }
    }
    
    .form-footer {
      margin-top: 1rem;
      
      p {
        font-size: 0.75rem; /* 移动端减小底部文字字体 */
      }
    }
  }
}
</style> 