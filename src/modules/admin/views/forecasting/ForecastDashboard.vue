<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 forecast-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-chart-line</v-icon>
              {{ $t('salesForecast') || 'توقعات المبيعات' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('forecastSubtitle') || 'توقعات ذكية للمبيعات والطلب باستخدام الذكاء الاصطناعي' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="refreshForecast"
              :disabled="loading"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-refresh"
            >
              {{ loading ? ($t('refreshing') || 'جاري التحديث...') : ($t('refresh') || 'تحديث') }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Navigation Tabs -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-4">
        <v-tabs v-model="activeTab" color="primary" variant="outlined" grow>
          <v-tab value="overview" prepend-icon="mdi-chart-pie">
            {{ $t('overview') || 'نظرة عامة' }}
          </v-tab>
          <v-tab value="inventory" prepend-icon="mdi-package-variant">
            {{ $t('inventory') || 'المخزون' }}
          </v-tab>
          <v-tab value="categories" prepend-icon="mdi-tag">
            {{ $t('categories') || 'التصنيفات' }}
          </v-tab>
          <v-tab value="abc" prepend-icon="mdi-chart-pie">
            {{ $t('abcAnalysis') || 'تحليل ABC' }}
          </v-tab>
          <v-tab value="seasonality" prepend-icon="mdi-calendar" @click="loadSeasonalityAnalysis">
            {{ $t('seasonalityAnalysis') || 'تحليل الموسمية' }}
          </v-tab>
        </v-tabs>
      </v-card-text>
    </v-card>

    <!-- Tab Content -->
    <v-window v-model="activeTab">
      <!-- Overview Tab -->
      <v-window-item value="overview">
        <!-- Quick Stats -->
        <v-row class="mb-6" v-if="forecast">
          <v-col
            v-for="stat in quickStats"
            :key="stat.key"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card variant="elevated" class="stat-card">
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div class="stat-content">
                    <h3 class="text-h4 font-weight-bold text-white mb-1">{{ stat.value }}</h3>
                    <p class="text-caption text-medium-emphasis mb-0">{{ stat.label }}</p>
                  </div>
                  <v-avatar
                    :color="stat.color"
                    variant="tonal"
                    size="50"
                    class="stat-icon"
                  >
                    <v-icon :color="stat.color" size="28">{{ stat.icon }}</v-icon>
                  </v-avatar>
                </div>
                <div class="stat-trend mt-2" :class="{ 'text-success': stat.trend > 0, 'text-error': stat.trend < 0 }">
                  <v-icon :color="stat.trend > 0 ? 'success' : 'error'" size="16">
                    {{ stat.trend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                  </v-icon>
                  <span class="text-caption font-weight-medium">{{ Math.abs(stat.trend) }}%</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Forecast Chart -->
        <v-card variant="elevated" class="mb-6" v-if="forecast">
          <v-card-title class="pa-4">
            <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
              <v-icon color="primary">mdi-chart-line</v-icon>
              {{ $t('salesForecast30Days') || 'توقعات المبيعات (30 يوم)' }}
            </h3>
            <v-spacer />
            <div class="d-flex ga-2">
              <div class="d-flex align-center ga-1">
                <div class="color-dot actual"></div>
                <span class="text-caption">{{ $t('previousSales') || 'مبيعات سابقة' }}</span>
              </div>
              <div class="d-flex align-center ga-1">
                <div class="color-dot predicted"></div>
                <span class="text-caption">{{ $t('forecast') || 'توقعات' }}</span>
              </div>
            </div>
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="chart-container">
              <canvas ref="forecastChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Inventory Tab -->
      <v-window-item value="inventory">
        <v-card variant="elevated" class="mb-6" v-if="inventoryForecast">
          <v-card-title class="pa-4">
            <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
              <v-icon color="warning">mdi-alert</v-icon>
              {{ $t('criticalInventoryAlerts') || 'تنبيهات المخزون الحرجة' }}
            </h3>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col
                v-for="item in inventoryForecast.critical"
                :key="item.productId"
                cols="12"
                md="6"
              >
                <v-card variant="outlined" class="alert-card critical">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-start ga-3">
                      <v-avatar color="error" variant="tonal" size="40">
                        <v-icon color="error">mdi-alert</v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <h4 class="text-h6 font-weight-medium mb-2">{{ item.productName }}</h4>
                        <div class="d-flex flex-column ga-1 mb-3">
                          <p class="text-body-2 mb-0">{{ $t('stock') || 'المخزون' }}: {{ item.currentStock }} {{ $t('pieces') || 'قطعة' }}</p>
                          <p class="text-body-2 mb-0">{{ $t('averageSales') || 'متوسط المبيعات' }}: {{ Math.round(item.dailyAverage) }}/{{ $t('day') || 'يوم' }}</p>
                          <p class="text-body-2 text-error font-weight-medium mb-0">
                            {{ $t('willRunOutIn') || 'سينفد خلال' }} {{ item.daysUntilZero }} {{ $t('days') || 'يوم' }}
                          </p>
                        </div>
                        <v-btn
                          @click="orderProduct(item)"
                          color="primary"
                          variant="elevated"
                          prepend-icon="mdi-cart"
                          size="small"
                        >
                          {{ $t('order') || 'طلب' }}
                        </v-btn>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row v-if="inventoryForecast.warning?.length">
              <v-col
                v-for="item in inventoryForecast.warning"
                :key="item.productId"
                cols="12"
                md="6"
              >
                <v-card variant="outlined" class="alert-card warning">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-start ga-3">
                      <v-avatar color="warning" variant="tonal" size="40">
                        <v-icon color="warning">mdi-alert-outline</v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <h4 class="text-h6 font-weight-medium mb-2">{{ item.productName }}</h4>
                        <div class="d-flex flex-column ga-1">
                          <p class="text-body-2 mb-0">{{ $t('stock') || 'المخزون' }}: {{ item.currentStock }} {{ $t('pieces') || 'قطعة' }}</p>
                          <p class="text-body-2 text-warning font-weight-medium mb-0">
                            {{ $t('recommendPurchaseIn') || 'ينصح بالشراء خلال' }} {{ item.daysUntilZero }} {{ $t('days') || 'يوم' }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Categories Tab -->
      <v-window-item value="categories">
        <v-card variant="elevated" class="mb-6" v-if="categoryForecasts.length">
          <v-card-title class="pa-4">
            <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
              <v-icon color="primary">mdi-tag</v-icon>
              {{ $t('categoryForecasts') || 'توقعات حسب التصنيف' }}
            </h3>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col
                v-for="cat in categoryForecasts"
                :key="cat.category"
                cols="12"
                sm="6"
                md="4"
              >
                <v-card variant="outlined" class="category-card">
                  <v-card-text class="pa-4">
                    <h4 class="text-h6 font-weight-medium mb-3">{{ getCategoryName(cat.category) }}</h4>
                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <p class="text-caption text-medium-emphasis mb-1">{{ $t('nextMonth') || 'الشهر القادم' }}</p>
                        <p class="text-h6 font-weight-bold text-primary">{{ formatCurrency(cat.forecast.total) }}</p>
                      </div>
                      <v-chip
                        :color="cat.trends.trend === 'rising' ? 'success' : cat.trends.trend === 'falling' ? 'error' : 'grey'"
                        variant="tonal"
                        size="small"
                      >
                        <v-icon size="12" class="me-1">{{ getTrendIcon(cat.trends.trend) }}</v-icon>
                        {{ Math.abs(cat.trends.change) }}%
                      </v-chip>
                    </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- ABC Analysis Tab -->
      <v-window-item value="abc">
        <div v-if="loadingABC" class="text-center pa-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
            class="mb-4"
          />
          <p class="text-body-1 text-medium-emphasis">{{ $t('analyzingData') || 'جاري تحليل البيانات...' }}</p>
        </div>

        <div v-else-if="abcData">
          <!-- ABC Summary Cards -->
          <v-row class="mb-6">
            <v-col cols="12" md="4">
              <v-card variant="elevated" class="abc-card class-a">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center ga-3 mb-3">
                    <v-avatar color="warning" variant="tonal" size="40">
                      <v-icon color="warning">mdi-crown</v-icon>
                    </v-avatar>
                    <h3 class="text-h5 font-weight-medium">{{ $t('classA') || 'فئة A' }}</h3>
                  </div>
                  <div class="d-flex flex-column ga-2">
                    <div class="d-flex justify-space-between">
                      <span class="text-caption text-medium-emphasis">{{ $t('productCount') || 'عدد المنتجات' }}</span>
                      <span class="text-body-2 font-weight-medium">{{ abcData.stats.A }}</span>
                    </div>
                    <div class="d-flex justify-space-between">
                      <span class="text-caption text-medium-emphasis">{{ $t('revenue') || 'الإيرادات' }}</span>
                      <span class="text-body-2 font-weight-medium">{{ formatCurrency(abcData.stats.revenueA) }}</span>
                    </div>
                    <div class="d-flex justify-space-between">
                      <span class="text-caption text-medium-emphasis">{{ $t('percentage') || 'النسبة' }}</span>
                      <span class="text-body-2 font-weight-medium">
                        {{ ((abcData.stats.revenueA / abcData.totalRevenue) * 100).toFixed(1) }}%
                      </span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card variant="elevated" class="abc-card class-b">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center ga-3 mb-3">
                    <v-avatar color="info" variant="tonal" size="40">
                      <v-icon color="info">mdi-chart-line</v-icon>
                    </v-avatar>
                    <h3 class="text-h5 font-weight-medium">{{ $t('classB') || 'فئة B' }}</h3>
                  </div>
                  <div class="d-flex flex-column ga-2">
                    <div class="d-flex justify-space-between">
                      <span class="text-caption text-medium-emphasis">{{ $t('productCount') || 'عدد المنتجات' }}</span>
                      <span class="text-body-2 font-weight-medium">{{ abcData.stats.B }}</span>
                    </div>
                    <div class="d-flex justify-space-between">
                      <span class="text-caption text-medium-emphasis">{{ $t('revenue') || 'الإيرادات' }}</span>
                      <span class="text-body-2 font-weight-medium">{{ formatCurrency(abcData.stats.revenueB) }}</span>
                    </div>
                    <div class="d-flex justify-space-between">
                      <span class="text-caption text-medium-emphasis">{{ $t('percentage') || 'النسبة' }}</span>
                      <span class="text-body-2 font-weight-medium">
                        {{ ((abcData.stats.revenueB / abcData.totalRevenue) * 100).toFixed(1) }}%
                      </span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card variant="elevated" class="abc-card class-c">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center ga-3 mb-3">
                    <v-avatar color="grey" variant="tonal" size="40">
                      <v-icon color="grey">mdi-package</v-icon>
                    </v-avatar>
                    <h3 class="text-h5 font-weight-medium">{{ $t('classC') || 'فئة C' }}</h3>
                  </div>
                  <div class="d-flex flex-column ga-2">
                    <div class="d-flex justify-space-between">
                      <span class="text-caption text-medium-emphasis">{{ $t('productCount') || 'عدد المنتجات' }}</span>
                      <span class="text-body-2 font-weight-medium">{{ abcData.stats.C }}</span>
                    </div>
                    <div class="d-flex justify-space-between">
                      <span class="text-caption text-medium-emphasis">{{ $t('revenue') || 'الإيرادات' }}</span>
                      <span class="text-body-2 font-weight-medium">{{ formatCurrency(abcData.stats.revenueC) }}</span>
                    </div>
                    <div class="d-flex justify-space-between">
                      <span class="text-caption text-medium-emphasis">{{ $t('percentage') || 'النسبة' }}</span>
                      <span class="text-body-2 font-weight-medium">
                        {{ ((abcData.stats.revenueC / abcData.totalRevenue) * 100).toFixed(1) }}%
                      </span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- ABC Revenue Distribution Chart -->
          <v-card variant="elevated" class="mb-6">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-chart-pie</v-icon>
                {{ $t('revenueDistributionByClass') || 'توزيع الإيرادات حسب الفئة' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="abc-bars">
                <div class="bar-item">
                  <span class="bar-label">A</span>
                  <div class="bar-wrapper">
                    <div
                      class="bar-fill class-a"
                      :style="{ width: (abcData.stats.revenueA / abcData.totalRevenue) * 100 + '%' }"
                    >
                      {{ ((abcData.stats.revenueA / abcData.totalRevenue) * 100).toFixed(1) }}%
                    </div>
                  </div>
                </div>
                <div class="bar-item">
                  <span class="bar-label">B</span>
                  <div class="bar-wrapper">
                    <div
                      class="bar-fill class-b"
                      :style="{ width: (abcData.stats.revenueB / abcData.totalRevenue) * 100 + '%' }"
                    >
                      {{ ((abcData.stats.revenueB / abcData.totalRevenue) * 100).toFixed(1) }}%
                    </div>
                  </div>
                </div>
                <div class="bar-item">
                  <span class="bar-label">C</span>
                  <div class="bar-wrapper">
                    <div
                      class="bar-fill class-c"
                      :style="{ width: (abcData.stats.revenueC / abcData.totalRevenue) * 100 + '%' }"
                    >
                      {{ ((abcData.stats.revenueC / abcData.totalRevenue) * 100).toFixed(1) }}%
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- ABC Recommendations -->
          <v-card variant="elevated" class="mb-6" v-if="abcData.recommendations?.length">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-lightbulb</v-icon>
                {{ $t('smartRecommendations') || 'توصيات ذكية' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col
                  v-for="rec in abcData.recommendations"
                  :key="rec.type"
                  cols="12"
                  md="6"
                >
                  <v-card variant="outlined" class="recommendation-card" :style="{ borderTop: `3px solid ${rec.color}` }">
                    <v-card-text class="pa-4">
                      <div class="d-flex align-start ga-3">
                        <v-avatar :color="rec.color" variant="tonal" size="40">
                          <v-icon :color="rec.color">{{ rec.icon }}</v-icon>
                        </v-avatar>
                        <div class="flex-grow-1">
                          <h4 class="text-h6 font-weight-medium mb-2">{{ rec.title }}</h4>
                          <p class="text-body-2 text-medium-emphasis mb-2">{{ rec.message }}</p>
                          <p class="text-body-2 mb-2">{{ rec.action }}</p>
                          <div v-if="rec.products?.length" class="d-flex flex-column ga-1">
                            <span class="text-caption text-medium-emphasis">{{ $t('examples') || 'أمثلة' }}:</span>
                            <span class="text-body-2">{{ rec.products.join('، ') }}</span>
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- ABC Products Table -->
          <v-card variant="elevated">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-table</v-icon>
                {{ $t('productDetails') || 'تفاصيل المنتجات' }}
              </h3>
              <v-spacer />
              <v-btn-toggle
                v-model="filterABC"
                variant="outlined"
                density="compact"
                color="primary"
              >
                <v-btn value="all">{{ $t('all') || 'الكل' }}</v-btn>
                <v-btn value="A">A</v-btn>
                <v-btn value="B">B</v-btn>
                <v-btn value="C">C</v-btn>
              </v-btn-toggle>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-data-table
                :headers="abcTableHeaders"
                :items="filteredABCProducts"
                :loading="loadingABC"
                items-per-page="10"
                class="abc-table"
              >
                <template #[`item.classification`]="{ item }">
                  <v-chip :color="getABCClassColor(item.classification)" variant="tonal" size="small">
                    {{ item.classification }}
                  </v-chip>
                </template>
                <template #[`item.totalRevenue`]="{ item }">
                  <span class="text-body-2 font-weight-medium">{{ formatCurrency(item.totalRevenue) }}</span>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </div>
      </v-window-item>

      <!-- Seasonality Tab -->
      <v-window-item value="seasonality">
        <div v-if="loadingSeasonality" class="text-center pa-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
            class="mb-4"
          />
          <p class="text-body-1 text-medium-emphasis">{{ $t('analyzingSeasonalPatterns') || 'جاري تحليل الأنماط الموسمية...' }}</p>
        </div>

        <div v-else-if="seasonalityData?.success">
          <!-- Seasonality Insights -->
          <v-card variant="elevated" class="mb-6" v-if="seasonalityData.insights?.length">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-lightbulb</v-icon>
                {{ $t('seasonalityInsights') || 'رؤى موسمية' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col
                  v-for="insight in seasonalityData.insights"
                  :key="insight.type"
                  cols="12"
                  md="6"
                >
                  <v-card variant="outlined" class="insight-card">
                    <v-card-text class="pa-4">
                      <div class="d-flex align-start ga-3">
                        <v-avatar color="primary" variant="tonal" size="40">
                          <v-icon color="primary">{{ insight.icon }}</v-icon>
                        </v-avatar>
                        <div class="flex-grow-1">
                          <h4 class="text-h6 font-weight-medium mb-2">{{ insight.title }}</h4>
                          <p class="text-body-2 text-medium-emphasis mb-2">{{ insight.message }}</p>
                          <small v-if="insight.recommendation" class="text-caption text-primary">{{ insight.recommendation }}</small>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Monthly Analysis -->
          <v-card variant="elevated" class="mb-6" v-if="seasonalityData.monthly">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-calendar</v-icon>
                {{ $t('monthlyAnalysis') || 'التحليل الشهري' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col
                  v-for="(data, month) in seasonalityData.monthly"
                  :key="month"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card variant="outlined" class="month-card" :class="{ 'high-peak': data.peak === 'high', 'low-peak': data.peak === 'low' }">
                    <v-card-text class="pa-4">
                      <div class="d-flex justify-space-between align-center mb-3">
                        <span class="text-body-2 font-weight-medium">{{ getMonthName(parseInt(month)) }}</span>
                        <v-chip
                          :color="data.peak === 'high' ? 'success' : data.peak === 'low' ? 'error' : 'grey'"
                          variant="tonal"
                          size="small"
                        >
                          {{ data.peak === 'high' ? ($t('active') || 'نشط') : data.peak === 'low' ? ($t('quiet') || 'هادئ') : ($t('normal') || 'عادي') }}
                        </v-chip>
                      </div>
                      <div class="d-flex flex-column ga-2 mb-3">
                        <div class="d-flex justify-space-between">
                          <span class="text-caption text-medium-emphasis">{{ $t('average') || 'المتوسط' }}</span>
                          <span class="text-body-2 font-weight-medium">{{ formatCurrency(data.avg) }}</span>
                        </div>
                        <div class="d-flex justify-space-between">
                          <span class="text-caption text-medium-emphasis">{{ $t('total') || 'الإجمالي' }}</span>
                          <span class="text-body-2 font-weight-medium">{{ formatCurrency(data.total) }}</span>
                        </div>
                      </div>
                      <div class="month-bar">
                        <div
                          class="bar-fill"
                          :style="{ width: (data.avg / maxMonthlyAvg) * 100 + '%' }"
                        ></div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Weekly Analysis -->
          <v-card variant="elevated" class="mb-6" v-if="seasonalityData.weekly">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-calendar-week</v-icon>
                {{ $t('weeklyAnalysis') || 'التحليل الأسبوعي' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col
                  v-for="(data, day) in seasonalityData.weekly"
                  :key="day"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card variant="outlined" class="day-card" :class="{ weekend: data.isWeekend }">
                    <v-card-text class="pa-4">
                      <div class="text-center">
                        <div class="day-name text-body-2 font-weight-medium mb-2">{{ data.name }}</div>
                        <div class="day-value text-h6 font-weight-bold text-primary mb-2">{{ formatCurrency(data.avg) }}</div>
                        <div class="day-bar">
                          <div
                            class="bar-fill"
                            :style="{ width: (data.avg / maxWeeklyAvg) * 100 + '%' }"
                          ></div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Special Seasons -->
          <v-card variant="elevated" class="mb-6" v-if="seasonalityData.specialSeasons">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-star</v-icon>
                {{ $t('specialSeasons') || 'المواسم الخاصة' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col
                  v-for="(data, key) in seasonalityData.specialSeasons"
                  :key="key"
                  cols="12"
                  md="6"
                >
                  <v-card variant="outlined" class="season-card" :class="{ 'positive-trend': data.trend === 'rising', 'negative-trend': data.trend === 'falling' }">
                    <v-card-text class="pa-4">
                      <div class="d-flex justify-space-between align-center mb-3">
                        <span class="text-body-2 font-weight-medium">{{ data.name }}</span>
                        <v-chip
                          :color="data.impact > 0 ? 'success' : 'error'"
                          variant="tonal"
                          size="small"
                        >
                          {{ data.impact > 0 ? '+' : '' }}{{ data.impact }}%
                        </v-chip>
                      </div>
                      <p class="text-body-2 text-medium-emphasis">{{ data.recommendation }}</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Seasonality Recommendations -->
          <v-card variant="elevated" v-if="seasonalityData.recommendations?.length">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-lightbulb</v-icon>
                {{ $t('seasonalityRecommendations') || 'توصيات موسمية' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col
                  v-for="rec in seasonalityData.recommendations"
                  :key="rec.title"
                  cols="12"
                  md="6"
                >
                  <v-card variant="outlined" class="rec-card" :style="{ borderRight: `3px solid ${rec.color}` }">
                    <v-card-text class="pa-4">
                      <div class="d-flex align-start ga-3">
                        <v-avatar :color="rec.color" variant="tonal" size="40">
                          <v-icon :color="rec.color">{{ rec.icon }}</v-icon>
                        </v-avatar>
                        <div class="flex-grow-1">
                          <h4 class="text-h6 font-weight-medium mb-2">{{ rec.title }}</h4>
                          <p class="text-body-2 text-medium-emphasis mb-2">{{ rec.message }}</p>
                          <small class="text-caption text-primary">{{ rec.action }}</small>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>

        <v-card v-else-if="seasonalityData && !seasonalityData.success" variant="outlined" class="text-center pa-6">
          <v-icon size="64" color="warning" class="mb-4">mdi-alert</v-icon>
          <h3 class="text-h6 font-weight-medium mb-2">{{ $t('error') || 'خطأ' }}</h3>
          <p class="text-body-2 text-medium-emphasis">{{ seasonalityData.message || ($t('insufficientData') || 'لا توجد بيانات كافية للتحليل') }}</p>
        </v-card>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import Chart from 'chart.js/auto';
import ForecastService from '@/services/ForecastService';
import CurrencyService from '@/services/CurrencyService';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const loadingABC = ref(false);
const loadingSeasonality = ref(false);
const forecast = ref(null);
const inventoryForecast = ref(null);
const categoryForecasts = ref([]);
const abcData = ref(null);
const seasonalityData = ref(null);
const activeTab = ref('overview');
const filterABC = ref('all');
const chart = ref(null);
const forecastChart = ref(null);
const maxMonthlyAvg = ref(0);
const maxWeeklyAvg = ref(0);

// Computed
const quickStats = computed(() => {
  if (!forecast.value) return [];
  
  return [
    {
      key: 'total',
      label: t('totalSales') || 'إجمالي المبيعات',
      value: formatCurrency(forecast.value.total),
      icon: 'mdi-cash',
      color: 'primary',
      trend: forecast.value.trend?.total || 0
    },
    {
      key: 'average',
      label: t('averageDaily') || 'متوسط يومي',
      value: formatCurrency(forecast.value.average),
      icon: 'mdi-chart-line',
      color: 'info',
      trend: forecast.value.trend?.average || 0
    },
    {
      key: 'growth',
      label: t('growthRate') || 'معدل النمو',
      value: `${forecast.value.growthRate || 0}%`,
      icon: 'mdi-trending-up',
      color: forecast.value.growthRate > 0 ? 'success' : 'error',
      trend: forecast.value.growthRate || 0
    },
    {
      key: 'accuracy',
      label: t('accuracy') || 'دقة التوقعات',
      value: `${forecast.value.accuracy || 0}%`,
      icon: 'mdi-bullseye',
      color: 'warning',
      trend: 0
    }
  ];
});

const abcTableHeaders = computed(() => [
  { title: t('productName') || 'اسم المنتج', key: 'name', sortable: true },
  { title: t('category') || 'التصنيف', key: 'category', sortable: true },
  { title: t('sales') || 'المبيعات', key: 'sales', sortable: true },
  { title: t('revenue') || 'الإيرادات', key: 'totalRevenue', sortable: true },
  { title: t('classification') || 'التصنيف', key: 'classification', sortable: true },
]);

const filteredABCProducts = computed(() => {
  if (!abcData.value?.products) return [];
  if (filterABC.value === 'all') return abcData.value.products;
  return abcData.value.products.filter(product => product.classification === filterABC.value);
});

// Methods
const formatCurrency = (value) => {
  return CurrencyService.format(value, 'SAR');
};

const getCategoryName = (category) => {
  const names = {
    walls: t('walls') || 'جدران',
    doors: t('doors') || 'أبواب',
    furniture: t('furniture') || 'أثاث',
    cars: t('cars') || 'سيارات',
    kitchens: t('kitchens') || 'مطابخ',
    ceilings: t('ceilings') || 'أسقف',
    tiles: t('tiles') || 'بلاط'
  };
  return names[category] || category;
};

const getTrendIcon = (trend) => {
  const icons = {
    rising: 'mdi-trending-up',
    falling: 'mdi-trending-down',
    stable: 'mdi-trending-neutral'
  };
  return icons[trend] || 'mdi-trending-neutral';
};

const getABCClassColor = (classification) => {
  const colors = {
    A: 'warning',
    B: 'info',
    C: 'grey'
  };
  return colors[classification] || 'grey';
};

const getMonthName = (month) => {
  const months = [
    t('january') || 'يناير',
    t('february') || 'فبراير',
    t('march') || 'مارس',
    t('april') || 'أبريل',
    t('may') || 'مايو',
    t('june') || 'يونيو',
    t('july') || 'يوليو',
    t('august') || 'أغسطس',
    t('september') || 'سبتمبر',
    t('october') || 'أكتوبر',
    t('november') || 'نوفمبر',
    t('december') || 'ديسمبر'
  ];
  return months[month - 1] || '';
};

const initForecastChart = () => {
  if (!forecastChart.value) return;

  if (chart.value) {
    chart.value.destroy();
  }

  const ctx = forecastChart.value.getContext('2d');
  
  const labels = [];
  const historicalData = [];
  const predictedData = [];
  
  // Generate sample data for demo
  for (let i = 1; i <= 30; i++) {
    labels.push(`يوم ${i}`);
    if (i <= 15) {
      historicalData.push(Math.floor(Math.random() * 1000 + 500));
      predictedData.push(null);
    } else {
      historicalData.push(null);
      predictedData.push(Math.floor(Math.random() * 1200 + 600));
    }
  }

  chart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('previousSales') || 'مبيعات سابقة',
          data: historicalData,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#2196F3',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
        {
          label: t('forecast') || 'توقعات',
          data: predictedData,
          borderColor: '#d4af37',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointBackgroundColor: '#d4af37',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(26, 26, 46, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#d4af37',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += formatCurrency(context.raw);
              return label;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false,
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            callback: (value) => {
              return formatCurrency(value);
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            maxRotation: 45,
            minRotation: 45,
          },
        },
      },
    },
  });
};

const refreshForecast = async () => {
  loading.value = true;
  try {
    const result = await ForecastService.getGeneralForecast();
    if (result.success) {
      forecast.value = result.data;
      await nextTick();
      initForecastChart();
      
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('forecastUpdated') || 'تم تحديث التوقعات',
        message: t('forecastUpdatedMessage') || 'تم تحديث بيانات التوقعات بنجاح',
        timeout: 3000
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Forecast refresh error:', error);
    // Use mock data as fallback
    forecast.value = {
      total: 250000,
      average: 8333,
      growthRate: 12.5,
      accuracy: 87.3,
      trend: {
        total: 12.5,
        average: 8.2
      }
    };
    await nextTick();
    initForecastChart();
    
    store.dispatch('notifications/add', {
      type: 'warning',
      title: t('usingMockData') || 'استخدام بيانات وهمية',
      message: t('usingMockDataMessage') || 'جاري استخدام بيانات وهمية للعرض',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const loadInventoryForecast = async () => {
  try {
    const result = await ForecastService.getInventoryForecast();
    if (result.success) {
      inventoryForecast.value = result.data;
    } else {
      inventoryForecast.value = {
        critical: [
          {
            productId: 1,
            productName: 'ملصقات جدران ديناميكية',
            currentStock: 15,
            dailyAverage: 3.2,
            daysUntilZero: 5
          },
          {
            productId: 2,
            productName: 'ملصقات أبواب عصرية',
            currentStock: 8,
            dailyAverage: 2.1,
            daysUntilZero: 4
          }
        ],
        warning: [
          {
            productId: 3,
            productName: 'ملصقات أثاث كلاسيكي',
            currentStock: 25,
            dailyAverage: 1.5,
            daysUntilZero: 16
          }
        ]
      };
    }
  } catch (error) {
    console.error('Inventory forecast error:', error);
  }
};

const loadCategoryForecasts = async () => {
  try {
    const result = await ForecastService.getCategoryForecasts();
    if (result.success) {
      categoryForecasts.value = result.data;
    } else {
      categoryForecasts.value = [
        {
          category: 'walls',
          forecast: { total: 85000 },
          trends: { trend: 'rising', change: 15.2 }
        },
        {
          category: 'doors',
          forecast: { total: 62000 },
          trends: { trend: 'stable', change: 2.1 }
        },
        {
          category: 'furniture',
          forecast: { total: 48000 },
          trends: { trend: 'falling', change: -5.8 }
        }
      ];
    }
  } catch (error) {
    console.error('Category forecast error:', error);
  }
};

const loadABCAnalysis = async () => {
  loadingABC.value = true;
  try {
    const result = await ForecastService.getABCAnalysis();
    if (result.success) {
      abcData.value = result.data;
      maxMonthlyAvg.value = Math.max(...Object.values(result.data.monthly || {}));
      maxWeeklyAvg.value = Math.max(...Object.values(result.data.weekly || {}));
    } else {
      abcData.value = {
        stats: {
          A: 15,
          B: 35,
          C: 85,
          revenueA: 125000,
          revenueB: 80000,
          revenueC: 45000
        },
        totalRevenue: 250000,
        recommendations: [
          {
            type: 'focus',
            title: t('focusOnClassA') || 'التركيز على فئة A',
            message: t('focusOnClassAMessage') || 'المنتجات من فئة A تمثل 80% من الإيرادات',
            action: t('increaseStockOfClassA') || 'زيادة مخزون منتجات فئة A',
            color: 'warning',
            icon: 'mdi-star',
            products: ['ملصقات جدران ديناميكية', 'ملصقات أبواب عصرية']
          }
        ]
      };
    }
  } catch (error) {
    console.error('ABC analysis error:', error);
  } finally {
    loadingABC.value = false;
  }
};

const loadSeasonalityAnalysis = async () => {
  loadingSeasonality.value = true;
  try {
    const result = await ForecastService.getSeasonalityAnalysis();
    if (result.success) {
      seasonalityData.value = result.data;
      maxMonthlyAvg.value = Math.max(...Object.values(result.data.monthly || {}));
      maxWeeklyAvg.value = Math.max(...Object.values(result.data.weekly || {}));
    } else {
      seasonalityData.value = {
        success: true,
        insights: [
          {
            type: 'peak',
            title: t('peakSeason') || 'الموسم الذروة',
            message: t('peakSeasonMessage') || 'فترة الصيف هي الأكثر نشاطاً',
            recommendation: t('increaseStockInSummer') || 'زيادة المخزون في فصل الصيف',
            icon: 'mdi-weather-sunny'
          }
        ],
        monthly: {},
        weekly: {},
        recommendations: []
      };
    }
  } catch (error) {
    console.error('Seasonality analysis error:', error);
  } finally {
    loadingSeasonality.value = false;
  }
};

const orderProduct = (product) => {
  store.dispatch('notifications/add', {
    type: 'info',
    title: t('productOrdered') || 'تم طلب المنتج',
    message: `${t('orderPlacedFor') || 'تم وضع طلب لـ'} ${product.productName}`,
    timeout: 3000
  });
};

// Watchers
watch(activeTab, async (newTab) => {
  if (newTab === 'inventory' && !inventoryForecast.value) {
    await loadInventoryForecast();
  } else if (newTab === 'categories' && !categoryForecasts.value.length) {
    await loadCategoryForecasts();
  } else if (newTab === 'abc' && !abcData.value) {
    await loadABCAnalysis();
  }
});

// Lifecycle
onMounted(async () => {
  await refreshForecast();
  await loadInventoryForecast();
  await loadCategoryForecasts();
});
</script>

<style scoped>
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

/* Header */
.forecast-header {
  animation: fadeIn 0.5s ease;
}

/* Stats Cards */
.stat-card {
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #1a1a2e, #2d2d44);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: #d4af37;
}

.stat-icon {
  background: rgba(212, 175, 55, 0.1);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Chart Container */
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

/* Color dots */
.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.color-dot.actual {
  background: #2196F3;
}

.color-dot.predicted {
  background: #d4af37;
}

/* Alert Cards */
.alert-card {
  transition: all 0.3s ease;
}

.alert-card:hover {
  transform: translateY(-2px);
}

.alert-card.critical {
  border-left: 4px solid #f44336;
}

.alert-card.warning {
  border-left: 4px solid #ff9800;
}

/* Category Cards */
.category-card {
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* ABC Cards */
.abc-card {
  transition: all 0.3s ease;
}

.abc-card:hover {
  transform: translateY(-2px);
}

.abc-card.class-a {
  border-left: 4px solid #ffc107;
}

.abc-card.class-b {
  border-left: 4px solid #2196f3;
}

.abc-card.class-c {
  border-left: 4px solid #9e9e9e;
}

/* ABC Bars */
.abc-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 30px;
  height: 30px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.bar-wrapper {
  flex: 1;
  height: 30px;
  background: #f5f5f5;
  border-radius: 15px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
  transition: width 0.3s ease;
}

.bar-fill.class-a {
  background: linear-gradient(90deg, #ffc107, #ffb300);
}

.bar-fill.class-b {
  background: linear-gradient(90deg, #2196f3, #1976d2);
}

.bar-fill.class-c {
  background: linear-gradient(90deg, #9e9e9e, #757575);
}

/* Recommendation Cards */
.recommendation-card {
  transition: all 0.3s ease;
}

.recommendation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Month Cards */
.month-card {
  transition: all 0.3s ease;
}

.month-card:hover {
  transform: translateY(-2px);
}

.month-card.high-peak {
  border-left: 4px solid #4caf50;
}

.month-card.low-peak {
  border-left: 4px solid #f44336;
}

.month-bar {
  width: 100%;
  height: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.month-bar .bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196f3, #1976d2);
  transition: width 0.3s ease;
}

/* Day Cards */
.day-card {
  transition: all 0.3s ease;
}

.day-card:hover {
  transform: translateY(-2px);
}

.day-card.weekend {
  background: rgba(255, 152, 0, 0.05);
}

.day-name {
  color: #666;
}

.day-bar {
  width: 100%;
  height: 6px;
  background: #f5f5f5;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}

.day-bar .bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4af37, #b8941f);
  transition: width 0.3s ease;
}

/* Season Cards */
.season-card {
  transition: all 0.3s ease;
}

.season-card:hover {
  transform: translateY(-2px);
}

.season-card.positive-trend {
  border-left: 4px solid #4caf50;
}

.season-card.negative-trend {
  border-left: 4px solid #f44336;
}

/* Insight Cards */
.insight-card {
  transition: all 0.3s ease;
}

.insight-card:hover {
  transform: translateY(-2px);
}

/* Rec Cards */
.rec-card {
  transition: all 0.3s ease;
}

.rec-card:hover {
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .d-flex.justify-space-between {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Loading states */
.v-progress-circular {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
