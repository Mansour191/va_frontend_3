<template>
  <v-dialog v-model="dialog" max-width="800" persistent>
    <v-card>
      <v-card-title class="pa-4 border-b">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="me-2" color="primary">mdi-truck</v-icon>
            <span class="text-h6">إدارة أسعار الشحن</span>
            <v-chip
              v-if="selectedWilaya"
              size="small"
              color="primary"
              class="ms-2"
            >
              {{ selectedWilaya.nameAr }}
            </v-chip>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeDialog"
          ></v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Search and Filter -->
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="بحث عن ولاية"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterRegion"
              :items="regions"
              label="المنطقة"
              clearable
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterStatus"
              :items="statusOptions"
              label="الحالة"
              clearable
              hide-details
            ></v-select>
          </v-col>
        </v-row>

        <!-- Bulk Operations -->
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="d-flex gap-2 align-center">
              <v-btn
                color="primary"
                variant="outlined"
                @click="showBulkUpdateDialog = true"
                :disabled="selectedWilayas.length === 0"
              >
                <v-icon start>mdi-pencil-multiple</v-icon>
                تحديث جماعي ({{ selectedWilayas.length }})
              </v-btn>
              
              <v-btn
                color="success"
                variant="outlined"
                @click="showBulkDiscountDialog = true"
                :disabled="selectedWilayas.length === 0"
              >
                <v-icon start>mdi-percent-multiple</v-icon>
                خصم جماعي
              </v-btn>
              
              <v-spacer></v-spacer>
              
              <v-btn
                color="info"
                variant="outlined"
                @click="exportData"
              >
                <v-icon start>mdi-download</v-icon>
                تصدير
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Wilayas Table -->
        <v-data-table
          v-model="selectedWilayas"
          :headers="headers"
          :items="filteredWilayas"
          :loading="isLoading"
          item-value="wilayaId"
          show-select
          class="elevation-1"
          :items-per-page="20"
          :search="searchQuery"
        >
          <!-- Status -->
          <template v-slot:item.isActive="{ item }">
            <v-chip
              :color="item.isActive ? 'success' : 'error'"
              size="small"
              variant="flat"
            >
              {{ item.isActive ? 'نشط' : 'معطل' }}
            </v-chip>
          </template>

          <!-- Home Delivery Price -->
          <template v-slot:item.homeDeliveryPrice="{ item }">
            <div class="d-flex align-center">
              <v-text-field
                v-model.number="item.homeDeliveryPrice"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                style="width: 120px;"
                @update:model-value="updatePrice(item.wilayaId, 'home_delivery_price', $event)"
                :disabled="isUpdating"
              ></v-text-field>
              <v-btn
                icon="mdi-content-copy"
                size="small"
                variant="text"
                @click="copyPrice(item.homeDeliveryPrice)"
                class="ms-2"
              ></v-btn>
            </div>
          </template>

          <!-- Stop Desk Price -->
          <template v-slot:item.stopDeskPrice="{ item }">
            <div class="d-flex align-center">
              <v-text-field
                v-model.number="item.stopDeskPrice"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                style="width: 120px;"
                @update:model-value="updatePrice(item.wilayaId, 'stop_desk_price', $event)"
                :disabled="isUpdating"
              ></v-text-field>
              <v-btn
                icon="mdi-content-copy"
                size="small"
                variant="text"
                @click="copyPrice(item.stopDeskPrice)"
                class="ms-2"
              ></v-btn>
            </div>
          </template>

          <!-- Express Delivery Price -->
          <template v-slot:item.expressDeliveryPrice="{ item }">
            <div class="d-flex align-center">
              <v-text-field
                v-model.number="item.expressDeliveryPrice"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                style="width: 120px;"
                @update:model-value="updatePrice(item.wilayaId, 'express_delivery_price', $event)"
                :disabled="isUpdating"
              ></v-text-field>
              <v-btn
                icon="mdi-content-copy"
                size="small"
                variant="text"
                @click="copyPrice(item.expressDeliveryPrice)"
                class="ms-2"
              ></v-btn>
            </div>
          </template>

          <!-- Free Shipping Minimum -->
          <template v-slot:item.freeShippingMinimum="{ item }">
            <div class="d-flex align-center">
              <v-text-field
                v-model.number="item.freeShippingMinimum"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                style="width: 120px;"
                @update:model-value="updatePrice(item.wilayaId, 'free_shipping_minimum', $event)"
                :disabled="isUpdating"
              ></v-text-field>
              <v-btn
                icon="mdi-content-copy"
                size="small"
                variant="text"
                @click="copyPrice(item.freeShippingMinimum)"
                class="ms-2"
              ></v-btn>
            </div>
          </template>

          <!-- Delivery Time -->
          <template v-slot:item.deliveryTimeDays="{ item }">
            <v-text-field
              v-model.number="item.deliveryTimeDays"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              style="width: 80px;"
              @update:model-value="updatePrice(item.wilayaId, 'delivery_time_days', $event)"
              :disabled="isUpdating"
            ></v-text-field>
          </template>

          <!-- Actions -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-map-marker"
                size="small"
                variant="text"
                color="info"
                @click="viewOnMap(item)"
              ></v-btn>
              <v-btn
                :icon="item.isActive ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'"
                size="small"
                :color="item.isActive ? 'success' : 'error'"
                variant="text"
                @click="toggleStatus(item)"
                :disabled="isUpdating"
              ></v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>

      <v-card-actions class="pa-4 border-t">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="closeDialog"
          :disabled="isUpdating"
        >
          إغلاق
        </v-btn>
        <v-btn
          color="primary"
          @click="saveChanges"
          :loading="isUpdating"
          :disabled="selectedWilayas.length === 0"
        >
          <v-icon start>mdi-content-save</v-icon>
          حفظ التغييرات
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Bulk Update Dialog -->
    <v-dialog v-model="showBulkUpdateDialog" max-width="500">
      <v-card>
        <v-card-title class="pa-4">
          <v-icon class="me-2">mdi-pencil-multiple</v-icon>
          تحديث جماعي للأسعار
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-alert type="info" variant="tonal" class="mb-4">
            سيتم تطبيق هذه التغييرات على {{ selectedWilayas.length }} ولاية مختارة
          </v-alert>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="bulkUpdate.homeDeliveryPrice"
                label="سعر التوصيل للمنزل"
                type="number"
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="bulkUpdate.stopDeskPrice"
                label="سعر التوصيل لنقطة الاستلام"
                type="number"
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="bulkUpdate.expressDeliveryPrice"
                label="سعر التوصيل السريع"
                type="number"
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="bulkUpdate.freeShippingMinimum"
                label="الحد الأدنى للشحن المجاني"
                type="number"
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showBulkUpdateDialog = false"
          >
            إلغاء
          </v-btn>
          <v-btn
            color="primary"
            @click="applyBulkUpdate"
            :loading="isUpdating"
          >
            تطبيق التحديث
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bulk Discount Dialog -->
    <v-dialog v-model="showBulkDiscountDialog" max-width="400">
      <v-card>
        <v-card-title class="pa-4">
          <v-icon class="me-2">mdi-percent-multiple</v-icon>
          خصم جماعي
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-alert type="warning" variant="tonal" class="mb-4">
            سيتم تطبيق الخصم على الأسعار الحالية للولايات المختارة
          </v-alert>

          <v-radio-group v-model="bulkDiscount.type" column>
            <v-radio label="نسبة مئوية" value="percentage"></v-radio>
            <v-radio label="مبلغ ثابت" value="fixed"></v-radio>
          </v-radio-group>

          <v-text-field
            v-model.number="bulkDiscount.value"
            :label="bulkDiscount.type === 'percentage' ? 'نسبة الخصم (%)' : 'مبلغ الخصم (د.ج)'"
            type="number"
            variant="outlined"
            hide-details
            class="mt-4"
            :suffix="bulkDiscount.type === 'percentage' ? '%' : 'د.ج'"
          ></v-text-field>

          <div class="mt-4">
            <h6 class="mb-2">معاينة التغيير:</h6>
            <v-data-table
              :headers="previewHeaders"
              :items="previewData"
              hide-default-footer
              density="compact"
            ></v-data-table>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showBulkDiscountDialog = false"
          >
            إلغاء
          </v-btn>
          <v-btn
            color="primary"
            @click="applyBulkDiscount"
            :loading="isUpdating"
          >
            تطبيق الخصم
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useShippingStore } from '@/stores/shipping'
import { useToast } from 'vuetify'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'updated'])

// Stores
const shippingStore = useShippingStore()
const toast = useToast()

// Local state
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const searchQuery = ref('')
const filterRegion = ref(null)
const filterStatus = ref(null)
const selectedWilayas = ref([])
const isUpdating = ref(false)
const showBulkUpdateDialog = ref(false)
const showBulkDiscountDialog = ref(false)

// Bulk update data
const bulkUpdate = ref({
  homeDeliveryPrice: null,
  stopDeskPrice: null,
  expressDeliveryPrice: null,
  freeShippingMinimum: null
})

// Bulk discount data
const bulkDiscount = ref({
  type: 'percentage',
  value: 20
})

// Table headers
const headers = [
  { title: 'كود الولاية', key: 'wilayaCode', sortable: true },
  { title: 'اسم الولاية', key: 'nameAr', sortable: true },
  { title: 'الحالة', key: 'isActive', sortable: true },
  { title: 'سعر التوصيل للمنزل', key: 'homeDeliveryPrice', sortable: true },
  { title: 'سعر نقطة الاستلام', key: 'stopDeskPrice', sortable: true },
  { title: 'سعر التوصيل السريع', key: 'expressDeliveryPrice', sortable: true },
  { title: 'شحن مجاني من', key: 'freeShippingMinimum', sortable: true },
  { title: 'مدة التوصيل', key: 'deliveryTimeDays', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, width: 100 }
]

const bulkPreviewHeaders = [
  { title: 'الولاية', key: 'nameAr' },
  { title: 'السعر الحالي', key: 'currentPrice' },
  { title: 'السعر الجديد', key: 'newPrice' }
]

// Options
const regions = [
  { title: 'الشمال', value: 'north' },
  { title: 'الشرق', value: 'east' },
  { title: 'الوسط', value: 'center' },
  { title: 'الغرب', value: 'west' },
  { title: 'الجنوب', value: 'south' }
]

const statusOptions = [
  { title: 'نشط', value: true },
  { title: 'معطل', value: false }
]

// Computed
const isLoading = computed(() => shippingStore.isLoading)

const filteredWilayas = computed(() => {
  let wilayas = [...shippingStore.wilayas]
  
  // Apply search filter
  if (searchQuery.value) {
    wilayas = shippingStore.searchWilayas(searchQuery.value)
  }
  
  // Apply region filter
  if (filterRegion.value) {
    wilayas = wilayas.filter(wilaya => 
      wilaya.regions && wilaya.regions.includes(filterRegion.value)
    )
  }
  
  // Apply status filter
  if (filterStatus.value !== null) {
    wilayas = wilayas.filter(wilaya => wilaya.isActive === filterStatus.value)
  }
  
  return wilayas
})

const previewData = computed(() => {
  return selectedWilayas.value.slice(0, 5).map(wilaya => {
    const currentPrice = wilaya.homeDeliveryPrice
    let newPrice = currentPrice
    
    if (bulkDiscount.value.type === 'percentage') {
      newPrice = currentPrice * (1 - bulkDiscount.value.value / 100)
    } else {
      newPrice = Math.max(0, currentPrice - bulkDiscount.value.value)
    }
    
    return {
      nameAr: wilaya.nameAr,
      currentPrice: formatCurrency(currentPrice),
      newPrice: formatCurrency(newPrice)
    }
  })
})

// Methods
function formatCurrency(amount) {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount)
}

async function updatePrice(wilayaId, field, value) {
  isUpdating.value = true
  
  try {
    const result = await shippingStore.updateShippingPrices(wilayaId, { [field]: value })
    
    if (result) {
      toast({
        title: '✅ تم التحديث',
        text: 'تم تحديث السعر بنجاح',
        color: 'success',
        timeout: 2000
      })
    }
  } catch (error) {
    toast({
      title: '❌ خطأ',
      text: 'فشل تحديث السعر',
        color: 'error',
        timeout: 3000
      })
  } finally {
    isUpdating.value = false
  }
}

async function toggleStatus(wilaya) {
  isUpdating.value = true
  
  try {
    const result = await shippingStore.updateShippingPrices(wilaya.wilayaId, { 
      isActive: !wilaya.isActive 
    })
    
    if (result) {
      toast({
        title: '✅ تم التحديث',
        text: `تم ${wilaya.isActive ? 'تعطيل' : 'تفعيل'} الولاية بنجاح`,
        color: 'success',
        timeout: 2000
      })
    }
  } catch (error) {
    toast({
      title: '❌ خطأ',
      text: 'فشل تحديث الحالة',
        color: 'error',
        timeout: 3000
      })
  } finally {
    isUpdating.value = false
  }
}

async function applyBulkUpdate() {
  if (selectedWilayas.value.length === 0) return
  
  isUpdating.value = true
  
  try {
    const wilayaIds = selectedWilayas.value.map(w => w.wilayaId)
    const updates = {}
    
    if (bulkUpdate.value.homeDeliveryPrice !== null) {
      updates.home_delivery_price = bulkUpdate.value.homeDeliveryPrice
    }
    if (bulkUpdate.value.stopDeskPrice !== null) {
      updates.stop_desk_price = bulkUpdate.value.stopDeskPrice
    }
    if (bulkUpdate.value.expressDeliveryPrice !== null) {
      updates.express_delivery_price = bulkUpdate.value.expressDeliveryPrice
    }
    if (bulkUpdate.value.freeShippingMinimum !== null) {
      updates.free_shipping_minimum = bulkUpdate.value.freeShippingMinimum
    }
    
    const result = await shippingStore.bulkUpdatePrices(wilayaIds, updates)
    
    if (result) {
      toast({
        title: '✅ تم التحديث الجماعي',
        text: `تم تحديث ${result.updated_count} ولاية بنجاح`,
        color: 'success',
        timeout: 3000
      })
      
      showBulkUpdateDialog.value = false
      selectedWilayas.value = []
      
      // Refresh data
      await shippingStore.fetchWilayas()
    }
  } catch (error) {
    toast({
      title: '❌ خطأ',
      text: 'فشل التحديث الجماعي',
        color: 'error',
        timeout: 3000
      })
  } finally {
    isUpdating.value = false
  }
}

async function applyBulkDiscount() {
  if (selectedWilayas.value.length === 0) return
  
  isUpdating.value = true
  
  try {
    const wilayaIds = selectedWilayas.value.map(w => w.wilayaId)
    const updates = {}
    
    selectedWilayas.value.forEach(wilaya => {
      let newPrice = wilaya.homeDeliveryPrice
      
      if (bulkDiscount.value.type === 'percentage') {
        newPrice = newPrice * (1 - bulkDiscount.value.value / 100)
      } else {
        newPrice = Math.max(0, newPrice - bulkDiscount.value.value)
      }
      
      updates[wilaya.wilayaId] = { home_delivery_price: newPrice }
    })
    
    const result = await shippingStore.bulkUpdatePrices(wilayaIds, updates)
    
    if (result) {
      toast({
        title: '✅ تطبيق الخصم',
        text: `تم تطبيق الخصم على ${result.updated_count} ولاية بنجاح`,
        color: 'success',
        timeout: 3000
      })
      
      showBulkDiscountDialog.value = false
      selectedWilayas.value = []
      
      // Refresh data
      await shippingStore.fetchWilayas()
    }
  } catch (error) {
    toast({
      title: '❌ خطأ',
      text: 'فشل تطبيق الخصم',
        color: 'error',
        timeout: 3000
      })
  } finally {
    isUpdating.value = false
  }
}

function copyPrice(price) {
  navigator.clipboard.writeText(price.toString())
  toast({
    title: '📋 نسخ',
    text: 'تم نسخ السعر',
    color: 'info',
    timeout: 1500
  })
}

function viewOnMap(wilaya) {
  if (wilaya.mapsUrl) {
    window.open(wilaya.mapsUrl, '_blank')
  } else {
    toast({
      title: '🗺️ خريطة',
      text: 'لا توجد خريطة متاحة لهذه الولاية',
      color: 'warning',
      timeout: 2000
    })
  }
}

function exportData() {
  const data = filteredWilayas.value.map(wilaya => ({
    'كود الولاية': wilaya.wilayaCode,
    'اسم الولاية': wilaya.nameAr,
    'الاسم الفرنسي': wilaya.nameEn,
    'سعر التوصيل للمنزل': wilaya.homeDeliveryPrice,
    'سعر نقطة الاستلام': wilaya.stopDeskPrice,
    'سعر التوصيل السريع': wilaya.expressDeliveryPrice,
    'الشحن المجاني من': wilaya.freeShippingMinimum,
    'مدة التوصيل': wilaya.deliveryTimeDays,
    'الحالة': wilaya.isActive ? 'نشط' : 'معطل'
  }))
  
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `shipping_prices_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  
  toast({
    title: '📊 تصدير',
    text: 'تم تصدير بيانات الشحن',
    color: 'success',
    timeout: 2000
  })
}

function closeDialog() {
  dialog.value = false
  selectedWilayas.value = []
  searchQuery.value = ''
  filterRegion.value = null
  filterStatus.value = null
}

// Lifecycle
onMounted(() => {
  shippingStore.fetchWilayas()
})
</script>

<style scoped>
.v-data-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.v-text-field :deep(.v-field__control) {
  text-align: center;
}

.bulk-preview {
  max-height: 200px;
  overflow-y: auto;
}
</style>
