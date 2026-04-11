import currencyConfig from '@/shared/integration/config/currency.config';

class CurrencyService {
  constructor() {
    this.config = currencyConfig;
    this.currentCurrency = this.loadCurrency();
  }

  // تحميل العملة المحفوظة
  loadCurrency() {
    const saved = localStorage.getItem('preferredCurrency');
    if (saved && this.config.currencies[saved]) {
      return saved;
    }
    return this.config.defaultCurrency;
  }

  // حفظ العملة المختارة
  setCurrency(currencyCode) {
    if (this.config.currencies[currencyCode]) {
      this.currentCurrency = currencyCode;
      localStorage.setItem('preferredCurrency', currencyCode);
      return true;
    }
    return false;
  }

  // الحصول على معلومات العملة الحالية
  getCurrentCurrency() {
    return this.config.currencies[this.currentCurrency];
  }

  // تنسيق المبلغ
  formatAmount(amount, currencyCode = null) {
    const code = currencyCode || this.currentCurrency;
    const currency = this.config.currencies[code];

    if (!currency) return amount.toString();

    // تنسيق الرقم
    const formattedNumber = new Intl.NumberFormat('ar-DZ', {
      minimumFractionDigits: this.config.format.DZD.minimumFractionDigits,
      maximumFractionDigits: this.config.format.DZD.maximumFractionDigits,
      useGrouping: this.config.format.DZD.useGrouping,
    }).format(amount);

    // وضع الرمز حسب اللغة
    if (currency.position === 'right') {
      return `${formattedNumber} ${currency.symbol}`;
    } else {
      return `${currency.symbol} ${formattedNumber}`;
    }
  }

  // تحويل المبلغ (محذوفة المتغيرات غير المستخدمة)
  async convertAmount(amount) {
    // هنا يمكن إضافة API لتحويل العملات
    // حالياً نستخدم سعر ثابت 1:1
    return amount;
  }

  // الحصول على جميع العملات المتاحة
  static async getAvailableCurrencies() {
    try {
      // في المستقبل يمكن جلب هذه البيانات من API
      // حالياً نستخدم الإعدادات المحلية
      const currencies = Object.entries(currencyConfig.currencies).map(([code, data]) => ({
        code,
        symbol: data.symbol,
        name: data.name || code
      }));
      
      return {
        success: true,
        data: currencies
      };
    } catch (error) {
      console.error('❌ Error fetching available currencies:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // تنسيق للاستخدام في التقارير
  formatForReport(amount) {
    const currency = this.getCurrentCurrency();
    return {
      raw: amount,
      formatted: this.formatAmount(amount),
      withSymbol: `${amount} ${currency.symbol}`,
      withoutSymbol: amount.toString(),
    };
  }
}

export default new CurrencyService();
