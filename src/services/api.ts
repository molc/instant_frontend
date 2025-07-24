import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { ElMessage } from 'element-plus';

// 🔧 强制使用真实API（用于连接后端测试）
const USE_MOCK_API = false; // 设置为 false 以使用真实后端

// 后端API配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://172.19.103.122:8000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const FULL_API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

console.log('🚀 API配置:', {
  USE_MOCK_API,
  API_BASE_URL,
  API_VERSION,
  FULL_API_URL
});

// 模拟API响应
const mockApiResponse = async (url: string, data?: any) => {
  console.log('Mock API调用:', url, data);
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (url.includes('/auth/login/access-token')) {
    // 解析form-data格式的数据
    const formData = data;
    const username = formData.get ? formData.get('username') : 
                    (typeof data === 'string' ? new URLSearchParams(data).get('username') : data?.username);
    const password = formData.get ? formData.get('password') : 
                    (typeof data === 'string' ? new URLSearchParams(data).get('password') : data?.password);
    
    // 支持多个测试用户
    if ((username === 'test@example.com' && password === 'password123') ||
        (username === '42000000002000000001' && password === '123456')) {
      return {
        data: {
          access_token: 'mock_jwt_token_123456',
          token_type: 'bearer'
        },
        status: 200
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }
  
  if (url.includes('/users/me')) {
    return {
      data: {
        id: 1,
        username: 'test@example.com',
        email: 'test@example.com',
        avatar: 'https://via.placeholder.com/40',
        status: 'online'
      },
      status: 200
    };
  }
  
  if (url.includes('/auth/register')) {
    return {
      data: {
        message: '注册成功',
        user: {
          id: 2,
          username: data?.username,
          email: data?.email,
          avatar: 'https://via.placeholder.com/40',
          status: 'online'
        }
      },
      status: 201
    };
  }
  
  if (url.includes('/chat/rooms')) {
    return {
      data: [
        {
          id: 1,
          name: '测试聊天室',
          type: 'group',
          avatar: 'https://via.placeholder.com/40',
          lastMessage: '欢迎使用即时通讯系统！',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          participants: [
            {
              id: 1,
              username: 'test@example.com',
              status: 'online'
            }
          ]
        }
      ],
      status: 200
    };
  }
  
  return {
    data: { message: 'Mock API响应' },
    status: 200
  };
};

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: USE_MOCK_API ? '/mock-api' : FULL_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    // 模拟API处理
    if (USE_MOCK_API) {
      console.log('使用模拟API模式');
      const mockResponse = await mockApiResponse(config.url || '', config.data);
      // 直接返回模拟响应（绕过网络请求）
      return Promise.reject({
        config,
        response: mockResponse,
        isAxiosError: false,
        isMockResponse: true
      });
    }
    
    // 从localStorage获取token，避免循环依赖
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // 添加认证token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError | any) => {
    // 处理模拟API响应
    if (error.isMockResponse) {
      return Promise.resolve(error.response);
    }
    
    // 处理HTTP错误
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      switch (status) {
        case 401:
          // 未认证，清除token并跳转到登录页
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            // 动态导入router，避免循环依赖
            import('@/router').then(({ default: router }) => {
              router.push('/auth');
            });
          }
          ElMessage.error('登录已过期，请重新登录');
          break;
        case 403:
          ElMessage.error('权限不足，无法访问该资源');
          break;
        case 404:
          // 检查是否为下载相关的请求
          const url = error.config?.url || '';
          const isDownloadRequest = url.includes('/files/download') || 
                                  url.includes('/files/download-info') || 
                                  url.includes('/uploads/');
          
          // 下载相关的404错误静默处理，让具体的下载逻辑处理
          if (!isDownloadRequest) {
            ElMessage.error('请求的资源不存在');
          }
          break;
        case 422:
          // 验证错误，显示具体的错误信息
          if (data.detail) {
            const errorMessage = Array.isArray(data.detail) 
              ? data.detail.map((err: any) => err.msg).join(', ')
              : data.detail;
            ElMessage.error(errorMessage);
          } else {
            ElMessage.error('请求数据格式错误');
          }
          break;
        case 500:
          ElMessage.error('服务器内部错误，请稍后重试');
          break;
        case 502:
          ElMessage.error('后端服务不可用，已切换到演示模式');
          break;
        default:
          ElMessage.error(data?.message || '网络请求失败');
      }
    } else if (error.request) {
      // 网络错误
      ElMessage.error('网络连接失败，请检查您的网络连接');
    } else {
      // 其他错误
      ElMessage.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export default api; 