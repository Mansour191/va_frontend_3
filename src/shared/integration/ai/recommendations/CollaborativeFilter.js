// src/integration/ai/recommendations/CollaborativeFilter.js
import DataCollector from '@/shared/integration/ai/forecasting/data/DataCollector';

class CollaborativeFilter {
  constructor() {
    this.userSimilarity = new Map(); // تشابه المستخدمين
    this.userPreferences = new Map(); // تفضيلات المستخدمين
  }

  // بناء مصفوفة تفضيلات المستخدمين
  async buildUserPreferences() {
    const data = await DataCollector.collectAllData();
    const orders = data.orders || [];

    this.userPreferences.clear();

    orders.forEach((order) => {
      const userId = order.customerId || order.userId;
      if (!userId) return;

      if (!this.userPreferences.has(userId)) {
        this.userPreferences.set(userId, new Map());
      }

      const userPrefs = this.userPreferences.get(userId);
      const items = order.items || [];

      items.forEach((item) => {
        if (item.id) {
          const current = userPrefs.get(item.id) || 0;
          userPrefs.set(item.id, current + (item.quantity || 1));
        }
      });
    });

    return {
      success: true,
      usersCount: this.userPreferences.size,
    };
  }

  // حساب تشابه المستخدمين (معامل بيرسون)
  calculateUserSimilarity(user1Prefs, user2Prefs) {
    // المنتجات المشتركة بين المستخدمين
    const commonProducts = [];
    user1Prefs.forEach((_, productId) => {
      if (user2Prefs.has(productId)) {
        commonProducts.push(productId);
      }
    });

    if (commonProducts.length < 2) return 0;

    // حساب المتوسطات
    let sum1 = 0,
      sum2 = 0;
    commonProducts.forEach((productId) => {
      sum1 += user1Prefs.get(productId);
      sum2 += user2Prefs.get(productId);
    });

    const mean1 = sum1 / commonProducts.length;
    const mean2 = sum2 / commonProducts.length;

    // حساب معامل ارتباط بيرسون
    let numerator = 0;
    let denom1 = 0;
    let denom2 = 0;

    commonProducts.forEach((productId) => {
      const diff1 = user1Prefs.get(productId) - mean1;
      const diff2 = user2Prefs.get(productId) - mean2;

      numerator += diff1 * diff2;
      denom1 += diff1 * diff1;
      denom2 += diff2 * diff2;
    });

    if (denom1 === 0 || denom2 === 0) return 0;

    return numerator / (Math.sqrt(denom1) * Math.sqrt(denom2));
  }

  // حساب تشابه جميع المستخدمين
  async calculateAllSimilarities() {
    await this.buildUserPreferences();

    this.userSimilarity.clear();
    const users = Array.from(this.userPreferences.keys());

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const user1 = users[i];
        const user2 = users[j];

        const similarity = this.calculateUserSimilarity(
          this.userPreferences.get(user1),
          this.userPreferences.get(user2)
        );

        if (similarity > 0.1) {
          // فقط التشابهات المهمة
          if (!this.userSimilarity.has(user1)) {
            this.userSimilarity.set(user1, []);
          }
          if (!this.userSimilarity.has(user2)) {
            this.userSimilarity.set(user2, []);
          }

          this.userSimilarity.get(user1).push({ userId: user2, score: similarity });
          this.userSimilarity.get(user2).push({ userId: user1, score: similarity });
        }
      }
    }

    // ترتيب حسب درجة التشابه
    this.userSimilarity.forEach((value) => {
      value.sort((a, b) => b.score - a.score);
    });

    return {
      success: true,
      usersCount: users.length,
      similaritiesCount: this.userSimilarity.size,
    };
  }

  // توصيات لمستخدم معين (بناءً على المستخدمين المشابهين)
  async getRecommendationsForUser(userId, limit = 10) {
    if (this.userSimilarity.size === 0) {
      await this.calculateAllSimilarities();
    }

    const similarUsers = this.userSimilarity.get(userId) || [];
    if (similarUsers.length === 0) return [];

    const userPrefs = this.userPreferences.get(userId) || new Map();
    const recommendations = new Map();

    // تجميع المنتجات من المستخدمين المشابهين
    similarUsers.slice(0, 5).forEach((similar) => {
      const similarPrefs = this.userPreferences.get(similar.userId) || new Map();

      similarPrefs.forEach((score, productId) => {
        // إذا لم يشتريها المستخدم الأصلي
        if (!userPrefs.has(productId)) {
          const current = recommendations.get(productId) || 0;
          recommendations.set(productId, current + score * similar.score);
        }
      });
    });

    // ترتيب حسب الأهمية
    const sorted = Array.from(recommendations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId, score]) => ({
        productId,
        score: Math.round(score * 100) / 100,
      }));

    return sorted;
  }

  // ========== توصيات محسّنة ==========

  // توصيات بناءً على سجل التصفح (وليس فقط الشراء)
  async getRecommendationsFromBrowsing(userId, browsingHistory, limit = 10) {
    if (!browsingHistory || browsingHistory.length === 0) {
      return [];
    }

    const data = await DataCollector.collectAllData();
    const products = data.products || [];

    // تحليل المنتجات التي تم تصفحها
    const viewedCategories = new Map();
    const viewedPrices = [];

    browsingHistory.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        viewedCategories.set(product.category, (viewedCategories.get(product.category) || 0) + 1);
        viewedPrices.push(product.price);
      }
    });

    // تحديد الفئة المفضلة
    let favoriteCategory = null;
    let maxCount = 0;
    viewedCategories.forEach((count, category) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = category;
      }
    });

    // متوسط الأسعار التي تم تصفحها
    const avgPrice = viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length;

    // توصيات بناءً على الفئة والسعر
    const recommendations = products
      .filter(
        (p) => p.category === favoriteCategory && !browsingHistory.some((h) => h.productId === p.id)
      )
      .map((p) => {
        const priceDiff = Math.abs(p.price - avgPrice) / avgPrice;
        const score = 1 - Math.min(priceDiff, 1); // كلما كان السعر أقرب زادت الدرجة
        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  }

  // الحصول على المستخدمين المشابهين
  getSimilarUsers(userId, limit = 5) {
    return (this.userSimilarity.get(userId) || []).slice(0, limit);
  }
}

export default new CollaborativeFilter();
