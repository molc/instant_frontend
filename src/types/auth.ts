// 用户认证相关的类型定义

// 根据API文档的 schemas.User 定义
export interface User {
  id: number;                    // 数据库自增整数 ID
  standard_id: string;           // 用户标准ID（如长号）
  name: string;                  // 用户姓名（根据API文档）
  is_active: boolean;            // 是否激活
}

export interface LoginCredentials {
  username: string;  // 对应 standard_id
  password: string;
}

// 根据API文档的 schemas.UserCreate 定义
export interface RegisterCredentials {
  standard_id: string;           // 用户标准ID，长度1-20字符，唯一
  name: string;                  // 用户姓名，长度1-100字符
  password: string;              // 用户密码，最少6字符
}

// 前端注册表单专用接口（包含确认密码等前端验证字段）
export interface RegisterFormData {
  standard_id: string;           // 用户标准ID
  name: string;                  // 用户姓名
  password: string;              // 密码
  confirm_password: string;      // 确认密码（前端验证用）
}

// 根据API文档的 schemas.Token 定义
export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// 登录时仅返回token（与API文档匹配）
export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TokenPayload {
  sub: string;
  exp: number;
  iat: number;
  user_id?: number;
  standard_id?: string;
}

// 用户搜索相关
export interface UserSearchParams {
  keyword: string;
  limit?: number;
}

// 用户状态查询
export interface UserStatusQuery {
  user_ids: number[];
}

export interface UserStatusResponse {
  statuses: Record<string, boolean>;
}

// 密码重置（虽然API文档中没有详细定义，保留以防后续需要）
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateUserProfile {
  nickname?: string;
  bio?: string;
  phone?: string;
  avatar?: string;
} 