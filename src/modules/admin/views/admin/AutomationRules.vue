<template>
  <v-container class="pa-4">
    <!-- Page Header -->
    <div class="page-header mb-6">
      <h1 class="text-h3 font-weight-bold text-white mb-4 d-flex align-center ga-3">
        <v-icon color="primary" size="40">mdi-robot</v-icon>
        {{ $t('automationRules') || 'قواعد الأتمتة الذكية' }}
      </h1>
      <v-btn
        @click="showRuleModal = true"
        variant="elevated"
        color="primary"
        prepend-icon="mdi-plus"
      >
        {{ $t('newRule') || 'قاعدة جديدة' }}
      </v-btn>
    </div>

    <!-- Rules List -->
    <v-row>
      <v-col
        v-for="rule in rules"
        :key="rule.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card variant="elevated" class="rule-card">
          <v-card-text class="pa-4">
            <!-- Rule Header -->
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="rule-title d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-cog</v-icon>
                <h3 class="text-h6 font-weight-medium text-white mb-0">{{ rule.name }}</h3>
              </div>
              <v-switch
                v-model="rule.enabled"
                @change="toggleRule(rule)"
                color="success"
                inset
              />
            </div>

            <!-- Rule Details -->
            <div class="rule-details mb-4">
              <div class="d-flex align-center ga-2 mb-2">
                <v-icon size="16" color="primary">mdi-lightning-bolt</v-icon>
                <span class="text-caption text-medium-emphasis">{{ $t('event') || 'الحدث' }}:</span>
                <span class="text-body-2 text-white">{{ getTriggerLabel(rule.trigger) }}</span>
              </div>
              <div class="d-flex align-center ga-2">
                <v-icon size="16" color="primary">mdi-play</v-icon>
                <span class="text-caption text-medium-emphasis">{{ $t('action') || 'الإجراء' }}:</span>
                <span class="text-body-2 text-white">{{ getActionLabel(rule.action) }}</span>
              </div>
            </div>

            <!-- Rule Actions -->
            <div class="rule-actions d-flex ga-2 justify-end">
              <v-btn
                @click="editRule(rule)"
                variant="tonal"
                color="primary"
                size="small"
                icon="mdi-pencil"
              />
              <v-btn
                @click="deleteRule(rule.id)"
                variant="tonal"
                color="error"
                size="small"
                icon="mdi-delete"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-card v-if="rules.length === 0" variant="elevated" class="empty-state text-center py-8">
      <v-card-text class="pa-6">
        <v-avatar size="80" color="primary" variant="tonal" class="mb-4">
          <v-icon size="48" color="primary">mdi-robot-off</v-icon>
        </v-avatar>
        <h3 class="text-h5 font-weight-medium text-white mb-2">{{ $t('noRules') || 'لا توجد قواعد' }}</h3>
        <p class="text-body-1 text-medium-emphasis mb-4">
          {{ $t('noRulesMessage') || 'لم يتم إعداد أي قواعد أتمتة بعد' }}
        </p>
        <v-btn
          @click="showRuleModal = true"
          variant="elevated"
          color="primary"
          prepend-icon="mdi-plus"
        >
          {{ $t('createFirstRule') || 'إنشاء أول قاعدة' }}
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Rule Dialog -->
    <v-dialog v-model="showRuleModal" max-width="600">
      <v-card>
        <v-card-title class="pa-6">
          <h2 class="text-h5 font-weight-bold">
            {{ editingRule ? ($t('editRule') || 'تعديل قاعدة') : ($t('newRule') || 'قاعدة جديدة') }}
          </h2>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form @submit.prevent="saveRule">
            <v-text-field
              v-model="form.name"
              :label="$t('ruleName') || 'اسم القاعدة'"
              variant="outlined"
              required
              class="mb-4"
            />

            <v-select
              v-model="form.trigger"
              :label="$t('trigger') || 'الحدث'"
              :items="triggerOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              required
              class="mb-4"
            />

            <v-select
              v-model="form.action"
              :label="$t('action') || 'الإجراء'"
              :items="actionOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              required
              class="mb-4"
            />

            <v-switch
              v-model="form.enabled"
              :label="$t('enabled') || 'مفعل'"
              color="success"
              inset
              class="mb-4"
            />

            <div class="d-flex ga-3 justify-end">
              <v-btn
                @click="closeModal"
                variant="tonal"
                color="default"
              >
                {{ $t('cancel') || 'إلغاء' }}
              </v-btn>
              <v-btn
                type="submit"
                variant="elevated"
                color="primary"
              >
                {{ $t('save') || 'حفظ' }}
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-medium-emphasis">{{ $t('loading') || 'جاري التحميل...' }}</p>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import AutomationService from '@/services/AutomationService';

const { t } = useI18n();
const store = useStore();

// State
const rules = ref([]);
const loading = ref(false);
const showRuleModal = ref(false);
const editingRule = ref(null);
const form = ref({
  name: '',
  trigger: '',
  action: '',
  enabled: true,
});

// Options for selects
const triggerOptions = computed(() => [
  { value: 'order.delivered', label: t('orderDelivered') || 'اكتمال طلب' },
  { value: 'order.shipped', label: t('orderShipped') || 'شحن طلب' },
  { value: 'inventory.low', label: t('inventoryLow') || 'انخفاض المخزون' },
  { value: 'schedule.daily', label: t('scheduleDaily') || 'موعد يومي' },
  { value: 'schedule.weekly', label: t('scheduleWeekly') || 'موعد أسبوعي' },
]);

const actionOptions = computed(() => [
  { value: 'sync.order', label: t('syncOrders') || 'ترحيل الطلبات' },
  { value: 'sync.inventory', label: t('updateInventory') || 'تحديث المخزون' },
  { value: 'create.invoice', label: t('createInvoice') || 'إنشاء فاتورة' },
  { value: 'send.email', label: t('sendEmail') || 'إرسال بريد' },
]);

// Methods
const loadRules = async () => {
  try {
    loading.value = true;
    
    const response = await AutomationService.getRules();
    if (response.success) {
      rules.value = response.data;
    } else {
      // Fallback to mock data
      rules.value = getMockRules();
    }
  } catch (error) {
    console.error('Error loading automation rules:', error);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: t('errorLoadingRules') || 'خطأ في تحميل قواعد الأتمتة',
      timeout: 5000
    });
    
    // Set fallback data
    rules.value = getMockRules();
  } finally {
    loading.value = false;
  }
};

const getMockRules = () => {
  return [
    {
      id: 1,
      name: 'مزامنة الطلبات المكتملة',
      trigger: 'order.delivered',
      action: 'sync.order',
      enabled: true,
    },
    {
      id: 2,
      name: 'تنبيه انخفاض المخزون',
      trigger: 'inventory.low',
      action: 'send.email',
      enabled: true,
    },
    {
      id: 3,
      name: 'تحديث المخزون اليومي',
      trigger: 'schedule.daily',
      action: 'sync.inventory',
      enabled: false,
    },
  ];
};

const getTriggerLabel = (trigger) => {
  const option = triggerOptions.value.find(opt => opt.value === trigger);
  return option ? option.label : trigger;
};

const getActionLabel = (action) => {
  const option = actionOptions.value.find(opt => opt.value === action);
  return option ? option.label : action;
};

const toggleRule = async (rule) => {
  try {
    const response = await AutomationService.toggleRule(rule.id, rule.enabled);
    
    if (response.success) {
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('success') || 'نجاح',
        message: rule.enabled 
          ? (t('ruleEnabled') || 'تم تفعيل القاعدة')
          : (t('ruleDisabled') || 'تم تعطيل القاعدة'),
        timeout: 3000
      });
    }
  } catch (error) {
    console.error('Error toggling rule:', error);
    
    // Revert the change
    rule.enabled = !rule.enabled;
  }
};

const editRule = (rule) => {
  editingRule.value = rule;
  form.value = { ...rule };
  showRuleModal.value = true;
};

const deleteRule = async (ruleId) => {
  const confirmed = confirm(t('confirmDeleteRule') || 'هل أنت متأكد من حذف هذه القاعدة؟');
  
  if (confirmed) {
    try {
      const response = await AutomationService.deleteRule(ruleId);
      
      if (response.success) {
        // Remove from local state
        rules.value = rules.value.filter(rule => rule.id !== ruleId);
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('success') || 'نجاح',
          message: t('ruleDeleted') || 'تم حذف القاعدة بنجاح',
          timeout: 3000
        });
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  }
};

const saveRule = async () => {
  try {
    let response;
    
    if (editingRule.value) {
      response = await AutomationService.updateRule(editingRule.value.id, form.value);
    } else {
      response = await AutomationService.createRule(form.value);
    }
    
    if (response.success) {
      // Close modal and reset form
      closeModal();
      
      // Reload rules
      await loadRules();
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('success') || 'نجاح',
        message: editingRule.value 
          ? (t('ruleUpdated') || 'تم تحديث القاعدة بنجاح')
          : (t('ruleCreated') || 'تم إنشاء القاعدة بنجاح'),
        timeout: 3000
      });
    }
  } catch (error) {
    console.error('Error saving rule:', error);
  }
};

const closeModal = () => {
  showRuleModal.value = false;
  editingRule.value = null;
  form.value = { name: '', trigger: '', action: '', enabled: true };
};

// Lifecycle
onMounted(() => {
  loadRules();
});
</script>

<style scoped>
/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  position: relative;
}

.page-header h1::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 2px;
}

/* Rule Cards */
.rule-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.rule-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.rule-card:hover::before {
  left: 100%;
}

.rule-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.rule-title {
  transition: all 0.3s ease;
}

.rule-card:hover .rule-title {
  transform: scale(1.02);
}

.rule-details {
  border-top: 1px solid rgba(var(--v-theme-primary), 0.1);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
  padding: 1rem 0;
}

.rule-actions .v-btn {
  transition: all 0.3s ease;
}

.rule-actions .v-btn:hover {
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-secondary), 0.05));
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s ease;
}

.empty-state:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rule-card {
  animation: fadeIn 0.6s ease forwards;
}

.rule-card:nth-child(1) { animation-delay: 0.1s; }
.rule-card:nth-child(2) { animation-delay: 0.2s; }
.rule-card:nth-child(3) { animation-delay: 0.3s; }
.rule-card:nth-child(4) { animation-delay: 0.4s; }

/* Responsive Design */
@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}

@media (max-width: 600px) {
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .rule-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Vuetify Overrides */
:deep(.v-card) {
  transition: all 0.3s ease;
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
}

:deep(.v-switch) {
  transition: all 0.3s ease;
}

:deep(.v-switch:hover) {
  transform: scale(1.05);
}

:deep(.v-text-field) {
  transition: all 0.3s ease;
}

:deep(.v-text-field:hover) {
  transform: translateY(-1px);
}

:deep(.v-select) {
  transition: all 0.3s ease;
}

:deep(.v-select:hover) {
  transform: translateY(-1px);
}

:deep(.v-dialog) {
  backdrop-filter: blur(5px);
}

:deep(.v-progress-circular) {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:deep(.v-avatar) {
  transition: all 0.3s ease;
}

:deep(.v-avatar:hover) {
  transform: scale(1.05);
}

:deep(.v-icon) {
  transition: all 0.3s ease;
}

:deep(.v-icon:hover) {
  transform: scale(1.1);
}
</style>  color: var(--bg-deep);
}
</style>
