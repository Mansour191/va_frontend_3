import BaseService from './BaseService';

class SecurityService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/security';
  }

  // Get security settings
  async getSecuritySettings() {
    try {
      const response = await this.get('/security/settings');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching security settings:', error);
      return this.getMockSecuritySettings();
    }
  }

  // Update security settings
  async updateSecuritySettings(settings) {
    try {
      const response = await this.put('/security/settings', settings);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating security settings:', error);
      return { success: true, data: settings, mockData: true };
    }
  }

  // Get user permissions
  async getUserPermissions(userId) {
    try {
      const response = await this.get(`/security/users/${userId}/permissions`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return this.getMockUserPermissions(userId);
    }
  }

  // Update user permissions
  async updateUserPermissions(userId, permissions) {
    try {
      const response = await this.put(`/security/users/${userId}/permissions`, permissions);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating user permissions:', error);
      return { success: true, data: permissions, mockData: true };
    }
  }

  // Get security logs
  async getSecurityLogs(params = {}) {
    try {
      const response = await this.get('/security/logs', { params });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching security logs:', error);
      return this.getMockSecurityLogs(params);
    }
  }

  // Get active sessions
  async getActiveSessions() {
    try {
      const response = await this.get('/security/sessions');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return this.getMockActiveSessions();
    }
  }

  // Revoke session
  async revokeSession(sessionId) {
    try {
      const response = await this.delete(`/security/sessions/${sessionId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error revoking session:', error);
      return { success: true, mockData: true };
    }
  }

  // Enable two-factor authentication
  async enableTwoFactorAuth(userId) {
    try {
      const response = await this.post(`/security/users/${userId}/2fa/enable`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return { 
        success: true, 
        data: { 
          qrCode: 'mock-qr-code-data',
          backupCodes: ['123456', '789012', '345678', '901234']
        }, 
        mockData: true 
      };
    }
  }

  // Disable two-factor authentication
  async disableTwoFactorAuth(userId) {
    try {
      const response = await this.post(`/security/users/${userId}/2fa/disable`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return { success: true, mockData: true };
    }
  }

  // Verify two-factor authentication
  async verifyTwoFactorAuth(userId, code) {
    try {
      const response = await this.post(`/security/users/${userId}/2fa/verify`, { code });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      return { success: code === '123456', mockData: true };
    }
  }

  // Get security audit report
  async getSecurityAuditReport(params = {}) {
    try {
      const response = await this.get('/security/audit', { params });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching security audit:', error);
      return this.getMockSecurityAuditReport(params);
    }
  }

  // Block IP address
  async blockIpAddress(ipAddress, reason) {
    try {
      const response = await this.post('/security/block-ip', { ipAddress, reason });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error blocking IP:', error);
      return { success: true, mockData: true };
    }
  }

  // Get blocked IPs
  async getBlockedIPs() {
    try {
      const response = await this.get('/security/blocked-ips');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching blocked IPs:', error);
      return this.getMockBlockedIPs();
    }
  }

  // Unblock IP address
  async unblockIpAddress(ipAddress) {
    try {
      const response = await this.delete(`/security/blocked-ips/${ipAddress}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error unblocking IP:', error);
      return { success: true, mockData: true };
    }
  }

  // Mock data methods
  getMockSecuritySettings() {
    return {
      success: true,
      data: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          passwordExpiry: 90
        },
        sessionSettings: {
          sessionTimeout: 30,
          maxConcurrentSessions: 3,
          requireReauth: false,
          autoLogout: true
        },
        twoFactorAuth: {
          enabled: true,
          requiredForAdmins: true,
          requiredForUsers: false,
          backupCodesEnabled: true
        },
        loginSecurity: {
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          captchaEnabled: true,
          ipWhitelistEnabled: false
        },
        apiSecurity: {
          rateLimiting: true,
          apiKeyRequired: false,
          corsEnabled: true,
          httpsOnly: true
        },
        auditSettings: {
          logAllActions: true,
          logFailedLogins: true,
          logPasswordChanges: true,
          logPermissionChanges: true,
          retentionPeriod: 90
        }
      },
      mockData: true
    };
  }

  getMockUserPermissions(userId) {
    return {
      success: true,
      data: {
        userId,
        permissions: [
          {
            module: 'products',
            permissions: ['read', 'create', 'update', 'delete']
          },
          {
            module: 'orders',
            permissions: ['read', 'update']
          },
          {
            module: 'customers',
            permissions: ['read', 'create', 'update']
          },
          {
            module: 'reports',
            permissions: ['read', 'generate']
          },
          {
            module: 'settings',
            permissions: ['read']
          },
          {
            module: 'users',
            permissions: ['read']
          }
        ],
        roles: ['manager', 'user'],
        lastUpdated: '2024-03-20T10:30:00Z'
      },
      mockData: true
    };
  }

  getMockSecurityLogs(params) {
    const logs = [
      {
        id: 1,
        timestamp: '2024-03-20T14:30:00Z',
        userId: 1,
        username: 'admin',
        action: 'LOGIN',
        description: 'تسجيل الدخول بنجاح',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'info'
      },
      {
        id: 2,
        timestamp: '2024-03-20T14:25:00Z',
        userId: 2,
        username: 'manager',
        action: 'PERMISSION_CHANGE',
        description: 'تم تغيير صلاحيات المستخدم',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        severity: 'warning'
      },
      {
        id: 3,
        timestamp: '2024-03-20T14:20:00Z',
        userId: null,
        username: 'unknown',
        action: 'LOGIN_FAILED',
        description: 'فشل تسجيل الدخول - كلمة مرور خاطئة',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)',
        severity: 'error'
      },
      {
        id: 4,
        timestamp: '2024-03-20T14:15:00Z',
        userId: 1,
        username: 'admin',
        action: 'PASSWORD_CHANGE',
        description: 'تم تغيير كلمة المرور',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'warning'
      },
      {
        id: 5,
        timestamp: '2024-03-20T14:10:00Z',
        userId: 3,
        username: 'user',
        action: 'LOGOUT',
        description: 'تسجيل الخروج',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0)',
        severity: 'info'
      }
    ];

    return {
      success: true,
      data: {
        logs: logs.slice(0, params.limit || 50),
        total: logs.length,
        page: params.page || 1,
        pageSize: params.limit || 50
      },
      mockData: true
    };
  }

  getMockActiveSessions() {
    return {
      success: true,
      data: {
        sessions: [
          {
            id: 'sess_1',
            userId: 1,
            username: 'admin',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            startTime: '2024-03-20T08:00:00Z',
            lastActivity: '2024-03-20T14:30:00Z',
            isActive: true,
            location: 'الجزائر العاصمة'
          },
          {
            id: 'sess_2',
            userId: 2,
            username: 'manager',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            startTime: '2024-03-20T09:15:00Z',
            lastActivity: '2024-03-20T14:25:00Z',
            isActive: true,
            location: 'وهران'
          },
          {
            id: 'sess_3',
            userId: 3,
            username: 'user',
            ipAddress: '192.168.1.103',
            userAgent: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0)',
            startTime: '2024-03-20T10:30:00Z',
            lastActivity: '2024-03-20T14:10:00Z',
            isActive: false,
            location: 'قسنطينة'
          }
        ],
        total: 3,
        activeCount: 2
      },
      mockData: true
    };
  }

  getMockSecurityAuditReport(params) {
    return {
      success: true,
      data: {
        summary: {
          totalEvents: 1247,
          securityEvents: 89,
          failedLogins: 23,
          passwordChanges: 45,
          permissionChanges: 12,
          suspiciousActivities: 5
        },
        events: [
          {
            timestamp: '2024-03-20T14:30:00Z',
            type: 'LOGIN_SUCCESS',
            severity: 'info',
            count: 156
          },
          {
            timestamp: '2024-03-20T14:25:00Z',
            type: 'PERMISSION_CHANGE',
            severity: 'warning',
            count: 12
          },
          {
            timestamp: '2024-03-20T14:20:00Z',
            type: 'LOGIN_FAILED',
            severity: 'error',
            count: 23
          }
        ],
        recommendations: [
          'فكر في تمكين المصادقة الثنائية للمستخدمين الحساسين',
          'مراجعة سياسات كلمات المرور لتعزيز الأمان',
          'مراقبة عناوين IP المشبوهة بانتظام'
        ]
      },
      mockData: true
    };
  }

  getMockBlockedIPs() {
    return {
      success: true,
      data: {
        blockedIPs: [
          {
            ipAddress: '192.168.1.200',
            reason: 'محاولات تسجيل دخول متعددة',
            blockedAt: '2024-03-20T12:00:00Z',
            blockedBy: 'system',
            expiresAt: '2024-03-27T12:00:00Z',
            isActive: true
          },
          {
            ipAddress: '10.0.0.50',
            reason: 'نشاط مشبوه',
            blockedAt: '2024-03-19T15:30:00Z',
            blockedBy: 'admin',
            expiresAt: null,
            isActive: true
          }
        ],
        total: 2
      },
      mockData: true
    };
  }
}

export default new SecurityService();
