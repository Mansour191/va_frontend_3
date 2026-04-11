import BaseService from './BaseService';

class ReportsService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/reports';
  }

  // Get available reports
  async getReports() {
    try {
      const response = await this.get('/reports');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching reports:', error);
      return this.getMockReports();
    }
  }

  // Generate specific report
  async generateReport(reportType, params = {}) {
    try {
      const response = await this.post(`/reports/generate/${reportType}`, params);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error generating report:', error);
      return this.getMockReportData(reportType, params);
    }
  }

  // Get report analytics
  async getReportAnalytics(reportId) {
    try {
      const response = await this.get(`/reports/${reportId}/analytics`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching report analytics:', error);
      return this.getMockReportAnalytics(reportId);
    }
  }

  // Export report
  async exportReport(reportId, format = 'pdf') {
    try {
      const response = await this.get(`/reports/${reportId}/export?format=${format}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error exporting report:', error);
      return { success: false, message: 'Export failed', mockData: true };
    }
  }

  // Schedule report
  async scheduleReport(reportConfig) {
    try {
      const response = await this.post('/reports/schedule', reportConfig);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error scheduling report:', error);
      return { success: true, data: { id: Date.now() }, mockData: true };
    }
  }

  // Get scheduled reports
  async getScheduledReports() {
    try {
      const response = await this.get('/reports/scheduled');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      return this.getMockScheduledReports();
    }
  }

  // Delete scheduled report
  async deleteScheduledReport(scheduleId) {
    try {
      const response = await this.delete(`/reports/scheduled/${scheduleId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
      return { success: true, mockData: true };
    }
  }

  // Mock data methods
  getMockReports() {
    return {
      success: true,
      data: {
        reports: [
          {
            id: 1,
            name: 'تقرير المبيعات الشهري',
            type: 'sales',
            description: 'تقرير شامل للمبيعات الشهرية مع تحليلات مفصلة',
            frequency: 'monthly',
            lastGenerated: '2024-03-01',
            status: 'active',
            icon: 'mdi-chart-line',
            color: '#4caf50'
          },
          {
            id: 2,
            name: 'تقرير العملاء',
            type: 'customers',
            description: 'تحليل شامل للعملاء الجدد والنشطين',
            frequency: 'weekly',
            lastGenerated: '2024-03-15',
            status: 'active',
            icon: 'mdi-account-group',
            color: '#2196f3'
          },
          {
            id: 3,
            name: 'تقرير المنتجات',
            type: 'products',
            description: 'تقرير أداء المنتجات والمخزون',
            frequency: 'daily',
            lastGenerated: '2024-03-20',
            status: 'active',
            icon: 'mdi-package',
            color: '#ff9800'
          },
          {
            id: 4,
            name: 'تقرير المالية',
            type: 'financial',
            description: 'تقرير مالي شامل بالإيرادات والمصروفات',
            frequency: 'monthly',
            lastGenerated: '2024-03-01',
            status: 'active',
            icon: 'mdi-currency-usd',
            color: '#9c27b0'
          },
          {
            id: 5,
            name: 'تقرير الطلبات',
            type: 'orders',
            description: 'تحليل الطلبات وحالتها',
            frequency: 'daily',
            lastGenerated: '2024-03-20',
            status: 'active',
            icon: 'mdi-shopping',
            color: '#f44336'
          }
        ]
      },
      mockData: true
    };
  }

  getMockReportData(reportType, params) {
    const mockData = {
      sales: {
        summary: {
          totalSales: 1250000,
          totalOrders: 845,
          averageOrderValue: 1480,
          growth: 12.5
        },
        chartData: [
          { month: 'يناير', sales: 98000, orders: 67 },
          { month: 'فبراير', sales: 115000, orders: 78 },
          { month: 'مارس', sales: 125000, orders: 85 }
        ],
        topProducts: [
          { name: 'فينيل ديكوري ذهبي', sales: 45000, units: 32 },
          { name: 'فينيل جدران فضي', sales: 38000, units: 28 },
          { name: 'فينيل أرضيات بني', sales: 32000, units: 24 }
        ]
      },
      customers: {
        summary: {
          totalCustomers: 2847,
          newCustomers: 156,
          activeCustomers: 1892,
          retention: 78.5
        },
        segments: [
          { name: 'عملاء جدد', count: 156, percentage: 5.5 },
          { name: 'عملاء نشطون', count: 1892, percentage: 66.4 },
          { name: 'عملاء عائدون', count: 799, percentage: 28.1 }
        ],
        demographics: {
          byAge: [
            { range: '18-25', count: 234 },
            { range: '26-35', count: 567 },
            { range: '36-45', count: 892 },
            { range: '46+', count: 1154 }
          ],
          byLocation: [
            { city: 'الجزائر', count: 1245 },
            { city: 'وهران', count: 567 },
            { city: 'قسنطينة', count: 432 },
            { city: 'أخرى', count: 603 }
          ]
        }
      },
      products: {
        summary: {
          totalProducts: 156,
          lowStock: 12,
          outOfStock: 3,
          topPerforming: 28
        },
        categories: [
          { name: 'ديكوري', count: 45, revenue: 340000 },
          { name: 'جدران', count: 38, revenue: 285000 },
          { name: 'أرضيات', count: 32, revenue: 198000 },
          { name: 'سقوف', count: 28, revenue: 156000 },
          { name: 'أثاث', count: 13, revenue: 87000 }
        ],
        performance: [
          { name: 'فينيل ديكوري ذهبي', sales: 45000, stock: 45, status: 'good' },
          { name: 'فينيل جدران فضي', sales: 38000, stock: 12, status: 'low' },
          { name: 'فينيل أرضيات بني', sales: 32000, stock: 0, status: 'out' }
        ]
      },
      financial: {
        summary: {
          totalRevenue: 1250000,
          totalExpenses: 785000,
          netProfit: 465000,
          profitMargin: 37.2
        },
        revenue: [
          { month: 'يناير', revenue: 380000, expenses: 245000 },
          { month: 'فبراير', revenue: 415000, expenses: 268000 },
          { month: 'مارس', revenue: 455000, expenses: 272000 }
        ],
        expenses: [
          { category: 'المواد الخام', amount: 345000, percentage: 44 },
          { category: 'العمالة', amount: 234000, percentage: 30 },
          { category: 'التشغيل', amount: 156000, percentage: 20 },
          { category: 'أخرى', amount: 50000, percentage: 6 }
        ]
      },
      orders: {
        summary: {
          totalOrders: 845,
          pendingOrders: 23,
          completedOrders: 789,
          cancelledOrders: 33
        },
        status: [
          { status: 'مكتمل', count: 789, percentage: 93.4 },
          { status: 'قيد الانتظار', count: 23, percentage: 2.7 },
          { status: 'ملغي', count: 33, percentage: 3.9 }
        ],
        timeline: [
          { date: '2024-03-18', orders: 28 },
          { date: '2024-03-19', orders: 32 },
          { date: '2024-03-20', orders: 35 }
        ]
      }
    };

    return {
      success: true,
      data: mockData[reportType] || {},
      mockData: true
    };
  }

  getMockReportAnalytics(reportId) {
    return {
      success: true,
      data: {
        reportId,
        analytics: {
          views: 145,
          downloads: 23,
          shares: 8,
          averageViewTime: 245, // seconds
          lastViewed: '2024-03-20T10:30:00Z',
          popularity: 78.5
        },
        insights: [
          'زيادة بنسبة 15% في المبيعات هذا الشهر',
          'العملاء الجدد زادوا بنسبة 8% مقارنة بالشهر الماضي',
          'منتجات الفئة الديكورية هي الأعلى مبيعات'
        ]
      },
      mockData: true
    };
  }

  getMockScheduledReports() {
    return {
      success: true,
      data: {
        schedules: [
          {
            id: 1,
            reportName: 'تقرير المبيعات اليومي',
            reportType: 'sales',
            frequency: 'daily',
            recipients: ['admin@company.com', 'manager@company.com'],
            nextRun: '2024-03-21T08:00:00Z',
            isActive: true,
            createdAt: '2024-03-01T10:00:00Z'
          },
          {
            id: 2,
            reportName: 'تقرير العملاء الأسبوعي',
            reportType: 'customers',
            frequency: 'weekly',
            recipients: ['marketing@company.com'],
            nextRun: '2024-03-25T09:00:00Z',
            isActive: true,
            createdAt: '2024-03-01T10:30:00Z'
          },
          {
            id: 3,
            reportName: 'تقرير المالية الشهري',
            reportType: 'financial',
            frequency: 'monthly',
            recipients: ['finance@company.com', 'ceo@company.com'],
            nextRun: '2024-04-01T08:00:00Z',
            isActive: true,
            createdAt: '2024-03-01T11:00:00Z'
          }
        ]
      },
      mockData: true
    };
  }
}

export default new ReportsService();
