// نفس الكود السابق - احتفظ به كما هو
export default {
  defaultCurrency: 'DZD',
  baseURL: process.env.VUE_APP_ERPNEXT_URL || 'https://your-erpnext.com',
  apiKey: process.env.VUE_APP_ERPNEXT_API_KEY || 'demo-key',
  apiSecret: process.env.VUE_APP_ERPNEXT_API_SECRET || 'demo-secret',
  timeout: 30000,

  // إعدادات الدينار الجزائري
  currencies: {
    DZD: {
      code: 'DZD',
      symbol: 'د.ج',
      name: 'الدينار الجزائري',
      nameEn: 'Algerian Dinar',
      decimals: 2,
      format: '{symbol} {value}',
      position: 'right', // symbol on the right
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

  endpoints: {
    products: '/api/resource/Item',
    customers: '/api/resource/Customer',
    salesOrders: '/api/resource/Sales Order',
    salesInvoices: '/api/resource/Sales Invoice',
    stockBalance: '/api/method/erpnext.stock.utils.get_stock_balance',
    versions: '/api/method/erpnext.versions.get_versions',
  },

  sync: {
    interval: 5 * 60 * 1000,
    retryAttempts: 3,
    retryDelay: 5000,
    batchSize: 50,
  },

  categoryMapping: {
    walls: 'ملصقات جدران',
    doors: 'ملصقات أبواب',
    furniture: 'ملصقات أثاث',
    cars: 'ملصقات سيارات',
    ceilings: 'ملصقات أسقف',
    tiles: 'ملصقات بلاط',
    kitchens: 'ملصقات مطابخ',
  },

  defaultWarehouse: 'Stores - SA',
  defaultTaxAccount: 'VAT - 15% - SA',
};
