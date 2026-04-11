// Enhanced ReviewsService with API Integration
import BaseService from './BaseService';

class ReviewsService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/reviews';
  }

  // API Methods
  async getReviews() {
    try {
      const response = await this.get('/items');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockReviewsData(),
        error: response.error || 'Failed to load reviews'
      };
    } catch (error) {
      console.error('Error getting reviews:', error);
      return {
        success: false,
        data: this.getMockReviewsData(),
        error: error.message
      };
    }
  }

  async createReview(reviewData) {
    try {
      const response = await this.post('/items', reviewData);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to create review'
      };
    } catch (error) {
      console.error('Error creating review:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateReview(reviewData) {
    try {
      const response = await this.put(`/items/${reviewData.id}`, reviewData);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to update review'
      };
    } catch (error) {
      console.error('Error updating review:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteReview(reviewId) {
    try {
      const response = await this.delete(`/items/${reviewId}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to delete review'
      };
    } catch (error) {
      console.error('Error deleting review:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getReviewById(reviewId) {
    try {
      const response = await this.get(`/items/${reviewId}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to get review'
      };
    } catch (error) {
      console.error('Error getting review:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getRatingDistribution() {
    try {
      const response = await this.get('/rating-distribution');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockRatingDistribution(),
        error: response.error || 'Failed to load rating distribution'
      };
    } catch (error) {
      console.error('Error getting rating distribution:', error);
      return {
        success: false,
        data: this.getMockRatingDistribution(),
        error: error.message
      };
    }
  }

  async getReviewsStats() {
    try {
      const response = await this.get('/stats');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockReviewsStats(),
        error: response.error || 'Failed to load reviews stats'
      };
    } catch (error) {
      console.error('Error getting reviews stats:', error);
      return {
        success: false,
        data: this.getMockReviewsStats(),
        error: error.message
      };
    }
  }

  async getTrendsStats() {
    try {
      const response = await this.get('/trends');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockTrendsStats(),
        error: response.error || 'Failed to load trends stats'
      };
    } catch (error) {
      console.error('Error getting trends stats:', error);
      return {
        success: false,
        data: this.getMockTrendsStats(),
        error: error.message
      };
    }
  }

  // Mock Data Methods
  getMockReviewsData() {
    return {
      reviews: [
        {
          id: 1,
          customer: 'أحمد محمد',
          email: 'ahmed@example.com',
          product: 'ملصق حائط زهور',
          rating: 5,
          comment: 'منتج رائع جداً! جودة عالية وتصميم جميل. أنصح به بشدة.',
          status: 'منشور',
          statusColor: 'success',
          avatarColor: 'primary',
          avatarIcon: 'mdi-account',
          date: '2024-01-15'
        },
        {
          id: 2,
          customer: 'فاطمة علي',
          email: 'fatima@example.com',
          product: 'ملصق باب خشبي',
          rating: 4,
          comment: 'جيد جداً لكن يحتاج بعض التحسين في التغليف.',
          status: 'منشور',
          statusColor: 'success',
          avatarColor: 'success',
          avatarIcon: 'mdi-account',
          date: '2024-01-12'
        },
        {
          id: 3,
          customer: 'محمد عبدالله',
          email: 'mohammed@example.com',
          product: 'ملصق سيارة رياضي',
          rating: 5,
          comment: 'أفضل ملصق سيارة استخدمته. الألوان رائعة والجودة ممتازة.',
          status: 'معلق',
          statusColor: 'warning',
          avatarColor: 'warning',
          avatarIcon: 'mdi-account',
          date: '2024-01-10'
        },
        {
          id: 4,
          customer: 'نورة سالم',
          email: 'nora@example.com',
          product: 'ملصق مطبخ عصري',
          rating: 3,
          comment: 'جيد ولكن السعر مرتفع قليلاً مقارنة بالمنتجات المشابهة.',
          status: 'منشور',
          statusColor: 'success',
          avatarColor: 'info',
          avatarIcon: 'mdi-account',
          date: '2024-01-08'
        },
        {
          id: 5,
          customer: 'خالد العتيبي',
          email: 'khalid@example.com',
          product: 'ملصق باب خشبي',
          rating: 5,
          comment: 'ممتاز! جودة فائقة وتصميم أنيق. سأطلب مرة أخرى بالتأكيد.',
          status: 'منشور',
          statusColor: 'success',
          avatarColor: 'purple',
          avatarIcon: 'mdi-account',
          date: '2024-01-05'
        },
        {
          id: 6,
          customer: 'سارة أحمد',
          email: 'sara@example.com',
          product: 'ملصق حائط زهور',
          rating: 4,
          comment: 'منتج جيد جداً. الألوان جميلة والمادة عالية الجودة.',
          status: 'مرفوض',
          statusColor: 'error',
          avatarColor: 'pink',
          avatarIcon: 'mdi-account',
          date: '2024-01-03'
        }
      ],
      reviewsStats: [
        {
          title: 'إجمالي المراجعات',
          value: '2,456',
          icon: 'mdi-comment-multiple',
          color: 'primary'
        },
        {
          title: 'متوسط التقييم',
          value: '4.5',
          icon: 'mdi-star',
          color: 'warning'
        },
        {
          title: 'المراجعات المعلقة',
          value: '23',
          icon: 'mdi-clock',
          color: 'info'
        },
        {
          title: 'هذا الشهر',
          value: '156',
          icon: 'mdi-calendar',
          color: 'success'
        }
      ],
      ratingDistribution: [
        {
          stars: 5,
          count: 1234,
          percentage: 50,
          color: 'success'
        },
        {
          stars: 4,
          count: 734,
          percentage: 30,
          color: 'primary'
        },
        {
          stars: 3,
          count: 368,
          percentage: 15,
          color: 'warning'
        },
        {
          stars: 2,
          count: 98,
          percentage: 4,
          color: 'error'
        },
        {
          stars: 1,
          count: 22,
          percentage: 1,
          color: 'grey'
        }
      ],
      trendsStats: {
        thisMonth: 156,
        lastMonth: 124,
        averageRating: 4.5,
        maxTrend: 200
      }
    };
  }

  getMockRatingDistribution() {
    return [
      {
        stars: 5,
        count: 1234,
        percentage: 50,
        color: 'success'
      },
      {
        stars: 4,
        count: 734,
        percentage: 30,
        color: 'primary'
      },
      {
        stars: 3,
        count: 368,
        percentage: 15,
        color: 'warning'
      },
      {
        stars: 2,
        count: 98,
        percentage: 4,
        color: 'error'
      },
      {
        stars: 1,
        count: 22,
        percentage: 1,
        color: 'grey'
      }
    ];
  }

  getMockReviewsStats() {
    return [
      {
        title: 'إجمالي المراجعات',
        value: '2,456',
        icon: 'mdi-comment-multiple',
        color: 'primary'
      },
      {
        title: 'متوسط التقييم',
        value: '4.5',
        icon: 'mdi-star',
        color: 'warning'
      },
      {
        title: 'المراجعات المعلقة',
        value: '23',
        icon: 'mdi-clock',
        color: 'info'
      },
      {
        title: 'هذا الشهر',
        value: '156',
        icon: 'mdi-calendar',
        color: 'success'
      }
    ];
  }

  getMockTrendsStats() {
    return {
      thisMonth: 156,
      lastMonth: 124,
      averageRating: 4.5,
      maxTrend: 200
    };
  }

  // Export singleton instance
  static getInstance() {
    if (!window.reviewsServiceInstance) {
      window.reviewsServiceInstance = new ReviewsService();
    }
    return window.reviewsServiceInstance;
  }
}

// Export class as default
export default ReviewsService;
