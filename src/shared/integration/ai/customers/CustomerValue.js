// src/integration/ai/customers/CustomerValue.js
import CustomerAnalyticsService from './CustomerAnalyticsService';

class CustomerValue {
  constructor() {
    this.calculations = {
      historical: null,
      predicted: null,
      segments: null,
    };
  }

  // ========== حساب القيمة التاريخية ==========

  calculateHistoricalValue(customer) {
    return {
      totalSpent: customer.totalSpent,
      averageOrderValue: customer.avgOrderValue,
      totalOrders: customer.totalOrders,
      firstPurchaseDate: customer.firstOrderDate,
      lastPurchaseDate: customer.lastOrderDate,
      customerLifetime: this.calculateCustomerLifetime(customer),
      purchaseFrequency: customer.orderFrequency,
      valuePerMonth: customer.totalSpent / this.calculateCustomerLifetime(customer),
    };
  }

  calculateCustomerLifetime(customer) {
    const first = new Date(customer.firstOrderDate);
    const last = new Date(customer.lastOrderDate);
    const days = Math.ceil((last - first) / (1000 * 60 * 60 * 24));
    return Math.max(1, days / 30); // بالشهور
  }

  // ========== حساب القيمة المتوقعة ==========

  async calculatePredictedValue(customer) {
    // تحليل الاتجاهات
    const trend = this.analyzePurchaseTrend(customer);

    // حساب معدل النمو/الانخفاض
    const growthRate = this.calculateGrowthRate(customer);

    // توقع القيمة للـ 12 شهر القادمة
    const monthlyValue = customer.totalSpent / this.calculateCustomerLifetime(customer);
    const predicted12Months = monthlyValue * 12 * (1 + growthRate);

    // توقع القيمة للـ 3 سنوات
    const predicted3Years = monthlyValue * 36 * Math.pow(1 + growthRate, 3);

    // توقع القيمة للعمر الافتراضي (5 سنوات)
    const predictedLifetime = monthlyValue * 60 * Math.pow(1 + growthRate, 5);

    return {
      monthlyValue: Math.round(monthlyValue),
      predicted12Months: Math.round(predicted12Months),
      predicted3Years: Math.round(predicted3Years),
      predictedLifetime: Math.round(predictedLifetime),
      growthRate: Math.round(growthRate * 100) / 100,
      trend,
      confidence: this.calculateConfidence(customer),
    };
  }

  // تحليل اتجاه الشراء
  analyzePurchaseTrend(customer) {
    if (customer.orderDates.length < 3) {
      return { direction: 'stable', strength: 0 };
    }

    // ترتيب الطلبات زمنياً
    const orders = customer.orderDates
      .map((date) => ({
        date: new Date(date),
        value: customer.avgOrderValue,
      }))
      .sort((a, b) => a.date - b.date);

    // حساب متوسط التغير
    let totalChange = 0;
    for (let i = 1; i < orders.length; i++) {
      const monthsDiff = (orders[i].date - orders[i - 1].date) / (1000 * 60 * 60 * 24 * 30);
      const valueDiff = orders[i].value - orders[i - 1].value;
      totalChange += valueDiff / monthsDiff;
    }

    const avgChange = totalChange / (orders.length - 1);

    let direction = 'stable';
    let strength = 0;

    if (avgChange > 50) {
      direction = 'strong_up';
      strength = Math.min(1, avgChange / 200);
    } else if (avgChange > 10) {
      direction = 'up';
      strength = avgChange / 100;
    } else if (avgChange < -50) {
      direction = 'strong_down';
      strength = Math.min(1, -avgChange / 200);
    } else if (avgChange < -10) {
      direction = 'down';
      strength = -avgChange / 100;
    }

    return { direction, strength, avgChange };
  }

  // حساب معدل النمو
  calculateGrowthRate(customer) {
    if (customer.orderDates.length < 2) return 0;

    const firstDate = new Date(customer.firstOrderDate);
    const lastDate = new Date(customer.lastOrderDate);
    const monthsActive = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 30));

    // متوسط الإنفاق الشهري
    const monthlySpend = customer.totalSpent / monthsActive;

    // إذا كان العميل نشطاً لأكثر من 3 أشهر، نقدر النمو
    if (monthsActive > 3) {
      if (monthlySpend > 5000) return 0.2;
      if (monthlySpend > 2000) return 0.15;
      if (monthlySpend > 500) return 0.1;
      return 0.05;
    }

    return 0;
  }

  // حساب درجة الثقة في التوقع
  calculateConfidence(customer) {
    let confidence = 50;

    if (customer.totalOrders >= 10) confidence += 30;
    else if (customer.totalOrders >= 5) confidence += 20;
    else if (customer.totalOrders >= 3) confidence += 10;

    const lifetime = this.calculateCustomerLifetime(customer);
    if (lifetime >= 12) confidence += 20;
    else if (lifetime >= 6) confidence += 10;

    if (customer.orderFrequency < 45) confidence += 10;

    return Math.min(95, confidence);
  }

  // ========== تحليل شرائح القيمة ==========

  async analyzeValueSegments() {
    const customers = await CustomerAnalyticsService.getAllCustomers();

    const segments = {
      high: [],
      medium: [],
      low: [],
      potential: [],
      atRisk: [],
    };

    for (const customer of customers) {
      const historical = this.calculateHistoricalValue(customer);
      const predicted = await this.calculatePredictedValue(customer);

      const customerWithValue = {
        ...customer,
        historical,
        predicted,
      };

      if (historical.totalSpent > 50000) {
        segments.high.push(customerWithValue);
      } else if (historical.totalSpent > 10000) {
        segments.medium.push(customerWithValue);
      } else {
        segments.low.push(customerWithValue);
      }

      if (historical.totalSpent > 5000 && predicted.growthRate > 0.15) {
        segments.potential.push(customerWithValue);
      }

      if (historical.totalSpent > 30000 && customer.daysSinceLastOrder > 45) {
        segments.atRisk.push(customerWithValue);
      }
    }

    const stats = {};
    for (const [key, value] of Object.entries(segments)) {
      stats[key] = {
        count: value.length,
        totalValue: value.reduce((sum, c) => sum + c.historical.totalSpent, 0),
        predictedValue: value.reduce((sum, c) => sum + c.predicted.predicted3Years, 0),
        averageValue:
          value.length > 0
            ? value.reduce((sum, c) => sum + c.historical.totalSpent, 0) / value.length
            : 0,
      };
    }

    this.calculations.segments = { segments, stats };
    return this.calculations.segments;
  }

  // ========== حساب القيمة الدائمة للعملاء (نسخة واحدة فقط) ==========

  async calculateCustomerLifetimeValue() {
    const customers = await CustomerAnalyticsService.getAllCustomers();

    let totalValue = 0;
    const customerValues = [];

    for (let i = 0; i < customers.length; i++) {
      const currentCustomer = customers[i];
      const historical = this.calculateHistoricalValue(currentCustomer);
      const predicted = await this.calculatePredictedValue(currentCustomer);

      const valueData = {
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        historical: historical.totalSpent,
        predicted1Year: predicted.predicted12Months,
        predicted3Years: predicted.predicted3Years,
        predictedLifetime: predicted.predictedLifetime,
        trend: predicted.trend,
        confidence: predicted.confidence,
      };

      customerValues.push(valueData);
      totalValue += predicted.predictedLifetime;
    }

    customerValues.sort((a, b) => b.predictedLifetime - a.predictedLifetime);

    return {
      totalLTV: Math.round(totalValue),
      averageLTV: customers.length > 0 ? Math.round(totalValue / customers.length) : 0,
      top10Percent: customerValues.slice(0, Math.ceil(customers.length * 0.1)),
      allCustomers: customerValues,
    };
  }

  // ========== إحصائيات القيمة ==========

  async getValueStats() {
    const customers = await CustomerAnalyticsService.getAllCustomers();
    const ltv = await this.calculateCustomerLifetimeValue();
    const segments = await this.analyzeValueSegments();

    const valueDistribution = {
      under1000: customers.filter((c) => c.totalSpent < 1000).length,
      under5000: customers.filter((c) => c.totalSpent >= 1000 && c.totalSpent < 5000).length,
      under10000: customers.filter((c) => c.totalSpent >= 5000 && c.totalSpent < 10000).length,
      under50000: customers.filter((c) => c.totalSpent >= 10000 && c.totalSpent < 50000).length,
      over50000: customers.filter((c) => c.totalSpent >= 50000).length,
    };

    return {
      totalLTV: ltv.totalLTV,
      averageLTV: ltv.averageLTV,
      segments: segments.stats,
      distribution: valueDistribution,
      topCustomer: ltv.top10Percent[0],
      potentialGrowth:
        segments.stats.potential.predictedValue - segments.stats.potential.totalValue,
      atRiskValue: segments.stats.atRisk.totalValue,
    };
  }

  // تحديث جميع الحسابات
  async refreshAll() {
    await this.analyzeValueSegments();
    await this.calculateCustomerLifetimeValue();

    return {
      success: true,
      stats: await this.getValueStats(),
    };
  }
}

export default new CustomerValue();
