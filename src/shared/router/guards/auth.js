// router/guards/auth.js
import { decryptData } from '@/integration/utils/helpers';

export default function (router) {
  router.beforeEach((to, from, next) => {
    // تعيين عنوان الصفحة
    document.title = `${to.meta.title || 'فينيل آرت'} - Vinyl Art`;

    const encryptedUser = localStorage.getItem('currentUser');
    const currentUser = encryptedUser ? decryptData(encryptedUser) : null;
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const isAdmin = to.matched.some((record) => record.meta.isAdmin);
    const requiredRole = to.matched.find((record) => record.meta.role)?.meta.role;
    const isGuest = to.matched.some((record) => record.meta.guest);

    // إذا كان المسار يتطلب صلاحيات مدير والمستخدم ليس مديراً
    if (isAdmin && (!currentUser || currentUser.role !== 'admin')) {
      next({ name: 'Home' });
      return;
    }

    // إذا كان المسار يتطلب دور معين والمستخدم لا يمتلكه
    if (requiredRole && (!currentUser || currentUser.role !== requiredRole)) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
      return;
    }

    // إذا كان المسار يتطلب تسجيل دخول والمستخدم غير مسجل
    if (requiresAuth && !currentUser) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
      return;
    }

    // إذا كان المسار للزوار فقط والمستخدم مسجل
    if (isGuest && currentUser) {
      next({ name: 'Home' });
      return;
    }

    // متابعة التنقل
    next();
  });
}
