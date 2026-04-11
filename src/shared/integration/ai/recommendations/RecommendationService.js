// src/integration/ai/recommendations/RecommendationService.js
import ProductAffinity from './ProductAffinity';
import CollaborativeFilter from './CollaborativeFilter';
import DataCollector from '@/shared/integration/ai/forecasting/data/DataCollector';
import AlertService from '@/shared/integration/services/AlertService';

class RecommendationService {
  constructor() {
    this.cache = {
      general: null,
      personalized: new Map(),
      lastUpdate: null,
    };
  }

  // تهيئة النظام
  async initialize() {
    console.log('جاري تهيئة نظام التوصيات...');

    // حساب الارتباطات بين المنتجات
    await ProductAffinity.calculateAffinities();

    // حساب تشابه المستخدمين
    await CollaborativeFilter.calculateAllSimilarities();

    this.cache.lastUpdate = new Date().toISOString();

    return {
      success: true,
      lastUpdate: this.cache.lastUpdate,
    };
  }

  // ========== توصيات عامة ==========

  // المنتجات الأكثر مبيعاً
  async getTopSellingProducts(limit = 10) {
    return ProductAffinity.getGeneralRecommendations(limit);
  }

  // المنتجات الرائجة (الأكثر مشاهدة/شراء في آخر 7 أيام)
  async getTrendingProducts(limit = 10) {
    const data = await DataCollector.collectAllData();
    const orders = data.orders || [];

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentSales = new Map();

    orders.forEach((order) => {
      const orderDate = new Date(order.date);
      if (orderDate >= lastWeek) {
        const items = order.items || [];
        items.forEach((item) => {
          if (item.id) {
            recentSales.set(item.id, (recentSales.get(item.id) || 0) + (item.quantity || 1));
          }
        });
      }
    });

    const products = data.products || [];
    const trending = products
      .map((p) => ({
        ...p,
        recentSales: recentSales.get(p.id) || 0,
      }))
      .filter((p) => p.recentSales > 0)
      .sort((a, b) => b.recentSales - a.recentSales)
      .slice(0, limit);

    return trending;
  }

  // ========== توصيات للمنتجات ==========

  // المنتجات التي تُشترى معاً
  async getFrequentlyBoughtTogether(productId, limit = 5) {
    const recommendations = ProductAffinity.getRecommendationsForProduct(productId, limit);

    // جلب تفاصيل المنتجات
    const data = await DataCollector.collectAllData();
    const products = data.products || [];

    return recommendations.map((rec) => {
      const product = products.find((p) => p.id === rec.productId);
      return {
        ...rec,
        product: product || { id: rec.productId, name: `منتج ${rec.productId}` },
      };
    });
  }

  // منتجات مشابهة (بناءً على التصنيف والخصائص)
  async getSimilarProducts(productId, limit = 5) {
    const data = await DataCollector.collectAllData();
    const products = data.products || [];

    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return [];

    // حساب التشابه بناءً على التصنيف والسعر
    const similar = products
      .filter((p) => p.id !== productId && p.category === targetProduct.category)
      .map((p) => {
        // درجة التشابه (كلما كان السعر أقرب كلما زادت الدرجة)
        const priceDiff = Math.abs(p.price - targetProduct.price);
        const maxPrice = Math.max(p.price, targetProduct.price);
        const similarity = 1 - priceDiff / maxPrice;

        return {
          product: p,
          score: similarity,
        };
      })
      .filter((p) => p.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return similar;
  }

  // ========== توصيات مخصصة للمستخدم ==========

  // توصيات مخصصة لمستخدم معين
  async getPersonalizedRecommendations(userId, limit = 10, hybrid = true) {
    if (hybrid) {
      return this.getHybridRecommendations(userId, null, limit);
    }

    // الكود القديم للتوصيات التعاونية فقط
    if (this.cache.personalized.has(userId)) {
      return this.cache.personalized.get(userId);
    }

    const collabRecs = await CollaborativeFilter.getRecommendationsForUser(userId, limit);

    if (collabRecs.length === 0) {
      const generalRecs = await this.getTopSellingProducts(limit);
      this.cache.personalized.set(userId, generalRecs);
      return generalRecs;
    }

    const data = await DataCollector.collectAllData();
    const products = data.products || [];

    const recommendations = collabRecs.map((rec) => {
      const product = products.find((p) => p.id === rec.productId);
      return {
        ...rec,
        product: product || { id: rec.productId, name: `منتج ${rec.productId}` },
        type: 'collaborative',
      };
    });

    this.cache.personalized.set(userId, recommendations);
    return recommendations;
  }

  // المنتجات التي قد تهم المستخدم بناءً على سجل الشراء
  async getYouMightAlsoLike(userId, limit = 10) {
    const data = await DataCollector.collectAllData();
    const orders = data.orders || [];

    // المنتجات التي اشتراها المستخدم
    const userOrders = orders.filter((o) => o.customerId === userId || o.userId === userId);
    const userProducts = new Set();

    userOrders.forEach((order) => {
      const items = order.items || [];
      items.forEach((item) => {
        if (item.id) userProducts.add(item.id);
      });
    });

    // جمع التوصيات من كل منتج اشتراه المستخدم
    const recommendations = new Map();

    for (const productId of userProducts) {
      const together = await this.getFrequentlyBoughtTogether(productId, 5);
      together.forEach((item) => {
        if (!userProducts.has(item.productId)) {
          const current = recommendations.get(item.productId) || 0;
          recommendations.set(item.productId, current + item.score);
        }
      });
    }

    // ترتيب حسب الأهمية
    const sorted = Array.from(recommendations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    // جلب تفاصيل المنتجات
    const products = data.products || [];
    return sorted.map(([productId, score]) => {
      const product = products.find((p) => p.id === productId);
      return {
        product: product || { id: productId, name: `منتج ${productId}` },
        score: Math.round(score * 100) / 100,
        type: 'collaborative',
      };
    });
  }

  // ========== توصيات موسمية ==========

  // الحصول على الموسم الحالي
  getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12

    if (month >= 3 && month <= 5) return 'spring'; // ربيع
    if (month >= 6 && month <= 8) return 'summer'; // صيف
    if (month >= 9 && month <= 11) return 'autumn'; // خريف
    return 'winter'; // شتاء
  }

  // الحصول على اسم الموسم بالعربية
  getSeasonName(season) {
    const names = {
      spring: 'الربيع',
      summer: 'الصيف',
      autumn: 'الخريف',
      winter: 'الشتاء',
    };
    return names[season] || season;
  }

  // توصيات حسب الموسم
  async getSeasonalRecommendations(limit = 10) {
    const season = this.getCurrentSeason();
    const data = await DataCollector.collectAllData();
    const products = data.products || [];

    // كلمات مفتاحية موسمية
    const seasonalKeywords = {
      spring: ['زهور', 'ربيع', 'ألوان فاتحة', 'طبيعة'],
      summer: ['شمس', 'صيف', 'بحر', 'سفر', 'سيارة'],
      autumn: ['خريف', 'أوراق', 'ألوان دافئة'],
      winter: ['شتاء', 'ثلج', 'أحمر', 'دافئ'],
    };

    // اختيار المنتجات المناسبة للموسم
    const keywords = seasonalKeywords[season] || [];
    const seasonalProducts = products
      .map((p) => {
        // حساب درجة الملاءمة للموسم
        let score = 0.5; // درجة أساسية

        // زيادة الدرجة إذا كان اسم المنتج يحتوي على كلمات موسمية
        keywords.forEach((keyword) => {
          if (p.name.includes(keyword) || (p.description && p.description.includes(keyword))) {
            score += 0.2;
          }
        });

        // منتجات معينة تناسب مواسم محددة
        if (season === 'summer' && p.category === 'cars') score += 0.3;
        if (season === 'winter' && p.category === 'walls') score += 0.3;
        if (season === 'spring' && p.category === 'walls') score += 0.3;

        return {
          product: p,
          score: Math.min(score, 1.0),
          season,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return seasonalProducts;
  }

  // توصيات للمناسبات القادمة
  async getEventRecommendations(limit = 10) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // تحديد المناسبة الحالية أو القادمة
    let event = null;
    let daysUntil = 0;

    // تقويم المناسبات (يمكن توسيعه)
    const events = [
      { name: 'عيد الحب', month: 2, day: 14, keywords: ['حب', 'رومانسي', 'أحمر', 'قلب'] },
      { name: 'عيد الأم', month: 3, day: 21, keywords: ['أم', 'هدية', 'عائلة'] },
      { name: 'رمضان', month: 9, keywords: ['رمضان', 'فانوس', 'زينة'] }, // الشهر متغير
      { name: 'العيد', month: 10, keywords: ['عيد', 'هدية', 'فرح'] },
      { name: 'العودة للمدارس', month: 9, day: 20, keywords: ['مدرسة', 'طالب', 'دراسة'] },
      { name: 'نهاية السنة', month: 12, keywords: ['سنة جديدة', 'هدية', 'احتفال'] },
    ];

    // البحث عن أقرب مناسبة
    for (const e of events) {
      if (e.month === month && (!e.day || e.day >= day)) {
        event = e;
        daysUntil = e.day ? e.day - day : 0;
        break;
      }
    }

    if (!event) return [];

    const data = await DataCollector.collectAllData();
    const products = data.products || [];

    // اختيار منتجات مناسبة للمناسبة
    const eventProducts = products
      .map((p) => {
        let score = 0.5;

        event.keywords.forEach((keyword) => {
          if (p.name.includes(keyword) || (p.description && p.description.includes(keyword))) {
            score += 0.25;
          }
        });

        return {
          product: p,
          score: Math.min(score, 1.0),
          event: event.name,
          daysUntil,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return eventProducts;
  }

  // ========== توصيات المخزون ==========

  // توصيات لتعويض المنتجات التي ستنفد قريباً
  async getLowStockRecommendations(limit = 10) {
    const data = await DataCollector.collectAllData();
    const products = data.products || [];
    const orders = data.orders || [];

    // حساب سرعة البيع (آخر 30 يوم)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const salesSpeed = new Map();

    orders.forEach((order) => {
      const orderDate = new Date(order.date);
      if (orderDate >= lastMonth) {
        const items = order.items || [];
        items.forEach((item) => {
          if (item.id) {
            salesSpeed.set(item.id, (salesSpeed.get(item.id) || 0) + (item.quantity || 1));
          }
        });
      }
    });

    // حساب المنتجات المنخفضة
    const lowStock = products
      .map((p) => {
        const monthlySales = salesSpeed.get(p.id) || 0;
        const avgDailySales = monthlySales / 30;
        const daysRemaining = avgDailySales > 0 ? Math.floor(p.stock / avgDailySales) : 999;

        return {
          product: p,
          daysRemaining,
          monthlySales,
          stock: p.stock,
          score: daysRemaining < 15 ? 1.0 - daysRemaining / 30 : 0,
          priority: daysRemaining < 7 ? 'high' : daysRemaining < 15 ? 'medium' : 'low',
        };
      })
      .filter((p) => p.daysRemaining < 30) // أقل من شهر
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, limit);

    return lowStock;
  }

  // عروض مجمعة (المنتجات التي تُباع معاً بكثرة)
  async getBundleRecommendations(limit = 5) {
    const bundles = [];

    // جمع أقوى الارتباطات من ProductAffinity
    ProductAffinity.affinityMatrix.forEach((recs, productId) => {
      if (recs.length >= 2) {
        // تشكيل عروض مجمعة من أقرب منتجين
        bundles.push({
          mainProductId: productId,
          withProductId: recs[0].productId,
          alsoWithId: recs[1]?.productId,
          score: (recs[0].score + (recs[1]?.score || 0)) / 2,
          frequency: recs[0].frequency + (recs[1]?.frequency || 0),
        });
      }
    });

    // ترتيب حسب التكرار
    const topBundles = bundles.sort((a, b) => b.frequency - a.frequency).slice(0, limit);

    const data = await DataCollector.collectAllData();
    const products = data.products || [];

    return topBundles.map((bundle) => {
      const mainProduct = products.find((p) => p.id === bundle.mainProductId);
      const withProduct = products.find((p) => p.id === bundle.withProductId);
      const alsoWith = bundle.alsoWithId ? products.find((p) => p.id === bundle.alsoWithId) : null;

      // حساب سعر العرض (خصم 10% على المجموعة)
      const totalPrice =
        (mainProduct?.price || 0) + (withProduct?.price || 0) + (alsoWith?.price || 0);
      const discountedPrice = totalPrice * 0.9;

      return {
        mainProduct,
        products: [mainProduct, withProduct, alsoWith].filter((p) => p),
        originalPrice: totalPrice,
        discountedPrice: Math.round(discountedPrice),
        savings: Math.round(totalPrice * 0.1),
        score: bundle.score,
        frequency: bundle.frequency,
      };
    });
  }

  // ========== توصيات هجينة ==========

  // توصيات هجينة تجمع بين عدة مصادر
  async getHybridRecommendations(userId = null, productId = null, limit = 10) {
    const sources = [];
    const weights = {
      collaborative: 0.3,
      seasonal: 0.2,
      event: 0.15,
      similar: 0.15,
      together: 0.1,
      lowStock: 0.05,
      general: 0.05,
    };

    // 1. توصيات تعاونية (إذا كان هناك مستخدم)
    if (userId) {
      const collab = await this.getPersonalizedRecommendations(userId, limit, false);
      sources.push(
        ...collab.map((r) => ({
          ...r,
          source: 'collaborative',
          weight: weights.collaborative,
        }))
      );
    }

    // 2. توصيات موسمية
    const seasonal = await this.getSeasonalRecommendations(limit);
    sources.push(
      ...seasonal.map((r) => ({
        ...r,
        source: 'seasonal',
        weight: weights.seasonal,
      }))
    );

    // 3. توصيات مناسبات
    const events = await this.getEventRecommendations(limit);
    sources.push(
      ...events.map((r) => ({
        ...r,
        source: 'event',
        weight: weights.event,
      }))
    );

    // 4. توصيات محتوى (إذا كان هناك منتج)
    if (productId) {
      const similar = await this.getSimilarProducts(productId, limit);
      sources.push(
        ...similar.map((r) => ({
          ...r,
          source: 'similar',
          weight: weights.similar,
        }))
      );

      const together = await this.getFrequentlyBoughtTogether(productId, limit);
      sources.push(
        ...together.map((r) => ({
          ...r,
          source: 'together',
          weight: weights.together,
        }))
      );
    }

    // 5. توصيات مخزون منخفض (للترويج للمنتجات التي ستنفد)
    const lowStock = await this.getLowStockRecommendations(limit);
    sources.push(
      ...lowStock.map((r) => ({
        product: r.product,
        score: r.score,
        source: 'lowStock',
        weight: weights.lowStock,
      }))
    );

    // 6. توصيات عامة (للملء)
    if (sources.length < limit * 2) {
      const general = await this.getTopSellingProducts(limit);
      sources.push(
        ...general.map((p) => ({
          product: p,
          score: 0.5,
          source: 'general',
          weight: weights.general,
        }))
      );
    }

    // تجميع وتوحيد الدرجات
    const combined = this.aggregateHybridRecommendations(sources, limit);

    return combined;
  }

  // تجميع التوصيات الهجينة
  aggregateHybridRecommendations(sources, limit) {
    const scoreMap = new Map();

    sources.forEach((item) => {
      const productId = item.product?.id || item.id;
      if (!productId) return;

      const current = scoreMap.get(productId) || {
        score: 0,
        sources: [],
        product: item.product || item,
        details: {},
      };

      // إضافة الدرجة مع الوزن
      const itemScore = item.score || 0.5;
      current.score += itemScore * (item.weight || 0.1);

      // تسجيل المصادر
      if (!current.sources.includes(item.source)) {
        current.sources.push(item.source);
      }

      // حفظ تفاصيل إضافية
      if (item.event) current.details.event = item.event;
      if (item.daysUntil) current.details.daysUntil = item.daysUntil;
      if (item.priority) current.details.priority = item.priority;
      if (item.season) current.details.season = item.season;

      scoreMap.set(productId, current);
    });

    return Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => ({
        product: item.product,
        score: Math.round(item.score * 100) / 100,
        sources: item.sources,
        type: item.sources[0], // النوع الرئيسي
        details: item.details,
      }));
  }

  // ========== تحليلات التوصيات ==========

  // إحصائيات أداء التوصيات
  async getRecommendationsAnalytics() {
    // const data = await DataCollector.collectAllData();
    // const orders = data.orders || []; // 👈 غير مستخدم - تم التعليق عليه

    // تحليل مدى تأثير التوصيات (إذا كان لدينا بيانات عن النقرات)
    // هذه إحصائيات افتراضية

    return {
      totalRecommendations: 1250,
      clickThroughRate: 0.35, // 35%
      conversionRate: 0.12, // 12%
      averageOrderValue: 850,
      topPerformingCategories: [
        { category: 'walls', revenue: 45000 },
        { category: 'cars', revenue: 32000 },
        { category: 'doors', revenue: 28000 },
      ],
      lastUpdate: this.cache.lastUpdate,
    };
  }

  // تسجيل تفاعل المستخدم مع توصية
  async trackRecommendationClick(userId, productId, recommendationType) {
    const key = `rec_click_${new Date().toISOString().split('T')[0]}`;

    // تخزين في localStorage مؤقتاً (يمكن استبداله بقاعدة بيانات)
    let stats = JSON.parse(localStorage.getItem(key) || '{}');

    if (!stats[recommendationType]) {
      stats[recommendationType] = { clicks: 0, conversions: 0 };
    }

    stats[recommendationType].clicks += 1;
    localStorage.setItem(key, JSON.stringify(stats));

    return { success: true };
  }

  // تسجيل تحويل (شراء) بعد توصية
  async trackRecommendationConversion(userId, productId, recommendationType) {
    const key = `rec_click_${new Date().toISOString().split('T')[0]}`;

    let stats = JSON.parse(localStorage.getItem(key) || '{}');

    if (!stats[recommendationType]) {
      stats[recommendationType] = { clicks: 0, conversions: 0 };
    }

    stats[recommendationType].conversions += 1;
    localStorage.setItem(key, JSON.stringify(stats));

    return { success: true };
  }

  // حساب أداء التوصيات
  async getRecommendationPerformance(days = 30) {
    const performance = {
      daily: [],
      byType: {},
      total: { clicks: 0, conversions: 0, ctr: 0 },
    };

    // تجميع الإحصائيات من الأيام الماضية
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = `rec_click_${date.toISOString().split('T')[0]}`;

      try {
        const dayStats = JSON.parse(localStorage.getItem(key) || '{}');

        // إحصائيات اليوم
        let dayClicks = 0;
        let dayConversions = 0;

        Object.entries(dayStats).forEach(([type, stat]) => {
          dayClicks += stat.clicks || 0;
          dayConversions += stat.conversions || 0;

          if (!performance.byType[type]) {
            performance.byType[type] = { clicks: 0, conversions: 0 };
          }
          performance.byType[type].clicks += stat.clicks || 0;
          performance.byType[type].conversions += stat.conversions || 0;
        });

        performance.daily.push({
          date: date.toISOString().split('T')[0],
          clicks: dayClicks,
          conversions: dayConversions,
          ctr: dayClicks > 0 ? dayConversions / dayClicks : 0,
        });

        performance.total.clicks += dayClicks;
        performance.total.conversions += dayConversions;
      } catch (e) {
        // تجاهل الأخطاء
      }
    }

    // حساب النسب المئوية
    performance.total.ctr =
      performance.total.clicks > 0 ? performance.total.conversions / performance.total.clicks : 0;

    // ترتيب حسب التاريخ
    performance.daily.sort((a, b) => new Date(a.date) - new Date(b.date));

    return performance;
  }

  // ========== أدوات مساعدة ==========

  // تحديث جميع النماذج
  async refreshAll() {
    await this.initialize();

    // إرسال تنبيه
    await AlertService.sendAlert({
      type: 'info',
      category: 'system',
      severity: 'low',
      title: '🤖 تحديث نظام التوصيات',
      message: 'تم تحديث نماذج التوصيات بنجاح',
      actionable: false,
    });

    return { success: true, lastUpdate: this.cache.lastUpdate };
  }

  // الحصول على آخر تحديث
  getLastUpdate() {
    return this.cache.lastUpdate;
  }
}

export default new RecommendationService();
