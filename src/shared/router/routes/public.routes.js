// router/routes/public.js
// المسارات العامة (لا تحتاج تسجيل دخول)

export default [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/Home.vue'),
    meta: { title: 'الرئيسية' },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/About.vue'),
    meta: { title: 'من نحن' },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/Contact.vue'),
    meta: { title: 'اتصل بنا' },
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/Gallery.vue'),
    meta: { title: 'معرض الأعمال' },
  },
  {
    path: '/blog',
    name: 'Blog',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/Blog.vue'),
    meta: { title: 'المدونة' },
  },
  {
    path: '/post/:id/:slug?',
    name: 'Post',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/Post.vue'),
    meta: { title: 'تفاصيل المقال' },
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/Privacy.vue'),
    meta: { title: 'سياسة الخصوصية' },
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/Terms.vue'),
    meta: { title: 'الشروط والأحكام' },
  },
  {
    path: '/how-to-order',
    name: 'HowToOrder',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/HowToOrder.vue'),
    meta: { title: 'كيف أطلب' },
  },
  {
    path: '/shipping-policy',
    name: 'ShippingPolicy',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/ShippingPolicy.vue'),
    meta: { title: 'سياسة الشحن' },
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/FAQ.vue'),
    meta: { title: 'الأسئلة الشائعة' },
  },
  {
    path: '/user-guide',
    name: 'UserGuide',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/UserGuide.vue'),
    meta: { title: 'دليل المستخدم' },
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import(/* webpackChunkName: "shop" */ '@/modules/customer/views/Notifications.vue'),
    meta: { title: 'الإشعارات', requiresAuth: true },
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import(/* webpackChunkName: "shop" */ '@/modules/products/views/Shop.vue'),
    meta: { title: 'المتجر' },
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import(/* webpackChunkName: "shop" */ '@/modules/products/views/Shop.vue'),
    meta: { title: 'المنتجات' },
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import(/* webpackChunkName: "shop" */ '@/modules/products/views/ProductDetail.vue'),
    meta: { title: 'تفاصيل المنتج', requiresAuth: false },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import(/* webpackChunkName: "shop" */ '@/modules/shop/views/Cart.vue'),
    meta: { title: 'سلة التسوق' },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import(/* webpackChunkName: "shop" */ '@/modules/shop/views/Checkout.vue'),
    meta: { title: 'إتمام الشراء' },
  },
  {
    path: '/order-success/:orderId',
    name: 'OrderSuccess',
    component: () => import(/* webpackChunkName: "shop" */ '@/modules/shop/views/OrderSuccess.vue'),
    meta: { title: 'نجاح الطلب' },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import(/* webpackChunkName: "shop" */ '@/modules/products/views/Search.vue'),
    meta: { title: 'البحث' },
  },
  {
    path: '/search/label/:label',
    name: 'Label',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/Home.vue'),
    meta: { title: 'التصنيفات' },
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: () => import(/* webpackChunkName: "shop" */ '@/modules/products/views/Wishlist.vue'),
    meta: {
      title: 'المفضلة',
      requiresAuth: true,
    },
  },
  {
    path: '/getlocation',
    name: 'GetLocation',
    component: () => import(/* webpackChunkName: "test" */ '@/test/GetLocation.vue'),
    meta: { 
      title: 'اختبار تحديد الموقع',
      requiresAuth: false,
      isPublic: true
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "home" */ '@/modules/public/views/NotFound.vue'),
    meta: { title: 'الصفحة غير موجودة' },
  },
];
