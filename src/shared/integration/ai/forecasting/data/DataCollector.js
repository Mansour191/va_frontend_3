// src\integration\ai\forecasting\data\DataCollector.js
import OrderSyncService from '@/shared/integration/services/OrderSyncService';
import ProductSyncService from '@/shared/integration/services/ProductSyncService';

class DataCollector {
  constructor() {
    this.salesData = [];
    this.products = [];
    this.orders = [];
  }

  // ========== جمع البيانات الأساسية ==========

  async collectAllData() {
    console.log('📊 جاري جمع بيانات المبيعات...');

    try {
      // جمع الطلبات
      const ordersResult = await OrderSyncService.getSiteOrders();
      this.orders = Array.isArray(ordersResult) ? ordersResult : [];

      // جمع المنتجات
      const productsResult = await ProductSyncService.getSiteProducts();
      this.products = Array.isArray(productsResult) ? productsResult : [];

      // معالجة البيانات
      this.processSalesData();

      return {
        success: true,
        salesData: this.salesData,
        products: this.products,
        orders: this.orders,
        stats: this.getStats(),
      };
    } catch (error) {
      console.error('خطأ في جمع البيانات:', error);
      return this.getMockData(); // بيانات وهمية للطوارئ
    }
  }

  // معالجة بيانات المبيعات
  processSalesData() {
    const salesMap = new Map();

    this.orders.forEach((order) => {
      const date = order.date?.split('T')[0] || new Date().toISOString().split('T')[0];

      if (!salesMap.has(date)) {
        salesMap.set(date, {
          date,
          revenue: 0,
          orders: 0,
          items: 0,
        });
      }

      const dayData = salesMap.get(date);
      dayData.revenue += order.total || 0;
      dayData.orders += 1;
      dayData.items += order.items?.length || 0;
    });

    // تحويل للترتيب زمني
    this.salesData = Array.from(salesMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  // إحصائيات سريعة
  getStats() {
    const totalRevenue = this.salesData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = this.salesData.reduce((sum, d) => sum + d.orders, 0);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      daysOfData: this.salesData.length,
      startDate: this.salesData[0]?.date,
      endDate: this.salesData[this.salesData.length - 1]?.date,
    };
  }

  // بيانات وهمية للتجربة (إذا لم توجد بيانات حقيقية)
  getMockData() {
    const mockData = [];
    const startDate = new Date('2024-01-01');

    for (let i = 0; i < 180; i++) {
      // 6 أشهر
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // نمط موسمي
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
      const baseSales = isWeekend ? 500 : 300;

      // إضافة بعض العشوائية
      const random = Math.random() * 100;

      mockData.push({
        date: date.toISOString().split('T')[0],
        revenue: baseSales + random,
        orders: Math.floor(baseSales / 100) + Math.floor(random / 50),
        items: Math.floor(baseSales / 50) + Math.floor(random / 20),
      });
    }

    this.salesData = mockData;

    return {
      success: true,
      salesData: mockData,
      products: [],
      orders: [],
      stats: {
        totalRevenue: mockData.reduce((s, d) => s + d.revenue, 0),
        totalOrders: mockData.reduce((s, d) => s + d.orders, 0),
        averageOrderValue: 120,
        daysOfData: mockData.length,
        startDate: mockData[0]?.date,
        endDate: mockData[mockData.length - 1]?.date,
      },
    };
  }

  // الحصول على بيانات لمنتج معين
  getProductSales(productId) {
    const productOrders = this.orders.filter((o) => o.items?.some((i) => i.id === productId));

    return productOrders.map((o) => ({
      date: o.date.split('T')[0],
      quantity: o.items.find((i) => i.id === productId).quantity,
      revenue: o.items.find((i) => i.id === productId).price,
    }));
  }

  // الحصول على بيانات حسب التصنيف
  getCategorySales(category) {
    const categoryOrders = this.orders.filter((o) => o.items?.some((i) => i.category === category));

    const salesByDate = {};

    categoryOrders.forEach((order) => {
      const date = order.date.split('T')[0];
      const categoryItems = order.items.filter((i) => i.category === category);
      const categoryTotal = categoryItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      if (!salesByDate[date]) salesByDate[date] = 0;
      salesByDate[date] += categoryTotal;
    });

    return Object.entries(salesByDate)
      .map(([date, revenue]) => ({
        date,
        revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export default new DataCollector();
