// إعدادات العملة للموقع
export default {
  // العملة الافتراضية
  defaultCurrency: 'DZD',

  // إعدادات الدينار الجزائري
  currencies: {
    DZD: {
      code: 'DZD',
      symbol: 'د.ج',
      name: 'الدينار الجزائري',
      nameEn: 'Algerian Dinar',
      decimals: 2,
      format: '{value} {symbol}',
      position: 'right',
      thousandSeparator: ',',
      decimalSeparator: '.',
    },
  },

  // إعدادات التنسيق
  format: {
    DZD: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    },
  },
};
