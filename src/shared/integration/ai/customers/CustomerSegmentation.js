// src/integration/ai/customers/CustomerSegmentation.js
import CustomerAnalyticsService from './CustomerAnalyticsService';

class CustomerSegmentation {
  constructor() {
    this.segments = {
      byValue: null,
      byBehavior: null,
      byEngagement: null,
      byLifecycle: null,
    };
  }

  // ========== تقسيم حسب سلوك الشراء ==========

  async segmentByBehavior() {
    const customers = await CustomerAnalyticsService.getAllCustomers();

    const segments = {
      bulkBuyers: [], // مشترون بالجملة (كميات كبيرة)
      frequentBuyers: [], // مشترون متكررون (طلبات كثيرة)
      highValue: [], // إنفاق عالي
      seasonal: [], // موسميون (يشترون في مواسم محددة)
      explorers: [], // مستكشفون (يشترون منتجات متنوعة)
    };

    customers.forEach((customer) => {
      // مشترون بالجملة (أكثر من 5 قطع في المتوسط)
      const avgQuantity = customer.totalSpent / (customer.avgOrderValue || 1);
      if (avgQuantity > 5) {
        segments.bulkBuyers.push(customer);
      }

      // مشترون متكررون (أكثر من 5 طلبات)
      if (customer.totalOrders >= 5) {
        segments.frequentBuyers.push(customer);
      }

      // إنفاق عالي (أكثر من ضعف المتوسط)
      const avgSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length;
      if (customer.totalSpent > avgSpent * 2) {
        segments.highValue.push(customer);
      }

      // موسميون (فجوة بين الطلبات أكبر من 60 يوم)
      if (customer.orderFrequency > 60) {
        segments.seasonal.push(customer);
      }

      // مستكشفون (اشتروا من أكثر من 3 فئات مختلفة)
      if (Object.keys(customer.categories || {}).length >= 3) {
        segments.explorers.push(customer);
      }
    });

    // إحصائيات كل شريحة
    const stats = {};
    for (const [key, value] of Object.entries(segments)) {
      stats[key] = {
        count: value.length,
        percentage: (value.length / customers.length) * 100,
        totalRevenue: value.reduce((sum, c) => sum + c.totalSpent, 0),
        avgOrderValue: this.calculateAverage(value.map((c) => c.avgOrderValue)),
      };
    }

    this.segments.byBehavior = { segments, stats };
    return this.segments.byBehavior;
  }

  // ========== تقسيم حسب التفاعل ==========

  async segmentByEngagement() {
    const customers = await CustomerAnalyticsService.getAllCustomers();

    const segments = {
      highlyEngaged: [], // تفاعل عالي (طلبات متكررة + حديثة)
      engaged: [], // متفاعل
      atRisk: [], // معرض للخطر (لم يشتروا منذ 30-60 يوم)
      lost: [], // مفقودون (أكثر من 90 يوم)
      new: [], // جدد (أقل من 30 يوم)
    };

    customers.forEach((customer) => {
      if (customer.daysSinceLastOrder <= 15 && customer.totalOrders >= 3) {
        segments.highlyEngaged.push(customer);
      } else if (customer.daysSinceLastOrder <= 30) {
        segments.engaged.push(customer);
      } else if (customer.daysSinceLastOrder > 30 && customer.daysSinceLastOrder <= 60) {
        segments.atRisk.push(customer);
      } else if (customer.daysSinceLastOrder > 90) {
        segments.lost.push(customer);
      }

      if (customer.daysSinceLastOrder <= 30 && customer.totalOrders === 1) {
        segments.new.push(customer);
      }
    });

    // إحصائيات
    const stats = {};
    for (const [key, value] of Object.entries(segments)) {
      stats[key] = {
        count: value.length,
        percentage: (value.length / customers.length) * 100,
        potentialRevenue: value.reduce((sum, c) => sum + c.avgOrderValue * 2, 0),
      };
    }

    this.segments.byEngagement = { segments, stats };
    return this.segments.byEngagement;
  }

  // ========== تقسيم حسب دورة الحياة ==========

  async segmentByLifecycle() {
    const customers = await CustomerAnalyticsService.getAllCustomers();

    const segments = {
      acquisition: [], // اكتساب (أول طلب)
      growth: [], // نمو (2-4 طلبات)
      maturity: [], // نضج (5+ طلبات)
      decline: [], // تراجع (لم يشتروا منذ 60+ يوم)
      reactivation: [], // إعادة تنشيط (عاد بعد انقطاع)
    };

    customers.forEach((customer) => {
      if (customer.totalOrders === 1 && customer.daysSinceLastOrder <= 30) {
        segments.acquisition.push(customer);
      } else if (customer.totalOrders >= 2 && customer.totalOrders <= 4) {
        segments.growth.push(customer);
      } else if (customer.totalOrders >= 5) {
        segments.maturity.push(customer);
      }

      if (customer.daysSinceLastOrder > 60 && customer.daysSinceLastOrder <= 90) {
        segments.decline.push(customer);
      }

      // إعادة تنشيط: لديه فجوة ثم عاد للشراء
      if (customer.orderDates.length >= 2) {
        const dates = customer.orderDates.sort();
        const gaps = [];
        for (let i = 1; i < dates.length; i++) {
          const gap = (new Date(dates[i]) - new Date(dates[i - 1])) / (1000 * 60 * 60 * 24);
          gaps.push(gap);
        }

        const maxGap = Math.max(...gaps);
        if (maxGap > 90 && gaps[gaps.length - 1] < 30) {
          segments.reactivation.push(customer);
        }
      }
    });

    // إحصائيات
    const stats = {};
    for (const [key, value] of Object.entries(segments)) {
      stats[key] = {
        count: value.length,
        percentage: (value.length / customers.length) * 100,
        totalValue: value.reduce((sum, c) => sum + c.totalSpent, 0),
      };
    }

    this.segments.byLifecycle = { segments, stats };
    return this.segments.byLifecycle;
  }

  // ========== تقسيم حسب القيمة المتوقعة ==========

  async segmentByPredictedValue() {
    const customers = await CustomerAnalyticsService.getAllCustomers();

    // حساب نقاط لكل عميل
    const scored = customers.map((customer) => {
      let score = 0;

      // قيمة المشتريات السابقة (0-40 نقطة)
      const valueScore = Math.min(40, (customer.totalSpent / 10000) * 40);

      // تكرار الشراء (0-30 نقطة)
      const frequencyScore = Math.min(30, customer.totalOrders * 5);

      //حداثة آخر شراء (0-20 نقطة)
      const recencyScore = Math.max(0, 20 - customer.daysSinceLastOrder);

      // تنوع المنتجات (0-10 نقاط)
      const diversityScore = Math.min(10, Object.keys(customer.categories || {}).length * 2);

      score = valueScore + frequencyScore + recencyScore + diversityScore;

      let segment = 'منخفض';
      if (score >= 80) segment = 'ممتاز';
      else if (score >= 60) segment = 'عالي';
      else if (score >= 40) segment = 'متوسط';

      return {
        ...customer,
        score: Math.round(score),
        segment,
      };
    });

    // تجميع حسب الشريحة
    const segments = {
      ممتاز: scored.filter((c) => c.segment === 'ممتاز'),
      عالي: scored.filter((c) => c.segment === 'عالي'),
      متوسط: scored.filter((c) => c.segment === 'متوسط'),
      منخفض: scored.filter((c) => c.segment === 'منخفض'),
    };

    const stats = {};
    for (const [key, value] of Object.entries(segments)) {
      stats[key] = {
        count: value.length,
        percentage: (value.length / customers.length) * 100,
        avgScore: this.calculateAverage(value.map((c) => c.score)),
        totalValue: value.reduce((sum, c) => sum + c.totalSpent, 0),
      };
    }

    return { segments, stats, scored };
  }

  // ========== توصيات تسويقية حسب الشريحة ==========

  async getMarketingRecommendations() {
    await this.segmentByEngagement();
    await this.segmentByLifecycle();
    await this.segmentByPredictedValue();

    const recommendations = [];

    // توصيات للمتفاعلين
    if (this.segments.byEngagement?.stats?.highlyEngaged?.count > 0) {
      recommendations.push({
        segment: 'highlyEngaged',
        title: '🎯 العملاء المتفاعلون',
        message: `${this.segments.byEngagement.stats.highlyEngaged.count} عميل متفاعل`,
        actions: ['أرسل لهم عروض VIP حصرية', 'اطلب منهم تقييمات للمنتجات', 'قدم لهم برنامج ولاء'],
        priority: 'high',
      });
    }

    // توصيات للمعرضين للخطر
    if (this.segments.byEngagement?.stats?.atRisk?.count > 0) {
      recommendations.push({
        segment: 'atRisk',
        title: '⚠️ عملاء معرضون للخطر',
        message: `${this.segments.byEngagement.stats.atRisk.count} عميل لم يشتروا منذ 30-60 يوم`,
        actions: ['أرسل لهم عروض إعادة تنشيط', 'استفسر عن سبب التوقف', 'قدم خصم خاص لعودتهم'],
        priority: 'urgent',
      });
    }

    // توصيات للعملاء الجدد
    if (this.segments.byEngagement?.stats?.new?.count > 0) {
      recommendations.push({
        segment: 'new',
        title: '🌟 عملاء جدد',
        message: `${this.segments.byEngagement.stats.new.count} عميل جديد هذا الشهر`,
        actions: [
          'أرسل لهم رسالة ترحيب',
          'قدم خصم للطلب الثاني',
          'اطلب منهم متابعة على وسائل التواصل',
        ],
        priority: 'medium',
      });
    }

    // توصيات للعملاء المفقودين
    if (this.segments.byEngagement?.stats?.lost?.count > 0) {
      recommendations.push({
        segment: 'lost',
        title: '📉 عملاء مفقودون',
        message: `${this.segments.byEngagement.stats.lost.count} عميل لم يشتروا منذ 90+ يوم`,
        actions: ['حاول إعادة التواصل عبر البريد', 'قدم عرض قوي للعودة', 'اسأل عن سبب الانقطاع'],
        priority: 'low',
      });
    }

    return recommendations;
  }

  // ========== أدوات مساعدة ==========

  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  // الحصول على جميع التقسيمات
  async getAllSegments() {
    await this.segmentByBehavior();
    await this.segmentByEngagement();
    await this.segmentByLifecycle();
    await this.segmentByPredictedValue();

    return this.segments;
  }
}

export default new CustomerSegmentation();
