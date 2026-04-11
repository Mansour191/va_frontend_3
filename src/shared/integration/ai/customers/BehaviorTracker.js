// src/integration/ai/customers/BehaviorTracker.js
// import DataCollector from '../forecasting/data/DataCollector';

class BehaviorTracker {
  constructor() {
    this.behaviors = {
      views: new Map(), // مشاهدات المنتجات
      searches: new Map(), // عمليات البحث
      cart: new Map(), // إضافات للسلة
      wishlist: new Map(), // قائمة الرغبات
      timeSpent: new Map(), // وقت التصفح
    };

    this.sessions = new Map(); // جلسات التصفح
  }

  // ========== تسجيل السلوك ==========

  // تسجيل مشاهدة منتج
  async trackProductView(userId, productId, productData) {
    const key = `${userId}_${productId}`;
    const now = new Date().toISOString();

    if (!this.behaviors.views.has(key)) {
      this.behaviors.views.set(key, {
        userId,
        productId,
        productName: productData.name,
        category: productData.category,
        price: productData.price,
        firstView: now,
        lastView: now,
        viewCount: 1,
      });
    } else {
      const view = this.behaviors.views.get(key);
      view.lastView = now;
      view.viewCount += 1;
    }

    // حفظ في localStorage (مؤقت)
    await this.persistBehavior('views', key, this.behaviors.views.get(key));

    return { success: true };
  }

  // تسجيل عملية بحث
  async trackSearch(userId, searchQuery, resultsCount) {
    const key = `${userId}_${Date.now()}`; // معرف فريد للبحث
    const search = {
      id: key, // 👈 استخدم المتغير كمعرف للبحث
      userId,
      query: searchQuery,
      resultsCount,
      timestamp: new Date().toISOString(),
      converted: false,
    };

    if (!this.behaviors.searches.has(userId)) {
      this.behaviors.searches.set(userId, []);
    }
    this.behaviors.searches.get(userId).push(search);

    // حفظ آخر 50 بحث فقط
    const searches = this.behaviors.searches.get(userId);
    if (searches.length > 50) {
      searches.shift();
    }

    await this.persistBehavior('searches', userId, searches);

    return search;
  }

  // تسجيل إضافة إلى السلة
  async trackAddToCart(userId, productId, productData, quantity = 1) {
    const key = `${userId}_${productId}`;
    const now = new Date().toISOString();

    if (!this.behaviors.cart.has(key)) {
      this.behaviors.cart.set(key, {
        userId,
        productId,
        productName: productData.name,
        price: productData.price,
        quantity,
        addedAt: now,
        updatedAt: now,
        purchased: false,
      });
    } else {
      const cart = this.behaviors.cart.get(key);
      cart.quantity += quantity;
      cart.updatedAt = now;
    }

    await this.persistBehavior('cart', key, this.behaviors.cart.get(key));

    return { success: true };
  }

  // تسجيل إزالة من السلة
  async trackRemoveFromCart(userId, productId) {
    const key = `${userId}_${productId}`;

    if (this.behaviors.cart.has(key)) {
      this.behaviors.cart.delete(key);
      await this.persistBehavior('cart', key, null, true); // حذف
    }

    return { success: true };
  }

  // تسجيل تحويل (شراء) لمنتج في السلة
  async trackPurchase(userId, productId, orderId) {
    const key = `${userId}_${productId}`;

    if (this.behaviors.cart.has(key)) {
      const cart = this.behaviors.cart.get(key);
      cart.purchased = true;
      cart.orderId = orderId;
      cart.purchasedAt = new Date().toISOString();

      await this.persistBehavior('cart', key, cart);
    }

    // تحديث آخر بحث أدى لشراء
    const searches = this.behaviors.searches.get(userId) || [];
    const lastSearch = searches[searches.length - 1];
    if (lastSearch) {
      lastSearch.converted = true;
    }

    return { success: true };
  }

  // تسجيل وقت التصفح
  async trackTimeSpent(userId, page, seconds) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${userId}_${today}`;

    if (!this.behaviors.timeSpent.has(key)) {
      this.behaviors.timeSpent.set(key, {
        userId,
        date: today,
        pages: {},
        total: 0,
      });
    }

    const timeData = this.behaviors.timeSpent.get(key);
    timeData.pages[page] = (timeData.pages[page] || 0) + seconds;
    timeData.total += seconds;

    await this.persistBehavior('timeSpent', key, timeData);

    return timeData;
  }

  // ========== تحليل السلوك ==========

  // تحليل سلوك مستخدم معين
  async analyzeUserBehavior(userId) {
    const views = this.getUserViews(userId);
    const searches = this.behaviors.searches.get(userId) || [];
    const cart = this.getUserCart(userId);
    const timeSpent = this.getUserTimeSpent(userId);

    // المنتجات الأكثر مشاهدة
    const topViewed = views.sort((a, b) => b.viewCount - a.viewCount).slice(0, 10);

    // الفئات المفضلة
    const categoryCount = {};
    views.forEach((view) => {
      categoryCount[view.category] = (categoryCount[view.category] || 0) + view.viewCount;
    });

    const favoriteCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // تحليل عمليات البحث
    const searchQueries = searches.map((s) => s.query);
    const searchPatterns = this.analyzeSearchPatterns(searches);

    // تحليل السلة
    const cartAnalysis = this.analyzeCart(cart);

    // متوسط وقت التصفح
    const avgTimePerDay =
      timeSpent.length > 0 ? timeSpent.reduce((sum, t) => sum + t.total, 0) / timeSpent.length : 0;

    return {
      userId,
      views: {
        total: views.length,
        unique: new Set(views.map((v) => v.productId)).size,
        topViewed,
        favoriteCategories,
      },
      searches: {
        total: searches.length,
        queries: searchQueries,
        patterns: searchPatterns,
        conversionRate: searches.filter((s) => s.converted).length / (searches.length || 1),
      },
      cart: cartAnalysis,
      timeSpent: {
        total: timeSpent.reduce((sum, t) => sum + t.total, 0),
        averagePerDay: avgTimePerDay,
        byPage: this.aggregatePageTime(timeSpent),
      },
      recommendations: this.generateBehaviorRecommendations({
        views,
        searches,
        cart,
        favoriteCategories,
      }),
    };
  }

  // الحصول على مشاهدات مستخدم
  getUserViews(userId) {
    const views = [];
    this.behaviors.views.forEach((view) => {
      if (view.userId === userId) {
        views.push(view);
      }
    });
    return views;
  }

  // الحصول على سلة مستخدم
  getUserCart(userId) {
    const cart = [];
    this.behaviors.cart.forEach((item) => {
      if (item.userId === userId && !item.purchased) {
        cart.push(item);
      }
    });
    return cart;
  }

  // الحصول على وقت تصفح مستخدم
  getUserTimeSpent(userId) {
    const timeSpent = [];
    this.behaviors.timeSpent.forEach((data) => {
      if (data.userId === userId) {
        timeSpent.push(data);
      }
    });
    return timeSpent;
  }

  // تحليل أنماط البحث
  analyzeSearchPatterns(searches) {
    if (searches.length === 0) return {};

    const patterns = {
      byHour: Array(24).fill(0),
      byDayOfWeek: Array(7).fill(0),
      commonTerms: {},
    };

    searches.forEach((search) => {
      const hour = new Date(search.timestamp).getHours();
      const day = new Date(search.timestamp).getDay();

      patterns.byHour[hour]++;
      patterns.byDayOfWeek[day]++;

      // تحليل الكلمات المفتاحية
      const terms = search.query.split(' ');
      terms.forEach((term) => {
        if (term.length > 2) {
          patterns.commonTerms[term] = (patterns.commonTerms[term] || 0) + 1;
        }
      });
    });

    // أكثر الكلمات بحثاً
    patterns.topTerms = Object.entries(patterns.commonTerms)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return patterns;
  }

  // تحليل السلة
  analyzeCart(cart) {
    if (cart.length === 0) {
      return {
        items: 0,
        totalValue: 0,
        abandoned: false,
      };
    }

    const totalValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const now = new Date();

    // هل السلة متروكة؟ (آخر تحديث منذ أكثر من 24 ساعة)
    const abandoned = cart.some((item) => {
      const updated = new Date(item.updatedAt);
      const hoursDiff = (now - updated) / (1000 * 60 * 60);
      return hoursDiff > 24;
    });

    return {
      items: cart.length,
      totalValue,
      averageItemPrice: totalValue / cart.length,
      abandoned,
      products: cart.map((item) => ({
        productId: item.productId,
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
        addedAt: item.addedAt,
      })),
    };
  }

  // تجميع وقت التصفح حسب الصفحة
  aggregatePageTime(timeSpent) {
    const pageTime = {};

    timeSpent.forEach((day) => {
      Object.entries(day.pages).forEach(([page, seconds]) => {
        pageTime[page] = (pageTime[page] || 0) + seconds;
      });
    });

    return Object.entries(pageTime)
      .map(([page, seconds]) => ({ page, seconds: Math.round(seconds / 60) })) // بالدقائق
      .sort((a, b) => b.seconds - a.seconds);
  }

  // توليد توصيات سلوكية
  generateBehaviorRecommendations({ views, searches, cart, favoriteCategories }) {
    const recommendations = [];

    // إذا كان لديه منتجات في السلة
    if (cart.length > 0 && cart.some((item) => !item.purchased)) {
      recommendations.push({
        type: 'cart',
        title: '🛒 سلة متروكة',
        message: 'لديك منتجات في السلة لم يتم شراؤها',
        action: 'تذكير العميل بإتمام الشراء',
      });
    }

    // إذا كان يبحث كثيراً
    if (searches.length > 10) {
      recommendations.push({
        type: 'search',
        title: '🔍 باحث نشط',
        message: 'هذا العميل يبحث كثيراً لكنه لا يشتري',
        action: 'أرسل له عروض مخصصة بناءً على بحثه',
      });
    }

    // إذا كانت لديه فئة مفضلة
    if (favoriteCategories.length > 0) {
      const topCategory = favoriteCategories[0];
      recommendations.push({
        type: 'category',
        title: `📦 مهتم بفئة ${topCategory.category}`,
        message: 'يظهر اهتماماً متكرراً بهذه الفئة',
        action: 'أرسل له منتجات جديدة في هذه الفئة',
      });
    }

    // إذا كان يقضي وقتاً طويلاً
    if (this.getUserTimeSpent(views[0]?.userId).reduce((sum, t) => sum + t.total, 0) > 3600) {
      recommendations.push({
        type: 'time',
        title: '⏰ يقضي وقتاً طويلاً',
        message: 'هذا العميل يقضي أكثر من ساعة في المتجر',
        action: 'قدم له مساعدة مباشرة أو عرض خاص',
      });
    }

    return recommendations;
  }

  // ========== حفظ واسترجاع البيانات ==========

  persistBehavior(type, key, data, delete_ = false) {
    try {
      const storageKey = `behavior_${type}`;
      let stored = JSON.parse(localStorage.getItem(storageKey) || '{}');

      if (delete_) {
        delete stored[key];
      } else {
        stored[key] = data;
      }

      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch (e) {
      console.error('خطأ في حفظ السلوك:', e);
    }
  }

  loadPersistedBehaviors() {
    try {
      ['views', 'searches', 'cart', 'timeSpent'].forEach((type) => {
        const storageKey = `behavior_${type}`;
        const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');

        Object.entries(stored).forEach(([key, value]) => {
          if (type === 'searches') {
            if (!this.behaviors[type].has(value.userId)) {
              this.behaviors[type].set(value.userId, []);
            }
            this.behaviors[type].get(value.userId).push(value);
          } else {
            this.behaviors[type].set(key, value);
          }
        });
      });
    } catch (e) {
      console.error('خطأ في تحميل السلوك:', e);
    }
  }

  // ========== إحصائيات السلوك ==========

  async getBehaviorStats() {
    const uniqueUsers = new Set();
    const totalViews = this.behaviors.views.size;

    this.behaviors.views.forEach((view) => uniqueUsers.add(view.userId));

    const totalCartItems = Array.from(this.behaviors.cart.values()).filter(
      (item) => !item.purchased
    ).length;

    const abandonedCarts = Array.from(this.behaviors.cart.values()).filter((item) => {
      if (item.purchased) return false;
      const updated = new Date(item.updatedAt);
      const now = new Date();
      return now - updated > 24 * 60 * 60 * 1000;
    }).length;

    return {
      uniqueVisitors: uniqueUsers.size,
      totalViews,
      averageViewsPerUser: uniqueUsers.size > 0 ? totalViews / uniqueUsers.size : 0,
      activeCarts: totalCartItems,
      abandonedCarts,
      cartAbandonmentRate: totalCartItems > 0 ? (abandonedCarts / totalCartItems) * 100 : 0,
      totalSearches: Array.from(this.behaviors.searches.values()).reduce(
        (sum, s) => sum + s.length,
        0
      ),
    };
  }

  // تنظيف البيانات القديمة
  cleanOldData(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    ['views', 'cart', 'timeSpent'].forEach((type) => {
      this.behaviors[type].forEach((value, key) => {
        const dateField = type === 'timeSpent' ? 'date' : 'lastView';
        const itemDate = new Date(value[dateField] || value.timestamp);

        if (itemDate < cutoff) {
          this.behaviors[type].delete(key);
          this.persistBehavior(type, key, null, true);
        }
      });
    });

    // تنظيف عمليات البحث القديمة
    this.behaviors.searches.forEach((searches, userId) => {
      const filtered = searches.filter((s) => new Date(s.timestamp) >= cutoff);
      this.behaviors.searches.set(userId, filtered);
      this.persistBehavior('searches', userId, filtered);
    });
  }
}

export default new BehaviorTracker();
