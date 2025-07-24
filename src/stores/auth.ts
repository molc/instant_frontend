import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse,
  TokenPayload,
  AccessTokenResponse,
  UserSearchParams,
  UserStatusQuery,
  UserStatusResponse
} from '@/types/auth';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 计算属性
  const isAuthenticated = computed(() => {
    return !!(token.value && user.value);
  });

  // 从localStorage恢复状态
  const initializeAuth = () => {
    if (typeof window === 'undefined') return;
    
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      try {
        // 验证token是否过期
        const payload = JSON.parse(atob(savedToken.split('.')[1])) as TokenPayload;
        const now = Date.now() / 1000;
        
        if (payload.exp > now) {
          token.value = savedToken;
          user.value = JSON.parse(savedUser);
        } else {
          // token过期，清除数据
          clearAuth();
        }
      } catch (error) {
        // token格式错误，清除数据
        clearAuth();
      }
    }
  };

  // 清除认证数据
  const clearAuth = () => {
    user.value = null;
    token.value = null;
    error.value = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  // 登录方法
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      
      console.log('🔐 发起登录请求:', {
        username: credentials.username,
        password: '***'
      });
      
      // 准备FormData格式的数据（后端期望的格式）
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      // 发送登录请求
      const response = await api.post<AccessTokenResponse>('/auth/login/access-token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('✅ 登录成功，获取到令牌:', response.data.token_type);
      
      // 保存认证信息
      token.value = response.data.access_token;
      localStorage.setItem('auth_token', response.data.access_token);
      
      // 获取用户信息
      await getCurrentUser();
      
    } catch (err: any) {
      console.error('❌ 登录失败:', err);
      const errorMessage = err.response?.data?.detail || '登录失败，请检查用户名和密码';
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  };

  // 注册 - 根据API文档 POST /users
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      // 注册用户
      const registerResponse = await api.post<User>('/users', credentials);
      
      console.log('✅ 注册成功:', registerResponse.data);

      // 注册成功后自动登录
      await login({
        username: credentials.standard_id,  // username对应API文档中的standard_id
        password: credentials.password
      });
      
    } catch (err: any) {
      console.error('❌ 注册失败:', err);
      
      // 保存错误信息
      const errorDetail = err.response?.data?.detail || err.message || '注册失败';
      error.value = errorDetail;
      
      // 重新抛出错误，保持错误信息完整
      const enhancedError: any = new Error(errorDetail);
      enhancedError.response = err.response;
      enhancedError.status = err.response?.status;
      throw enhancedError;
      
    } finally {
      isLoading.value = false;
    }
  };

  // 登出 - 清除本地数据（API文档中没有登出接口）
  const logout = async (): Promise<void> => {
    clearAuth();
  };

  // 获取当前用户信息 - 根据API文档 GET /users/me
  const getCurrentUser = async (): Promise<User> => {
    try {
      const response = await api.get<User>('/users/me');
      user.value = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // 搜索用户 - 根据API文档 GET /users/search
  const searchUsers = async (params: UserSearchParams): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/users/search', { params });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // 批量获取用户状态 - 根据API文档 POST /users/statuses
  const getUserStatuses = async (query: UserStatusQuery): Promise<UserStatusResponse> => {
    try {
      const response = await api.post<UserStatusResponse>('/users/statuses', query);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // 初始化
  initializeAuth();

  return {
    // 状态
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    
    // 方法
    login,
    register,
    logout,
    getCurrentUser,
    searchUsers,
    getUserStatuses,
    clearAuth,
    initializeAuth,
  };
}); 