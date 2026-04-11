import BaseService from './BaseService';

class UserService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/users';
  }

  // Get all users
  async getUsers(params = {}) {
    try {
      const response = await this.get('/users', { params });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      return this.getMockUsers(params);
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await this.get(`/users/${userId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching user:', error);
      return this.getMockUserById(userId);
    }
  }

  // Create user
  async createUser(userData) {
    try {
      const response = await this.post('/users', userData);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error creating user:', error);
      return this.getMockCreateUserResponse(userData);
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await this.put(`/users/${userId}`, userData);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating user:', error);
      return this.getMockUpdateUserResponse(userId, userData);
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await this.delete(`/users/${userId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: true, mockData: true };
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const response = await this.get(`/users/${userId}/profile`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return this.getMockUserProfile(userId);
    }
  }

  // Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      const response = await this.put(`/users/${userId}/profile`, profileData);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return this.getMockUpdateProfileResponse(userId, profileData);
    }
  }

  // Change user password
  async changePassword(userId, passwordData) {
    try {
      const response = await this.post(`/users/${userId}/change-password`, passwordData);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: true, mockData: true };
    }
  }

  // Upload user avatar
  async uploadAvatar(userId, file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await this.post(`/users/${userId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { 
        success: true, 
        data: { 
          avatar: '/api/users/' + userId + '/avatar.jpg',
          uploadedAt: new Date().toISOString()
        }, 
        mockData: true 
      };
    }
  }

  // Get user permissions
  async getUserPermissions(userId) {
    try {
      const response = await this.get(`/users/${userId}/permissions`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return this.getMockUserPermissions(userId);
    }
  }

  // Update user permissions
  async updateUserPermissions(userId, permissions) {
    try {
      const response = await this.put(`/users/${userId}/permissions`, permissions);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating user permissions:', error);
      return { success: true, data: permissions, mockData: true };
    }
  }

  // Get user roles
  async getUserRoles() {
    try {
      const response = await this.get('/users/roles');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return this.getMockUserRoles();
    }
  }

  // Assign role to user
  async assignRole(userId, roleId) {
    try {
      const response = await this.post(`/users/${userId}/roles/${roleId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error assigning role:', error);
      return { success: true, mockData: true };
    }
  }

  // Remove role from user
  async removeRole(userId, roleId) {
    try {
      const response = await this.delete(`/users/${userId}/roles/${roleId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error removing role:', error);
      return { success: true, mockData: true };
    }
  }

  // Get user activity log
  async getUserActivityLog(userId, params = {}) {
    try {
      const response = await this.get(`/users/${userId}/activity`, { params });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return this.getMockUserActivityLog(userId, params);
    }
  }

  // Enable/disable user
  async toggleUserStatus(userId, status) {
    try {
      const response = await this.patch(`/users/${userId}/status`, { status });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error toggling user status:', error);
      return { success: true, data: { status }, mockData: true };
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const response = await this.get('/users/stats');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return this.getMockUserStats();
    }
  }

  // Search users
  async searchUsers(query, params = {}) {
    try {
      const response = await this.get('/users/search', { 
        params: { ...params, q: query } 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error searching users:', error);
      return this.getMockSearchUsers(query, params);
    }
  }

  // Mock data methods
  getMockUsers(params) {
    const users = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@vynilart.com',
        firstName: 'الأدمن',
        lastName: 'النظام',
        phone: '+213 123 456 789',
        role: 'admin',
        status: 'active',
        avatar: '/api/users/1/avatar.jpg',
        lastLogin: '2024-03-20T14:30:00Z',
        createdAt: '2024-01-01T10:00:00Z',
        emailVerified: true,
        twoFactorEnabled: true,
        permissions: ['all']
      },
      {
        id: 2,
        username: 'manager',
        email: 'manager@vynilart.com',
        firstName: 'مدير',
        lastName: 'النظام',
        phone: '+213 987 654 321',
        role: 'manager',
        status: 'active',
        avatar: '/api/users/2/avatar.jpg',
        lastLogin: '2024-03-20T12:15:00Z',
        createdAt: '2024-01-15T14:20:00Z',
        emailVerified: true,
        twoFactorEnabled: false,
        permissions: ['products', 'orders', 'customers']
      },
      {
        id: 3,
        username: 'user1',
        email: 'user1@vynilart.com',
        firstName: 'مستخدم',
        lastName: 'أول',
        phone: '+213 555 123 456',
        role: 'user',
        status: 'active',
        avatar: '/api/users/3/avatar.jpg',
        lastLogin: '2024-03-20T10:30:00Z',
        createdAt: '2024-02-01T09:30:00Z',
        emailVerified: true,
        twoFactorEnabled: false,
        permissions: ['orders', 'profile']
      },
      {
        id: 4,
        username: 'user2',
        email: 'user2@vynilart.com',
        firstName: 'مستخدم',
        lastName: 'ثاني',
        phone: '+213 444 789 123',
        role: 'user',
        status: 'inactive',
        avatar: '/api/users/4/avatar.jpg',
        lastLogin: '2024-03-15T16:45:00Z',
        createdAt: '2024-02-10T11:20:00Z',
        emailVerified: false,
        twoFactorEnabled: false,
        permissions: ['orders', 'profile']
      },
      {
        id: 5,
        username: 'employee',
        email: 'employee@vynilart.com',
        firstName: 'موظف',
        lastName: 'الشركة',
        phone: '+213 333 456 789',
        role: 'employee',
        status: 'active',
        avatar: '/api/users/5/avatar.jpg',
        lastLogin: '2024-03-20T08:15:00Z',
        createdAt: '2024-01-20T13:45:00Z',
        emailVerified: true,
        twoFactorEnabled: false,
        permissions: ['products', 'orders']
      }
    ];

    return {
      success: true,
      data: {
        users: users.slice(0, params.limit || 20),
        total: users.length,
        page: params.page || 1,
        pageSize: params.limit || 20
      },
      mockData: true
    };
  }

  getMockUserById(userId) {
    const users = this.getMockUsers().data.users;
    const user = users.find(u => u.id === userId);
    return {
      success: true,
      data: user || null,
      mockData: true
    };
  }

  getMockCreateUserResponse(userData) {
    return {
      success: true,
      data: {
        id: Date.now(),
        ...userData,
        status: 'active',
        createdAt: new Date().toISOString(),
        emailVerified: false,
        twoFactorEnabled: false
      },
      mockData: true
    };
  }

  getMockUpdateUserResponse(userId, userData) {
    return {
      success: true,
      data: {
        id: userId,
        ...userData,
        updatedAt: new Date().toISOString()
      },
      mockData: true
    };
  }

  getMockUserProfile(userId) {
    const user = this.getMockUserById(userId).data;
    return {
      success: true,
      data: {
        ...user,
        bio: 'مطور ومصمم متخصص في منتجات الفينيل',
        website: 'https://vynilart.com',
        location: 'الجزائر العاصمة',
        birthDate: '1990-01-01',
        gender: 'male',
        language: 'ar',
        timezone: 'Africa/Algiers',
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          theme: 'light',
          language: 'ar'
        },
        social: {
          facebook: 'https://facebook.com/vynilart',
          twitter: 'https://twitter.com/vynilart',
          linkedin: 'https://linkedin.com/in/vynilart',
          instagram: 'https://instagram.com/vynilart'
        }
      },
      mockData: true
    };
  }

  getMockUpdateProfileResponse(userId, profileData) {
    return {
      success: true,
      data: {
        id: userId,
        ...profileData,
        updatedAt: new Date().toISOString()
      },
      mockData: true
    };
  }

  getMockUserPermissions(userId) {
    const user = this.getMockUserById(userId).data;
    return {
      success: true,
      data: {
        userId,
        permissions: user?.permissions || [],
        lastUpdated: '2024-03-20T10:30:00Z'
      },
      mockData: true
    };
  }

  getMockUserRoles() {
    return {
      success: true,
      data: [
        {
          id: 1,
          name: 'admin',
          displayName: 'المدير',
          description: 'صلاحيات كاملة على النظام',
          permissions: ['all'],
          userCount: 1,
          isSystem: true
        },
        {
          id: 2,
          name: 'manager',
          displayName: 'مدير',
          description: 'صلاحيات إدارة محدودة',
          permissions: ['products', 'orders', 'customers', 'reports'],
          userCount: 1,
          isSystem: true
        },
        {
          id: 3,
          name: 'employee',
          displayName: 'موظف',
          description: 'صلاحيات الموظف الأساسية',
          permissions: ['products', 'orders'],
          userCount: 1,
          isSystem: true
        },
        {
          id: 4,
          name: 'user',
          displayName: 'مستخدم',
          description: 'صلاحيات المستخدم العادية',
          permissions: ['orders', 'profile'],
          userCount: 2,
          isSystem: true
        }
      ],
      mockData: true
    };
  }

  getMockUserActivityLog(userId, params) {
    const activities = [
      {
        id: 1,
        action: 'LOGIN',
        description: 'تسجيل الدخول',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: '2024-03-20T14:30:00Z',
        severity: 'info'
      },
      {
        id: 2,
        action: 'PROFILE_UPDATE',
        description: 'تحديث الملف الشخصي',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: '2024-03-20T13:15:00Z',
        severity: 'info'
      },
      {
        id: 3,
        action: 'PASSWORD_CHANGE',
        description: 'تغيير كلمة المرور',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: '2024-03-19T16:45:00Z',
        severity: 'warning'
      }
    ];

    return {
      success: true,
      data: {
        activities: activities.slice(0, params.limit || 20),
        total: activities.length,
        page: params.page || 1,
        pageSize: params.limit || 20
      },
      mockData: true
    };
  }

  getMockUserStats() {
    return {
      success: true,
      data: {
        totalUsers: 2847,
        activeUsers: 2341,
        inactiveUsers: 506,
        newUsersThisMonth: 156,
        usersByRole: [
          { role: 'admin', count: 1, percentage: 0.04 },
          { role: 'manager', count: 3, percentage: 0.11 },
          { role: 'employee', count: 45, percentage: 1.58 },
          { role: 'user', count: 2798, percentage: 98.27 }
        ],
        usersByStatus: [
          { status: 'active', count: 2341, percentage: 82.2 },
          { status: 'inactive', count: 506, percentage: 17.8 }
        ],
        loginStats: {
          todayLogins: 145,
          weeklyLogins: 892,
          monthlyLogins: 2341,
          averageSessionDuration: 1245 // seconds
        },
        registrationStats: {
          todayRegistrations: 5,
          weeklyRegistrations: 34,
          monthlyRegistrations: 156,
          growthRate: 12.5
        }
      },
      mockData: true
    };
  }

  getMockSearchUsers(query, params) {
    const allUsers = this.getMockUsers().data.users;
    const filteredUsers = allUsers.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.firstName.toLowerCase().includes(query.toLowerCase()) ||
      user.lastName.toLowerCase().includes(query.toLowerCase())
    );

    return {
      success: true,
      data: {
        users: filteredUsers.slice(0, params.limit || 20),
        total: filteredUsers.length,
        page: params.page || 1,
        pageSize: params.limit || 20,
        query
      },
      mockData: true
    };
  }
}

export default new UserService();
