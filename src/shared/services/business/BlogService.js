// Enhanced BlogService with API Integration
import BaseService from './BaseService';

class BlogService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/blog';
  }

  // API Methods
  async getBlogPosts() {
    try {
      const response = await this.get('/posts');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockBlogData(),
        error: response.error || 'Failed to load blog posts'
      };
    } catch (error) {
      console.error('Error getting blog posts:', error);
      return {
        success: false,
        data: this.getMockBlogData(),
        error: error.message
      };
    }
  }

  async createPost(postData) {
    try {
      const response = await this.post('/posts', postData);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to create blog post'
      };
    } catch (error) {
      console.error('Error creating blog post:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updatePost(postData) {
    try {
      const response = await this.put(`/posts/${postData.id}`, postData);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to update blog post'
      };
    } catch (error) {
      console.error('Error updating blog post:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deletePost(postId) {
    try {
      const response = await this.delete(`/posts/${postId}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to delete blog post'
      };
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPostById(postId) {
    try {
      const response = await this.get(`/posts/${postId}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to get blog post'
      };
    } catch (error) {
      console.error('Error getting blog post:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCategories() {
    try {
      const response = await this.get('/categories');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockCategories(),
        error: response.error || 'Failed to load categories'
      };
    } catch (error) {
      console.error('Error getting categories:', error);
      return {
        success: false,
        data: this.getMockCategories(),
        error: error.message
      };
    }
  }

  // Mock Data Methods
  getMockBlogData() {
    return {
      blogPosts: [
        {
          id: 1,
          title: 'كيفية تزيين جدران منزلك بملصقات فنية',
          excerpt: 'دليل شامل لاختيار وتركيب الملصقات الفنية لجدران منزلك',
          author: 'أحمد محمد',
          category: 'ديكور',
          status: 'منشور',
          statusColor: 'success',
          statusIcon: 'mdi-publish',
          authorColor: 'primary',
          createdAt: '2024-01-15',
          views: 1250,
          content: 'محتوى المقال الكامل هنا...'
        },
        {
          id: 2,
          title: 'أفضل ملصقات السيارات لعام 2024',
          excerpt: 'استعراض لأحدث ملصقات السيارات وتطبيقاتها',
          author: 'فاطمة علي',
          category: 'سيارات',
          status: 'منشور',
          statusColor: 'success',
          statusIcon: 'mdi-publish',
          authorColor: 'success',
          createdAt: '2024-01-12',
          views: 980,
          content: 'محتوى المقال الكامل هنا...'
        },
        {
          id: 3,
          title: 'ملصقات المطابخ العصرية',
          excerpt: 'أفكار مبتكرة لملصقات المطابخ العصرية',
          author: 'محمد عبدالله',
          category: 'مطابخ',
          status: 'مسودة',
          statusColor: 'warning',
          statusIcon: 'mdi-file-edit',
          authorColor: 'warning',
          createdAt: '2024-01-10',
          views: 0,
          content: 'محتوى المقال الكامل هنا...'
        },
        {
          id: 4,
          title: 'فن الملصقات ثلاثية الأبعاد',
          excerpt: 'تقنيات جديدة في عالم الملصقات ثلاثية الأبعاد',
          author: 'نورة سالم',
          category: 'فن',
          status: 'مجدول',
          statusColor: 'info',
          statusIcon: 'mdi-clock',
          authorColor: 'info',
          createdAt: '2024-01-08',
          views: 0,
          content: 'محتوى المقال الكامل هنا...'
        }
      ],
      blogStats: [
        {
          title: 'إجمالي المقالات',
          value: '156',
          icon: 'mdi-file-document-multiple',
          color: 'primary'
        },
        {
          title: 'المقالات المنشورة',
          value: '124',
          icon: 'mdi-publish',
          color: 'success'
        },
        {
          title: 'المقالات المسودة',
          value: '32',
          icon: 'mdi-file-edit',
          color: 'warning'
        },
        {
          title: 'المقالات المجدولة',
          value: '8',
          icon: 'mdi-clock',
          color: 'info'
        }
      ]
    };
  }

  getMockCategories() {
    return [
      'ديكور',
      'سيارات',
      'مطابخ',
      'فن',
      'أثاث',
      'أبواب'
    ];
  }

  // Export singleton instance
  static getInstance() {
    if (!window.blogServiceInstance) {
      window.blogServiceInstance = new BlogService();
    }
    return window.blogServiceInstance;
  }
}

// Export class as default
export default BlogService;
