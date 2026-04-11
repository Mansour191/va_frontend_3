// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes'; // استيراد المسارات من مجلد routes
import { useStorage } from '@vueuse/core'
import { useAuth } from '@/composables/useAuth'

console.log('📦 المسارات القادمة من routes:', routes);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, left: 0 };
    }
  },
});

console.log('🚀 الراوتر بعد الإنشاء:', router);

// High-security navigation guard
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, user } = useAuth();
  
  // Get auth state from secure storage
  const authToken = useStorage('authToken', '')
  
  const isUserAuthenticated = isAuthenticated.value || !!authToken.value
  const currentUser = user.value
  const currentUserRole = currentUser?.isStaff ? 'admin' : (currentUser ? 'user' : 'guest')
  
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresStaff = to.matched.some(record => record.meta.requiresStaff)
  const requiresAdmin = to.matched.some(record => record.meta.isAdmin)
  const requiresInvestor = to.matched.some(record => record.meta.isInvestor)
  const requiredRole = to.meta.role
  const isPublicRouteMeta = to.matched.some(record => record.meta.isPublic)
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/getlocation']
  const isPublicRoute = publicRoutes.includes(to.path) || to.path.startsWith('/auth/') || isPublicRouteMeta
  
  console.log(`🔐 Route Guard: ${to.path} | Auth: ${isUserAuthenticated} | Role: ${currentUserRole} | Staff: ${currentUser?.isStaff}`)
  
  // If user is not authenticated and trying to access protected route
  if (!isUserAuthenticated && !isPublicRoute) {
    console.warn('🚫 Unauthorized access attempt - redirecting to login')
    next({ 
      name: 'Login', 
      query: { redirect: to.fullPath } 
    })
    return
  }
  
  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isUserAuthenticated && isPublicRoute && to.path !== '/') {
    const redirectPath = getRoleBasedRedirect(currentUserRole)
    console.log(`🔄 Authenticated user accessing public page - redirecting to ${redirectPath}`)
    next(redirectPath)
    return
  }
  
  // Role-based access control
  if (requiresAuth && isUserAuthenticated) {
    // Staff-only routes (new requiresStaff meta)
    if (requiresStaff && !currentUser?.isStaff) {
      console.warn('🚫 Non-staff trying to access staff route')
      next(getRoleBasedRedirect(currentUserRole))
      return
    }
    
    // Admin-only routes (legacy isAdmin meta)
    if (requiresAdmin && !currentUser?.isStaff) {
      console.warn('🚫 Non-admin trying to access admin route')
      next(getRoleBasedRedirect(currentUserRole))
      return
    }
    
    // Investor-only routes
    if (requiresInvestor && currentUserRole !== 'investor' && currentUserRole !== 'admin') {
      console.warn('🚫 Unauthorized role trying to access investor route')
      next(getRoleBasedRedirect(currentUserRole))
      return
    }
    
    // Specific role requirements
    if (requiredRole && currentUserRole !== requiredRole && currentUserRole !== 'admin') {
      console.warn(`🚫 User role ${currentUserRole} not authorized for role ${requiredRole}`)
      next(getRoleBasedRedirect(currentUserRole))
      return
    }
  }
  
  // All checks passed - allow navigation
  console.log('✅ Navigation allowed')
  next()
})

// Helper function to get role-based redirect
function getRoleBasedRedirect(role) {
  switch (role) {
    case 'admin':
      return '/dashboard'
    case 'investor':
      return '/investor'
    case 'customer':
      return '/'
    default:
      return '/'
  }
}

// Navigation guard for route protection (additional layer)
router.afterEach((to, from) => {
  // Log navigation for security auditing
  console.log(`📍 Navigation: ${from.path} → ${to.path}`)
  
  // Track page view for behavior analytics (async, non-blocking)
  import('@/services/TrackingService').then(({ trackingService }) => {
    trackingService.trackPageView({
      path: to.path,
      fullPath: to.fullPath,
      name: to.name,
      query: to.query,
      params: to.params
    }).catch(error => {
      // Silently fail to not disrupt user experience
      console.warn('Page tracking failed:', error)
    })
  }).catch(error => {
    console.warn('Failed to load tracking service:', error)
  })
  
  // Clear sensitive data from memory when leaving sensitive pages
  if (from.path.startsWith('/dashboard') || from.path.startsWith('/investor')) {
    // Optional: Clear any sensitive in-memory data
    console.log('🧹 Clearing sensitive data from memory')
  }
})

export default router;
