<template>
  <div class="invoice-pdf">
    <!-- Invoice Header -->
    <div class="invoice-header">
      <div class="header-row">
        <div class="company-info">
          <h1 class="company-name">VinylArt</h1>
          <p class="company-address">الجزائر، سطيف</p>
          <p class="company-contact">هاتف: +213 XXX XXX XXX</p>
          <p class="company-email">info@vinylart.dz</p>
        </div>
        <div class="invoice-details">
          <h2 class="invoice-title">فاتورة</h2>
          <p class="invoice-number">رقم الفاتورة: {{ invoiceNumber }}</p>
          <p class="invoice-date">التاريخ: {{ formatDate(invoiceDate) }}</p>
          <p class="order-number">رقم الطلب: {{ order.orderNumber }}</p>
        </div>
      </div>
    </div>

    <!-- Customer Information -->
    <div class="customer-section">
      <h3 class="section-title">معلومات العميل</h3>
      <div class="customer-info">
        <div class="customer-details">
          <p><strong>الاسم:</strong> {{ order.customerName }}</p>
          <p><strong>الهاتف:</strong> {{ order.phone }}</p>
          <p><strong>البريد الإلكتروني:</strong> {{ order.email }}</p>
        </div>
        <div class="shipping-info">
          <p><strong>عنوان الشحن:</strong></p>
          <p>{{ order.shippingAddress }}</p>
          <p>{{ order.wilaya?.nameAr }}</p>
        </div>
      </div>
    </div>

    <!-- Order Items Table -->
    <div class="items-section">
      <h3 class="section-title">تفاصيل المنتجات</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>المنتج</th>
            <th>نوع الخامة</th>
            <th>المواصفات</th>
            <th>الكمية</th>
            <th>سعر الوحدة</th>
            <th>المجموع</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in order.items" :key="index">
            <td class="product-cell">
              <div class="product-info">
                <div class="product-name">{{ item.product?.nameAr }}</div>
                <div class="product-sku" v-if="item.variant?.sku">SKU: {{ item.variant.sku }}</div>
              </div>
            </td>
            <td class="material-cell">
              <div class="material-info">
                <div class="material-name">{{ item.material?.nameAr || 'خامة قياسية' }}</div>
                <div class="material-type" v-if="item.material?.isPremium">خامة مميزة</div>
              </div>
            </td>
            <td class="specs-cell">
              <div class="specifications">
                <div v-if="item.variant?.attributes">
                  {{ getVariantAttributes(item.variant.attributes) }}
                </div>
                <div v-if="item.customAttributes && Object.keys(item.customAttributes).length > 0">
                  {{ getCustomAttributes(item.customAttributes) }}
                </div>
                <div v-if="item.notes" class="item-notes">ملاحظات: {{ item.notes }}</div>
              </div>
            </td>
            <td class="quantity-cell">
              {{ item.quantity }}
              <span v-if="item.variant?.attributes?.unit">{{ item.variant.attributes.unit }}</span>
            </td>
            <td class="price-cell">{{ formatCurrency(item.price) }}</td>
            <td class="total-cell">{{ formatCurrency(item.totalPrice) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Order Summary -->
    <div class="summary-section">
      <div class="summary-row">
        <div class="summary-label">المجموع الفرعي:</div>
        <div class="summary-value">{{ formatCurrency(order.subtotal) }}</div>
      </div>
      <div class="summary-row">
        <div class="summary-label">تكلفة الشحن:</div>
        <div class="summary-value">{{ formatCurrency(order.shippingCost) }}</div>
      </div>
      <div class="summary-row" v-if="order.tax > 0">
        <div class="summary-label">الضريبة:</div>
        <div class="summary-value">{{ formatCurrency(order.tax) }}</div>
      </div>
      <div class="summary-row" v-if="order.discountAmount > 0">
        <div class="summary-label">الخصم:</div>
        <div class="summary-value discount">-{{ formatCurrency(order.discountAmount) }}</div>
      </div>
      <div class="summary-row total">
        <div class="summary-label">المجموع:</div>
        <div class="summary-value">{{ formatCurrency(order.totalAmount) }}</div>
      </div>
    </div>

    <!-- Payment Information -->
    <div class="payment-section">
      <h3 class="section-title">معلومات الدفع</h3>
      <div class="payment-info">
        <p><strong>طريقة الدفع:</strong> {{ getPaymentMethodLabel(order.paymentMethod) }}</p>
        <p><strong>حالة الدفع:</strong> {{ getPaymentStatusLabel(order.paymentStatus) }}</p>
        <p v-if="order.trackingNumber"><strong>رقم التتبع:</strong> {{ order.trackingNumber }}</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="invoice-footer">
      <div class="footer-row">
        <div class="footer-notes">
          <p>شكراً لثقتكم بـ VinylArt</p>
          <p>جميع الأسعار بالدينار الجزائري</p>
        </div>
        <div class="footer-signature">
          <p>التوقيع:</p>
          <div class="signature-line"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  invoiceNumber: {
    type: String,
    default: () => `INV-${Date.now()}`
  },
  invoiceDate: {
    type: String,
    default: () => new Date().toISOString()
  }
});

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getVariantAttributes = (attributes) => {
  if (!attributes || typeof attributes !== 'object') return '';
  
  const attrs = [];
  if (attributes.size) attrs.push(`المقاس: ${attributes.size}`);
  if (attributes.color) attrs.push(`اللون: ${attributes.color}`);
  if (attributes.dimension) attrs.push(`الأبعاد: ${attributes.dimension}`);
  if (attributes.orientation) attrs.push(`الاتجاه: ${attributes.orientation}`);
  
  return attrs.join(' | ');
};

const getCustomAttributes = (attributes) => {
  if (!attributes || typeof attributes !== 'object') return '';
  
  const attrs = [];
  if (attributes.customText) attrs.push(`نص مخصص: ${attributes.customText}`);
  if (attributes.customDesign) attrs.push(`تصميم مخصص`);
  if (attributes.urgent) attrs.push(`طلب عاجل`);
  if (attributes.notes) attrs.push(`ملاحظات: ${attributes.notes}`);
  
  return attrs.join(' | ');
};

const getPaymentMethodLabel = (method) => {
  const labels = {
    'cash': 'الدفع عند الاستلام',
    'card': 'بطاقة ائتمان',
    'transfer': 'تحويل بنكي',
    'ccp': 'CCP'
  };
  return labels[method] || method;
};

const getPaymentStatusLabel = (status) => {
  const labels = {
    'pending': 'في الانتظار',
    'paid': 'مدفوع',
    'failed': 'فشل',
    'refunded': 'مسترد'
  };
  return labels[status] || status;
};
</script>

<style scoped>
.invoice-pdf {
  font-family: 'Arial', sans-serif;
  direction: rtl;
  padding: 20px;
  background: white;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
}

/* Header Styles */
.invoice-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.company-info {
  text-align: right;
}

.company-name {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.company-address,
.company-contact,
.company-email {
  margin: 2px 0;
  font-size: 14px;
  color: #666;
}

.invoice-details {
  text-align: left;
}

.invoice-title {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.invoice-number,
.invoice-date,
.order-number {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

/* Section Styles */
.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin: 20px 0 10px 0;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 5px;
}

/* Customer Section */
.customer-section {
  margin-bottom: 30px;
}

.customer-info {
  display: flex;
  justify-content: space-between;
  gap: 40px;
}

.customer-details,
.shipping-info {
  flex: 1;
}

.customer-details p,
.shipping-info p {
  margin: 5px 0;
  font-size: 14px;
}

.customer-details strong,
.shipping-info strong {
  color: #2c3e50;
}

/* Items Table */
.items-section {
  margin-bottom: 30px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.items-table th {
  background-color: #f8f9fa;
  padding: 12px;
  text-align: right;
  border: 1px solid #dee2e6;
  font-weight: bold;
  font-size: 14px;
  color: #2c3e50;
}

.items-table td {
  padding: 12px;
  text-align: right;
  border: 1px solid #dee2e6;
  font-size: 14px;
  vertical-align: top;
}

.product-info {
  text-align: right;
}

.product-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.product-sku {
  font-size: 12px;
  color: #666;
}

.material-info {
  text-align: right;
}

.material-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.material-type {
  font-size: 12px;
  color: #f39c12;
}

.specifications {
  font-size: 13px;
  line-height: 1.4;
}

.item-notes {
  font-style: italic;
  color: #666;
  margin-top: 4px;
}

.quantity-cell {
  text-align: center;
  font-weight: 600;
}

.price-cell,
.total-cell {
  text-align: left;
  font-weight: 600;
}

.total-cell {
  font-size: 16px;
  color: #27ae60;
}

/* Summary Section */
.summary-section {
  margin-bottom: 30px;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
}

.summary-row.total {
  border-top: 2px solid #2c3e50;
  padding-top: 15px;
  margin-top: 15px;
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.summary-label {
  font-weight: 600;
}

.summary-value {
  font-weight: 600;
}

.summary-value.discount {
  color: #27ae60;
}

/* Payment Section */
.payment-section {
  margin-bottom: 30px;
}

.payment-info p {
  margin: 5px 0;
  font-size: 14px;
}

/* Footer */
.invoice-footer {
  margin-top: 40px;
  border-top: 2px solid #f0f0f0;
  padding-top: 20px;
}

.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.footer-notes {
  text-align: right;
}

.footer-notes p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.footer-signature {
  text-align: left;
}

.signature-line {
  width: 200px;
  height: 50px;
  border-bottom: 1px solid #999;
  margin-top: 20px;
}

/* Print Styles */
@media print {
  .invoice-pdf {
    padding: 10px;
    font-size: 12px;
  }
  
  .company-name {
    font-size: 24px;
  }
  
  .invoice-title {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .items-table th,
  .items-table td {
    padding: 8px;
    font-size: 12px;
  }
  
  .summary-row {
    font-size: 14px;
  }
  
  .summary-row.total {
    font-size: 16px;
  }
}
</style>
