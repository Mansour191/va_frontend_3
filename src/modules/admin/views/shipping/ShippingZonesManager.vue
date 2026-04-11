<template>
  <v-card class="shipping-zones-manager" elevation="2">
    <v-card-title class="d-flex align-center pa-4">
      <v-icon color="primary" class="me-2">mdi-truck</v-icon>
      {{ $t('shippingZonesManagement') || 'إدارة مناطق الشحن' }}
      <v-spacer />
      <v-btn
        color="primary"
        variant="elevated"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
      >
        {{ $t('addZone') || 'إضافة منطقة' }}
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Search and Filter -->
      <div class="d-flex align-center gap-3 mb-4">
        <v-text-field
          v-model="searchQuery"
          :label="$t('searchZones') || 'البحث عن المناطق'"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          class="flex-grow-1"
        />
        
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          :label="$t('filterByStatus') || 'تصفية حسب الحالة'"
          variant="outlined"
          density="compact"
          hide-details
          style="width: 150px"
        />
      </div>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="filteredZones"
        :loading="loading"
        :search="searchQuery"
        class="shipping-table"
      >
        <!-- Wilaya ID -->
        <template v-slot:item.wilayaId="{ item }">
          <v-chip size="small" variant="tonal">
            {{ item.wilayaId }}
          </v-chip>
        </template>

        <!-- Names -->
        <template v-slot:item.nameAr="{ item }">
          <div>
            <div class="text-body-2">{{ item.nameAr }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.nameFr }}</div>
          </div>
        </template>

        <!-- Prices -->
        <template v-slot:item.stopDeskPrice="{ item }">
          <div class="text-body-2 font-weight-bold">
            {{ formatPrice(item.stopDeskPrice) }}
          </div>
        </template>

        <template v-slot:item.homeDeliveryPrice="{ item }">
          <div class="text-body-2 font-weight-bold text-primary">
            {{ formatPrice(item.homeDeliveryPrice) }}
          </div>
        </template>

        <!-- Status -->
        <template v-slot:item.isActive="{ item }">
          <v-switch
            :model-value="item.isActive"
            color="success"
            inset
            hide-details
            @update:model-value="toggleZoneStatus(item, $event)"
          />
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <v-btn-group density="compact" variant="elevated">
            <v-btn
              size="small"
              icon="mdi-pencil"
              color="primary"
              @click="editZone(item)"
            />
            <v-btn
              size="small"
              icon="mdi-delete"
              color="error"
              @click="deleteZone(item)"
            />
          </v-btn-group>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialogOpen" max-width="600">
      <v-card>
        <v-card-title class="pa-4">
          <v-icon class="me-2">
            {{ editingZone ? 'mdi-pencil' : 'mdi-plus' }}
          </v-icon>
          {{ editingZone ? $t('editZone') : $t('addZone') }}
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-form ref="zoneForm" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="zoneForm.wilayaId"
                  :label="$t('wilayaId') || 'رمز الولاية'"
                  variant="outlined"
                  :rules="[v => !!v || 'هذا الحقل مطلوب']"
                  required
                  :disabled="!!editingZone"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="zoneForm.isActive"
                  :label="$t('active') || 'نشط'"
                  color="success"
                  inset
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="zoneForm.nameAr"
                  :label="$t('nameAr') || 'الاسم بالعربية'"
                  variant="outlined"
                  :rules="[v => !!v || 'هذا الحقل مطلوب']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="zoneForm.nameFr"
                  :label="$t('nameFr') || 'الاسم بالفرنسية'"
                  variant="outlined"
                  :rules="[v => !!v || 'هذا الحقل مطلوب']"
                  required
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="zoneForm.stopDeskPrice"
                  :label="$t('stopDeskPrice') || 'سعر نقطة التوقف'"
                  variant="outlined"
                  type="number"
                  prefix="د.ج"
                  :rules="[v => !!v || 'هذا الحقل مطلوب', v => v >= 0 || 'السعر يجب أن يكون موجباً']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="zoneForm.homeDeliveryPrice"
                  :label="$t('homeDeliveryPrice') || 'سعر التوصيل للمنزل'"
                  variant="outlined"
                  type="number"
                  prefix="د.ج"
                  :rules="[v => !!v || 'هذا الحقل مطلوب', v => v >= 0 || 'السعر يجب أن يكون موجباً']"
                  required
                />
              </v-col>
            </v-row>

            <!-- Regions JSON Editor -->
            <v-col cols="12">
              <v-textarea
                v-model="zoneForm.regionsText"
                :label="$t('regions') || 'المناطق (JSON)'"
                variant="outlined"
                rows="3"
                :placeholder="$t('regionsPlaceholder') || 'مثال: [\"الجزائر\", \"حسين داي\", \"بولوغين\"]'"
                :rules="[v => isValidJSON(v) || 'JSON غير صالح']"
              />
            </v-col>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="closeDialog" variant="outlined">
            {{ $t('cancel') || 'إلغاء' }}
          </v-btn>
          <v-btn
            color="primary"
            @click="saveZone"
            :loading="saving"
            :disabled="!formValid"
          >
            {{ $t('save') || 'حفظ' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialogOpen" max-width="400">
      <v-card>
        <v-card-title class="pa-4">
          <v-icon color="error" class="me-2">mdi-delete</v-icon>
          {{ $t('confirmDelete') || 'تأكيد الحذف' }}
        </v-card-title>

        <v-card-text class="pa-4">
          <p class="text-body-1">
            {{ $t('confirmDeleteMessage') || 'هل أنت متأكد من حذف منطقة الشحن هذه؟' }}
          </p>
          <p class="text-body-2 text-medium-emphasis">
            {{ $t('zoneToDelete') || 'منطقة الحذف' }}: {{ zoneToDelete?.nameAr }}
          </p>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="deleteDialogOpen = false" variant="outlined">
            {{ $t('cancel') || 'إلغاء' }}
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="deleting"
          >
            {{ $t('delete') || 'حذف' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useShipping } from '@/composables/useShipping';

// Composables
const { t } = useI18n();
const {
  activeZones,
  loading,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone: deleteShippingZoneAPI,
  toggleShippingZone,
  fetchActiveShippingZones
} = useShipping();

// State
const searchQuery = ref('');
const statusFilter = ref('all');
const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingZone = ref(null);
const zoneToDelete = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formValid = ref(false);
const zoneForm = ref({
  wilayaId: '',
  nameAr: '',
  nameFr: '',
  stopDeskPrice: 0,
  homeDeliveryPrice: 0,
  isActive: true,
  regionsText: '[]'
});

// Computed
const headers = computed(() => [
  { title: t('wilayaId') || 'رمز الولاية', key: 'wilayaId', sortable: true },
  { title: t('name') || 'الاسم', key: 'nameAr', sortable: true },
  { title: t('stopDeskPrice') || 'سعر نقطة التوقف', key: 'stopDeskPrice', sortable: true },
  { title: t('homeDeliveryPrice') || 'سعر التوصيل', key: 'homeDeliveryPrice', sortable: true },
  { title: t('status') || 'الحالة', key: 'isActive', sortable: true },
  { title: t('actions') || 'الإجراءات', key: 'actions', sortable: false }
]);

const statusOptions = computed(() => [
  { title: t('all') || 'الكل', value: 'all' },
  { title: t('active') || 'نشط', value: 'active' },
  { title: t('inactive') || 'غير نشط', value: 'inactive' }
]);

const filteredZones = computed(() => {
  let zones = activeZones.value;

  // Apply status filter
  if (statusFilter.value === 'active') {
    zones = zones.filter(zone => zone.isActive);
  } else if (statusFilter.value === 'inactive') {
    zones = zones.filter(zone => !zone.isActive);
  }

  return zones;
});

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(price);
};

const isValidJSON = (jsonString) => {
  if (!jsonString) return true;
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

const openCreateDialog = () => {
  editingZone.value = null;
  resetForm();
  dialogOpen.value = true;
};

const editZone = (zone) => {
  editingZone.value = zone;
  zoneForm.value = {
    wilayaId: zone.wilayaId,
    nameAr: zone.nameAr,
    nameFr: zone.nameFr,
    stopDeskPrice: zone.stopDeskPrice,
    homeDeliveryPrice: zone.homeDeliveryPrice,
    isActive: zone.isActive,
    regionsText: JSON.stringify(zone.regions || [], null, 2)
  };
  dialogOpen.value = true;
};

const resetForm = () => {
  zoneForm.value = {
    wilayaId: '',
    nameAr: '',
    nameFr: '',
    stopDeskPrice: 0,
    homeDeliveryPrice: 0,
    isActive: true,
    regionsText: '[]'
  };
};

const closeDialog = () => {
  dialogOpen.value = false;
  resetForm();
  editingZone.value = null;
};

const saveZone = async () => {
  if (!formValid.value) return;

  saving.value = true;
  try {
    const zoneData = {
      wilayaId: zoneForm.value.wilayaId,
      nameAr: zoneForm.value.nameAr,
      nameFr: zoneForm.value.nameFr,
      stopDeskPrice: zoneForm.value.stopDeskPrice,
      homeDeliveryPrice: zoneForm.value.homeDeliveryPrice,
      isActive: zoneForm.value.isActive,
      regions: JSON.parse(zoneForm.value.regionsText || '[]')
    };

    let result;
    if (editingZone.value) {
      result = await updateShippingZone(editingZone.value.id, zoneData);
    } else {
      result = await createShippingZone(zoneData);
    }

    if (result.success) {
      closeDialog();
      await fetchActiveShippingZones();
    }
  } catch (error) {
    console.error('❌ Error saving shipping zone:', error);
  } finally {
    saving.value = false;
  }
};

const deleteZone = (zone) => {
  zoneToDelete.value = zone;
  deleteDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!zoneToDelete.value) return;

  deleting.value = true;
  try {
    const result = await deleteShippingZoneAPI(zoneToDelete.value.id);
    if (result.success) {
      deleteDialogOpen.value = false;
      zoneToDelete.value = null;
      await fetchActiveShippingZones();
    }
  } catch (error) {
    console.error('❌ Error deleting shipping zone:', error);
  } finally {
    deleting.value = false;
  }
};

const toggleZoneStatus = async (zone, isActive) => {
  try {
    const result = await toggleShippingZone(zone.id, isActive);
    if (result.success) {
      await fetchActiveShippingZones();
    }
  } catch (error) {
    console.error('❌ Error toggling shipping zone:', error);
  }
};

// Initialize
onMounted(() => {
  fetchActiveShippingZones();
});
</script>

<style scoped>
.shipping-zones-manager {
  border-radius: 12px;
}

.shipping-table :deep(.v-data-table__tr) {
  cursor: pointer;
}

.shipping-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.05);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .d-flex.gap-3 {
    flex-direction: column;
  }
  
  .v-data-table :deep(.v-data-table__th),
  .v-data-table :deep(.v-data-table__td) {
    padding: 8px 4px;
  }
}
</style>
