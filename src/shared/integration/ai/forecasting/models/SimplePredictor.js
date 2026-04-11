// src\integration\ai\forecasting\models\SimplePredictor.js

import * as ss from 'simple-statistics';
import regression from 'regression';

class SimplePredictor {
  constructor() {
    this.models = {
      linear: null,
      seasonal: {},
    };
  }

  // توقع باستخدام الانحدار الخطي
  linearRegression(data, daysToPredict = 30) {
    if (data.length < 2) return null;

    // تحضير البيانات
    const points = data.map((val, i) => [i, val]);

    // حساب الانحدار
    const result = regression.linear(points);

    // توقع الأيام القادمة
    const predictions = [];
    for (let i = data.length; i < data.length + daysToPredict; i++) {
      const predicted = result.equation[0] * i + result.equation[1];
      predictions.push(Math.max(0, Math.round(predicted)));
    }

    return {
      predictions,
      equation: result.equation,
      r2: result.r2,
      nextDay: predictions[0],
      nextWeek: predictions.slice(0, 7).reduce((a, b) => a + b, 0),
      nextMonth: predictions.slice(0, 30).reduce((a, b) => a + b, 0),
    };
  }

  // توقع موسمي (حسب أيام الأسبوع)
  seasonalForecast(data, period = 7) {
    if (data.length < period) return null;

    const seasonal = [];

    // حساب المتوسط لكل يوم في الأسبوع
    for (let i = 0; i < period; i++) {
      const values = [];
      for (let j = i; j < data.length; j += period) {
        if (data[j] !== undefined) values.push(data[j]);
      }
      if (values.length > 0) {
        seasonal.push(ss.mean(values));
      }
    }

    return seasonal;
  }

  // المتوسط المتحرك
  movingAverage(data, window = 7) {
    if (data.length < window) return [];

    const averages = [];
    for (let i = window; i < data.length; i++) {
      const sum = data.slice(i - window, i).reduce((a, b) => a + b, 0);
      averages.push(Math.round(sum / window));
    }
    return averages;
  }

  // توقع مع الموسمية (الأكثر دقة)
  predictWithSeasonality(data, daysToPredict = 30) {
    if (data.length < 14) return null;

    const seasonal = this.seasonalForecast(data, 7);
    const trend = this.linearRegression(data);

    if (!trend) return null;

    const predictions = [];
    for (let i = 0; i < daysToPredict; i++) {
      const dayOfWeek = i % 7;
      const trendValue = trend.equation[0] * (data.length + i) + trend.equation[1];

      // إذا كان عندنا بيانات موسمية
      if (seasonal && seasonal[dayOfWeek]) {
        const seasonalMean = ss.mean(seasonal);
        const seasonalFactor = seasonal[dayOfWeek] / (seasonalMean || 1);
        predictions.push(Math.max(0, Math.round(trendValue * seasonalFactor)));
      } else {
        predictions.push(Math.max(0, Math.round(trendValue)));
      }
    }

    return {
      predictions,
      total: predictions.reduce((a, b) => a + b, 0),
      average: Math.round(ss.mean(predictions)),
      confidence: this.calculateConfidence(data, predictions),
      seasonal,
    };
  }

  // حساب الثقة في التوقعات
  calculateConfidence(historical) {
    if (historical.length < 30) return 70; // ثقة أساسية

    const recentData = historical.slice(-30);
    const variance = ss.variance(recentData);
    const mean = ss.mean(recentData);

    if (mean === 0) return 50;

    const cv = variance / mean; // معامل الاختلاف

    // ثقة أقل كلما زاد التباين
    let confidence = Math.max(0, Math.min(100, 100 - cv * 50));

    // تعديل حسب كمية البيانات
    if (historical.length > 100) confidence += 10;
    if (historical.length > 200) confidence += 5;

    return Math.min(95, Math.round(confidence));
  }

  // تحليل الموسمية (شهرية)
  analyzeSeasonality(data) {
    if (data.length < 60) return null;

    const monthly = {};

    for (let i = 0; i < data.length; i++) {
      const month = i % 12;
      if (!monthly[month]) monthly[month] = [];
      monthly[month].push(data[i]);
    }

    const analysis = {};
    for (let month = 0; month < 12; month++) {
      if (monthly[month]?.length > 0) {
        analysis[month] = {
          avg: ss.mean(monthly[month]),
          min: Math.min(...monthly[month]),
          max: Math.max(...monthly[month]),
        };
      }
    }

    return analysis;
  }

  // اكتشاف الاتجاهات (Trend Detection)
  detectTrends(data) {
    const recent = data.slice(-30);
    const older = data.slice(-60, -30);

    const recentAvg = ss.mean(recent);
    const olderAvg = ss.mean(older);

    const change = ((recentAvg - olderAvg) / (olderAvg || 1)) * 100;

    let trend = 'stable';
    if (change > 10) trend = 'rising';
    if (change > 20) trend = 'strong_rise';
    if (change < -10) trend = 'falling';
    if (change < -20) trend = 'strong_fall';

    return {
      trend,
      change: Math.round(change * 10) / 10,
      recentAvg: Math.round(recentAvg),
      olderAvg: Math.round(olderAvg),
    };
  }

  // تنبؤ بمخزون الأمان (Safety Stock)
  calculateSafetyStock(salesData, serviceLevel = 95) {
    // حساب الانحراف المعياري للمبيعات
    const mean = salesData.reduce((a, b) => a + b, 0) / salesData.length;
    const variance = salesData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / salesData.length;
    const stdDev = Math.sqrt(variance);

    // Z-score حسب مستوى الخدمة
    const zScore =
      {
        90: 1.28,
        95: 1.65,
        99: 2.33,
      }[serviceLevel] || 1.65;

    // مخزون الأمان = Z × الانحراف المعياري × جذر(مهلة التوريد)
    const leadTimeDays = 7; // مهلة التوريد 7 أيام
    const safetyStock = Math.ceil(zScore * stdDev * Math.sqrt(leadTimeDays));

    return safetyStock;
  }

  // نقطة إعادة الطلب (Reorder Point)
  calculateReorderPoint(salesData, leadTimeDays = 7) {
    const dailyAverage = salesData.slice(-30).reduce((a, b) => a + b, 0) / 30;
    const safetyStock = this.calculateSafetyStock(salesData);

    // نقطة إعادة الطلب = (المتوسط اليومي × مهلة التوريد) + مخزون الأمان
    return Math.ceil(dailyAverage * leadTimeDays + safetyStock);
  }

  // ========== تحليل الموسمية المتقدم ==========

  // تحليل شهري متقدم
  analyzeMonthlyPattern(data) {
    if (!data || data.length < 60) return null;

    const monthlyData = {};

    // تجميع البيانات حسب الشهر
    data.forEach((value, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (data.length - index));
      const month = date.getMonth(); // 0-11

      if (!monthlyData[month]) monthlyData[month] = [];
      monthlyData[month].push(value);
    });

    const monthlyAnalysis = {};
    for (let month = 0; month < 12; month++) {
      if (monthlyData[month]?.length > 0) {
        const values = monthlyData[month];
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        const total = values.reduce((a, b) => a + b, 0);

        monthlyAnalysis[month] = {
          avg: Math.round(avg),
          total: Math.round(total),
          max: Math.round(max),
          min: Math.round(min),
          days: values.length,
          peak:
            avg > 1.2 * this.getOverallAverage(data)
              ? 'high'
              : avg < 0.8 * this.getOverallAverage(data)
              ? 'low'
              : 'normal',
        };
      }
    }

    return monthlyAnalysis;
  }

  // تحليل أسبوعي (أيام الأسبوع)
  analyzeWeeklyPattern(data) {
    if (!data || data.length < 14) return null;

    const weeklyData = {
      0: [], // الأحد
      1: [], // الاثنين
      2: [], // الثلاثاء
      3: [], // الأربعاء
      4: [], // الخميس
      5: [], // الجمعة
      6: [], // السبت
    };

    // تجميع البيانات حسب يوم الأسبوع
    data.forEach((value, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (data.length - index));
      const dayOfWeek = date.getDay(); // 0-6

      if (weeklyData[dayOfWeek]) {
        weeklyData[dayOfWeek].push(value);
      }
    });

    const weeklyAnalysis = {};
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    for (let day = 0; day < 7; day++) {
      if (weeklyData[day].length > 0) {
        const values = weeklyData[day];
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        weeklyAnalysis[day] = {
          name: dayNames[day],
          avg: Math.round(avg),
          isWeekend: day === 5 || day === 6, // الجمعة والسبت عطلة في بعض الدول
          values: values.length,
        };
      }
    }

    return weeklyAnalysis;
  }

  // تحليل المواسم الخاصة (رمضان، الصيف، الشتاء)
  analyzeSpecialSeasons(data) {
    if (!data || data.length < 90) return null;

    const seasons = {
      ramadan: { name: 'رمضان', months: [8, 9], factor: 1.3 }, // رمضان في شهري 8-9 هجري
      summer: { name: 'الصيف', months: [6, 7, 8], factor: 1.2 },
      winter: { name: 'الشتاء', months: [12, 1, 2], factor: 0.9 },
      spring: { name: 'الربيع', months: [3, 4, 5], factor: 1.0 },
      autumn: { name: 'الخريف', months: [9, 10, 11], factor: 0.95 },
    };

    const overallAvg = this.getOverallAverage(data);
    const seasonalAnalysis = {};

    for (const [key, season] of Object.entries(seasons)) {
      const seasonData = [];

      data.forEach((value, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (data.length - index));
        const month = date.getMonth() + 1; // 1-12

        if (season.months.includes(month)) {
          seasonData.push(value);
        }
      });

      if (seasonData.length > 0) {
        const seasonAvg = seasonData.reduce((a, b) => a + b, 0) / seasonData.length;
        const impact = ((seasonAvg - overallAvg) / overallAvg) * 100;

        seasonalAnalysis[key] = {
          name: season.name,
          avg: Math.round(seasonAvg),
          impact: Math.round(impact * 10) / 10,
          trend: impact > 10 ? 'high' : impact < -10 ? 'low' : 'normal',
          recommendation: this.getSeasonRecommendation(key, impact),
        };
      }
    }

    return seasonalAnalysis;
  }

  // الحصول على المتوسط العام
  getOverallAverage(data) {
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  // توليد توصيات موسمية
  getSeasonRecommendation(season, impact) {
    const recommendations = {
      ramadan: {
        high: '📈 زيادة المخزون 30% قبل رمضان، توقع إقبال كبير',
        low: 'توقع انخفاض في رمضان، خطط عروض خاصة',
        normal: 'رمضان موسم متوسط، حافظ على المخزون الطبيعي',
      },
      summer: {
        high: '☀️ موسم الصيف قوي، زود المخزون 20%',
        low: 'انخفاض متوقع في الصيف، ركز على المنتجات الصيفية',
        normal: 'الصيف موسم عادي، حافظ على المستوى الحالي',
      },
      winter: {
        high: '❄️ إقبال شتوي قوي، جهز مخزون إضافي',
        low: 'انخفاض شتوي متوقع، خفّض الطلبات',
        normal: 'الشتاء موسم معتاد',
      },
      spring: {
        high: '🌱 ربيع نشط، استعد لزيادة المبيعات',
        low: 'ربيع هادئ، خطط لعروص',
        normal: 'ربيع عادي',
      },
      autumn: {
        high: '🍂 خريف نشط',
        low: 'خريف هادئ',
        normal: 'خريف عادي',
      },
    };

    return recommendations[season]?.[impact] || 'موسم عادي';
  }

  // توليد توصيات موسمية شاملة
  generateSeasonalRecommendations(monthlyPattern, weeklyPattern) {
    const recommendations = [];

    // توصيات شهرية
    if (monthlyPattern) {
      const currentMonth = new Date().getMonth();
      const nextMonth = (currentMonth + 1) % 12;

      if (monthlyPattern[nextMonth]?.peak === 'high') {
        recommendations.push({
          type: 'seasonal',
          icon: 'fa-solid fa-calendar-alt',
          color: '#d4af37',
          title: 'شهر قادم نشط',
          message: `الشهر القادم ${this.getMonthName(nextMonth)} متوقع أن يكون نشطاً`,
          action: 'زود المخزون بنسبة 25%',
        });
      }
    }

    // توصيات أسبوعية
    if (weeklyPattern) {
      const weekendAvg = (weeklyPattern[5]?.avg + weeklyPattern[6]?.avg) / 2;
      const weekdayAvg =
        (weeklyPattern[0]?.avg +
          weeklyPattern[1]?.avg +
          weeklyPattern[2]?.avg +
          weeklyPattern[3]?.avg +
          weeklyPattern[4]?.avg) /
        5;

      if (weekendAvg > weekdayAvg * 1.2) {
        recommendations.push({
          type: 'weekend',
          icon: 'fa-solid fa-umbrella-beach',
          color: '#2196F3',
          title: 'عطلات نهاية الأسبوع',
          message: 'المبيعات تزيد في عطلات نهاية الأسبوع',
          action: 'زود المخزون يومي الخميس والجمعة',
        });
      }
    }

    return recommendations;
  }

  // الحصول على اسم الشهر
  getMonthName(month) {
    const months = [
      'يناير',
      'فبراير',
      'مارس',
      'إبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];
    return months[month] || '';
  }
}

export default new SimplePredictor();
