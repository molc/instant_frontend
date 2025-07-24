// 通用类型定义
export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
}

export interface PaginationParams {
  skip?: number
  limit?: number
}

export interface PaginationResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}

export type Theme = 'light' | 'dark'

export interface Settings {
  theme: Theme
  language: string
  notifications: boolean
  soundEnabled: boolean
  fontSize: 'small' | 'medium' | 'large'
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
} 