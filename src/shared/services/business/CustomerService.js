// Enhanced CustomerService with API Integration
import BaseService from './BaseService';

class CustomerService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/customers';
  }

  // API Methods
  async getCustomers() {
    try {
      const response = await this.get('/items');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockCustomerData(),
        error: response.error || 'Failed to load customers'
      };
    } catch (error) {
      console.error('Error getting customers:', error);
      return {
        success: false,
        data: this.getMockCustomerData(),
        error: error.message
      };
    }
  }

  async createCustomer(customerData) {
    try {
      const response = await this.post('/items', customerData);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to create customer'
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateCustomer(customerData) {
    try {
      const response = await this.put(`/items/${customerData.id}`, customerData);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to update customer'
      };
    } catch (error) {
      console.error('Error updating customer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteCustomer(customerId) {
    try {
      const response = await this.delete(`/items/${customerId}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to delete customer'
      };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCustomerById(customerId) {
    try {
      const response = await this.get(`/items/${customerId}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        error: response.error || 'Failed to get customer'
      };
    } catch (error) {
      console.error('Error getting customer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCustomerSegments() {
    try {
      const response = await this.get('/segments');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockCustomerSegments(),
        error: response.error || 'Failed to load customer segments'
      };
    } catch (error) {
      console.error('Error getting customer segments:', error);
      return {
        success: false,
        data: this.getMockCustomerSegments(),
        error: error.message
      };
    }
  }

  async getCustomerStats() {
    try {
      const response = await this.get('/stats');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockCustomerStats(),
        error: response.error || 'Failed to load customer stats'
      };
    } catch (error) {
      console.error('Error getting customer stats:', error);
      return {
        success: false,
        data: this.getMockCustomerStats(),
        error: error.message
      };
    }
  }

  async getGrowthStats() {
    try {
      const response = await this.get('/growth');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockGrowthStats(),
        error: response.error || 'Failed to load growth stats'
      };
    } catch (error) {
      console.error('Error getting growth stats:', error);
      return {
        success: false,
        data: this.getMockGrowthStats(),
        error: error.message
      };
    }
  }

  // Mock Data Methods
  getMockCustomerData() {
    return {
      customers: [
        {
          id: 1,
          name: 'أحمد محمد',
          email: 'ahmed@example.com',
          phone: '+966 50 123 4567',
          segment: 'العملاء المميزون',
          status: 'نشط',
          segmentColor: 'warning',
          statusColor: 'success',
          avatarColor: 'primary',
          avatarIcon: 'mdi-account',
          orders: 23,
          revenue: 15450,
          address: 'الرياض، المملكة العربية السعودية',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          name: 'فاطمة علي',
          email: 'fatima@example.com',
          phone: '+966 55 987 6543',
          segment: 'العملاء النشطون',
          status: 'نشط',
          segmentColor: 'info',
          statusColor: 'success',
          avatarColor: 'success',
          avatarIcon: 'mdi-account',
          orders: 18,
          revenue: 12340,
          address: 'جدة، المملكة العربية السعودية',
          createdAt: '2024-01-12'
        },
        {
          id: 3,
          name: 'محمد عبدالله',
          email: 'mohammed@example.com',
          phone: '+966 51 234 5678',
          segment: 'العملاء العاديون',
          status: 'غير نشط',
          segmentColor: 'primary',
          statusColor: 'error',
          avatarColor: 'warning',
          avatarIcon: 'mdi-account',
          orders: 7,
          revenue: 3450,
          address: 'الدمام، المملكة العربية السعودية',
          createdAt: '2024-01-10'
        },
        {
          id: 4,
          name: 'نورة سالم',
          email: 'nora@example.com',
          phone: '+966 56 789 0123',
          segment: 'العملاء الجدد',
          status: 'نشط',
          segmentColor: 'success',
          statusColor: 'success',
          avatarColor: 'info',
          avatarIcon: 'mdi-account',
          orders: 3,
          revenue: 1230,
          address: 'مكة المكرمة، المملكة العربية السعودية',
          createdAt: '2024-01-08'
        },
        {
          id: 5,
          name: 'خالد العتيبي',
          email: 'khalid@example.com',
          phone: '+966 50 345 6789',
          segment: 'العملاء المميزون',
          status: 'نشط',
          segmentColor: 'warning',
          statusColor: 'success',
          avatarColor: 'purple',
          avatarIcon: 'mdi-account',
          orders: 31,
          revenue: 23450,
          address: 'الخبر، المملكة العربية السعودية',
          createdAt: '2024-01-05'
        },
        {
          id: 6,
          name: 'سارة أحمد',
          email: 'sara@example.com',
          phone: '+966 53 456 7890',
          segment: 'العملاء النشطون',
          status: 'نشط',
          segmentColor: 'info',
          statusColor: 'success',
          avatarColor: 'pink',
          avatarIcon: 'mdi-account',
          orders: 15,
          revenue: 8900,
          address: 'المدينة المنورة، المملكة العربية السعودية',
          createdAt: '2024-01-03'
        }
      ],
      customerStats: [
        {
          title: 'إجمالي العملاء',
          value: '1,234',
          icon: 'mdi-account-multiple',
          color: 'primary'
        },
        {
          title: 'العملاء النشطون',
          value: '987',
          icon: 'mdi-account-check',
          color: 'success'
        },
        {
          title: 'العملاء الجدد',
          value: '156',
          icon: 'mdi-account-plus',
          color: 'warning'
        },
        {
          title: 'العملاء المميزون',
          value: '89',
          icon: 'mdi-star',
          color: 'info'
        }
      ],
      customerSegments: [
        {
          name: 'العملاء العاديون',
          count: 456,
          percentage: 37,
          icon: 'mdi-account',
          color: 'primary'
        },
        {
          name: 'العملاء المميزون',
          count: 234,
          percentage: 19,
          icon: 'mdi-star',
          color: 'warning'
        },
        {
          name: 'العملاء الجدد',
          count: 156,
          percentage: 13,
          icon: 'mdi-account-plus',
          color: 'success'
        },
        {
          name: 'العملاء النشطون',
          count: 388,
          percentage: 31,
          icon: 'mdi-account-check',
          color: 'info'
        }
      ],
      growthStats: {
        thisMonth: 156,
        lastMonth: 124,
        thisYear: 1234,
        maxGrowth: 1500
      }
    };
  }

  getMockCustomerSegments() {
    return [
      {
        name: 'العملاء العاديون',
        count: 456,
        percentage: 37,
        icon: 'mdi-account',
        color: 'primary'
      },
      {
        name: 'العملاء المميزون',
        count: 234,
        percentage: 19,
        icon: 'mdi-star',
        color: 'warning'
      },
      {
        name: 'العملاء الجدد',
        count: 156,
        percentage: 13,
        icon: 'mdi-account-plus',
        color: 'success'
      },
      {
        name: 'العملاء النشطون',
        count: 388,
        percentage: 31,
        icon: 'mdi-account-check',
        color: 'info'
      }
    ];
  }

  getMockCustomerStats() {
    return [
      {
        title: 'إجمالي العملاء',
        value: '1,234',
        icon: 'mdi-account-multiple',
        color: 'primary'
      },
      {
        title: 'العملاء النشطون',
        value: '987',
        icon: 'mdi-account-check',
        color: 'success'
      },
      {
        title: 'العملاء الجدد',
        value: '156',
        icon: 'mdi-account-plus',
        color: 'warning'
      },
      {
        title: 'العملاء المميزون',
        value: '89',
        icon: 'mdi-star',
        color: 'info'
      }
    ];
  }

  getMockGrowthStats() {
    return {
      thisMonth: 156,
      lastMonth: 124,
      thisYear: 1234,
      maxGrowth: 1500
    };
  }

  // Export singleton instance
  static getInstance() {
    if (!window.customerServiceInstance) {
      window.customerServiceInstance = new CustomerService();
    }
    return window.customerServiceInstance;
  }
}

// Export class as default
export default CustomerService;
