<template>
  <v-container fluid class="royal-products-manager pa-4">
    <!-- Header -->
    <v-card class="royal-header mb-6" v-motion="fadeUpVariants">
      <v-card-text class="pa-6">
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center">
              <v-avatar
                color="#d4af37"
                size="48"
                class="me-4 royal-avatar"
              >
                <v-icon icon="mdi-package-variant-closed" size="28"></v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h3 font-weight-bold royal-title">
                  <v-icon icon="mdi-crown" size="24" class="me-2 royal-crown"></v-icon>
                  {{ $t('products.title', 'إدارة المنتجات') }}
                </h1>
                <p class="text-body-1 royal-subtitle mt-2">
                  {{ $t('products.subtitle', 'إدارة جميع منتجات الفينيل والتصاميم') }}
                </p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="d-flex gap-3 justify-md-end justify-start">
              <v-btn
                @click="showAddDialog = true"
                color="#d4af37"
                variant="elevated"
                class="royal-btn-gold"
                prepend-icon="mdi-plus"
              >
                {{ $t('products.addProduct', 'إضافة منتج') }}
              </v-btn>
              <v-btn
                @click="importProducts"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-upload"
                class="royal-btn-outline"
              >
                {{ $t('common.import', 'استيراد') }}
              </v-btn>
              <v-btn
                @click="exportProducts"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-download"
                class="royal-btn-outline"
              >
                {{ $t('common.export', 'تصدير') }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3" v-for="stat in productStats" :key="stat.label">
        <v-card class="royal-stat-card" v-motion="fadeUpVariants">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-2 royal-stat-label mb-1">{{ stat.label }}</p>
                <h3 class="text-h4 font-weight-bold royal-stat-value">{{ stat.value }}</h3>
                <div class="d-flex align-center mt-2">
                  <v-icon 
                    :icon="stat.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'"
                    :color="stat.trend >= 0 ? 'success' : 'error'"
                    size="16"
                    class="me-1"
                  ></v-icon>
                  <span 
                    :class="stat.trend >= 0 ? 'text-success' : 'text-error'"
                    class="text-caption royal-trend"
                  >
                    {{ stat.trend >= 0 ? '+' : '' }}{{ stat.trend }}%
                  </span>
                </div>
              </div>
              <v-avatar
                :color="stat.color"
                size="48"
                class="royal-avatar-stat"
              >
                <v-icon :icon="stat.icon" size="24"></v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters and Search -->
    <v-card class="royal-filter-card mb-6" v-motion="fadeUpVariants">
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.global.value"
              :label="$t('products.search', 'بحث في المنتجات...')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              class="royal-field"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.category.value"
              :items="categories"
              :label="$t('products.category', 'الفئة')"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
              prepend-inner-icon="mdi-folder"
              class="royal-field"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status.value"
              :items="statusOptions"
              :label="$t('products.status', 'الحالة')"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
              prepend-inner-icon="mdi-check-circle"
              class="royal-field"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.priceRange.value"
              :items="priceRanges"
              :label="$t('products.priceRange', 'نطاق السعر')"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
              prepend-inner-icon="mdi-currency-usd"
              class="royal-field"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Products Table -->
    <v-card class="royal-table-card" v-motion="fadeUpVariants">
      <v-card-title class="pa-4 d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-table" size="24" class="me-2 royal-icon"></v-icon>
          <h3 class="text-h5 font-weight-bold">{{ $t('products.productList', 'قائمة المنتجات') }}</h3>
          <v-chip
            :color="products.length > 0 ? 'primary' : 'default'"
            variant="elevated"
            size="small"
            class="ms-3 royal-badge"
          >
            {{ products.length }}
          </v-chip>
        </div>
        <div class="d-flex gap-2">
          <v-btn
            @click="loadProducts"
            :loading="loading"
            variant="outlined"
            prepend-icon="mdi-refresh"
            size="small"
          >
            {{ $t('common.refresh', 'تحديث') }}
          </v-btn>
          <v-btn
            @click="exportProducts"
            variant="outlined"
            prepend-icon="mdi-download"
            size="small"
          >
            {{ $t('common.export', 'تصدير') }}
          </v-btn>
        </div>
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text class="pa-0">
        <v-data-table
          :headers="tableColumns"
          :items="filteredProducts"
          :loading="loading"
          :sort-by="[{ key: 'name', order: 'asc' }]"
          class="royal-data-table"
          :items-per-page="10"
          :items-per-page-options="[10, 25, 50, 100]"
        >
          <!-- Product Column -->
          <template v-slot:item.name="{ item }">
            <div class="d-flex align-center py-2">
              <v-avatar size="48" class="me-3 royal-avatar-small">
                <v-img :src="item.image || '/api/placeholder/48/48'" :alt="item.name"></v-img>
              </v-avatar>
              <div>
                <div class="font-weight-bold royal-product-name">{{ item.name }}</div>
                <div class="text-caption royal-product-sku">{{ item.sku }}</div>
              </div>
            </div>
          </template>

          <!-- Category Column -->
          <template v-slot:item.category="{ item }">
            <v-chip
              :color="getCategoryColor(item.category)"
              variant="elevated"
              size="small"
              class="royal-chip"
            >
              {{ getCategoryLabel(item.category) }}
            </v-chip>
          </template>

          <!-- Price Column -->
          <template v-slot:item.price="{ item }">
            <span class="font-weight-bold royal-price">
              {{ formatAmount(item.price) }}
            </span>
          </template>

          <!-- Stock Column -->
          <template v-slot:item.stock="{ item }">
            <v-chip
              :color="getStockColor(item.stock)"
              variant="elevated"
              size="small"
              class="royal-chip"
            >
              <v-icon icon="mdi-package" size="14" class="me-1"></v-icon>
              {{ item.stock }}
            </v-chip>
          </template>

          <!-- Status Column -->
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              variant="elevated"
              size="small"
              class="royal-chip"
            >
              {{ getStatusLabel(item.status) }}
            </v-chip>
          </template>

          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-eye"
                variant="text"
                size="small"
                @click="viewProduct(item)"
                class="royal-action-btn"
              ></v-btn>
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                @click="editProduct(item)"
                class="royal-action-btn"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                @click="confirmDelete(item)"
                class="royal-action-btn"
              ></v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Product Dialog -->
    <v-dialog v-model="showAddDialog" max-width="800" persistent>
      <v-card class="royal-dialog">
        <v-card-title class="pa-4 royal-dialog-header">
          <div class="d-flex align-center">
            <v-avatar color="#d4af37" size="32" class="me-3">
              <v-icon icon="mdi-plus" size="16"></v-icon>
            </v-avatar>
            <h3 class="text-h5 font-weight-bold">
              {{ $t('products.addNewProduct', 'إضافة منتج جديد') }}
            </h3>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-form ref="productForm" v-model="validForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newProduct.name"
                  :label="$t('products.productName', 'اسم المنتج')"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || $t('validation.required', 'هذا الحقل مطلوب')]"
                  class="royal-field"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newProduct.sku"
                  :label="$t('products.sku', 'رمز المنتج')"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || $t('validation.required', 'هذا الحقل مطلوب')]"
                  class="royal-field"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newProduct.category"
                  :items="categories"
                  :label="$t('products.category', 'الفئة')"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || $t('validation.required', 'هذا الحقل مطلوب')]"
                  class="royal-field"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newProduct.price"
                  :label="$t('products.price', 'السعر')"
                  type="number"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || $t('validation.required', 'هذا الحقل مطلوب')]"
                  class="royal-field"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newProduct.stock"
                  :label="$t('products.stock', 'المخزون')"
                  type="number"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || $t('validation.required', 'هذا الحقل مطلوب')]"
                  class="royal-field"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newProduct.status"
                  :items="statusOptions"
                  :label="$t('products.status', 'الحالة')"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || $t('validation.required', 'هذا الحقل مطلوب')]"
                  class="royal-field"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newProduct.description"
                  :label="$t('products.description', 'الوصف')"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  class="royal-field"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn @click="showAddDialog = false" variant="outlined">
            {{ $t('common.cancel', 'إلغاء') }}
          </v-btn>
          <v-btn @click="saveProduct" color="#d4af37" variant="elevated" :disabled="!validForm">
            <v-icon icon="mdi-content-save" class="me-2"></v-icon>
            {{ $t('common.save', 'حفظ') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400" persistent>
      <v-card class="royal-dialog">
        <v-card-title class="pa-4 royal-dialog-header">
          <div class="d-flex align-center">
            <v-avatar color="error" size="32" class="me-3">
              <v-icon icon="mdi-delete" size="16"></v-icon>
            </v-avatar>
            <h3 class="text-h5 font-weight-bold">
              {{ $t('products.deleteTitle', 'تأكيد الحذف') }}
            </h3>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <p class="text-body-1 mb-2">
            {{ $t('products.deleteMessage', 'هل أنت متأكد من حذف هذا المنتج؟') }}
          </p>
          <p class="font-weight-bold text-error">
            {{ productToDelete?.name }}
          </p>
          <p class="text-caption text-dim mt-2">
            {{ $t('products.deleteWarning', 'هذا الإجراء لا يمكن التراجع عنه') }}
          </p>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteDialog = false" variant="outlined">
            {{ $t('common.cancel', 'إلغاء') }}
          </v-btn>
          <v-btn @click="deleteProduct" color="error" variant="elevated">
            <v-icon icon="mdi-delete" class="me-2"></v-icon>
            {{ $t('common.delete', 'حذف') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import ProductsService from '@/services/ProductsService';
import CurrencySelector from '@/shared/components/CurrencySelector.vue';

// Store and i18n
const store = useStore();
const { t } = useI18n();

// State
const loading = ref(false);
const showAddDialog = ref(false);
const showDeleteDialog = ref(false);
const validForm = ref(false);
const products = ref([]);
const productToDelete = ref(null);
const productForm = ref(null);

// Filters
const filters = ref({
  global: { value: '' },
  category: { value: '' },
  status: { value: '' },
  priceRange: { value: '' }
});

// New product form
const newProduct = ref({
  name: '',
  sku: '',
  category: '',
  price: 0,
  stock: 0,
  status: 'active',
  description: ''
});

// Options data
const categories = ref([
  { value: 'ديكوري', label: 'ديكوري' },
  { value: 'جدران', label: 'جدران' },
  { value: 'أرضيات', label: 'أرضيات' },
  { value: 'سقوف', label: 'سقوف' },
  { value: 'أثاث', label: 'أثاث' },
  { value: 'مطابخ', label: 'مطابخ' },
  { value: 'حمامات', label: 'حمامات' }
]);

const statusOptions = ref([
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'low_stock', label: 'مخزون منخفض' },
  { value: 'out_of_stock', label: 'نفد المخزون' }
]);

const priceRanges = ref([
  { value: '0-1000', label: 'أقل من 1000' },
  { value: '1000-5000', label: '1000 - 5000' },
  { value: '5000-10000', label: '5000 - 10000' },
  { value: '10000+', label: 'أكثر من 10000' }
]);

// Motion variants
const fadeUpVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  leave: { opacity: 0, y: -20 }
};

// Table columns
const tableColumns = computed(() => [
  { title: t('products.product', 'المنتج'), key: 'name', sortable: false },
  { title: t('products.category', 'الفئة'), key: 'category' },
  { title: t('products.price', 'السعر'), key: 'price' },
  { title: t('products.stock', 'المخزون'), key: 'stock' },
  { title: t('products.sales', 'المبيعات'), key: 'sales' },
  { title: t('products.status', 'الحالة'), key: 'status' },
  { title: t('products.actions', 'الإجراءات'), key: 'actions', sortable: false }
]);

// Methods
const loadProducts = async () => {
  try {
    loading.value = true;
    const response = await ProductsService.getProducts();
    if (response.success) {
      products.value = response.data.products || [];
    } else {
      products.value = response.mockData?.products || [];
    }
  } catch (error) {
    console.error('Error loading products:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('products.loadError', 'فشل في تحميل المنتجات')
    });
  } finally {
    loading.value = false;
  }
};

const saveProduct = async () => {
  if (!validForm.value) return;
  
  try {
    const response = await ProductsService.createProduct(newProduct.value);
    if (response.success) {
      products.value.unshift(response.data);
      showAddDialog.value = false;
      resetForm();
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('products.createSuccess', 'تم إنشاء المنتج بنجاح')
      });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('products.createError', 'فشل في إنشاء المنتج')
    });
  }
};

const deleteProduct = async () => {
  if (!productToDelete.value) return;
  
  try {
    const response = await ProductsService.deleteProduct(productToDelete.value.id);
    if (response.success) {
      products.value = products.value.filter(p => p.id !== productToDelete.value.id);
      showDeleteDialog.value = false;
      productToDelete.value = null;
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('products.deleteSuccess', 'تم حذف المنتج بنجاح')
      });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('products.deleteError', 'فشل في حذف المنتج')
    });
  }
};

const viewProduct = (product) => {
  console.log('View product:', product);
  // TODO: Implement product view
};

const editProduct = (product) => {
  console.log('Edit product:', product);
  // TODO: Implement product edit
};

const confirmDelete = (product) => {
  productToDelete.value = product;
  showDeleteDialog.value = true;
};

const importProducts = () => {
  console.log('Import products');
  // TODO: Implement import functionality
};

const exportProducts = () => {
  console.log('Export products');
  // TODO: Implement export functionality
};

const resetForm = () => {
  newProduct.value = {
    name: '',
    sku: '',
    category: '',
    price: 0,
    stock: 0,
    status: 'active',
    description: ''
  };
  if (productForm.value) {
    productForm.value.reset();
  }
};

// Computed
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = !filters.value.global.value || 
      product.name.toLowerCase().includes(filters.value.global.value.toLowerCase()) ||
      product.sku.toLowerCase().includes(filters.value.global.value.toLowerCase());
    
    const matchesCategory = !filters.value.category.value || product.category === filters.value.category.value;
    const matchesStatus = !filters.value.status.value || product.status === filters.value.status.value;
    const matchesPrice = !filters.value.price.value || checkPriceRange(product.price, filters.value.price.value);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
  });
});

const productStats = computed(() => [
  { 
    label: t('products.totalProducts', 'إجمالي المنتجات'), 
    value: products.value.length, 
    icon: 'mdi-package-variant-closed', 
    color: '#d4af37', 
    trend: 12 
  },
  { 
    label: t('products.activeProducts', 'نشط الآن'), 
    value: products.value.filter(p => p.status === 'active').length, 
    icon: 'mdi-check-circle', 
    color: '#4caf50', 
    trend: 5 
  },
  { 
    label: t('products.lowStock', 'مخزون منخفض'), 
    value: products.value.filter(p => p.stock <= 10).length, 
    icon: 'mdi-alert', 
    color: '#ff9800', 
    trend: -2 
  },
  { 
    label: t('products.outOfStock', 'خارج المخزون'), 
    value: products.value.filter(p => p.stock === 0).length, 
    icon: 'mdi-close-circle', 
    color: '#f44336', 
    trend: 0 
  }
]);

// Helper methods
const formatAmount = (val) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(val);
};

const getCategoryLabel = (val) => {
  const category = categories.value.find(c => c.value === val);
  return category ? category.label : val;
};

const getCategoryColor = (category) => {
  const colors = {
    'ديكوري': '#d4af37',
    'جدران': '#4caf50',
    'أرضيات': '#2196f3',
    'سقوف': '#ff9800',
    'أثاث': '#9c27b0',
    'مطابخ': '#f44336',
    'حمامات': '#00bcd4'
  };
  return colors[category] || '#757575';
};

const getStockColor = (stock) => {
  if (stock === 0) return 'error';
  if (stock <= 10) return 'warning';
  return 'success';
};

const getStatusColor = (status) => {
  const colors = {
    'active': 'success',
    'inactive': 'error',
    'low_stock': 'warning',
    'out_of_stock': 'error'
  };
  return colors[status] || 'default';
};

const getStatusLabel = (status) => {
  const labels = {
    'active': t('products.active', 'نشط'),
    'inactive': t('products.inactive', 'غير نشط'),
    'low_stock': t('products.lowStock', 'مخزون منخفض'),
    'out_of_stock': t('products.outOfStock', 'نفد المخزون')
  };
  return labels[status] || status;
};

const checkPriceRange = (price, range) => {
  const [min, max] = range.split('-').map(p => p === '+' ? Infinity : parseInt(p));
  return price >= min && price <= max;
};

// Lifecycle
onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.royal-products-manager {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
}

/* Header Styles */
.royal-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.15);
}

.royal-title {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.royal-subtitle {
  color: #666;
}

.royal-crown {
  color: #d4af37;
}

.royal-avatar {
  border: 3px solid #d4af37;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.royal-btn-gold {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  color: #1a1a2e;
  font-weight: 600;
  border: none;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  transition: all 0.3s ease;
}

.royal-btn-gold:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.royal-btn-outline {
  border: 2px solid #d4af37;
  color: #d4af37;
  font-weight: 600;
  transition: all 0.3s ease;
}

.royal-btn-outline:hover {
  background: rgba(212, 175, 55, 0.1);
  transform: translateY(-1px);
}

/* Statistics Cards */
.royal-stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.1);
  transition: all 0.3s ease;
}

.royal-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.2);
}

.royal-stat-label {
  color: #666;
  font-weight: 500;
}

.royal-stat-value {
  color: #1a1a2e;
}

.royal-trend {
  font-weight: 600;
}

.royal-avatar-stat {
  border: 2px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
}

/* Filter Card */
.royal-filter-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.1);
}

.royal-field {
  transition: all 0.3s ease;
}

.royal-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.royal-field :deep(.v-field:hover) {
  border-color: #d4af37;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.15);
}

.royal-field :deep(.v-field__input) {
  color: #1a1a2e;
  font-weight: 500;
}

.royal-field :deep(.v-label) {
  color: #666;
  font-weight: 500;
}

/* Table Card */
.royal-table-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.1);
}

.royal-icon {
  color: #d4af37;
}

.royal-badge {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 100%);
  color: #1a1a2e;
  font-weight: 600;
}

.royal-data-table {
  background: transparent;
}

.royal-data-table :deep(.v-data-table__thead > tr > th) {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
  color: #d4af37;
  font-weight: 600;
  border-bottom: 2px solid rgba(212, 175, 55, 0.2);
}

.royal-data-table :deep(.v-data-table__tbody > tr:hover) {
  background: rgba(212, 175, 55, 0.05);
}

.royal-data-table :deep(.v-data-table__tbody > tr > td) {
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.royal-avatar-small {
  border: 2px solid rgba(212, 175, 55, 0.3);
}

.royal-product-name {
  color: #1a1a2e;
}

.royal-product-sku {
  color: #666;
}

.royal-chip {
  font-weight: 500;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.royal-price {
  color: #d4af37;
  font-size: 1.1rem;
}

.royal-action-btn {
  transition: all 0.2s ease;
}

.royal-action-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  transform: scale(1.1);
}

/* Dialog Styles */
.royal-dialog {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.2);
}

.royal-dialog-header {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.royal-stat-card,
.royal-filter-card,
.royal-table-card {
  animation: fadeInUp 0.6s ease-out;
}

/* Responsive Design */
@media (max-width: 960px) {
  .royal-title {
    font-size: 1.5rem;
  }
  
  .royal-header .v-btn {
    font-size: 0.875rem;
  }
}

@media (max-width: 600px) {
  .royal-products-manager {
    padding: 1rem;
  }
  
  .royal-header,
  .royal-filter-card,
  .royal-table-card {
    border-radius: 12px;
  }
  
  .royal-title {
    font-size: 1.25rem;
  }
  
  .royal-stat-card {
    margin-bottom: 1rem;
  }
}
</style>
        @selection-change="onSelectionChange"
        selectionMode="multiple"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
        responsiveLayout="scroll"
        scrollHeight="600px"
        v-auto-animate
      >
        <template #column-actions="{ data }">
          <div class="flex items-center space-x-2">
            <Button
              icon="fas fa-eye"
              class="p-button-rounded p-button-text p-button-plain"
              @click="viewProduct(data)"
            />
            <Button
              icon="fas fa-edit"
              class="p-button-rounded p-button-text p-button-plain"
              @click="editProduct(data)"
            />
            <Button
              icon="fas fa-trash"
              class="p-button-rounded p-button-text p-button-plain p-button-danger"
              @click="deleteProduct(data)"
            />
          </div>
        </template>

        <template #column-status="{ data }">
          <Tag
            :value="getStatusText(data.status)"
            :severity="getStatusSeverity(data.status)"
            class="rounded-full"
          />
        </template>

        <template #column-price="{ data }">
          <div class="flex items-center space-x-2">
            <span class="font-medium text-marble-900">{{ formatCurrency(data.price) }}</span>
            <Tag
              v-if="data.discount"
              :value="`${data.discount}%`"
              severity="success"
              class="rounded-full text-xs"
            />
          </div>
        </template>

        <template #column-stock="{ data }">
          <div class="flex items-center space-x-2">
            <span class="font-medium">{{ data.stock }}</span>
            <div
              class="w-2 h-2 rounded-full"
              :class="getStockStatus(data.stock)"
            ></div>
          </div>
        </template>

        <template #column-image="{ data }">
          <Image
            :src="data.image || '/placeholder-product.png'"
            :alt="data.name"
            width="50"
            height="50"
            class="rounded-xl"
            preview
          />
        </template>
      </RoyalDataTable>
    </div>

    <!-- Add/Edit Product Dialog -->
    <Dialog
      v-model:visible="showAddDialog"
      :header="editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'"
      :modal="true"
      :style="{ width: '600px' }"
      class="royal-dialog"
    >
      <form @submit.prevent="saveProduct" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label class="text-sm font-medium text-marble-700 mb-2">اسم المنتج</label>
            <InputText
              v-model="productForm.name"
              placeholder="أدخل اسم المنتج"
              required
            />
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-marble-700 mb-2">الفئة</label>
            <Dropdown
              v-model="productForm.category"
              :options="categories"
              placeholder="اختر الفئة"
              required
            />
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-marble-700 mb-2">السعر</label>
            <InputNumber
              v-model="productForm.price"
              mode="currency"
              currency="DZD"
              placeholder="0.00"
              required
            />
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-marble-700 mb-2">الخصم (%)</label>
            <InputNumber
              v-model="productForm.discount"
              :min="0"
              :max="100"
              placeholder="0"
            />
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-marble-700 mb-2">المخزون</label>
            <InputNumber
              v-model="productForm.stock"
              :min="0"
              placeholder="0"
              required
            />
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-marble-700 mb-2">الحالة</label>
            <Dropdown
              v-model="productForm.status"
              :options="statusOptions"
              placeholder="اختر الحالة"
              required
            />
          </div>
        </div>
        <div class="flex flex-col">
          <label class="text-sm font-medium text-marble-700 mb-2">الوصف</label>
          <Textarea
            v-model="productForm.description"
            rows="4"
            placeholder="أدخل وصف المنتج"
          />
        </div>
        <div class="flex flex-col">
          <label class="text-sm font-medium text-marble-700 mb-2">صورة المنتج</label>
          <div class="flex items-center space-x-4">
            <Image
              v-if="productForm.image"
              :src="productForm.image"
              :alt="productForm.name"
              width="100"
              height="100"
              class="rounded-xl"
              preview
            />
            <Button
              icon="fas fa-upload"
              label="رفع صورة"
              class="p-button-outlined p-button-royal"
              @click="uploadImage"
            />
          </div>
        </div>
      </form>
      
      <template #footer>
        <Button
          label="إلغاء"
          class="p-button-outlined p-button-royal"
          @click="showAddDialog = false"
        />
        <Button
          label="حفظ"
          class="p-button-royal"
          @click="saveProduct"
          :loading="saving"
        />
      </template>
    </Dialog>

    <!-- Product Details Dialog -->
    <Dialog
      v-model:visible="showDetailsDialog"
      header="تفاصيل المنتج"
      :modal="true"
      :style="{ width: '800px' }"
      class="royal-dialog"
    >
      <div v-if="selectedProduct" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Image
              :src="selectedProduct.image || '/placeholder-product.png'"
              :alt="selectedProduct.name"
              class="rounded-xl w-full"
              preview
            />
          </div>
          <div class="space-y-4">
            <div>
              <h3 class="text-xl font-bold text-marble-900">{{ selectedProduct.name }}</h3>
              <p class="text-marble-600 mt-2">{{ selectedProduct.description }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-marble-600">الفئة</p>
                <p class="font-medium text-marble-900">{{ selectedProduct.category }}</p>
              </div>
              <div>
                <p class="text-sm text-marble-600">السعر</p>
                <p class="font-medium text-marble-900">{{ formatCurrency(selectedProduct.price) }}</p>
              </div>
              <div>
                <p class="text-sm text-marble-600">المخزون</p>
                <p class="font-medium text-marble-900">{{ selectedProduct.stock }}</p>
              </div>
              <div>
                <p class="text-sm text-marble-600">الحالة</p>
                <Tag
                  :value="getStatusText(selectedProduct.status)"
                  :severity="getStatusSeverity(selectedProduct.status)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button
          label="إغلاق"
          class="p-button-royal"
          @click="showDetailsDialog = false"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFadeInUp } from '@/composables/useAnimations';
import RecommendationsWidget from '@/shared/components/RecommendationsWidget.vue';
import RoyalSidebar from '@/shared/components/ui/RoyalSidebar.vue';
import { FilterMatchMode } from 'primevue/api';

const { variants: fadeUpVariants } = useFadeInUp();

// State
const loading = ref(false);
const saving = ref(false);
const showAddDialog = ref(false);
const showDetailsDialog = ref(false);
const editingProduct = ref(null);
const selectedProduct = ref(null);
const selectedProducts = ref([]);

const products = ref([
  {
    id: 1,
    name: 'فينيل ديكوري ذهبي',
    category: 'فينيل جدران',
    price: 2500,
    discount: 10,
    stock: 45,
    status: 'active',
    description: 'فينيل ديكوري عالي الجودة بتصميم ذهبي أنيق',
    image: '/api/placeholder/300/200'
  },
  {
    id: 2,
    name: 'فينيل أرضيات خشبي',
    category: 'فينيل أرضيات',
    price: 3200,
    discount: 0,
    stock: 23,
    status: 'active',
    description: 'فينيل أرضيات بتصميم خشبي طبيعي',
    image: '/api/placeholder/300/200'
  },
  {
    id: 3,
    name: 'فينيل سقف أزرق',
    category: 'فينيل أسقف',
    price: 1800,
    discount: 15,
    stock: 0,
    status: 'out_of_stock',
    description: 'فينيل سقف بلون أزرق سماوي',
    image: '/api/placeholder/300/200'
  }
]);

const productForm = ref({
  name: '',
  category: '',
  price: null,
  discount: 0,
  stock: null,
  status: '',
  description: '',
  image: ''
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  category: { value: null, matchMode: FilterMatchMode.EQUALS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
  priceRange: { value: null, matchMode: FilterMatchMode.EQUALS }
});

// Options
const categories = ref(['فينيل جدران', 'فينيل أرضيات', 'فينيل أسقف', 'فينيل أبواب', 'فينيل نوافذ']);
const statusOptions = ref([
  { label: 'نشط', value: 'active' },
  { label: 'غير نشط', value: 'inactive' },
  { label: 'نفد المخزون', value: 'out_of_stock' }
]);
const priceRanges = ref([
  { label: 'أقل من 1000 دج', value: 'low' },
  { label: '1000 - 3000 دج', value: 'medium' },
  { label: 'أكثر من 3000 دج', value: 'high' }
]);

// Table columns
const tableColumns = ref([
  {
    field: 'image',
    header: 'الصورة',
    sortable: false
  },
  {
    field: 'name',
    header: 'اسم المنتج',
    sortable: true
  },
  {
    field: 'category',
    header: 'الفئة',
    sortable: true
  },
  {
    field: 'price',
    header: 'السعر',
    sortable: true
  },
  {
    field: 'stock',
    header: 'المخزون',
    sortable: true
  },
  {
    field: 'status',
    header: 'الحالة',
    sortable: true
  },
  {
    field: 'actions',
    header: 'الإجراءات',
    sortable: false
  }
]);

// Methods
const loadProducts = async () => {
  loading.value = true;
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Products already loaded
  } catch (error) {
    console.error('Error loading products:', error);
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(value);
};

const getStatusText = (status) => {
  const statusMap = {
    active: 'نشط',
    inactive: 'غير نشط',
    out_of_stock: 'نفد المخزون'
  };
  return statusMap[status] || status;
};

const getStatusSeverity = (status) => {
  const severityMap = {
    active: 'success',
    inactive: 'warning',
    out_of_stock: 'danger'
  };
  return severityMap[status] || 'info';
};

const getStockStatus = (stock) => {
  if (stock === 0) return 'bg-red-500';
  if (stock < 10) return 'bg-yellow-500';
  return 'bg-green-500';
};

const viewProduct = (product) => {
  selectedProduct.value = product;
  showDetailsDialog.value = true;
};

const editProduct = (product) => {
  editingProduct.value = product;
  productForm.value = { ...product };
  showAddDialog.value = true;
};

const deleteProduct = (product) => {
  if (confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`)) {
    // Delete logic here
    console.log('Deleting product:', product);
  }
};

const saveProduct = async () => {
  saving.value = true;
  try {
    // Save logic here
    await new Promise(resolve => setTimeout(resolve, 1000));
    showAddDialog.value = false;
    editingProduct.value = null;
    productForm.value = {
      name: '',
      category: '',
      price: null,
      discount: 0,
      stock: null,
      status: '',
      description: '',
      image: ''
    };
    await loadProducts();
  } catch (error) {
    console.error('Error saving product:', error);
  } finally {
    saving.value = false;
  }
};

const onSelectionChange = (event) => {
  selectedProducts.value = event.value;
};

const importProducts = () => {
  console.log('Import products');
};

const exportProducts = () => {
  console.log('Export products');
};

const uploadImage = () => {
  console.log('Upload image');
};

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.royal-products-manager {
  font-family: 'Inter', system-ui, sans-serif;
}

:deep(.royal-dialog) {
  @apply bg-white rounded-2xl shadow-marble;
}

:deep(.royal-dialog .p-dialog-header) {
  @apply bg-gradient-to-r from-royal-50 to-marble-50 border-b border-marble-200 p-4;
}

:deep(.royal-dialog .p-dialog-content) {
  @apply p-4;
}

:deep(.royal-dialog .p-dialog-footer) {
  @apply bg-gradient-to-r from-royal-50 to-marble-50 border-t border-marble-200 p-4;
}

/* Auto animate classes */
.auto-animate {
  --auto-animate-duration: 0.3s;
  --auto-animate-easing: ease-in-out;
}
</style>
