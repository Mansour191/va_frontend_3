// src/integration/ai/customers/ChurnPredictor.js
import CustomerAnalyticsService from './CustomerAnalyticsService';
import AlertService from '@/shared/integration/services/AlertService';

class ChurnPredictor {
  constructor() {
    this.model = {
      weights: {
        recency: 0.35, // وزن حداثة آخر طلب
        frequency: 0.25, // وزن تكرار الطلبات
        monetary: 0.2, // وزن قيمة المشتريات
        engagement: 0.15, // وزن التفاعل
        diversity: 0.05, // وزن تنوع المنتجات
      },
      thresholds: {
        high: 0.7, // احتمالية عالية للتوقف
        medium: 0.4, // احتمالية متوسطة
        low: 0.2, // احتمالية منخفضة
      },
    };

    this.predictions = {
      highRisk: [],
      mediumRisk: [],
      lowRisk: [],
      safe: [],
    };
  }

  // ========== حساب احتمالية التوقف ==========

  calculateChurnProbability(customer) {
    let score = 0;
    let totalWeight = 0;

    // 1. حداثة آخر طلب (Recency)
    const recencyScore = this.calculateRecencyScore(customer.daysSinceLastOrder);
    score += recencyScore * this.model.weights.recency;
    totalWeight += this.model.weights.recency;

    // 2. تكرار الطلبات (Frequency)
    const frequencyScore = this.calculateFrequencyScore(customer);
    score += frequencyScore * this.model.weights.frequency;
    totalWeight += this.model.weights.frequency;

    // 3. قيمة المشتريات (Monetary)
    const monetaryScore = this.calculateMonetaryScore(customer);
    score += monetaryScore * this.model.weights.monetary;
    totalWeight += this.model.weights.monetary;

    // 4. التفاعل (Engagement)
    const engagementScore = this.calculateEngagementScore();
    score += engagementScore * this.model.weights.engagement;
    totalWeight += this.model.weights.engagement;

    // 5. تنوع المنتجات (Diversity)
    const diversityScore = this.calculateDiversityScore(customer);
    score += diversityScore * this.model.weights.diversity;
    totalWeight += this.model.weights.diversity;

    // تطبيع النتيجة
    const probability = score / totalWeight;

    return {
      probability: Math.round(probability * 100) / 100,
      factors: {
        recency: recencyScore,
        frequency: frequencyScore,
        monetary: monetaryScore,
        engagement: engagementScore,
        diversity: diversityScore,
      },
    };
  }

  // درجة حداثة آخر طلب (كلما زادت الأيام، زادت احتمالية التوقف)
  calculateRecencyScore(days) {
    if (days <= 15) return 0.1; // نشط جداً
    if (days <= 30) return 0.3; // نشط
    if (days <= 45) return 0.5; // متوسط
    if (days <= 60) return 0.7; // خطر
    return 0.9; // خطر شديد
  }

  // درجة تكرار الطلبات
  calculateFrequencyScore(customer) {
    if (customer.totalOrders >= 10) return 0.1; // مخلص جداً
    if (customer.totalOrders >= 5) return 0.3; // مخلص
    if (customer.totalOrders >= 3) return 0.5; // متوسط
    if (customer.totalOrders >= 1) return 0.7; // جديد
    return 0.9; // لم يشتري بعد
  }

  // درجة قيمة المشتريات
  calculateMonetaryScore(customer) {
    const avgOrderValue = customer.avgOrderValue || 0;

    if (avgOrderValue >= 1000) return 0.1; // إنفاق عالي
    if (avgOrderValue >= 500) return 0.3; // إنفاق متوسط
    if (avgOrderValue >= 200) return 0.5; // إنفاق منخفض
    if (avgOrderValue > 0) return 0.7; // إنفاق بسيط
    return 0.9; // لم ينفق
  }

  // درجة التفاعل
  calculateEngagementScore() {
    // نقاط التفاعل: فتح البريد، النقر على الروابط، إلخ
    // هذا نموذج مبسط، يمكن توسيعه لاحقاً
    const interactionScore = Math.random() * 0.5; // قيمة افتراضية

    if (interactionScore > 0.8) return 0.1;
    if (interactionScore > 0.6) return 0.3;
    if (interactionScore > 0.4) return 0.5;
    if (interactionScore > 0.2) return 0.7;
    return 0.9;
  }

  // درجة تنوع المنتجات
  calculateDiversityScore(customer) {
    const categoriesCount = Object.keys(customer.categories || {}).length;

    if (categoriesCount >= 5) return 0.1; // متنوع جداً
    if (categoriesCount >= 3) return 0.3; // متنوع
    if (categoriesCount >= 2) return 0.5; // متوسط
    if (categoriesCount >= 1) return 0.7; // محدود
    return 0.9; // لم يشتري
  }

  // ========== توقع التوقف لجميع العملاء ==========

  async predictAllCustomers() {
    const customers = await CustomerAnalyticsService.getAllCustomers();

    // إعادة تعيين التنبؤات
    this.predictions = {
      highRisk: [],
      mediumRisk: [],
      lowRisk: [],
      safe: [],
    };

    // استخدام for...of بدلاً من forEach
    for (const customer of customers) {
      const prediction = this.calculateChurnProbability(customer);

      const customerWithPrediction = {
        ...customer,
        churnProbability: prediction.probability,
        churnFactors: prediction.factors,
        churnLevel: this.getChurnLevel(prediction.probability),
      };

      // تصنيف حسب مستوى الخطر
      if (prediction.probability >= this.model.thresholds.high) {
        this.predictions.highRisk.push(customerWithPrediction);
      } else if (prediction.probability >= this.model.thresholds.medium) {
        this.predictions.mediumRisk.push(customerWithPrediction);
      } else if (prediction.probability >= this.model.thresholds.low) {
        this.predictions.lowRisk.push(customerWithPrediction);
      } else {
        this.predictions.safe.push(customerWithPrediction);
      }
    }

    // ترتيب حسب درجة الخطورة
    this.predictions.highRisk.sort((a, b) => b.churnProbability - a.churnProbability);
    this.predictions.mediumRisk.sort((a, b) => b.churnProbability - a.churnProbability);
    this.predictions.lowRisk.sort((a, b) => b.churnProbability - a.churnProbability);

    return this.predictions;
  }

  // تحديد مستوى الخطر
  getChurnLevel(probability) {
    if (probability >= 0.7) return 'high';
    if (probability >= 0.4) return 'medium';
    if (probability >= 0.2) return 'low';
    return 'safe';
  }

  // ========== تحليل أسباب التوقف ==========

  // تحليل أسباب التوقف
  analyzeChurnReasons() {
    // إنشاء كائن الأسباب
    const reasons = {
      recency: { count: 0, totalProbability: 0 },
      frequency: { count: 0, totalProbability: 0 },
      monetary: { count: 0, totalProbability: 0 },
      engagement: { count: 0, totalProbability: 0 },
      diversity: { count: 0, totalProbability: 0 },
    };

    // التحقق من وجود بيانات
    const highRiskList = this.predictions?.highRisk;

    if (highRiskList && highRiskList.length > 0) {
      // استخدام حلقة for عادية
      for (let idx = 0; idx < highRiskList.length; idx++) {
        const riskyCustomer = highRiskList[idx];

        if (riskyCustomer.churnFactors) {
          const factors = riskyCustomer.churnFactors;

          // فحص كل عامل يدوياً
          if (factors.recency && factors.recency > 0.6) {
            reasons.recency.count++;
            reasons.recency.totalProbability += factors.recency;
          }
          if (factors.frequency && factors.frequency > 0.6) {
            reasons.frequency.count++;
            reasons.frequency.totalProbability += factors.frequency;
          }
          if (factors.monetary && factors.monetary > 0.6) {
            reasons.monetary.count++;
            reasons.monetary.totalProbability += factors.monetary;
          }
          if (factors.engagement && factors.engagement > 0.6) {
            reasons.engagement.count++;
            reasons.engagement.totalProbability += factors.engagement;
          }
          if (factors.diversity && factors.diversity > 0.6) {
            reasons.diversity.count++;
            reasons.diversity.totalProbability += factors.diversity;
          }
        }
      }
    }

    // حساب النتائج
    const totalHighRisk = highRiskList?.length || 1;

    return {
      recency: {
        count: reasons.recency.count,
        averageScore:
          reasons.recency.count > 0
            ? Math.round((reasons.recency.totalProbability / reasons.recency.count) * 100) / 100
            : 0,
        percentage: Math.round((reasons.recency.count / totalHighRisk) * 100),
      },
      frequency: {
        count: reasons.frequency.count,
        averageScore:
          reasons.frequency.count > 0
            ? Math.round((reasons.frequency.totalProbability / reasons.frequency.count) * 100) / 100
            : 0,
        percentage: Math.round((reasons.frequency.count / totalHighRisk) * 100),
      },
      monetary: {
        count: reasons.monetary.count,
        averageScore:
          reasons.monetary.count > 0
            ? Math.round((reasons.monetary.totalProbability / reasons.monetary.count) * 100) / 100
            : 0,
        percentage: Math.round((reasons.monetary.count / totalHighRisk) * 100),
      },
      engagement: {
        count: reasons.engagement.count,
        averageScore:
          reasons.engagement.count > 0
            ? Math.round((reasons.engagement.totalProbability / reasons.engagement.count) * 100) /
              100
            : 0,
        percentage: Math.round((reasons.engagement.count / totalHighRisk) * 100),
      },
      diversity: {
        count: reasons.diversity.count,
        averageScore:
          reasons.diversity.count > 0
            ? Math.round((reasons.diversity.totalProbability / reasons.diversity.count) * 100) / 100
            : 0,
        percentage: Math.round((reasons.diversity.count / totalHighRisk) * 100),
      },
    };
  }

  // ========== توصيات لمنع التوقف ==========

  async getRetentionRecommendations() {
    await this.predictAllCustomers();

    const recommendations = [];
    const churnAnalysis = this.analyzeChurnReasons();

    // توصيات للعملاء عاليي الخطورة
    if (this.predictions.highRisk.length > 0) {
      recommendations.push({
        level: 'high',
        title: '🔴 عملاء خطر التوقف مرتفع',
        count: this.predictions.highRisk.length,
        percentage:
          (
            (this.predictions.highRisk.length /
              (this.predictions.highRisk.length +
                this.predictions.mediumRisk.length +
                this.predictions.lowRisk.length +
                this.predictions.safe.length)) *
            100
          ).toFixed(1) + '%',
        actions: [
          {
            type: 'call',
            description: 'اتصال هاتفي شخصي',
            reason: 'عملاء ذوو قيمة عالية معرضون للخطر',
          },
          {
            type: 'offer',
            description: 'عرض حصري 30% خصم',
            reason: 'تحفيزهم للعودة',
          },
          {
            type: 'survey',
            description: 'استبيان رضا العملاء',
            reason: 'فهم سبب التوقف المحتمل',
          },
        ],
      });
    }

    // توصيات حسب الأسباب الرئيسية
    if (churnAnalysis.recency.percentage > 30) {
      recommendations.push({
        level: 'medium',
        title: '⏰ عملاء لم يشتروا منذ فترة',
        count: churnAnalysis.recency.count,
        actions: [
          {
            type: 'email',
            description: 'حملة بريدية تذكيرية',
            reason: 'آخر شراء منذ أكثر من 60 يوم',
          },
          {
            type: 'offer',
            description: 'خصم 20% للعودة',
            reason: 'تحفيزهم لإعادة الشراء',
          },
        ],
      });
    }

    if (churnAnalysis.frequency.percentage > 25) {
      recommendations.push({
        level: 'medium',
        title: '🔄 عملاء غير منتظمين',
        count: churnAnalysis.frequency.count,
        actions: [
          {
            type: 'loyalty',
            description: 'برنامج ولاء للطلبات المتكررة',
            reason: 'تشجيعهم على الشراء المنتظم',
          },
          {
            type: 'reminder',
            description: 'تذكيرات دورية بالمنتجات الجديدة',
            reason: 'زيادة التفاعل',
          },
        ],
      });
    }

    if (churnAnalysis.engagement.percentage > 20) {
      recommendations.push({
        level: 'low',
        title: '📱 عملاء غير متفاعلين',
        count: churnAnalysis.engagement.count,
        actions: [
          {
            type: 'social',
            description: 'دعوة لمتابعة وسائل التواصل',
            reason: 'زيادة التفاعل خارج الموقع',
          },
          {
            type: 'newsletter',
            description: 'نشرة بريدية أسبوعية',
            reason: 'إبقائهم على اطلاع',
          },
        ],
      });
    }

    return recommendations;
  }

  // ========== إحصائيات التوقف ==========

  async getChurnStats() {
    await this.predictAllCustomers();

    const total =
      this.predictions.highRisk.length +
      this.predictions.mediumRisk.length +
      this.predictions.lowRisk.length +
      this.predictions.safe.length;

    const stats = {
      total,
      highRisk: {
        count: this.predictions.highRisk.length,
        percentage: ((this.predictions.highRisk.length / total) * 100).toFixed(1) + '%',
        potentialLoss: this.predictions.highRisk.reduce((sum, c) => sum + c.totalSpent, 0),
      },
      mediumRisk: {
        count: this.predictions.mediumRisk.length,
        percentage: ((this.predictions.mediumRisk.length / total) * 100).toFixed(1) + '%',
        potentialLoss: this.predictions.mediumRisk.reduce((sum, c) => sum + c.totalSpent, 0),
      },
      lowRisk: {
        count: this.predictions.lowRisk.length,
        percentage: ((this.predictions.lowRisk.length / total) * 100).toFixed(1) + '%',
      },
      safe: {
        count: this.predictions.safe.length,
        percentage: ((this.predictions.safe.length / total) * 100).toFixed(1) + '%',
      },
      churnRate:
        (
          ((this.predictions.highRisk.length + this.predictions.mediumRisk.length) / total) *
          100
        ).toFixed(1) + '%',
      mainReasons: this.analyzeChurnReasons(),
    };

    return stats;
  }

  // ========== تنبيهات التوقف ==========

  async checkChurnAlerts() {
    await this.predictAllCustomers();

    if (this.predictions.highRisk.length > 5) {
      await AlertService.sendAlert({
        type: 'warning',
        category: 'customers',
        severity: 'high',
        title: '⚠️ ارتفاع خطر توقف العملاء',
        message: `هناك ${this.predictions.highRisk.length} عميل معرضون لخطر التوقف`,
        actionable: true,
        action: {
          label: 'عرض التفاصيل',
          handler: 'viewChurnRisk',
        },
      });
    }

    const totalValue = this.predictions.highRisk.reduce((sum, c) => sum + c.totalSpent, 0);
    if (totalValue > 100000) {
      await AlertService.sendAlert({
        type: 'warning',
        category: 'customers',
        severity: 'high',
        title: '💰 خسارة محتملة كبيرة',
        message: `العملاء المعرضون للخطر يمثلون قيمة ${totalValue.toLocaleString()} دج`,
        actionable: true,
        action: {
          label: 'اتخاذ إجراء',
          handler: 'viewRetention',
        },
      });
    }
  }

  // تحديث النموذج
  async refreshAll() {
    await this.predictAllCustomers();
    await this.checkChurnAlerts();

    return {
      success: true,
      predictions: this.predictions,
      stats: await this.getChurnStats(),
    };
  }
}

export default new ChurnPredictor();
