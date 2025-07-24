import api from './api';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  nickname?: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface UserSearchParams {
  query: string;
  limit?: number;
  skip?: number;
}

export interface UserSearchResponse {
  users: User[];
  total: number;
}

// 搜索用户
export const searchUsers = async (params: UserSearchParams): Promise<UserSearchResponse> => {
  try {
    const response = await api.get<UserSearchResponse>('/users/search', {
      params: {
        q: params.query,
        limit: params.limit || 10,
        skip: params.skip || 0
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取用户详情
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get<User>('/users/me');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 