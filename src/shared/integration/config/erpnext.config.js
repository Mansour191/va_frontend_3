// ERPNext Configuration - GraphQL-focused
export default {
  defaultCurrency: 'DZD',
  
  // GraphQL Configuration
  graphqlEndpoint: import.meta.env.VITE_GRAPHQL_URL || '/graphql',
  
  // ERPNext External API (for wrapper service only)
  erpnextURL: import.meta.env.VITE_ERPNEXT_URL || 'https://your-erpnext.com',
  erpnextApiKey: import.meta.env.VITE_ERPNEXT_API_KEY || '',
  erpnextApiSecret: import.meta.env.VITE_ERPNEXT_API_SECRET || '',
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

  // GraphQL Sync Configuration
  sync: {
    interval: 5 * 60 * 1000,
    retryAttempts: 3,
    retryDelay: 5000,
    batchSize: 50,
    autoSyncEnabled: true,
    syncTypes: {
      products: true,
      customers: true,
      orders: true,
      inventory: true,
      pricing: true
    }
  },

  // Category Mapping
  categoryMapping: {
    walls: 'ملصقات جدران',
    doors: 'ملصقات أبواب',
    furniture: 'ملصقات أثاث',
    cars: 'ملصقات سيارات',
    ceilings: 'ملصقات أسقف',
    tiles: 'ملصقات بلاط',
    kitchens: 'ملصقات مطابخ',
  },

  // ERPNext System Settings
  defaultWarehouse: 'Stores - SA',
  defaultTaxAccount: 'VAT - 15% - SA',

  // GraphQL Wrapper Settings
  wrapper: {
    preferGraphQL: true,
    fallbackToREST: true,
    logFailures: true,
    retryOnFailure: true
  }
};
