<template>
  <v-container fluid class="pricing-rules">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="glass-card" elevation="0">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between flex-wrap">
              <div>
                <h1 class="text-h4 font-weight-bold gold-text mb-2">
                  <v-icon class="me-3" color="#d4af37">mdi-cogs</v-icon>
                  {{ $t('pricing.rules.title', 'قواعد التسعير') }}
                </h1>
                <p class="text-dim">{{ $t('pricing.rules.subtitle', 'إدارة قواعد التسعير التلقائية') }}</p>
              </div>
              <div class="d-flex gap-2 mt-4 mt-sm-0">
                <v-btn
                  color="primary"
                  @click="showCreateDialog = true"
                  variant="elevated"
                >
                  <v-icon class="me-2">mdi-plus</v-icon>
                  {{ $t('pricing.rules.newRule', 'قاعدة جديدة') }}
                </v-btn>
                <v-btn
                  color="secondary"
                  @click="exportRules"
                  variant="elevated"
                >
                  <v-icon class="me-2">mdi-download</v-icon>
                  {{ $t('common.export', 'تصدير') }}
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col
        v-for="stat in statsData"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card class="stat-card glass-card" elevation="0">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-avatar
                :color="stat.color"
                size="48"
                class="me-3"
              >
                <v-icon :icon="stat.icon" size="24"></v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <h3 class="text-h5 font-weight-bold mb-1">{{ stat.value }}</h3>
                <p class="text-body-2 text-dim mb-2">{{ stat.title }}</p>
                <v-chip
                  :color="stat.trendType === 'positive' ? 'success' : 'error'"
                  size="small"
                  variant="elevated"
                >
                  <v-icon
                    :icon="stat.trendIcon"
                    size="16"
                    class="me-1"
                  ></v-icon>
                  {{ stat.trend }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Rules Table -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="glass-card" elevation="0">
          <v-card-title class="pa-4 pb-2">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon class="me-2" color="#d4af37">mdi-format-list-bulleted</v-icon>
                {{ $t('pricing.rules.list', 'قائمة القواعد') }}
              </div>
              <div class="d-flex gap-2">
                <v-text-field
                  v-model="searchQuery"
                  :label="$t('common.search', 'بحث')"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="max-width: 300px"
                  clearable
                ></v-text-field>
                <v-select
                  v-model="filterStatus"
                  :items="statusOptions"
                  :label="$t('pricing.rules.filterStatus', 'فلترة بالحالة')"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  style="max-width: 200px"
                  clearable
                ></v-select>
              </div>
            </div>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-data-table
              :headers="tableHeaders"
              :items="filteredRules"
              :loading="loading"
              :items-per-page="10"
              class="elevation-0"
            >
              <template v-slot:item.name="{ item }">
                <div class="d-flex align-center">
                  <v-avatar
                    :color="getRuleTypeColor(item.type)"
                    size="32"
                    class="me-3"
                  >
                    <v-icon :icon="getRuleTypeIcon(item.type)" size="16"></v-icon>
                  </v-avatar>
                  <div>
                    <div class="font-weight-bold">{{ item.name }}</div>
                    <div class="text-caption text-dim">{{ item.description }}</div>
                  </div>
                </div>
              </template>
              
              <template v-slot:item.type="{ item }">
                <v-chip
                  :color="getRuleTypeColor(item.type)"
                  size="small"
                  variant="elevated"
                >
                  {{ $t(`pricing.ruleTypes.${item.type}`, item.type) }}
                </v-chip>
              </template>
              
              <template v-slot:item.value="{ item }">
                <div class="font-weight-bold">
                  {{ formatRuleValue(item) }}
                </div>
              </template>
              
              <template v-slot:item.targetProducts="{ item }">
                <v-chip
                  size="small"
                  color="primary"
                  variant="elevated"
                >
                  {{ item.targetProducts?.length || 0 }} {{ $t('pricing.rules.products', 'منتجات') }}
                </v-chip>
              </template>
              
              <template v-slot:item.isActive="{ item }">
                <v-switch
                  v-model="item.isActive"
                  :loading="item.loading"
                  @change="toggleRuleStatus(item)"
                  color="success"
                  hide-details
                  density="compact"
                ></v-switch>
              </template>
              
              <template v-slot:item.priority="{ item }">
                <v-chip
                  :color="getPriorityColor(item.priority)"
                  size="small"
                  variant="elevated"
                >
                  {{ $t(`pricing.priority.${item.priority}`, item.priority) }}
                </v-chip>
              </template>
              
              <template v-slot:item.actions="{ item }">
                <div class="d-flex gap-1">
                  <v-btn
                    color="primary"
                    size="small"
                    variant="text"
                    @click="editRule(item)"
                  >
                    <v-icon size="16">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    color="info"
                    size="small"
                    variant="text"
                    @click="testRule(item)"
                  >
                    <v-icon size="16">mdi-flask</v-icon>
                  </v-btn>
                  <v-btn
                    color="error"
                    size="small"
                    variant="text"
                    @click="deleteRule(item.id)"
                  >
                    <v-icon size="16">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Rules Performance Chart -->
    <v-row>
      <v-col cols="12">
        <v-card class="glass-card" elevation="0">
          <v-card-title class="pa-4 pb-2">
            <v-icon class="me-2" color="#d4af37">mdi-chart-line</v-icon>
            {{ $t('pricing.rules.performance', 'أداء القواعد') }}
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="chart-container">
              <canvas ref="performanceChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create/Edit Rule Dialog -->
    <v-dialog
      v-model="showCreateDialog"
      max-width="800"
      persistent
    >
      <v-card class="glass-card">
        <v-card-title class="pa-4 pb-2">
          <v-icon class="me-2" color="#d4af37">mdi-plus</v-icon>
          {{ editingRule ? $t('pricing.rules.editRule', 'تعديل القاعدة') : $t('pricing.rules.createRule', 'إنشاء قاعدة جديدة') }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form @submit.prevent="saveRule" ref="ruleForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="ruleForm.name"
                  :label="$t('pricing.rules.name', 'اسم القاعدة')"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || $t('validation.required', 'هذا الحقل مطلوب')]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="ruleForm.type"
                  :items="ruleTypes"
                  :label="$t('pricing.rules.type', 'نوع القاعدة')"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || $t('validation.required', 'هذا الحقل مطلوب')]"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="ruleForm.description"
                  :label="$t('pricing.rules.description', 'الوصف')"
                  variant="outlined"
                  density="compact"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="ruleForm.value"
                  :label="$t('pricing.rules.value', 'القيمة')"
                  type="number"
                  step="0.01"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || $t('validation.required', 'هذا الحقل مطلوب')]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="ruleForm.priority"
                  :items="priorityOptions"
                  :label="$t('pricing.rules.priority', 'الأولوية')"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="ruleForm.targetProducts"
                  :items="availableProducts"
                  :label="$t('pricing.rules.targetProducts', 'المنتجات المستهدفة')"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  density="compact"
                  multiple
                  chips
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="ruleForm.conditions"
                  :label="$t('pricing.rules.conditions', 'الشروط')"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  :placeholder="$t('pricing.rules.conditionsPlaceholder', 'أدخل الشروط مفصولة بفواصل')"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="ruleForm.isActive"
                  :label="$t('pricing.rules.active', 'قاعدة نشطة')"
                  color="success"
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            @click="closeDialog"
            variant="outlined"
          >
            {{ $t('common.cancel', 'إلغاء') }}
          </v-btn>
          <v-btn
            :color="saving ? 'grey' : 'primary'"
            :loading="saving"
            @click="saveRule"
            variant="elevated"
          >
            <v-icon class="me-2">mdi-save</v-icon>
            {{ editingRule ? $t('common.update', 'تحديث') : $t('common.save', 'حفظ') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import Chart from 'chart.js/auto';
import PricingRulesService from '@/services/PricingRulesService';
import DashboardService from '@/services/DashboardService';

// Store and i18n
const store = useStore();
const { t } = useI18n();

// State
const loading = ref(false);
const saving = ref(false);
const showCreateDialog = ref(false);
const editingRule = ref(null);
const searchQuery = ref('');
const filterStatus = ref('');
const rules = ref([]);
const availableProducts = ref([]);

// Chart ref
const performanceChart = ref(null);

// Form
const ruleForm = ref({
  name: '',
  type: '',
  description: '',
  value: '',
  priority: 'medium',
  targetProducts: [],
  conditions: '',
  isActive: true
});

// Computed
const statsData = computed(() => [
  {
    title: t('pricing.stats.totalRules', 'إجمالي القواعد'),
    value: rules.value.length.toString(),
    icon: 'mdi-cogs',
    color: '#d4af37',
    trend: '+12%',
    trendType: 'positive',
    trendIcon: 'mdi-trending-up'
  },
  {
    title: t('pricing.stats.activeRules', 'القواعد النشطة'),
    value: rules.value.filter(r => r.isActive).length.toString(),
    icon: 'mdi-check-circle',
    color: '#4caf50',
    trend: '+8%',
    trendType: 'positive',
    trendIcon: 'mdi-trending-up'
  },
  {
    title: t('pricing.stats.inactiveRules', 'القواعد غير النشطة'),
    value: rules.value.filter(r => !r.isActive).length.toString(),
    icon: 'mdi-close-circle',
    color: '#f44336',
    trend: '-5%',
    trendType: 'negative',
    trendIcon: 'mdi-trending-down'
  },
  {
    title: t('pricing.stats.avgImpact', 'متوسط التأثير'),
    value: '+15.3%',
    icon: 'mdi-trending-up',
    color: '#2196f3',
    trend: '+3.2%',
    trendType: 'positive',
    trendIcon: 'mdi-trending-up'
  }
]);

const tableHeaders = computed(() => [
  { title: t('pricing.table.name', 'الاسم'), key: 'name', sortable: true },
  { title: t('pricing.table.type', 'النوع'), key: 'type', sortable: true },
  { title: t('pricing.table.value', 'القيمة'), key: 'value', sortable: true },
  { title: t('pricing.table.targetProducts', 'المنتجات المستهدفة'), key: 'targetProducts', sortable: false },
  { title: t('pricing.table.status', 'الحالة'), key: 'isActive', sortable: true },
  { title: t('pricing.table.priority', 'الأولوية'), key: 'priority', sortable: true },
  { title: t('pricing.table.actions', 'الإجراءات'), key: 'actions', sortable: false }
]);

const filteredRules = computed(() => {
  let filtered = rules.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(rule => 
      rule.name.toLowerCase().includes(query) ||
      rule.description.toLowerCase().includes(query)
    );
  }
  
  if (filterStatus.value !== '') {
    filtered = filtered.filter(rule => rule.isActive === (filterStatus.value === 'active'));
  }
  
  return filtered;
});

const ruleTypes = computed(() => [
  { title: t('pricing.ruleTypes.percentage', 'نسبة مئوية'), value: 'percentage' },
  { title: t('pricing.ruleTypes.fixed', 'قيمة ثابتة'), value: 'fixed' },
  { title: t('pricing.ruleTypes.formula', 'معادلة'), value: 'formula' },
  { title: t('pricing.ruleTypes.conditional', 'شرطية'), value: 'conditional' }
]);

const priorityOptions = computed(() => [
  { title: t('pricing.priority.low', 'منخفضة'), value: 'low' },
  { title: t('pricing.priority.medium', 'متوسطة'), value: 'medium' },
  { title: t('pricing.priority.high', 'عالية'), value: 'high' }
]);

const statusOptions = computed(() => [
  { title: t('pricing.status.all', 'الكل'), value: '' },
  { title: t('pricing.status.active', 'نشط'), value: 'active' },
  { title: t('pricing.status.inactive', 'غير نشط'), value: 'inactive' }
]);

// Methods
const loadRules = async () => {
  try {
    loading.value = true;
    const response = await PricingRulesService.getPricingRules();
    if (response.success) {
      rules.value = response.data.rules || [];
    } else {
      rules.value = response.mockData?.rules || getMockRules();
    }
  } catch (error) {
    console.error('Error loading rules:', error);
    rules.value = getMockRules();
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.rules.loadError', 'فشل في تحميل القواعد')
    });
  } finally {
    loading.value = false;
  }
};

const loadProducts = async () => {
  try {
    const response = await DashboardService.getProducts({ limit: 100 });
    if (response.success) {
      availableProducts.value = response.data.products || [];
    } else {
      availableProducts.value = getMockProducts();
    }
  } catch (error) {
    console.error('Error loading products:', error);
    availableProducts.value = getMockProducts();
  }
};

const saveRule = async () => {
  try {
    saving.value = true;
    
    const ruleData = { ...ruleForm.value };
    if (ruleData.conditions) {
      ruleData.conditions = ruleData.conditions.split(',').map(c => c.trim()).filter(c => c);
    }
    
    let response;
    if (editingRule.value) {
      response = await PricingRulesService.updatePricingRule(editingRule.value.id, ruleData);
    } else {
      response = await PricingRulesService.createPricingRule(ruleData);
    }
    
    if (response.success) {
      await loadRules();
      closeDialog();
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: editingRule.value 
          ? t('pricing.rules.updateSuccess', 'تم تحديث القاعدة بنجاح')
          : t('pricing.rules.createSuccess', 'تم إنشاء القاعدة بنجاح')
      });
    }
  } catch (error) {
    console.error('Error saving rule:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: editingRule.value 
        ? t('pricing.rules.updateError', 'فشل في تحديث القاعدة')
        : t('pricing.rules.createError', 'فشل في إنشاء القاعدة')
    });
  } finally {
    saving.value = false;
  }
};

const editRule = (rule) => {
  editingRule.value = rule;
  ruleForm.value = {
    name: rule.name,
    type: rule.type,
    description: rule.description,
    value: rule.value,
    priority: rule.priority,
    targetProducts: rule.targetProducts || [],
    conditions: rule.conditions ? rule.conditions.join(', ') : '',
    isActive: rule.isActive
  };
  showCreateDialog.value = true;
};

const deleteRule = async (ruleId) => {
  if (!confirm(t('pricing.rules.deleteConfirm', 'هل أنت متأكد من حذف هذه القاعدة؟'))) return;
  
  try {
    const response = await PricingRulesService.deletePricingRule(ruleId);
    if (response.success) {
      await loadRules();
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('pricing.rules.deleteSuccess', 'تم حذف القاعدة بنجاح')
      });
    }
  } catch (error) {
    console.error('Error deleting rule:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.rules.deleteError', 'فشل في حذف القاعدة')
    });
  }
};

const toggleRuleStatus = async (rule) => {
  try {
    rule.loading = true;
    const response = await PricingRulesService.togglePricingRuleStatus(rule.id);
    if (!response.success) {
      // Revert the change if API fails
      rule.isActive = !rule.isActive;
    }
  } catch (error) {
    console.error('Error toggling rule status:', error);
    rule.isActive = !rule.isActive;
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.rules.toggleError', 'فشل في تغيير حالة القاعدة')
    });
  } finally {
    rule.loading = false;
  }
};

const testRule = async (rule) => {
  try {
    const response = await PricingRulesService.testPricingRule(rule, 'test');
    if (response.success) {
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('pricing.rules.testSuccess', 'تم اختبار القاعدة بنجاح')
      });
    }
  } catch (error) {
    console.error('Error testing rule:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.rules.testError', 'فشل في اختبار القاعدة')
    });
  }
};

const exportRules = async () => {
  try {
    const response = await PricingRulesService.exportPricingRules();
    if (response.success) {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pricing-rules-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('pricing.rules.exportSuccess', 'تم تصدير القواعد بنجاح')
      });
    }
  } catch (error) {
    console.error('Error exporting rules:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.rules.exportError', 'فشل في تصدير القواعد')
    });
  }
};

const closeDialog = () => {
  showCreateDialog.value = false;
  editingRule.value = null;
  ruleForm.value = {
    name: '',
    type: '',
    description: '',
    value: '',
    priority: 'medium',
    targetProducts: [],
    conditions: '',
    isActive: true
  };
};

// Helper functions
const getRuleTypeColor = (type) => {
  const colors = {
    percentage: '#d4af37',
    fixed: '#4caf50',
    formula: '#2196f3',
    conditional: '#ff9800'
  };
  return colors[type] || '#9e9e9e';
};

const getRuleTypeIcon = (type) => {
  const icons = {
    percentage: 'mdi-percent',
    fixed: 'mdi-currency-usd',
    formula: 'mdi-function',
    conditional: 'mdi-code-braces'
  };
  return icons[type] || 'mdi-cog';
};

const getPriorityColor = (priority) => {
  const colors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336'
  };
  return colors[priority] || '#9e9e9e';
};

const formatRuleValue = (rule) => {
  if (rule.type === 'percentage') {
    return `${rule.value > 0 ? '+' : ''}${rule.value}%`;
  }
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(rule.value);
};

const updatePerformanceChart = () => {
  if (performanceChart.value) {
    Chart.getChart(performanceChart.value)?.destroy();
    
    new Chart(performanceChart.value, {
      type: 'line',
      data: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [{
          label: t('pricing.charts.ruleApplications', 'تطبيقات القواعد'),
          data: [45, 52, 48, 58, 63, 71],
          borderColor: '#d4af37',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          tension: 0.4
        }, {
          label: t('pricing.charts.revenueImpact', 'تأثير الإيرادات'),
          data: [12, 15, 14, 18, 22, 25],
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#fff' }
          }
        },
        scales: {
          y: {
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    });
  }
};

// Mock data functions
const getMockRules = () => [
  {
    id: 1,
    name: 'زيادة الأسعار في المواسم',
    description: 'زيادة أسعار المنتجات بنسبة 20% خلال مواسم الأعياد',
    type: 'percentage',
    value: 20,
    conditions: ['مواسم الأعياد', 'زيادة الطلب'],
    targetProducts: [1, 2, 3],
    isActive: true,
    priority: 'high',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z'
  },
  {
    id: 2,
    name: 'خصم للعملاء الجدد',
    description: 'خصم 15% للعملاء الجدد على أول عملية شراء',
    type: 'percentage',
    value: -15,
    conditions: ['عميل جديد', 'أول عملية شراء'],
    targetProducts: [4, 5, 6],
    isActive: true,
    priority: 'medium',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:30:00Z'
  },
  {
    id: 3,
    name: 'تسعير ديناميكي',
    description: 'تعديل الأسعار بناءً على مستوى المخزون',
    type: 'conditional',
    value: 0,
    conditions: ['مخزون منخفض', 'طلب مرتفع'],
    targetProducts: [7, 8],
    isActive: false,
    priority: 'low',
    createdAt: '2024-01-05T16:20:00Z',
    updatedAt: '2024-01-12T13:10:00Z'
  }
];

const getMockProducts = () => [
  { id: 1, name: 'فينيل ديكوري فاخر' },
  { id: 2, name: 'فينيل جدران عصري' },
  { id: 3, name: 'فينيل أرضيات مقاوم' },
  { id: 4, name: 'فينيل سقف حديث' },
  { id: 5, name: 'فينيل أثاث كلاسيكي' }
];

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadRules(),
    loadProducts()
  ]);
  
  await nextTick();
  updatePerformanceChart();
});
</script>

<style scoped>
.pricing-rules {
  min-height: 100vh;
  padding: 20px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.gold-text {
  color: #d4af37 !important;
}

.text-dim {
  color: rgba(255, 255, 255, 0.7) !important;
}

.stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pricing-rules {
    padding: 10px;
  }
  
  .chart-container {
    height: 250px;
  }
}

/* Vuetify overrides */
:deep(.v-card) {
  transition: all 0.3s ease;
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-chip) {
  transition: all 0.2s ease;
}

:deep(.v-data-table) {
  background: transparent;
}

:deep(.v-data-table .v-table__wrapper) {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

:deep(.v-switch .v-switch__track) {
  background: rgba(255, 255, 255, 0.2);
}

:deep(.v-dialog .v-card) {
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
