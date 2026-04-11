import { useAuthStore } from '@/shared/store/auth';

/**
 * reviews.js
 * مديول إدارة التقييمات والمراجعات
 */

export default {
  namespaced: true,
  state: {
    // تخزين التقييمات مفهرسة بـ productId
    reviews: (() => {
      try {
        const saved = localStorage.getItem('product_reviews');
        return saved ? JSON.parse(saved) : {};
      } catch (e) {
        return {};
      }
    })(),
    reports: [] // البلاغات عن التعليقات
  },
  mutations: {
    ADD_REVIEW(state, { productId, review }) {
      if (!state.reviews[productId]) {
        state.reviews[productId] = [];
      }
      state.reviews[productId].unshift({
        id: Date.now(),
        ...review,
        date: new Date().toISOString(),
        reported: false
      });
      localStorage.setItem('product_reviews', JSON.stringify(state.reviews));
    },
    REPORT_REVIEW(state, { productId, reviewId, reason }) {
      const review = state.reviews[productId]?.find(r => r.id === reviewId);
      if (review) {
        review.reported = true;
        state.reports.push({
          reviewId,
          productId,
          reason,
          date: new Date().toISOString()
        });
        localStorage.setItem('product_reviews', JSON.stringify(state.reviews));
      }
    }
  },
  actions: {
    submitReview({ commit }, { productId, rating, comment }) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        throw new Error('يجب تسجيل الدخول لإضافة تقييم');
      }

      const user = authStore.user;
      commit('ADD_REVIEW', {
        productId,
        review: {
          userName: user.firstName || user.lastName || user.email.split('@')[0],
          userEmail: user.email,
          rating,
          comment
        }
      });
    },
    reportReview({ commit }, payload) {
      commit('REPORT_REVIEW', payload);
      // محاكاة إرسال بلاغ للخادم
      console.log('📢 تم الإبلاغ عن تعليق:', payload);
    }
  },
  getters: {
    getProductReviews: (state) => (productId) => {
      return state.reviews[productId] || [];
    },
    getAverageRating: (state) => (productId) => {
      const productReviews = state.reviews[productId] || [];
      if (productReviews.length === 0) return 0;
      const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
      return (sum / productReviews.length).toFixed(1);
    },
    getReviewsCount: (state) => (productId) => {
      return (state.reviews[productId] || []).length;
    }
  }
};
