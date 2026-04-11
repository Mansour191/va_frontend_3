// src/integration/ai/customers/CustomerAnalyticsService.js
import DataCollector from '@/shared/integration/ai/forecasting/data/DataCollector';
import AlertService from '@/shared/integration/services/AlertService';

class CustomerAnalyticsService {
  constructor() {
    this.cache = {
      segments: null,
      churn: null,
      ltv: null,
      lastUpdate: null,
    };
  }

  // ========== تحليلات العملاء الأساسية ==========

  // الحصول على جميع العملاء مع بياناتهم
  async getAllCustomers() {
    const data = await DataCollector.collectAllData();
    const orders = data.orders || [];

    // استخراج العملاء الفريدين
    const customersMap = new Map();

    orders.forEach((order) => {
      const customerId = order.customerId || order.userId;
      if (!customerId) return;

      if (!customersMap.has(customerId)) {
        customersMap.set(customerId, {
          id: customerId,
          name: order.customerName || `عميل ${customerId}`,
          email: order.email,
          phone: order.phone,
          totalOrders: 0,
          totalSpent: 0,
          firstOrderDate: order.date,
          lastOrderDate: order.date,
          products: new Set(),
          categories: new Map(),
          orderDates: [],
        });
      }

      const customer = customersMap.get(customerId);
      customer.totalOrders += 1;
      customer.totalSpent += order.total || 0;

      // تحديث التواريخ
      if (new Date(order.date) < new Date(customer.firstOrderDate)) {
        customer.firstOrderDate = order.date;
      }
      if (new Date(order.date) > new Date(customer.lastOrderDate)) {
        customer.lastOrderDate = order.date;
      }

      customer.orderDates.push(order.date);

      // تجميع المنتجات والفئات
      const items = order.items || [];
      items.forEach((item) => {
        if (item.id) customer.products.add(item.id);
        if (item.category) {
          customer.categories.set(item.category, (customer.categories.get(item.category) || 0) + 1);
        }
      });
    });

    // تحويل المصفوفات والتحويلات إلى تنسيق مناسب
    const customers = Array.from(customersMap.values()).map((c) => ({
      ...c,
      products: Array.from(c.products),
      categories: Object.fromEntries(c.categories),
      orderFrequency: this.calculateOrderFrequency(c.orderDates),
      avgOrderValue: c.totalSpent / c.totalOrders,
      daysSinceLastOrder: this.daysSince(c.lastOrderDate),
    }));

    return customers;
  }

  // حساب تكرار الطلبات
  calculateOrderFrequency(orderDates) {
    if (orderDates.length < 2) return 0;

    const sorted = orderDates.sort((a, b) => new Date(a) - new Date(b));
    let totalDays = 0;

    for (let i = 1; i < sorted.length; i++) {
      const days = (new Date(sorted[i]) - new Date(sorted[i - 1])) / (1000 * 60 * 60 * 24);
      totalDays += days;
    }

    return Math.round(totalDays / (sorted.length - 1));
  }

  // حساب الأيام منذ آخر طلب
  daysSince(dateString) {
    const lastDate = new Date(dateString);
    const now = new Date();
    return Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
  }

  // ========== تقسيم العملاء ==========

  // تقسيم العملاء حسب القيمة
  async segmentCustomersByValue() {
    const customers = await this.getAllCustomers();

    // حساب إجمالي الإيرادات
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

    // ترتيب تنازلي حسب الإنفاق
    const sorted = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);

    let cumulative = 0;
    const segments = {
      vip: [], // أعلى 20% إنفاق (80% من الإيرادات)
      regular: [], // الـ 30% التالية (15% من الإيرادات)
      occasional: [], // الـ 50% الباقية (5% من الإيرادات)
      new: [], // عملاء جدد (أقل من 30 يوم)
      churned: [], // عملاء توقفوا (أكثر من 90 يوم)
    };

    sorted.forEach((customer) => {
      cumulative += customer.totalSpent;
      const cumulativePercent = (cumulative / totalRevenue) * 100;

      if (cumulativePercent <= 80) {
        segments.vip.push(customer);
      } else if (cumulativePercent <= 95) {
        segments.regular.push(customer);
      } else {
        segments.occasional.push(customer);
      }

      // تصنيف إضافي
      if (customer.daysSinceLastOrder > 90) {
        segments.churned.push(customer);
      } else if (customer.totalOrders === 1 && customer.daysSinceLastOrder < 30) {
        segments.new.push(customer);
      }
    });

    // إحصائيات كل شريحة
    const stats = {
      vip: {
        count: segments.vip.length,
        revenue: segments.vip.reduce((sum, c) => sum + c.totalSpent, 0),
        avgOrderValue: this.calculateAverage(segments.vip.map((c) => c.avgOrderValue)),
      },
      regular: {
        count: segments.regular.length,
        revenue: segments.regular.reduce((sum, c) => sum + c.totalSpent, 0),
        avgOrderValue: this.calculateAverage(segments.regular.map((c) => c.avgOrderValue)),
      },
      occasional: {
        count: segments.occasional.length,
        revenue: segments.occasional.reduce((sum, c) => sum + c.totalSpent, 0),
        avgOrderValue: this.calculateAverage(segments.occasional.map((c) => c.avgOrderValue)),
      },
      new: {
        count: segments.new.length,
        revenue: segments.new.reduce((sum, c) => sum + c.totalSpent, 0),
      },
      churned: {
        count: segments.churned.length,
        revenue: segments.churned.reduce((sum, c) => sum + c.totalSpent, 0),
      },
    };

    this.cache.segments = { segments, stats };
    return this.cache.segments;
  }

  // حساب المتوسط
  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  // ========== تحليل الفئات المفضلة للعملاء ==========

  async getCustomerCategoryPreferences(customerId) {
    const customers = await this.getAllCustomers();
    const customer = customers.find((c) => c.id === customerId);

    if (!customer) return [];

    // ترتيب الفئات حسب عدد المشتريات
    const preferences = Object.entries(customer.categories || {})
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / customer.totalOrders) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    return preferences;
  }

  // ========== تحليلات عامة ==========

  async getCustomerAnalytics() {
    const customers = await this.getAllCustomers();
    const segments = await this.segmentCustomersByValue();

    // العملاء النشطون (آخر 30 يوم)
    const activeCustomers = customers.filter((c) => c.daysSinceLastOrder <= 30);

    // العملاء الجدد (أول طلب خلال آخر 30 يوم)
    const newCustomers = customers.filter((c) => {
      const daysSinceFirst = this.daysSince(c.firstOrderDate);
      return daysSinceFirst <= 30;
    });

    // متوسط القيمة الدائمة (تقديري)
    const avgLTV = customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length;

    return {
      total: customers.length,
      active: activeCustomers.length,
      new: newCustomers.length,
      churned: segments.stats.churned.count,
      revenue: {
        total: customers.reduce((sum, c) => sum + c.totalSpent, 0),
        averagePerCustomer: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length,
        averageOrderValue: this.calculateAverage(customers.map((c) => c.avgOrderValue)),
      },
      segments: segments.stats,
      retention: {
        returningRate: (customers.filter((c) => c.totalOrders > 1).length / customers.length) * 100,
        averageOrdersPerCustomer:
          customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length,
      },
      // 👈 أضف هذا السطر
      averageLifetimeValue: avgLTV,
    };
  }

  // ========== تحديث الكاش ==========

  async refreshAll() {
    await this.getAllCustomers();
    await this.segmentCustomersByValue();

    this.cache.lastUpdate = new Date().toISOString();

    await AlertService.sendAlert({
      type: 'info',
      category: 'system',
      severity: 'low',
      title: '📊 تحديث تحليلات العملاء',
      message: 'تم تحديث بيانات تحليلات العملاء بنجاح',
      actionable: false,
    });

    return { success: true, lastUpdate: this.cache.lastUpdate };
  }

  getLastUpdate() {
    return this.cache.lastUpdate;
  }
}

export default new CustomerAnalyticsService();
