<template>
  <v-dialog v-model="dialog" max-width="800" persistent>
    <v-card>
      <v-card-title class="pa-4 border-b">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="me-2" color="primary">mdi-truck</v-icon>
            <span class="text-h6">إدارة شركات الشحن</span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeDialog"
          ></v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Add/Edit Form -->
        <v-form ref="methodForm" v-model="formData" class="mb-6">
          <h3 class="mb-4" v-if="!editMode">إضافة شركة شحن جديدة</h3>
          <h3 class="mb-4" v-else>تعديل شركة الشحن</h3>
          
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                label="اسم الشركة"
                variant="outlined"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.provider"
                :items="providerOptions"
                item-title="title"
                item-value="value"
                label="المزود"
                variant="outlined"
                :rules="[rules.required]"
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.service_type"
                :items="serviceTypeOptions"
                item-title="title"
                item-value="value"
                label="نوع الخدمة"
                variant="outlined"
                :rules="[rules.required]"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.expected_delivery_time"
                label="وقت التوصيل المتوقع (أيام)"
                type="number"
                variant="outlined"
                :rules="[rules.required, rules.positive]"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-file-input
                v-model="formData.logo"
                label="الشعار"
                variant="outlined"
                accept="image/*"
                prepend-icon="mdi-image"
                show-size
              ></v-file-input>
            </v-col>
            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.is_active"
                label="نشط"
                color="primary"
                inset
              ></v-switch>
            </v-col>
          </v-row>

          <v-textarea
            v-model="formData.description"
            label="الوصف"
            variant="outlined"
            rows="3"
            class="mb-4"
          ></v-textarea>

          <!-- API Integration Fields -->
          <v-divider class="my-4"></v-divider>
          <h4 class="mb-4">معلومات التكامل مع API</h4>
          
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.api_endpoint"
                label="نقطة نهاية API"
                variant="outlined"
                placeholder="https://api.example.com/"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.api_key"
                label="مفتاح API"
                variant="outlined"
                type="password"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-text-field
            v-model="formData.tracking_url_template"
            label="قالب رابط التتبع"
            variant="outlined"
            placeholder="https://track.example.com/{tracking_number}"
            hint="استخدم {tracking_number} كعنصر نائب"
          ></v-text-field>
        </v-form>

        <!-- Shipping Methods List -->
        <v-divider class="my-4"></v-divider>
        <h3 class="mb-4">شركات الشحن المتاحة</h3>
        
        <v-data-table
          :headers="headers"
          :items="shippingMethods"
          :loading="isLoading"
          class="elevation-1"
          :items-per-page="10"
        >
          <!-- Logo -->
          <template v-slot:item.logo="{ item }">
            <v-avatar size="32" class="me-2">
              <v-img
                v-if="item.logo"
                :src="item.logo"
                :alt="item.name"
              ></v-img>
              <v-icon v-else>mdi-truck</v-icon>
            </v-avatar>
          </template>

          <!-- Provider -->
          <template v-slot:item.provider="{ item }">
            <v-chip size="small" :color="getProviderColor(item.provider)">
              {{ getProviderLabel(item.provider) }}
            </v-chip>
          </template>

          <!-- Service Type -->
          <template v-slot:item.service_type="{ item }">
            <v-chip size="small" :color="getServiceTypeColor(item.service_type)">
              {{ getServiceTypeLabel(item.service_type) }}
            </v-chip>
          </template>

          <!-- Status -->
          <template v-slot:item.is_active="{ item }">
            <v-chip
              :color="item.is_active ? 'success' : 'error'"
              size="small"
              variant="flat"
            >
              {{ item.is_active ? 'نشط' : 'معطل' }}
            </v-chip>
          </template>

          <!-- Actions -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="editMethod(item)"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteMethod(item)"
                :loading="isDeleting"
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
          :disabled="isSaving"
        >
          إغلاق
        </v-btn>
        <v-btn
          color="primary"
          @click="saveMethod"
          :loading="isSaving"
          :disabled="!isFormValid"
        >
          <v-icon start>{{ editMode ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
          {{ editMode ? 'حفظ التغييرات' : 'إضافة الشركة' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vuetify'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { 
  SHIPPING_METHODS_QUERY,
  CREATE_SHIPPING_METHOD_MUTATION,
  UPDATE_SHIPPING_METHOD_MUTATION,
  DELETE_SHIPPING_METHOD_MUTATION
} from '@/integration/graphql/shipping.graphql'
import { ValidationLayer } from '@/shared/utils/validationLayer'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'saved'])

// Local state
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const methodForm = ref(null)
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const editMode = ref(false)
const shippingMethods = ref([])

const formData = ref({
  id: null,
  name: '',
  provider: '',
  service_type: '',
  expected_delivery_time: 2,
  logo: null,
  description: '',
  is_active: true,
  api_endpoint: '',
  api_key: '',
  tracking_url_template: ''
})

// Options
const providerOptions = [
  { title: 'Yalidine', value: 'yalidine' },
  { title: 'ZR Express', value: 'zr_express' },
  { title: 'FedEx', value: 'fedex' },
  { title: 'DHL', value: 'dhl' },
  { title: 'Aramex', value: 'aramex' },
  { title: 'Local Post', value: 'local_post' },
  { title: 'Custom', value: 'custom' }
]

const serviceTypeOptions = [
  { title: 'توصيل للمنزل', value: 'home' },
  { title: 'نقطة استلام', value: 'desk' },
  { title: 'توصيل سريع', value: 'express' },
  { title: 'توصيل اقتصادي', value: 'economy' }
]

// Table headers
const headers = [
  { title: 'الشعار', key: 'logo', sortable: false, width: 80 },
  { title: 'اسم الشركة', key: 'name', sortable: true },
  { title: 'المزود', key: 'provider', sortable: true },
  { title: 'نوع الخدمة', key: 'service_type', sortable: true },
  { title: 'وقت التوصيل', key: 'expected_delivery_time', sortable: true },
  { title: 'الحالة', key: 'is_active', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, width: 100 }
]

// Validation rules
const rules = {
  required: value => !!value || 'هذا الحقل مطلوب',
  positive: value => value > 0 || 'يجب أن يكون الرقم موجباً'
}

// Computed
const isFormValid = computed(() => {
  return formData.value.name && 
         formData.value.provider && 
         formData.value.service_type && 
         formData.value.expected_delivery_time > 0
})

// Toast
const toast = useToast()

// Methods
function getProviderLabel(provider) {
  const option = providerOptions.find(opt => opt.value === provider)
  return option ? option.title : provider
}

function getProviderColor(provider) {
  const colors = {
    'yalidine': 'blue',
    'zr_express': 'green',
    'fedex': 'orange',
    'dhl': 'red',
    'aramex': 'purple',
    'local_post': 'grey',
    'custom': 'indigo'
  }
  return colors[provider] || 'grey'
}

function getServiceTypeLabel(serviceType) {
  const option = serviceTypeOptions.find(opt => opt.value === serviceType)
  return option ? option.title : serviceType
}

function getServiceTypeColor(serviceType) {
  const colors = {
    'home': 'primary',
    'desk': 'secondary',
    'express': 'warning',
    'economy': 'info'
  }
  return colors[serviceType] || 'grey'
}

// GraphQL Mutations
const { mutate: createShippingMethod } = useMutation(CREATE_SHIPPING_METHOD_MUTATION)
const { mutate: updateShippingMethod } = useMutation(UPDATE_SHIPPING_METHOD_MUTATION)
const { mutate: deleteShippingMethod } = useMutation(DELETE_SHIPPING_METHOD_MUTATION)

async function saveMethod() {
  if (!isFormValid.value) {
    toast({
      title: '❌ خطأ',
      text: 'يرجى تعبئة جميع الحقول المطلوبة',
      color: 'error',
      timeout: 3000
    })
    return
  }

  // Client-side validation
  const validationInput = {
    name: formData.value.name,
    cost: formData.value.cost || 0,
    deliveryDays: formData.value.expected_delivery_time || 1
  }
  
  const validation = ValidationLayer.validateShippingMethod(validationInput)
  if (!validation.isValid) {
    toast({
      title: '❌ خطأ في التحقق',
      text: validation.errors.join('، '),
      color: 'error',
      timeout: 5000
    })
    return
  }

  isSaving.value = true

  try {
    const variables = {
      name: formData.value.name,
      provider: formData.value.provider,
      serviceType: formData.value.service_type,
      expectedDeliveryTime: formData.value.expected_delivery_time,
      description: formData.value.description,
      isActive: formData.value.is_active,
      apiEndpoint: formData.value.api_endpoint,
      apiKey: formData.value.api_key,
      trackingUrlTemplate: formData.value.tracking_url_template
    }

    // Only include logo if it's a string (URL), not a File object
    if (typeof formData.value.logo === 'string' && formData.value.logo) {
      variables.logo = formData.value.logo
    }

    let result
    if (editMode.value) {
      variables.id = formData.value.id
      result = await updateShippingMethod(variables)
    } else {
      result = await createShippingMethod(variables)
    }

    if (result?.data?.createShippingMethod?.success || result?.data?.updateShippingMethod?.success) {
      toast({
        title: '✅ نجاح',
        text: editMode.value ? 'تم تحديث الشركة بنجاح' : 'تم إضافة الشركة بنجاح',
        color: 'success',
        timeout: 3000
      })

      // Reset form
      resetForm()
      
      // Refresh list
      await refetchShippingMethods()
      
      // Emit saved event
      emit('saved')
    } else {
      throw new Error('فشل حفظ البيانات')
    }
  } catch (error) {
    console.error('Error saving shipping method:', error)
    
    toast({
      title: '❌ خطأ',
      text: error.message || 'فشل حفظ الشركة',
      color: 'error',
      timeout: 5000
    })
  } finally {
    isSaving.value = false
  }
}

async function deleteMethod(method) {
  if (!confirm(`هل أنت متأكد من حذف شركة "${method.name}"؟`)) {
    return
  }

  isDeleting.value = true

  try {
    const result = await deleteShippingMethod({ id: method.id })

    if (result?.data?.deleteShippingMethod?.success) {
      toast({
        title: '✨ تم الحذف',
        text: 'تم حذف الشركة بنجاح',
        color: 'success',
        timeout: 3000
      })

      // Refresh list
      await refetchShippingMethods()
      
      // Emit saved event
      emit('saved')
    } else {
      throw new Error('فشل حذف الشركة')
    }
  } catch (error) {
    console.error('Error deleting shipping method:', error)
    
    toast({
      title: '❌ خطأ',
      text: error.message || 'فشل حذف الشركة',
      color: 'error',
      timeout: 5000
    })
  } finally {
    isDeleting.value = false
  }
}

function editMethod(method) {
  editMode.value = true
  formData.value = { ...method }
}

function resetForm() {
  editMode.value = false
  formData.value = {
    id: null,
    name: '',
    provider: '',
    service_type: '',
    expected_delivery_time: 2,
    logo: null,
    description: '',
    is_active: true,
    api_endpoint: '',
    api_key: '',
    tracking_url_template: ''
  }
  
  if (methodForm.value) {
    methodForm.value.resetValidation()
  }
}

function closeDialog() {
  dialog.value = false
  resetForm()
}

// GraphQL Query for shipping methods
const { 
  result: shippingMethodsResult, 
  loading: isLoading, 
  refetch: refetchShippingMethods 
} = useQuery(SHIPPING_METHODS_QUERY)

// Computed property to extract shipping methods from GraphQL result
const shippingMethods = computed(() => {
  return shippingMethodsResult.value?.shippingMethods?.edges?.map(edge => edge.node) || []
})

// Lifecycle
onMounted(() => {
  // GraphQL query will automatically fetch on mount
})
</script>

<style scoped>
.v-data-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.v-avatar {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>
