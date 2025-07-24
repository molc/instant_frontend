import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/ChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/views/auth/AuthPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    redirect: '/auth'
  },
  {
    path: '/register',
    redirect: '/auth'
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/views/TestPage.vue')
  },
  {
    path: '/test-performance',
    name: 'TestPerformance',
    component: () => import('@/views/MessagePerformanceTest.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/chat-demo',
    name: 'ChatDemo',
    component: () => import('@/views/ChatDemo.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 未认证且需要认证，重定向到登录页
    next('/auth')
  } else if (to.path === '/auth' && authStore.isAuthenticated) {
    // 已认证且访问登录页，重定向到聊天页
    next('/chat')
  } else {
    // 允许访问
    next()
  }
})

export default router 