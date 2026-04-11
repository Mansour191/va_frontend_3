// Enhanced ContentService with API Integration
import BaseService from './BaseService';

class ContentService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/content';
  }

  // API Methods
  async getContentItems() {
    try {
      const response = await this.get('/items');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockContentData(),
        error: response.error || 'Failed to load content items'
      };
    } catch (error) {
      console.error('Error getting content items:', error);
      return {
        success: false,
        data: this.getMockContentData(),
        error: error.message
      };
    }
  }

  async createContent(contentData) {
    try {
      const response = await this.post('/items', contentData);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to create content'
      };
    } catch (error) {
      console.error('Error creating content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateContent(contentData) {
    try {
      const response = await this.put(`/items/${contentData.id}`, contentData);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to update content'
      };
    } catch (error) {
      console.error('Error updating content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteContent(contentId) {
    try {
      const response = await this.delete(`/items/${contentId}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to delete content'
      };
    } catch (error) {
      console.error('Error deleting content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getContentById(contentId) {
    try {
      const response = await this.get(`/items/${contentId}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to get content'
      };
    } catch (error) {
      console.error('Error getting content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getContentTypes() {
    try {
      const response = await this.get('/types');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockContentTypes(),
        error: response.error || 'Failed to load content types'
      };
    } catch (error) {
      console.error('Error getting content types:', error);
      return {
        success: false,
        data: this.getMockContentTypes(),
        error: error.message
      };
    }
  }

  // Mock Data Methods
  getMockContentData() {
    return {
      contentItems: [
        {
          id: 1,
          title: 'الصفحة الرئيسية',
          description: 'صفحة الترحيب الرئيسية للموقع',
          type: 'الصفحات',
          status: 'منشور',
          statusColor: 'success',
          statusIcon: 'mdi-publish',
          typeColor: 'primary',
          typeIcon: 'mdi-file-document',
          author: 'أحمد محمد',
          authorColor: 'primary',
          createdAt: '2024-01-15',
          views: 3450,
          content: 'محتوى الصفحة الرئيسية الكامل هنا...'
        },
        {
          id: 2,
          title: 'دليل استخدام المنتجات',
          description: 'دليل شامل لاستخدام منتجاتنا',
          type: 'المقالات',
          status: 'منشور',
          statusColor: 'success',
          statusIcon: 'mdi-publish',
          typeColor: 'success',
          typeIcon: 'mdi-blog',
          author: 'فاطمة علي',
          authorColor: 'success',
          createdAt: '2024-01-12',
          views: 2180,
          content: 'محتوى الدليل الكامل هنا...'
        },
        {
          id: 3,
          title: 'سياسة الخصوصية',
          description: 'سياسة الخصوصية والاستخدام',
          type: 'الصفحات',
          status: 'منشور',
          statusColor: 'success',
          statusIcon: 'mdi-publish',
          typeColor: 'primary',
          typeIcon: 'mdi-file-document',
          author: 'محمد عبدالله',
          authorColor: 'warning',
          createdAt: '2024-01-10',
          views: 890,
          content: 'محتوى سياسة الخصوصية الكامل هنا...'
        },
        {
          id: 4,
          title: 'مقالة جديدة عن المنتجات',
          description: 'مقالة قيد المراجعة',
          type: 'المقالات',
          status: 'مسودة',
          statusColor: 'warning',
          statusIcon: 'mdi-file-edit',
          typeColor: 'success',
          typeIcon: 'mdi-blog',
          author: 'نورة سالم',
          authorColor: 'info',
          createdAt: '2024-01-08',
          views: 0,
          content: 'محتوى المقالة الكامل هنا...'
        }
      ],
      contentStats: [
        {
          title: 'إجمالي المحتوى',
          value: '234',
          icon: 'mdi-file-document-multiple',
          color: 'primary'
        },
        {
          title: 'المحتوى المنشور',
          value: '189',
          icon: 'mdi-publish',
          color: 'success'
        },
        {
          title: 'المحتوى المسودة',
          value: '45',
          icon: 'mdi-file-edit',
          color: 'warning'
        },
        {
          title: 'المحتوى المجدول',
          value: '12',
          icon: 'mdi-clock',
          color: 'info'
        }
      ],
      contentTypes: [
        {
          name: 'الصفحات',
          count: 45,
          icon: 'mdi-file-document',
          color: 'primary'
        },
        {
          name: 'المقالات',
          count: 67,
          icon: 'mdi-blog',
          color: 'success'
        },
        {
          name: 'المنتجات',
          count: 89,
          icon: 'mdi-shopping',
          color: 'warning'
        },
        {
          name: 'الصور',
          count: 156,
          icon: 'mdi-image',
          color: 'info'
        },
        {
          name: 'الفيديو',
          count: 23,
          icon: 'mdi-video',
          color: 'error'
        },
        {
          name: 'المستندات',
          count: 34,
          icon: 'mdi-file',
          color: 'purple'
        }
      ],
      contentDistribution: [
        {
          type: 'الصفحات',
          percentage: 19,
          icon: 'mdi-file-document',
          color: 'primary'
        },
        {
          type: 'المقالات',
          percentage: 29,
          icon: 'mdi-blog',
          color: 'success'
        },
        {
          type: 'المنتجات',
          percentage: 38,
          icon: 'mdi-shopping',
          color: 'warning'
        },
        {
          type: 'الوسائط',
          percentage: 14,
          icon: 'mdi-image',
          color: 'info'
        }
      ]
    };
  }

  getMockContentTypes() {
    return [
      'الصفحات',
      'المقالات',
      'المنتجات',
      'الصور',
      'الفيديو',
      'المستندات'
    ];
  }

  // Export singleton instance
  static getInstance() {
    if (!window.contentServiceInstance) {
      window.contentServiceInstance = new ContentService();
    }
    return window.contentServiceInstance;
  }
}

// Export class as default
export default ContentService;
