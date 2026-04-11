<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-4">
        <v-icon class="me-2" color="primary">mdi-bullhorn</v-icon>
        إرسال إشعار إداري
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text class="pa-4">
        <v-form ref="form" v-model="valid">
          <!-- Recipient Type -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-label class="text-subtitle-1 font-weight-medium mb-2">
                المستلمون
              </v-label>
              <v-radio-group
                v-model="broadcastData.recipient_type"
                column
                hide-details
              >
                <v-radio
                  label="جميع المستخدمين"
                  value="all"
                  color="primary"
                ></v-radio>
                <v-radio
                  label="مجموعة محددة"
                  value="group"
                  color="primary"
                ></v-radio>
                <v-radio
                  label="دور محدد"
                  value="role"
                  color="primary"
                ></v-radio>
                <v-radio
                  label="مستخدمين محددين"
                  value="users"
                  color="primary"
                ></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

          <!-- Group/Role Selection -->
          <v-row v-if="broadcastData.recipient_type === 'group'" class="mb-4">
            <v-col cols="12">
              <v-select
                v-model="broadcastData.recipient_group"
                :items="groupOptions"
                label="اختر المجموعة"
                variant="outlined"
                hide-details
                :rules="[v => !!v || 'يجب اختيار مجموعة']"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon>{{ item.raw.icon }}</v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-row v-else-if="broadcastData.recipient_type === 'role'" class="mb-4">
            <v-col cols="12">
              <v-select
                v-model="broadcastData.recipient_group"
                :items="roleOptions"
                label="اختر الدور"
                variant="outlined"
                hide-details
                :rules="[v => !!v || 'يجب اختيار دور']"
              ></v-select>
            </v-col>
          </v-row>

          <v-row v-else-if="broadcastData.recipient_type === 'users'" class="mb-4">
            <v-col cols="12">
              <v-combobox
                v-model="broadcastData.selected_users"
                :items="userOptions"
                label="اختر المستخدمين"
                variant="outlined"
                multiple
                chips
                hide-details
                :rules="[v => v.length > 0 || 'يجب اختيار مستخدم واحد على الأقل']"
              ></v-combobox>
            </v-col>
          </v-row>

          <!-- Priority -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-label class="text-subtitle-1 font-weight-medium mb-2">
                الأولوية
              </v-label>
              <v-radio-group
                v-model="broadcastData.priority"
                row
                hide-details
              >
                <v-radio
                  label="منخفضة"
                  value="low"
                  color="grey"
                ></v-radio>
                <v-radio
                  label="متوسطة"
                  value="medium"
                  color="blue"
                ></v-radio>
                <v-radio
                  label="عالية"
                  value="high"
                  color="orange"
                ></v-radio>
                <v-radio
                  label="حرجة"
                  value="critical"
                  color="red"
                ></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

          <!-- Category -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-select
                v-model="broadcastData.category"
                :items="categoryOptions"
                label="الفئة"
                variant="outlined"
                hide-details
                :rules="[v => !!v || 'يجب اختيار فئة']"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon>{{ item.raw.icon }}</v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <!-- Title -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-text-field
                v-model="broadcastData.title"
                label="عنوان الإشعار"
                variant="outlined"
                counter="100"
                :rules="titleRules"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Message -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-textarea
                v-model="broadcastData.message"
                label="محتوى الإشعار"
                variant="outlined"
                counter="500"
                rows="4"
                :rules="messageRules"
                hide-details
              ></v-textarea>
            </v-col>
          </v-row>

          <!-- Action URL -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-text-field
                v-model="broadcastData.action_url"
                label="رابط الإجراء (اختياري)"
                variant="outlined"
                placeholder="https://example.com/action"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Action Text -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-text-field
                v-model="broadcastData.action_text"
                label="نص الزر (اختياري)"
                variant="outlined"
                placeholder="عرض التفاصيل"
                hide-details
                :disabled="!broadcastData.action_url"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Schedule -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-checkbox
                v-model="broadcastData.schedule_later"
                label="جدولة لوقت لاحق"
                hide-details
              ></v-checkbox>
            </v-col>
          </v-row>

          <v-row v-if="broadcastData.schedule_later" class="mb-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="broadcastData.schedule_date"
                type="date"
                label="التاريخ"
                variant="outlined"
                :min="minDate"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="broadcastData.schedule_time"
                type="time"
                label="الوقت"
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Preview -->
          <v-row v-if="broadcastData.title && broadcastData.message">
            <v-col cols="12">
              <v-label class="text-subtitle-1 font-weight-medium mb-2">
                معاينة الإشعار
              </v-label>
              <v-card variant="outlined" class="pa-3">
                <div class="d-flex align-start mb-2">
                  <v-avatar
                    :color="getPreviewColor()"
                    size="32"
                    class="me-3"
                  >
                    <v-icon size="16" color="white">
                      {{ getPreviewIcon() }}
                    </v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="font-weight-medium mb-1">
                      {{ broadcastData.title }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis mb-2">
                      {{ broadcastData.message }}
                    </div>
                    <div class="d-flex align-center gap-2">
                      <v-chip
                        :color="getPriorityColor(broadcastData.priority)"
                        size="x-small"
                        variant="flat"
                      >
                        {{ getPriorityLabel(broadcastData.priority) }}
                      </v-chip>
                      <span class="text-caption text-medium-emphasis">
                        الآن
                      </span>
                    </div>
                    <div v-if="broadcastData.action_url" class="mt-2">
                      <v-btn
                        size="small"
                        variant="outlined"
                        disabled
                      >
                        {{ broadcastData.action_text || 'فتح الرابط' }}
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="closeDialog"
          :disabled="isSending"
        >
          إلغاء
        </v-btn>
        <v-btn
          color="primary"
          @click="sendBroadcast"
          :loading="isSending"
          :disabled="!valid"
        >
          <v-icon start>mdi-send</v-icon>
          {{ broadcastData.schedule_later ? 'جدولة' : 'إرسال' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNotificationsStore, NOTIFICATION_CATEGORIES, NOTIFICATION_PRIORITIES } from '@/stores/notifications'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'sent'])

// Store
const notificationsStore = useNotificationsStore()

// Reactive state
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const valid = ref(false)
const isSending = ref(false)
const form = ref(null)

const broadcastData = ref({
  recipient_type: 'all',
  recipient_group: null,
  selected_users: [],
  priority: 'medium',
  category: NOTIFICATION_CATEGORIES.SYSTEM,
  title: '',
  message: '',
  action_url: '',
  action_text: '',
  schedule_later: false,
  schedule_date: '',
  schedule_time: ''
})

// Validation rules
const titleRules = [
  v => !!v || 'العنوان مطلوب',
  v => (v && v.length >= 3) || 'العنوان يجب أن يكون 3 أحرف على الأقل',
  v => (v && v.length <= 100) || 'العنوان يجب ألا يتجاوز 100 حرف'
]

const messageRules = [
  v => !!v || 'الرسالة مطلوبة',
  v => (v && v.length >= 10) || 'الرسالة يجب أن تكون 10 أحرف على الأقل',
  v => (v && v.length <= 500) || 'الرسالة يجب ألا تتجاوز 500 حرف'
]

// Computed
const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Options
const groupOptions = [
  { value: 'customers', label: 'العملاء', icon: 'mdi-account-group' },
  { value: 'admins', label: 'المديرون', icon: 'mdi-shield-account' },
  { value: 'managers', label: 'المديرون', icon: 'mdi-account-tie' },
  { value: 'employees', label: 'الموظفون', icon: 'mdi-account-hard-hat' },
  { value: 'vip_customers', label: 'العملاء المميزون', icon: 'mdi-star' }
]

const roleOptions = [
  { value: 'superuser', title: 'مدير النظام' },
  { value: 'admin', title: 'مدير' },
  { value: 'manager', title: 'مدير قسم' },
  { value: 'employee', title: 'موظف' },
  { value: 'customer', title: 'عميل' }
]

const categoryOptions = [
  { value: NOTIFICATION_CATEGORIES.SYSTEM, label: 'النظام', icon: 'mdi-cog' },
  { value: NOTIFICATION_CATEGORIES.MARKETING, label: 'التسويق', icon: 'mdi-bullhorn' },
  { value: NOTIFICATION_CATEGORIES.FINANCE, label: 'المالية', icon: 'mdi-cash' },
  { value: NOTIFICATION_CATEGORIES.ORDER, label: 'الطلبات', icon: 'mdi-shopping' },
  { value: NOTIFICATION_CATEGORIES.SECURITY, label: 'الأمان', icon: 'mdi-shield-account' },
  { value: NOTIFICATION_CATEGORIES.LOGISTICS, label: 'اللوجستيات', icon: 'mdi-truck' },
  { value: NOTIFICATION_CATEGORIES.INVENTORY, label: 'المخزون', icon: 'mdi-package' },
  { value: NOTIFICATION_CATEGORIES.CUSTOMER_SERVICE, label: 'خدمة العملاء', icon: 'mdi-headset' }
]

const userOptions = [
  // This would be populated from API
  { title: 'أحمد محمد', value: 1 },
  { title: 'فاطمة علي', value: 2 },
  { title: 'محمد إبراهيم', value: 3 },
  { title: 'مريم أحمد', value: 4 },
]

// Methods
const getPreviewIcon = () => {
  const icons = {
    [NOTIFICATION_CATEGORIES.SYSTEM]: 'mdi-cog',
    [NOTIFICATION_CATEGORIES.MARKETING]: 'mdi-bullhorn',
    [NOTIFICATION_CATEGORIES.FINANCE]: 'mdi-cash',
    [NOTIFICATION_CATEGORIES.ORDER]: 'mdi-shopping',
    [NOTIFICATION_CATEGORIES.SECURITY]: 'mdi-shield-account',
    [NOTIFICATION_CATEGORIES.LOGISTICS]: 'mdi-truck',
    [NOTIFICATION_CATEGORIES.INVENTORY]: 'mdi-package',
    [NOTIFICATION_CATEGORIES.CUSTOMER_SERVICE]: 'mdi-headset',
  }
  return icons[broadcastData.value.category] || 'mdi-bell'
}

const getPreviewColor = () => {
  const colors = {
    [NOTIFICATION_CATEGORIES.FINANCE]: 'success',
    [NOTIFICATION_CATEGORIES.INVENTORY]: 'warning',
    [NOTIFICATION_CATEGORIES.ORDER]: 'info',
    [NOTIFICATION_CATEGORIES.SECURITY]: 'error',
    [NOTIFICATION_CATEGORIES.MARKETING]: 'purple',
    [NOTIFICATION_CATEGORIES.SYSTEM]: 'grey',
    [NOTIFICATION_CATEGORIES.LOGISTICS]: 'teal',
    [NOTIFICATION_CATEGORIES.CUSTOMER_SERVICE]: 'indigo',
  }
  return colors[broadcastData.value.category] || 'primary'
}

const getPriorityColor = (priority) => {
  const colors = {
    [NOTIFICATION_PRIORITIES.LOW]: 'grey',
    [NOTIFICATION_PRIORITIES.MEDIUM]: 'blue',
    [NOTIFICATION_PRIORITIES.HIGH]: 'orange',
    [NOTIFICATION_PRIORITIES.CRITICAL]: 'red',
  }
  return colors[priority] || 'grey'
}

const getPriorityLabel = (priority) => {
  const labels = {
    [NOTIFICATION_PRIORITIES.LOW]: 'منخفض',
    [NOTIFICATION_PRIORITIES.MEDIUM]: 'متوسط',
    [NOTIFICATION_PRIORITIES.HIGH]: 'عالي',
    [NOTIFICATION_PRIORITIES.CRITICAL]: 'حرج',
  }
  return labels[priority] || 'متوسط'
}

const resetForm = () => {
  broadcastData.value = {
    recipient_type: 'all',
    recipient_group: null,
    selected_users: [],
    priority: 'medium',
    category: NOTIFICATION_CATEGORIES.SYSTEM,
    title: '',
    message: '',
    action_url: '',
    action_text: '',
    schedule_later: false,
    schedule_date: '',
    schedule_time: ''
  }
  
  if (form.value) {
    form.value.resetValidation()
  }
}

const closeDialog = () => {
  dialog.value = false
  resetForm()
}

const sendBroadcast = async () => {
  if (!form.value.validate()) {
    return
  }

  isSending.value = true

  try {
    const payload = {
      recipient_type: broadcastData.value.recipient_type,
      priority: broadcastData.value.priority,
      category: broadcastData.value.category,
      title: broadcastData.value.title,
      message: broadcastData.value.message,
      action_url: broadcastData.value.action_url || null,
      action_text: broadcastData.value.action_text || null,
      sender: 'admin'
    }

    if (broadcastData.value.recipient_type === 'group') {
      payload.recipient_group = broadcastData.value.recipient_group
    } else if (broadcastData.value.recipient_type === 'role') {
      payload.recipient_group = broadcastData.value.recipient_group
    } else if (broadcastData.value.recipient_type === 'users') {
      payload.user_ids = broadcastData.value.selected_users.map(u => u.value || u)
    }

    if (broadcastData.value.schedule_later) {
      const scheduleDateTime = new Date(`${broadcastData.value.schedule_date}T${broadcastData.value.schedule_time}`)
      payload.schedule_at = scheduleDateTime.toISOString()
    }

    const response = await fetch('/api/admin/broadcast/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      emit('sent', payload)
      closeDialog()
      
      // Show success message
      notificationsStore.addNotification({
        type: 'system_update',
        title: '✅ تم الإرسال بنجاح',
        message: broadcastData.value.schedule_later 
          ? 'تم جدولة الإشعار بنجاح' 
          : 'تم إرسال الإشعار بنجاح',
        priority: 'medium',
        category: NOTIFICATION_CATEGORIES.SYSTEM
      })
    } else {
      throw new Error('Failed to send broadcast')
    }
  } catch (error) {
    console.error('Error sending broadcast:', error)
    
    // Show error message
    notificationsStore.addNotification({
      type: 'system_update',
      title: '❌ فشل الإرسال',
      message: 'حدث خطأ أثناء إرسال الإشعار. يرجى المحاولة مرة أخرى.',
      priority: 'high',
      category: NOTIFICATION_CATEGORIES.SYSTEM
    })
  } finally {
    isSending.value = false
  }
}

const getAuthToken = () => {
  return localStorage.getItem('auth_token') || ''
}

// Watch for dialog close to reset form
watch(dialog, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-radio-group {
  gap: 8px;
}

.v-chip {
  font-size: 0.75rem;
}

.preview-card {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
}
</style>
