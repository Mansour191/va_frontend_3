// src/integration/ai/forecasting/ForecastService.js
import DataCollector from './data/DataCollector';
import SimplePredictor from './models/SimplePredictor';
import AlertService from '@/shared/integration/services/AlertService';

class ForecastService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 دقائق

    // تحميل التنبيهات المحفوظة
    AlertService.loadPersistedAlerts();

    // تنظيف التنبيهات المنتهية كل ساعة
    setInterval(() => {
      AlertService.clearExpiredAlerts();
    }, 60 * 60 * 1000);
  }

  // ========== إدارة الكاش ==========

  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTTL;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // ========== توقعات عامة (محدثة مع كاش وتنبيهات) ==========

  async getGeneralForecast(days = 30) {
    const cacheKey = `general_forecast_${days}`;
    if (this.isCacheValid(cacheKey)) {
      console.log('⚡ Serving general forecast from cache');
      return this.cache.get(cacheKey).data;
    }

    try {
      // جمع البيانات
      const data = await DataCollector.collectAllData();

      if (!data.success) {
        throw new Error('فشل جمع البيانات');
      }

      // استخراج المبيعات اليومية
      const dailySales = data.salesData.map((d) => d.revenue);

      if (dailySales.length < 7) {
        return this.getDefaultForecast();
      }

      // توقع باستخدام النموذج الموسمي
      const forecast = SimplePredictor.predictWithSeasonality(dailySales, days);

      if (!forecast) {
        return this.getDefaultForecast();
      }

      // تحليل الاتجاهات
      const trends = SimplePredictor.detectTrends(dailySales);

      // تحليل الموسمية الشهرية
      const seasonality = SimplePredictor.analyzeSeasonality(dailySales);

      const result = {
        success: true,
        generatedAt: new Date().toISOString(),
        basedOn: data.stats.daysOfData + ' يوم من البيانات',
        confidence: forecast.confidence,
        total: forecast.total,
        average: forecast.average,
        predictions: forecast.predictions,
        trends,
        seasonality,
        details: {
          nextDay: forecast.predictions[0],
          nextWeek: forecast.predictions.slice(0, 7).reduce((a, b) => a + b, 0),
          nextMonth: forecast.total,
        },
      };

      // حفظ في الكاش
      this.setCache(cacheKey, result);

      // إنشاء تنبيهات ذكية
      await this.createForecastAlerts(result);

      // فحص التنبيهات (للتوافق مع الكود القديم)
      await this.checkAlerts(result);

      return result;
    } catch (error) {
      console.error('❌ خطأ في التوقعات:', error);
      return this.getDefaultForecast();
    }
  }

  // ========== توقعات لمنتج معين (محدثة مع كاش) ==========

  async getProductForecast(productId, days = 30) {
    const cacheKey = `product_forecast_${productId}_${days}`;
    if (this.isCacheValid(cacheKey)) {
      console.log(`⚡ Serving forecast for product ${productId} from cache`);
      return this.cache.get(cacheKey).data;
    }

    try {
      const data = await DataCollector.collectAllData();
      const productSales = DataCollector.getProductSales(productId);

      if (productSales.length < 3) {
        return {
          success: false,
          message: 'بيانات غير كافية لهذا المنتج',
        };
      }

      const forecast = SimplePredictor.predictSimple(productSales, days);
      const inventory = DataCollector.getProductInventory(productId);

      const result = {
        success: true,
        productId,
        productName: DataCollector.getProductName(productId),
        currentStock: inventory,
        forecast,
        recommendations: this.generateRecommendations(inventory, forecast),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`❌ Error forecasting product ${productId}:`, error);
      return { success: false, message: error.message };
    }
  }

  // ... (باقي الدوال المساعدة كما هي)

  getDefaultForecast() {
    return {
      success: false,
      message: 'بيانات غير كافية لإجراء توقعات دقيقة',
      total: 0,
      average: 0,
      predictions: Array(30).fill(0),
    };
  }

  generateRecommendations(stock, forecast) {
    const recs = [];
    const daysLeft = stock / (forecast.average || 1);

    if (daysLeft < 7) {
      recs.push({
        type: 'urgent',
        message: '⚠️ المخزون سينفد قريباً جداً',
        action: `يجب طلب ${Math.ceil(forecast.average * 14)} قطعة فوراً لتغطية الأسبوعين القادمين`,
      });
    } else if (daysLeft < 15) {
      recs.push({
        type: 'warning',
        message: 'المخزون سينفد خلال أسبوعين',
        action: `يرجى التخطيط لطلب ${Math.ceil(forecast.average * 30)} قطعة خلال الأسبوع القادم`,
      });
    }

    return recs;
  }

  async createForecastAlerts(forecast) {
    if (forecast.average > 100) {
      await AlertService.sendAlert({
        type: 'forecast',
        severity: 'info',
        title: '📈 توقعات مبيعات مرتفعة',
        message: `يتوقع النظام متوسط مبيعات يومي قدره ${Math.round(
          forecast.average
        )} قطعة خلال الشهر القادم.`,
      });
    }
  }

  async checkAlerts(forecast) {
    // منطق التحقق الإضافي إذا لزم الأمر
  }

  async getInventoryForecast() {
    const data = await DataCollector.collectAllData();
    const results = {
      critical: [],
      warning: [],
      safe: [],
    };

    for (const product of data.products) {
      const sales = DataCollector.getProductSales(product.id);
      if (sales.length >= 3) {
        const forecast = SimplePredictor.predictSimple(sales, 30);
        const daysLeft = product.stock / (forecast.average || 1);

        const item = {
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
          daysUntilZero: Math.round(daysLeft),
          averageDailySales: forecast.average,
        };

        if (daysLeft < 7) results.critical.push(item);
        else if (daysLeft < 15) results.warning.push(item);
        else results.safe.push(item);
      }
    }

    return results;
  }
}

export default new ForecastService();
