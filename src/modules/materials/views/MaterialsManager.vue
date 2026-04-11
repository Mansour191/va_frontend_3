<template>
  <div class="materials-manager">
    <!-- Header Section -->
    <div class="materials-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">إدارة المواد</h1>
          <p class="page-subtitle">إدارة المواد الخام والمكونات</p>
        </div>
        <div class="header-right">
          <v-btn
            v-can="'api.add_material'"
            color="primary"
            prepend-icon="mdi-plus"
            @click="showAddMaterialDialog = true"
            class="add-material-btn"
            :title="canAddMaterials ? 'إضافة مادة جديدة' : 'ليس لديك صلاحية إضافة مواد'"
          >
            إضافة مادة
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="materials-content">
      <!-- Error State -->
      <div v-if="error" class="error-state">
        <v-alert
          type="error"
          prominent
          class="mb-4"
        >
          <v-alert-title>خطأ في جلب البيانات</v-alert-title>
          <div>{{ error.message }}</div>
          <v-btn
            color="white"
            variant="outlined"
            class="mt-3"
            @click="fetchMaterials"
          >
            إعادة المحاولة
          </v-btn>
        </v-alert>
      </div>

      <!-- Materials Table -->
      <div v-else class="materials-table-section">
        <v-data-table
          :headers="tableHeaders"
          :items="filteredMaterials"
          :loading="loading"
          :search="searchQuery"
          class="materials-table"
          :items-per-page="[10, 25, 50, 100]"
          :sort-by="[{ key: 'created_at', order: 'desc' }]"
        >
          <template v-slot:item.name="{ item }">
            <div class="material-info">
              <div class="material-name">{{ item.name }}</div>
              <div class="material-code">{{ item.code }}</div>
            </div>
          </template>

          <template v-slot:item.price="{ item }">
            <div class="material-price">
              <span class="price-value">{{ formatCurrency(item.price) }}</span>
              <v-icon 
                v-if="!canEditPrices" 
                icon="mdi-lock" 
                size="x-small" 
                color="warning"
                class="ms-2"
                title="ليس لديك صلاحية تعديل الأسعار"
              ></v-icon>
            </div>
          </template>

          <template v-slot:item.stock="{ item }">
            <v-chip
              :color="getStockColor(item.stock)"
              size="small"
              variant="flat"
            >
              {{ item.stock }} {{ item.unit }}
            </v-chip>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="item.is_active ? 'success' : 'error'"
              size="small"
              variant="flat"
            >
              {{ item.is_active ? 'نشط' : 'غير نشط' }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="action-buttons">
              <!-- View Button - Always visible -->
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                @click="viewMaterial(item)"
                class="action-btn"
                title="عرض التفاصيل"
              ></v-btn>
              
              <!-- Edit Button - Requires edit permission -->
              <v-btn
                v-can="'api.edit_material'"
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="editMaterial(item)"
                class="action-btn"
                :title="canEditMaterials ? 'تعديل المادة' : 'ليس لديك صلاحية تعديل المواد'"
              ></v-btn>
              
              <!-- Price Edit Button - Requires price permission -->
              <v-btn
                v-can="'api.change_price'"
                icon="mdi-currency-usd"
                size="small"
                variant="text"
                color="warning"
                @click="editPrice(item)"
                class="action-btn"
                :title="canEditPrices ? 'تعديل السعر' : 'ليس لديك صلاحية تعديل الأسعار'"
              ></v-btn>
              
              <!-- Delete Button - Requires delete permission -->
              <v-btn
                v-can="'api.delete_material'"
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteMaterial(item)"
                class="action-btn"
                :title="canDeleteMaterials ? 'حذف المادة' : 'ليس لديك صلاحية حذف المواد'"
              ></v-btn>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>

    <!-- Add/Edit Material Dialog -->
    <v-dialog v-model="showAddMaterialDialog" max-width="600">
      <v-card>
        <v-card-title class="dialog-title">
          {{ editingMaterial ? 'تعديل مادة' : 'إضافة مادة جديدة' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="materialForm" v-model="materialFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="materialForm.name"
                  label="اسم المادة"
                  :rules="[v => !!v || 'اسم المادة مطلوب']"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="materialForm.code"
                  label="الكود"
                  :rules="[v => !!v || 'الكود مطلوب']"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="materialForm.price"
                  label="السعر"
                  type="number"
                  :rules="[v => !!v || 'السعر مطلوب']"
                  variant="outlined"
                  density="compact"
                  prefix="د.ج"
                  :disabled="!canEditPrices"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="materialForm.stock"
                  label="المخزون"
                  type="number"
                  :rules="[v => !!v || 'المخزون مطلوب']"
                  variant="outlined"
                  density="compact"
                  suffix="وحدة"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="materialForm.is_active"
                  label="نشط"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showAddMaterialDialog = false">إلغاء</v-btn>
          <v-btn
            color="primary"
            @click="saveMaterial"
            :loading="savingMaterial"
            :disabled="!materialFormValid"
          >
            حفظ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Material Dialog -->
    <v-dialog v-model="showViewMaterialDialog" max-width="500">
      <v-card>
        <v-card-title class="dialog-title">
          تفاصيل المادة
        </v-card-title>
        <v-card-text>
          <div class="material-details" v-if="selectedMaterial">
            <div class="detail-item">
              <span class="detail-label">الاسم:</span>
              <span class="detail-value">{{ selectedMaterial.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">الكود:</span>
              <span class="detail-value">{{ selectedMaterial.code }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">السعر:</span>
              <span class="detail-value">{{ formatCurrency(selectedMaterial.price) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">المخزون:</span>
              <span class="detail-value">{{ selectedMaterial.stock }} {{ selectedMaterial.unit }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">الحالة:</span>
              <v-chip :color="selectedMaterial.is_active ? 'success' : 'error'" size="small">
                {{ selectedMaterial.is_active ? 'نشط' : 'غير نشط' }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showViewMaterialDialog = false">إغلاق</v-btn>
          <v-btn 
            v-can="'api.edit_material'"
            color="primary" 
            @click="editMaterial(selectedMaterial)"
          >
            تعديل
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { vCan } from '@/shared/directives/permissionDirective';

const store = useStore();
const { t } = useI18n();
const router = useRouter();

// Auth composable for permission checks
const { 
  user, 
  isAdmin, 
  canAddMaterials, 
  canEditMaterials, 
  canDeleteMaterials, 
  canEditPrices 
} = useAuth();

// Reactive data
const searchQuery = ref('');
const showAddMaterialDialog = ref(false);
const showViewMaterialDialog = ref(false);
const editingMaterial = ref(null);
const selectedMaterial = ref(null);
const savingMaterial = ref(false);
const materialFormValid = ref(false);

// Mock data - replace with real GraphQL query
const materials = ref([
  {
    id: 1,
    name: 'الخشب الأحمر',
    code: 'WD001',
    price: 150.50,
    stock: 100,
    unit: 'كجم',
    is_active: true,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'الخشب الأبيض',
    code: 'WD002',
    price: 120.00,
    stock: 250,
    unit: 'كجم',
    is_active: true,
    created_at: '2024-01-20T14:20:00Z'
  },
  {
    id: 3,
    name: 'مادة طلاء',
    code: 'PT001',
    price: 85.75,
    stock: 50,
    unit: 'لتر',
    is_active: false,
    created_at: '2024-02-10T11:00:00Z'
  }
]);

const loading = ref(false);
const error = ref(null);

// Material form
const materialForm = ref({
  name: '',
  code: '',
  price: 0,
  stock: 0,
  unit: 'كجم',
  is_active: true
});

// Table headers
const tableHeaders = [
  { title: 'اسم المادة', key: 'name' },
  { title: 'الكود', key: 'code' },
  { title: 'السعر', key: 'price' },
  { title: 'المخزون', key: 'stock' },
  { title: 'الحالة', key: 'status' },
  { title: 'الإجراءات', key: 'actions', sortable: false }
];

// Computed properties
const filteredMaterials = computed(() => {
  if (!searchQuery.value) return materials.value;
  
  const query = searchQuery.value.toLowerCase();
  return materials.value.filter(material => 
    material.name.toLowerCase().includes(query) ||
    material.code.toLowerCase().includes(query)
  );
});

// Methods
const fetchMaterials = () => {
  // Replace with actual GraphQL query
  console.log('Fetching materials...');
};

const saveMaterial = async () => {
  if (!materialFormValid.value) return;

  savingMaterial.value = true;
  try {
    // Replace with actual GraphQL mutation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (editingMaterial.value) {
      const index = materials.value.findIndex(m => m.id === editingMaterial.value.id);
      if (index !== -1) {
        materials.value[index] = { ...materials.value[index], ...materialForm.value };
      }
    } else {
      const newMaterial = {
        id: Date.now(),
        ...materialForm.value,
        created_at: new Date().toISOString()
      };
      materials.value.push(newMaterial);
    }

    showAddMaterialDialog.value = false;
    resetMaterialForm();
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: editingMaterial.value ? 'تم تحديث المادة بنجاح' : 'تم إضافة المادة بنجاح'
    });
  } catch (error) {
    console.error('Error saving material:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء حفظ المادة'
    });
  } finally {
    savingMaterial.value = false;
  }
};

const editMaterial = (material) => {
  editingMaterial.value = material;
  materialForm.value = { ...material };
  showAddMaterialDialog.value = true;
};

const viewMaterial = (material) => {
  selectedMaterial.value = material;
  showViewMaterialDialog.value = true;
};

const deleteMaterial = async (material) => {
  if (confirm(`هل أنت متأكد من حذف المادة "${material.name}"؟`)) {
    try {
      // Replace with actual GraphQL mutation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const index = materials.value.findIndex(m => m.id === material.id);
      if (index !== -1) {
        materials.value.splice(index, 1);
      }
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: 'تم حذف المادة بنجاح'
      });
    } catch (error) {
      console.error('Error deleting material:', error);
      store.dispatch('notifications/showNotification', {
        type: 'error',
        message: 'حدث خطأ أثناء حذف المادة'
      });
    }
  }
};

const editPrice = (material) => {
  // Open price edit dialog or navigate to price edit page
  console.log('Editing price for:', material.name);
};

const resetMaterialForm = () => {
  materialForm.value = {
    name: '',
    code: '',
    price: 0,
    stock: 0,
    unit: 'كجم',
    is_active: true
  };
  editingMaterial.value = null;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount);
};

const getStockColor = (stock) => {
  if (stock === 0) return 'error';
  if (stock < 20) return 'warning';
  return 'success';
};

// Lifecycle
onMounted(() => {
  fetchMaterials();
});
</script>

<style scoped>
.materials-manager {
  padding: 2rem;
  background: var(--bg-surface);
  min-height: 100vh;
}

.materials-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.header-right {
  display: flex;
  gap: 1rem;
}

.add-material-btn {
  min-width: 120px;
}

.materials-content {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.materials-table-section {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
}

.materials-table {
  border-radius: 12px;
}

.material-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.material-name {
  font-weight: 600;
  color: var(--text-primary);
}

.material-code {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.material-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-value {
  font-weight: 600;
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  min-width: 32px;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  padding: 1.5rem;
}

.material-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-surface);
  border-radius: 8px;
}

.detail-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.detail-value {
  font-weight: 600;
  color: var(--text-primary);
}

/* Responsive Design */
@media (max-width: 960px) {
  .materials-manager {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-right {
    justify-content: center;
  }
}
</style>
