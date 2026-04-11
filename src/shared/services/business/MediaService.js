// Enhanced MediaService with API Integration
import BaseService from './BaseService';

class MediaService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/media';
  }

  // API Methods
  async getMediaItems() {
    try {
      const response = await this.get('/items');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockMediaData(),
        error: response.error || 'Failed to load media items'
      };
    } catch (error) {
      console.error('Error getting media items:', error);
      return {
        success: false,
        data: this.getMockMediaData(),
        error: error.message
      };
    }
  }

  async uploadMedia(formData) {
    try {
      const response = await this.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to upload media'
      };
    } catch (error) {
      console.error('Error uploading media:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteMedia(mediaId) {
    try {
      const response = await this.delete(`/items/${mediaId}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to delete media'
      };
    } catch (error) {
      console.error('Error deleting media:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async downloadMedia(mediaId) {
    try {
      const response = await this.get(`/items/${mediaId}/download`, {
        responseType: 'blob'
      });
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to download media'
      };
    } catch (error) {
      console.error('Error downloading media:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getMediaById(mediaId) {
    try {
      const response = await this.get(`/items/${mediaId}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to get media'
      };
    } catch (error) {
      console.error('Error getting media:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getMediaTypes() {
    try {
      const response = await this.get('/types');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockMediaTypes(),
        error: response.error || 'Failed to load media types'
      };
    } catch (error) {
      console.error('Error getting media types:', error);
      return {
        success: false,
        data: this.getMockMediaTypes(),
        error: error.message
      };
    }
  }

  async getStorageStats() {
    try {
      const response = await this.get('/storage');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockStorageStats(),
        error: response.error || 'Failed to load storage stats'
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        success: false,
        data: this.getMockStorageStats(),
        error: error.message
      };
    }
  }

  // Mock Data Methods
  getMockMediaData() {
    return {
      mediaItems: [
        {
          id: 1,
          name: 'ملصق حائط زهور',
          type: 'image',
          size: 2457600,
          thumbnail: 'https://picsum.photos/seed/wall1/300/200.jpg',
          typeColor: 'success',
          typeIcon: 'mdi-image',
          createdAt: '2024-01-15',
          category: 'الجدران'
        },
        {
          id: 2,
          name: 'فيديو تعليمي للمنتج',
          type: 'video',
          size: 52428800,
          thumbnail: null,
          typeColor: 'warning',
          typeIcon: 'mdi-video',
          createdAt: '2024-01-12',
          category: 'الفيديوهات'
        },
        {
          id: 3,
          name: 'دليل المستخدم',
          type: 'document',
          size: 1048576,
          thumbnail: null,
          typeColor: 'info',
          typeIcon: 'mdi-file-document',
          createdAt: '2024-01-10',
          category: 'المستندات'
        },
        {
          id: 4,
          name: 'ملصق باب خشبي',
          type: 'image',
          size: 3145728,
          thumbnail: 'https://picsum.photos/seed/door1/300/200.jpg',
          typeColor: 'success',
          typeIcon: 'mdi-image',
          createdAt: '2024-01-08',
          category: 'الأبواب'
        },
        {
          id: 5,
          name: 'ملصق سيارة رياضي',
          type: 'image',
          size: 4096000,
          thumbnail: 'https://picsum.photos/seed/car1/300/200.jpg',
          typeColor: 'success',
          typeIcon: 'mdi-image',
          createdAt: '2024-01-05',
          category: 'السيارات'
        },
        {
          id: 6,
          name: 'ملصق مطبخ عصري',
          type: 'image',
          size: 2867200,
          thumbnail: 'https://picsum.photos/seed/kitchen1/300/200.jpg',
          typeColor: 'success',
          typeIcon: 'mdi-image',
          createdAt: '2024-01-03',
          category: 'المطابخ'
        },
        {
          id: 7,
          name: 'موسيقى خلفية',
          type: 'audio',
          size: 8388608,
          thumbnail: null,
          typeColor: 'error',
          typeIcon: 'mdi-music',
          createdAt: '2024-01-01',
          category: 'الصوت'
        },
        {
          id: 8,
          name: 'أرشيف المنتجات',
          type: 'archive',
          size: 52428800,
          thumbnail: null,
          typeColor: 'purple',
          typeIcon: 'mdi-archive',
          createdAt: '2023-12-28',
          category: 'الأرشيف'
        }
      ],
      mediaStats: [
        {
          title: 'إجمالي الوسائط',
          value: '456',
          icon: 'mdi-image-multiple',
          color: 'primary'
        },
        {
          title: 'الصور',
          value: '324',
          icon: 'mdi-image',
          color: 'success'
        },
        {
          title: 'الفيديوهات',
          value: '67',
          icon: 'mdi-video',
          color: 'warning'
        },
        {
          title: 'المستندات',
          value: '65',
          icon: 'mdi-file-document',
          color: 'info'
        }
      ],
      mediaTypes: [
        {
          name: 'الصور',
          count: 324,
          size: 2457600000,
          icon: 'mdi-image',
          color: 'success'
        },
        {
          name: 'الفيديوهات',
          count: 67,
          size: 8192000000,
          icon: 'mdi-video',
          color: 'warning'
        },
        {
          name: 'المستندات',
          count: 65,
          size: 512000000,
          icon: 'mdi-file-document',
          color: 'info'
        },
        {
          name: 'الصوت',
          count: 23,
          size: 256000000,
          icon: 'mdi-music',
          color: 'error'
        },
        {
          name: 'الأرشيف',
          count: 12,
          size: 1024000000,
          icon: 'mdi-archive',
          color: 'purple'
        },
        {
          name: 'آخر',
          count: 8,
          size: 128000000,
          icon: 'mdi-file',
          color: 'grey'
        }
      ],
      storageStats: {
        used: 10240000000,
        available: 5242880000,
        total: 15462880000
      }
    };
  }

  getMockMediaTypes() {
    return [
      'الصور',
      'الفيديوهات',
      'المستندات',
      'الصوت',
      'الأرشيف',
      'آخر'
    ];
  }

  getMockStorageStats() {
    return {
      used: 10240000000,
      available: 5242880000,
      total: 15462880000
    };
  }

  // Export singleton instance
  static getInstance() {
    if (!window.mediaServiceInstance) {
      window.mediaServiceInstance = new MediaService();
    }
    return window.mediaServiceInstance;
  }
}

// Export class as default
export default MediaService;
