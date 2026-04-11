<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <div class="d-flex align-center">
          <v-avatar
            color="#d4af37"
            size="40"
            class="me-4"
          >
            <v-icon icon="mdi-package-variant-closed" size="24"></v-icon>
          </v-avatar>
          <div>
            <h1 class="text-h4 font-weight-bold">
              {{ $t('products.title', 'إدارة المنتجات') }}
            </h1>
            <p class="text-body-2 text-dim mt-1">
              {{ $t('products.subtitle', 'إدارة وتحديث مخزون تصاميم الفينيل والرخام') }}
            </p>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="4" class="text-md-end">
        <div class="d-flex gap-2 justify-md-end justify-start">
          <v-btn
            :loading="syncProgress > 0"
            :disabled="syncProgress > 0"
            @click="syncAllProducts"
            variant="outlined"
            color="primary"
          >
            <v-icon 
              :icon="syncProgress > 0 ? 'mdi-sync' : 'mdi-sync'" 
              :class="{ 'mdi-spin': syncProgress > 0 }"
              class="me-2"
            ></v-icon>
            {{ syncProgress > 0 ? $t('products.syncing', `مزامنة (${syncProgress}%)`) : $t('products.sync', 'مزامنة مع ERPNext') }}
          </v-btn>
          <v-btn
            @click="openNewProductModal"
            color="primary"
            variant="elevated"
          >
            <v-icon icon="mdi-plus" class="me-2"></v-icon>
            {{ $t('products.addProduct', 'إضافة منتج') }}
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3" v-for="stat in productStats" :key="stat.label">
        <v-card class="glass-card stat-card">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-2 text-dim mb-1">{{ stat.label }}</p>
                <h3 class="text-h4 font-weight-bold">{{ stat.value }}</h3>
                <div class="d-flex align-center mt-2">
                  <v-icon 
                    :icon="stat.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'"
                    :color="stat.trend >= 0 ? 'success' : 'error'"
                    size="16"
                    class="me-1"
                  ></v-icon>
                  <span 
                    :class="stat.trend >= 0 ? 'text-success' : 'text-error'"
                    class="text-caption"
                  >
                    {{ stat.trend >= 0 ? '+' : '' }}{{ stat.trend }}%
                  </span>
                </div>
              </div>
              <v-avatar
                :color="stat.color"
                size="48"
                class="elevation-2"
              >
                <v-icon :icon="stat.icon" size="24"></v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters and Search -->
    <v-card class="glass-card mb-6">
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              :label="$t('products.search', 'بحث عن منتج')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              @input="debouncedSearch"
              @click:clear="clearSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="categoryFilter"
              :items="categories"
              :label="$t('products.category', 'التصنيف')"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
              prepend-inner-icon="mdi-folder"
            ></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="stockFilter"
              :items="stockFilters"
              :label="$t('products.stockStatus', 'حالة المخزون')"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              clearable
              prepend-inner-icon="mdi-package"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <div class="d-flex gap-2">
              <v-btn-toggle
                v-model="viewMode"
                mandatory
                variant="outlined"
                density="compact"
              >
                <v-btn value="grid" icon="mdi-view-grid"></v-btn>
                <v-btn value="table" icon="mdi-view-list"></v-btn>
              </v-btn-toggle>
              <v-spacer></v-spacer>
              <v-btn
                @click="exportProducts"
                variant="outlined"
                prepend-icon="mdi-download"
              >
                {{ $t('common.export', 'تصدير') }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
          class="mb-4"
        ></v-progress-circular>
        <p class="text-body-1 text-dim">
          {{ $t('products.loading', 'جاري تحميل المنتجات...') }}
        </p>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert
          type="error"
          :text="error"
          closable
          class="mb-4"
        ></v-alert>
      </v-col>
    </v-row>

    <!-- Products Content -->
    <template v-else>
      <!-- Table View -->
      <v-data-table
        v-if="viewMode === 'table'"
        :headers="tableHeaders"
        :items="paginatedProducts"
        :loading="loading"
        :sort-by="[{ key: sortKey, order: sortOrder }]"
        class="products-table mb-6"
        @click:row="viewProduct"
      >
        <!-- Product Column -->
        <template v-slot:item.product="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="48" class="me-3">
              <v-img :src="item.image || '/api/placeholder/48/48'" :alt="item.name"></v-img>
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ item.name }}</div>
              <div class="text-caption text-dim">{{ item.sku }}</div>
            </div>
          </div>
        </template>

        <!-- Category Column -->
        <template v-slot:item.category="{ item }">
          <v-chip
            :color="getCategoryColor(item.category)"
            variant="elevated"
            size="small"
          >
            {{ getCategoryLabel(item.category) }}
          </v-chip>
        </template>

        <!-- Price Column -->
        <template v-slot:item.price="{ item }">
          <span class="font-weight-bold">
            {{ formatAmount(item.price) }}
          </span>
        </template>

        <!-- Stock Column -->
        <template v-slot:item.stock="{ item }">
          <v-chip
            :color="getStockColor(item.stock)"
            variant="elevated"
            size="small"
          >
            <v-icon icon="mdi-package" size="14" class="me-1"></v-icon>
            {{ item.stock }} {{ $t('products.units', 'قطعة') }}
          </v-chip>
        </template>

        <!-- Sales Column -->
        <template v-slot:item.sales="{ item }">
          <div class="d-flex align-center">
            <v-icon icon="mdi-shopping" size="16" class="me-1 text-dim"></v-icon>
            <span>{{ item.sales }}</span>
          </div>
        </template>

        <!-- Status Column -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            variant="elevated"
            size="small"
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
              @click.stop="viewProduct(item)"
            ></v-btn>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click.stop="editProduct(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click.stop="confirmDelete(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>

      <!-- Grid View -->
      <v-row v-else>
        <v-col 
          cols="12" sm="6" md="4" lg="3"
          v-for="product in paginatedProducts"
          :key="product.id"
        >
          <v-card class="product-card glass-card h-100">
            <v-img
              :src="product.image || '/api/placeholder/300/200'"
              :alt="product.name"
              height="200"
              cover
              class="align-end"
            >
              <v-chip
                v-if="product.featured"
                color="#d4af37"
                variant="elevated"
                size="small"
                class="ma-2"
              >
                <v-icon icon="mdi-star" size="12" class="me-1"></v-icon>
                {{ $t('products.featured', 'مميز') }}
              </v-chip>
            </v-img>
            
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-start mb-2">
                <div>
                  <h3 class="text-h6 font-weight-bold mb-1">{{ product.name }}</h3>
                  <p class="text-caption text-dim mb-2">{{ product.sku }}</p>
                </div>
                <v-chip
                  :color="getCategoryColor(product.category)"
                  variant="elevated"
                  size="small"
                >
                  {{ getCategoryLabel(product.category) }}
                </v-chip>
              </div>
              
              <p class="text-body-2 text-dim mb-3 line-clamp-2">{{ product.description }}</p>
              
              <div class="d-flex justify-space-between align-center mb-3">
                <div>
                  <span class="text-h5 font-weight-bold primary-text">{{ formatAmount(product.price) }}</span>
                </div>
                <v-chip
                  :color="getStockColor(product.stock)"
                  variant="elevated"
                  size="small"
                >
                  {{ product.stock }} {{ $t('products.units', 'قطعة') }}
                </v-chip>
              </div>
              
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center text-dim">
                  <v-icon icon="mdi-shopping" size="16" class="me-1"></v-icon>
                  <span class="text-caption">{{ product.sales }} {{ $t('products.sales', 'مبيعات') }}</span>
                </div>
                <v-chip
                  :color="getStatusColor(product.status)"
                  variant="elevated"
                  size="small"
                >
                  {{ getStatusLabel(product.status) }}
                </v-chip>
              </div>
            </v-card-text>
            
            <v-divider></v-divider>
            
            <v-card-actions class="pa-2">
              <v-btn
                variant="text"
                size="small"
                @click="viewProduct(product)"
              >
                <v-icon icon="mdi-eye" class="me-1"></v-icon>
                {{ $t('common.view', 'عرض') }}
              </v-btn>
              <v-btn
                variant="text"
                size="small"
                @click="editProduct(product)"
              >
                <v-icon icon="mdi-pencil" class="me-1"></v-icon>
                {{ $t('common.edit', 'تعديل') }}
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                size="small"
                color="error"
                @click="confirmDelete(product)"
              >
                <v-icon icon="mdi-delete"></v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Pagination -->
      <v-row v-if="filteredProducts.length > itemsPerPage">
        <v-col cols="12">
          <div class="d-flex justify-center">
            <v-pagination
              v-model="currentPage"
              :length="Math.ceil(filteredProducts.length / itemsPerPage)"
              :total-visible="7"
              @input="fetchProducts"
            ></v-pagination>
          </div>
        </v-col>
      </v-row>
    </template>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteModal" max-width="400" persistent>
      <v-card class="glass-card">
        <v-card-title class="pa-4">
          <div class="d-flex align-center">
            <v-avatar color="error" size="32" class="me-3">
              <v-icon icon="mdi-delete" size="16"></v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold">
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
          <v-btn @click="showDeleteModal = false" variant="outlined">
            {{ $t('common.cancel', 'إلغاء') }}
          </v-btn>
          <v-btn @click="handleDelete" color="error" variant="elevated">
            <v-icon icon="mdi-delete" class="me-2"></v-icon>
            {{ $t('common.delete', 'حذف') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { debounce } from 'lodash';
import ProductsService from '@/services/ProductsService';
import DashboardService from '@/services/DashboardService';
import AIService from '@/services/AIService';
import ERPNextService from '@/services/ERPNextService';

// Store and i18n
const store = useStore();
const { t } = useI18n();

// State
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const categoryFilter = ref('');
const stockFilter = ref('');
const viewMode = ref('grid');
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(12);
const showDeleteModal = ref(false);
const productToDelete = ref(null);
const products = ref([]);
const syncProgress = ref(0);
const categories = ref([]);

// Categories data
const categoryOptions = [
  { value: 'ديكوري', label: 'ديكوري' },
  { value: 'جدران', label: 'جدران' },
  { value: 'أرضيات', label: 'أرضيات' },
  { value: 'سقوف', label: 'سقوف' },
  { value: 'أثاث', label: 'أثاث' },
  { value: 'مطابخ', label: 'مطابخ' },
  { value: 'حمامات', label: 'حمامات' }
];

const stockFilters = [
  { value: 'in-stock', label: 'متوفر' },
  { value: 'low-stock', label: 'مخزون منخفض' },
  { value: 'out-of-stock', label: 'نفد المخزون' }
];

// Table headers
const tableHeaders = computed(() => [
  { title: t('products.product', 'المنتج'), key: 'product', sortable: false },
  { title: t('products.category', 'التصنيف'), key: 'category' },
  { title: t('products.price', 'السعر'), key: 'price' },
  { title: t('products.stock', 'المخزون'), key: 'stock' },
  { title: t('products.sales', 'المبيعات'), key: 'sales' },
  { title: t('products.status', 'الحالة'), key: 'status' },
  { title: t('products.actions', 'الإجراءات'), key: 'actions', sortable: false }
]);

// Methods
const fetchProducts = async () => {
  try {
    loading.value = true;
    error.value = null;

    const filters = {
      search: searchQuery.value,
      category: categoryFilter.value,
      stock_status: stockFilter.value,
      page: currentPage.value,
      limit: itemsPerPage.value,
      sort: sortKey.value,
      order: sortOrder.value
    };

    const response = await ProductsService.getProducts(filters);
    if (response.success) {
      products.value = response.data.products || [];
    } else {
      products.value = response.mockData?.products || [];
    }
    
    // Fetch categories
    const categoriesResponse = await ProductsService.getCategories();
    if (categoriesResponse.success) {
      categories.value = categoriesResponse.data;
    } else {
      categories.value = categoriesResponse.mockData;
    }
    
  } catch (err) {
    console.error('Error fetching products:', err);
    error.value = t('products.fetchError', 'فشل في تحميل المنتجات');
  } finally {
    loading.value = false;
  }
};

const createProduct = async (productData) => {
  try {
    // Generate AI-powered description if not provided
    if (!productData.description) {
      const aiDescription = await AIService.generateProductDescription(
        productData.name,
        productData.category
      );
      productData.description = aiDescription.description;
    }

    const response = await ProductsService.createProduct(productData);
    if (response.success) {
      products.value.unshift(response.data);
      
      // Sync with ERPNext
      await ERPNextService.syncProduct(response.data.id);
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('products.createSuccess', 'تم إنشاء المنتج بنجاح')
      });
      
      return response.data;
    }
    throw new Error(response.message);
  } catch (err) {
    console.error('Error creating product:', err);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('products.createError', 'فشل في إنشاء المنتج')
    });
    throw err;
  }
};

const updateProduct = async (productId, productData) => {
  try {
    const response = await ProductsService.updateProduct(productId, productData);
    if (response.success) {
      const index = products.value.findIndex(p => p.id === productId);
      if (index !== -1) {
        products.value[index] = response.data;
      }
      
      // Sync with ERPNext
      await ERPNextService.syncProduct(productId);
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('products.updateSuccess', 'تم تحديث المنتج بنجاح')
      });
      
      return response.data;
    }
    throw new Error(response.message);
  } catch (err) {
    console.error('Error updating product:', err);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('products.updateError', 'فشل في تحديث المنتج')
    });
    throw err;
  }
};

const deleteProduct = async (productId) => {
  try {
    const response = await ProductsService.deleteProduct(productId);
    if (response.success) {
      products.value = products.value.filter(p => p.id !== productId);
      
      // Sync deletion with ERPNext
      await ERPNextService.syncToERPNext('product_deletions', {
        productId,
        timestamp: new Date().toISOString()
      });
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('products.deleteSuccess', 'تم حذف المنتج بنجاح')
      });
    }
  } catch (err) {
    console.error('Error deleting product:', err);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('products.deleteError', 'فشل في حذف المنتج')
    });
    throw err;
  }
};

const syncAllProducts = async () => {
  try {
    syncProgress.value = 0;
    
    // Start ERPNext sync
    await ERPNextService.migrateProducts();
    
    // Monitor sync progress
    const checkProgress = async () => {
      const status = await ERPNextService.getProductSyncStatus();
      syncProgress.value = status.progress || 0;
      
      if (status.completed) {
        await fetchProducts(); // Refresh products list
        store.dispatch('notifications/showNotification', {
          type: 'success',
          message: t('products.syncSuccess', 'تمت المزامنة بنجاح')
        });
        return;
      }
      
      setTimeout(checkProgress, 2000); // Check again in 2 seconds
    };
    
    checkProgress();
  } catch (err) {
    console.error('Error syncing products:', err);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('products.syncError', 'فشل في المزامنة')
    });
  }
};

const exportProducts = async () => {
  try {
    const response = await ProductsService.exportProducts({
      format: 'excel',
      filters: {
        search: searchQuery.value,
        category: categoryFilter.value,
        stock_status: stockFilter.value
      }
    });
    
    if (response.success) {
      // Create download link
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('products.exportSuccess', 'تم تصدير المنتجات بنجاح')
      });
    }
  } catch (err) {
    console.error('Error exporting products:', err);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('products.exportError', 'فشل في تصدير المنتجات')
    });
  }
};

// Computed
const lowStockProducts = computed(() => 
  products.value.filter(p => p.stock > 0 && p.stock <= 10)
);

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
    value: lowStockProducts.value.length, 
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

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchesSearch = !searchQuery.value || 
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = !categoryFilter.value || p.category === categoryFilter.value;
    const matchesStock = !stockFilter.value || (
      stockFilter.value === 'in-stock' ? p.stock > 10 :
      stockFilter.value === 'low-stock' ? (p.stock > 0 && p.stock <= 10) :
      p.stock === 0
    );
    return matchesSearch && matchesCategory && matchesStock;
  });
});

const sortedProducts = computed(() => {
  const sorted = [...filteredProducts.value];
  sorted.sort((a, b) => {
    const aVal = a[sortKey.value];
    const bVal = b[sortKey.value];
    if (typeof aVal === 'number') return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal;
    return sortOrder.value === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });
  return sorted;
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return sortedProducts.value.slice(start, start + itemsPerPage.value);
});

// Helper methods
const formatAmount = (val) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(val);
};

const getCategoryLabel = (val) => {
  const category = categoryOptions.find(c => c.value === val);
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

// Event handlers
const debouncedSearch = debounce(() => { currentPage.value = 1; }, 300);
const clearSearch = () => { searchQuery.value = ''; currentPage.value = 1; };

const handleSort = (key) => {
  if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  else { sortKey.value = key; sortOrder.value = 'asc'; }
};

const viewProduct = (product) => {
  console.log('View product:', product);
  // TODO: Open product view modal
};

const editProduct = (product) => {
  console.log('Edit product:', product);
  // TODO: Open product edit modal
};

const confirmDelete = (product) => { 
  productToDelete.value = product; 
  showDeleteModal.value = true; 
};

const handleDelete = async () => {
  if (productToDelete.value) {
    try {
      await deleteProduct(productToDelete.value.id);
      showDeleteModal.value = false;
      productToDelete.value = null;
    } catch (err) {
      // Error already handled in deleteProduct
    }
  }
};

const openNewProductModal = () => {
  console.log('Open new product modal');
  // TODO: Open product creation modal
};

// Watchers
watch([searchQuery, categoryFilter, stockFilter], () => {
  currentPage.value = 1;
  fetchProducts();
});

watch(currentPage, () => {
  fetchProducts();
});

// Lifecycle
onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.glass-card {
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
}

.product-card {
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(212, 175, 55, 0.25);
}

.primary-text {
  color: #d4af37 !important;
}

.text-dim {
  color: rgba(255, 255, 255, 0.7) !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Vuetify overrides */
:deep(.v-data-table) {
  background: transparent;
}

:deep(.v-data-table .v-table__thead > tr > th) {
  background: rgba(212, 175, 55, 0.1);
  color: #d4af37;
  font-weight: 600;
}

:deep(.v-data-table .v-table__tbody > tr:hover) {
  background: rgba(212, 175, 55, 0.05);
}

:deep(.v-data-table .v-table__tbody > tr > td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.v-field) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

:deep(.v-field .v-field__input) {
  color: #fff;
}

:deep(.v-field .v-label) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.v-select .v-field__input) {
  color: #fff;
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-card) {
  transition: all 0.3s ease;
}

:deep(.v-chip) {
  transition: all 0.2s ease;
}

:deep(.v-pagination .v-pagination__item) {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

:deep(.v-pagination .v-pagination__item--is-active) {
  background: #d4af37;
  color: #000;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
