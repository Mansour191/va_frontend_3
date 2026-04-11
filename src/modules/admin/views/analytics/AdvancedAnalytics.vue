<template>
  <v-container class="pa-4">
    <!-- رأس الصفحة -->
    <v-card variant="elevated" class="mb-6 analytics-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-chart-line</v-icon>
              {{ $t('advancedAnalytics') || 'التحليلات المتقدمة' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('analyticsSubtitle') || 'تحليلات ذكية ورؤى عميقة لأداء المتجر' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="exportAnalytics"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-download"
            >
              {{ $t('exportReport') || 'تصدير التقرير' }}
            </v-btn>
            <v-btn
              @click="refreshData"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-refresh"
            >
              {{ $t('refresh') || 'تحديث' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- مؤشرات الأداء الرئيسية (KPIs) -->
    <v-row class="mb-6">
      <v-col
        v-for="kpi in kpis"
        :key="kpi.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card variant="elevated" class="kpi-card">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar
                :color="kpi.color"
                variant="tonal"
                size="48"
              >
                <v-icon :icon="kpi.icon" size="24"></v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-h5 font-weight-bold">{{ kpi.value }}</div>
                <div class="text-caption text-medium-emphasis">{{ kpi.title }}</div>
              </div>
              <v-chip
                v-if="kpi.trend"
                :color="kpi.trend > 0 ? 'success' : 'error'"
                variant="tonal"
                size="small"
              >
                <v-icon start :icon="kpi.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down'"></v-icon>
                {{ Math.abs(kpi.trend) }}%
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- فلاتر الوقت -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-4">
        <div class="d-flex align-center ga-4 flex-wrap">
          <div class="date-range d-flex ga-2">
            <v-btn
              v-for="range in dateRanges"
              :key="range.value"
              :variant="selectedRange === range.value ? 'elevated' : 'tonal'"
              :color="selectedRange === range.value ? 'primary' : 'default'"
              @click="setDateRange(range.value)"
            >
              {{ range.label }}
            </v-btn>
          </div>
          
          <div v-if="selectedRange === 'custom'" class="custom-date d-flex align-center ga-2">
            <v-text-field
              v-model="customDate.from"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            />
            <span class="text-body-2">{{ $t('to') || 'إلى' }}</span>
            <v-text-field
              v-model="customDate.to"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            />
            <v-btn
              @click="applyCustomRange"
              variant="elevated"
              color="primary"
              size="small"
            >
              {{ $t('apply') || 'تطبيق' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- المخططات -->
    <v-row class="mb-6">
      <v-col cols="12" lg="8">
        <v-card variant="elevated">
          <v-card-text class="pa-6">
            <h3 class="text-h6 font-weight-bold mb-4">
              {{ $t('salesTrend') || 'اتجاه المبيعات' }}
            </h3>
            <canvas ref="salesChart" width="400" height="200"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" lg="4">
        <v-card variant="elevated">
          <v-card-text class="pa-6">
            <h3 class="text-h6 font-weight-bold mb-4">
              {{ $t('categoryDistribution') || 'توزيع الفئات' }}
            </h3>
            <canvas ref="categoryChart" width="200" height="200"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- جدول البيانات -->
    <v-card variant="elevated">
      <v-card-text class="pa-6">
        <h3 class="text-h6 font-weight-bold mb-4">
          {{ $t('detailedAnalytics') || 'التحليلات التفصيلية' }}
        </h3>
        
        <v-data-table
          :headers="tableHeaders"
          :items="tableData"
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:item.revenue="{ item }">
            <span class="font-weight-bold">{{ item.revenue }}</span>
          </template>
          
          <template v-slot:item.growth="{ item }">
            <v-chip
              :color="item.growth > 0 ? 'success' : 'error'"
              variant="tonal"
              size="small"
            >
              <v-icon start :icon="item.growth > 0 ? 'mdi-trending-up' : 'mdi-trending-down'"></v-icon>
              {{ Math.abs(item.growth) }}%
            </v-chip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import moment from 'moment';
import CurrencyService from '@/integration/services/CurrencyService';
import AnalyticsService from '@/services/AnalyticsService';

Chart.register(...registerables);

export default {
  name: 'AdvancedAnalytics',
  
  data() {
    return {
      loading: false,
      selectedRange: 'month',
      salesChartType: 'line',
      analyticsService: new AnalyticsService(),
      
      // Date ranges
      dateRanges: [
        { label: 'اليوم', value: 'today' },
        { label: 'أسبوع', value: 'week' },
        { label: 'شهر', value: 'month' },
        { label: 'سنة', value: 'year' },
        { label: 'مخصص', value: 'custom' },
      ],
      
      // Custom date range
      customDate: {
        from: '',
        to: ''
      },
      
      // KPIs data - will be loaded from API
      kpis: [],
      
      // Category sales data - will be loaded from API
      categorySales: [],
      
      // Table data - will be loaded from API
      tableHeaders: [
        { title: 'الفئة', key: 'category' },
        { title: 'الإيرادات', key: 'revenue' },
        { title: 'الطلبات', key: 'orders' },
        { title: 'النمو', key: 'growth' },
      ],
      
      tableData: [],
      
      // Charts objects
      charts: {
        sales: null,
        category: null,
      },
      
      // Sales chart data
      salesChartData: {
        labels: [],
        datasets: []
      },
    };
  },
  
  mounted() {
    this.loadAnalyticsData();
  },
  
  beforeUnmount() {
    this.destroyCharts();
  },
  
  methods: {
    // Load analytics data from API
    async loadAnalyticsData() {
      this.loading = true;
      
      try {
        // Load KPIs
        const kpisResponse = await this.analyticsService.getKPIs(this.selectedRange);
        this.kpis = kpisResponse.data || this.getMockKPIs();
        
        // Load category analytics
        const categoryResponse = await this.analyticsService.getCategoryAnalytics(this.selectedRange);
        this.categorySales = categoryResponse.data || this.getMockCategorySales();
        
        // Load sales analytics
        const salesResponse = await this.analyticsService.getSalesAnalytics(this.selectedRange);
        this.salesChartData = salesResponse.data || this.getMockSalesData();
        
        // Load top products for table
        const productsResponse = await this.analyticsService.getTopProducts(this.selectedRange);
        this.tableData = productsResponse.data || this.getMockTableData();
        
        // Initialize charts after data is loaded
        this.$nextTick(() => {
          this.initCharts();
        });
        
        // Show success notification
        this.$store.dispatch('notifications/add', {
          type: 'success',
          title: 'تم تحميل البيانات',
          message: 'تم تحميل بيانات التحليلات بنجاح',
          timeout: 3000
        });
        
      } catch (error) {
        console.error('Error loading analytics data:', error);
        
        // Fallback to mock data
        this.kpis = this.getMockKPIs();
        this.categorySales = this.getMockCategorySales();
        this.salesChartData = this.getMockSalesData();
        this.tableData = this.getMockTableData();
        
        // Show error notification
        this.$store.dispatch('notifications/add', {
          type: 'error',
          title: 'خطأ في تحميل البيانات',
          message: 'جاري استخدام البيانات الوهمية',
          timeout: 5000
        });
        
        // Initialize charts with mock data
        this.$nextTick(() => {
          this.initCharts();
        });
      } finally {
        this.loading = false;
      }
    },
    
    // Date range methods
    setDateRange(range) {
      this.selectedRange = range;
      this.loadAnalyticsData();
    },
    
    applyCustomRange() {
      if (this.customDate.from && this.customDate.to) {
        this.loadAnalyticsData();
      }
    },
    
    // Chart methods
    initCharts() {
      this.initSalesChart();
      this.initCategoryChart();
    },
    
    initSalesChart() {
      const ctx = this.$refs.salesChart?.getContext('2d');
      if (!ctx) return;

      if (this.charts.sales) {
        this.charts.sales.destroy();
      }

      const labels = this.salesChartData.labels || ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
      const data = this.salesChartData.datasets?.[0]?.data || [4500, 5200, 4800, 6100, 7800, 8200, 6700];

      this.charts.sales = new Chart(ctx, {
        type: this.salesChartType,
        data: {
          labels: labels,
          datasets: [
            {
              label: 'المبيعات',
              data: data,
              backgroundColor: 'rgba(212, 175, 55, 0.2)',
              borderColor: '#d4af37',
              borderWidth: 2,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value.toLocaleString() + ' ر.س';
                },
              },
            },
          },
        },
      });
    },
    
    initCategoryChart() {
      const ctx = this.$refs.categoryChart?.getContext('2d');
      if (!ctx) return;

      if (this.charts.category) {
        this.charts.category.destroy();
      }

      const data = this.categorySales.map((c) => c.percentage);
      const labels = this.categorySales.map((c) => c.category);
      const colors = this.categorySales.map((c) => c.color);

      this.charts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: '#fff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
        },
      });
    },
    
    destroyCharts() {
      if (this.charts.sales) {
        this.charts.sales.destroy();
      }
      if (this.charts.category) {
        this.charts.category.destroy();
      }
    },
    
    updateCharts() {
      this.initCharts();
    },
    
    // Action methods
    exportAnalytics() {
      // Implementation for export functionality
      console.log('Exporting analytics...');
      this.$store.dispatch('notifications/add', {
        type: 'info',
        title: 'تصدير التقرير',
        message: 'جاري تصدير التقرير...',
        timeout: 3000
      });
    },
    
    refreshData() {
      this.loadAnalyticsData();
    },
    
    // Mock data fallback methods
    getMockKPIs() {
      return [
        {
          title: 'إجمالي الإيرادات',
          value: '284,500 ر.س',
          icon: 'mdi-currency-usd',
          color: 'primary',
          trend: 8.3,
        },
        {
          title: 'إجمالي الطلبات',
          value: '1,234',
          icon: 'mdi-shopping',
          color: 'success',
          trend: 15.7,
        },
        {
          title: 'عدد العملاء',
          value: '892',
          icon: 'mdi-account-group',
          color: 'warning',
          trend: 12.4,
        },
        {
          title: 'متوسط قيمة الطلب',
          value: '450 ر.س',
          icon: 'mdi-calculator',
          color: 'info',
          trend: -2.1,
        },
      ];
    },
    
    getMockCategorySales() {
      return [
        { category: 'فنون عربية', percentage: 35, color: '#d4af37' },
        { category: 'فنون حديثة', percentage: 25, color: '#2196f3' },
        { category: 'فنون كلاسيكية', percentage: 20, color: '#4caf50' },
        { category: 'فنون تجريدية', percentage: 20, color: '#ff9800' },
      ];
    },
    
    getMockSalesData() {
      return {
        labels: ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
        datasets: [
          {
            label: 'المبيعات',
            data: [4500, 5200, 4800, 6100, 7800, 8200, 6700],
          }
        ]
      };
    },
    
    getMockTableData() {
      return [
        { category: 'فنون عربية', revenue: '99,575 ر.س', orders: 432, growth: 8.3 },
        { category: 'فنون حديثة', revenue: '71,125 ر.س', orders: 308, growth: 15.7 },
        { category: 'فنون كلاسيكية', revenue: '56,900 ر.س', orders: 246, growth: 12.4 },
        { category: 'فنون تجريدية', revenue: '56,900 ر.س', orders: 246, growth: -2.1 },
      ];
    },
  },
};
</script>

<style scoped>
.analytics-header {
  background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
  color: white;
}

.kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.date-range .v-btn {
  min-width: 80px;
}

.custom-date {
  background: rgba(0, 0, 0, 0.02);
  padding: 8px 12px;
  border-radius: 8px;
}

canvas {
  max-height: 300px;
}
</style>
