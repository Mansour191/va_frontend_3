// دوال مساعدة للتكامل

// تعقيم نصوص HTML البسيطة للحماية من XSS
export const sanitizeHTML = (html) => {
  if (!html) return '';
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// إنشاء CSRF Token عشوائي (محاكاة)
export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// تشفير البيانات البسيطة في localStorage (محاكاة)
export const encryptData = (data) => {
  // في بيئة الإنتاج، يجب استخدام مكتبة تشفير حقيقية مثل crypto-js
  return btoa(JSON.stringify(data));
};

export const decryptData = (encryptedData) => {
  try {
    return JSON.parse(atob(encryptedData));
  } catch (e) {
    return null;
  }
};

// تنسيق التاريخ
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// تنسيق الوقت
export const formatTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// تنسيق التاريخ والوقت
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
};

// تحويل بيانات المنتج من الموقع لـ ERPNext
export const transformProductToERPNext = (product, categoryMapping) => {
  return {
    item_code: product.sku || `PROD-${product.id}`,
    item_name: product.name,
    item_group: categoryMapping[product.category] || 'منتجات متنوعة',
    stock_uom: 'Unit',
    standard_rate: product.price,
    description: product.description || '',
    image: product.image || '',
  };
};

// تحويل بيانات العميل من الموقع لـ ERPNext
export const transformCustomerToERPNext = (customer) => {
  return {
    customer_name: customer.name,
    customer_group: 'Individual',
    customer_type: 'Individual',
    email_id: customer.email,
    mobile_no: customer.phone,
    territory: 'All Territories',
  };
};

// تحويل بيانات الطلب لفاتورة في ERPNext
export const transformOrderToInvoice = (order, taxAccount) => {
  return {
    customer: order.customer.email,
    transaction_date: order.createdAt,
    due_date: order.createdAt,
    items: order.products.map((item) => ({
      item_code: item.sku,
      qty: item.quantity,
      rate: item.price,
    })),
    taxes: [
      {
        charge_type: 'On Net Total',
        account_head: taxAccount,
        rate: 15,
      },
    ],
    update_stock: 1,
  };
};

// إنشاء معرف فريد للمزامنة
export const generateSyncId = () => {
  return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// تصفية الأخطاء المتكررة
export const filterDuplicateErrors = (errors) => {
  const unique = new Map();
  errors.forEach((error) => {
    const key = `${error.type}_${error.message}`;
    if (!unique.has(key)) {
      unique.set(key, error);
    }
  });
  return Array.from(unique.values());
};
