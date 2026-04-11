// src/integration/ai/recommendations/ProductAffinity.js
import DataCollector from '@/shared/integration/ai/forecasting/data/DataCollector';

class ProductAffinity {
  constructor() {
    this.affinityMatrix = new Map(); // مصفوفة الارتباطات
    this.lastUpdate = null;
  }

  // حساب الارتباطات بين المنتجات (المنتجات التي تُشترى معاً)
  async calculateAffinities() {
    try {
      const data = await DataCollector.collectAllData();
      const orders = data.orders || [];

      // مصفوفة مؤقتة للتكرارات
      const cooccurrence = new Map();

      // حساب عدد مرات ظهور كل زوج من المنتجات معاً
      orders.forEach((order) => {
        const items = order.items || [];
        const productIds = items.map((item) => item.id).filter((id) => id);

        // كل زوج من المنتجات في نفس الطلب
        for (let i = 0; i < productIds.length; i++) {
          for (let j = i + 1; j < productIds.length; j++) {
            const pair1 = `${productIds[i]}:${productIds[j]}`;
            const pair2 = `${productIds[j]}:${productIds[i]}`;

            cooccurrence.set(pair1, (cooccurrence.get(pair1) || 0) + 1);
            cooccurrence.set(pair2, (cooccurrence.get(pair2) || 0) + 1);
          }
        }
      });

      // حساب معامل الارتباط (Jaccard Index)
      const productCounts = this.getProductCounts(orders);

      this.affinityMatrix.clear();

      cooccurrence.forEach((count, pair) => {
        const [id1, id2] = pair.split(':').map(Number);
        const count1 = productCounts.get(id1) || 1;
        const count2 = productCounts.get(id2) || 1;

        // معامل جاكارد = (عدد مرات الظهور معاً) / (مجموع مرات ظهور كل منتج)
        const jaccard = count / (count1 + count2 - count);

        if (jaccard > 0.05) {
          // فقط الارتباطات القوية
          if (!this.affinityMatrix.has(id1)) {
            this.affinityMatrix.set(id1, []);
          }
          this.affinityMatrix.get(id1).push({
            productId: id2,
            score: jaccard,
            frequency: count,
          });
        }
      });

      // ترتيب الارتباطات حسب القوة
      this.affinityMatrix.forEach((value) => {
        value.sort((a, b) => b.score - a.score);
      });

      this.lastUpdate = new Date().toISOString();

      return {
        success: true,
        productsCount: this.affinityMatrix.size,
        lastUpdate: this.lastUpdate,
      };
    } catch (error) {
      console.error('خطأ في حساب الارتباطات:', error);
      return { success: false, error: error.message };
    }
  }

  // حساب عدد مرات ظهور كل منتج
  getProductCounts(orders) {
    const counts = new Map();

    orders.forEach((order) => {
      const items = order.items || [];
      items.forEach((item) => {
        if (item.id) {
          counts.set(item.id, (counts.get(item.id) || 0) + 1);
        }
      });
    });

    return counts;
  }

  // الحصول على توصيات لمنتج معين
  getRecommendationsForProduct(productId, limit = 5) {
    const recommendations = this.affinityMatrix.get(productId) || [];
    return recommendations.slice(0, limit);
  }

  // الحصول على توصيات عامة (أكثر المنتجات مبيعاً)
  async getGeneralRecommendations(limit = 10) {
    const data = await DataCollector.collectAllData();
    const products = data.products || [];

    // حساب عدد مبيعات كل منتج
    const salesCount = new Map();
    data.orders.forEach((order) => {
      const items = order.items || [];
      items.forEach((item) => {
        if (item.id) {
          salesCount.set(item.id, (salesCount.get(item.id) || 0) + 1);
        }
      });
    });

    // ترتيب حسب الأكثر مبيعاً
    const sorted = products
      .map((p) => ({
        ...p,
        sales: salesCount.get(p.id) || 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);

    return sorted;
  }
}

export default new ProductAffinity();
