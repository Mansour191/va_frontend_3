<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-card elevation="4" class="overflow-hidden">
          <!-- Header -->
          <v-card-text class="pa-8 text-center bg-surface">
            <h1 class="text-h3 font-weight-bold text-warning mb-4 d-flex align-center justify-center gap-3">
              <v-icon size="40" color="warning">mdi-truck-fast</v-icon>
              {{ $t('shippingPolicy') || 'سياسة الشحن والتوصيل' }}
            </h1>
            <p class="text-h6 text-medium-emphasis">{{ $t('shippingPolicyIntro') || 'كل ما تود معرفته عن توصيل طلباتك' }}</p>
          </v-card-text>

          <!-- Policy Items -->
          <v-card-text class="pa-8">
            <v-row class="mb-8">
              <v-col
                v-for="(item, index) in policyItems"
                :key="index"
                cols="12"
                md="6"
              >
                <v-card elevation="2" class="pa-6 text-center h-100">
                  <div class="policy-icon-wrapper mb-4">
                    <v-icon :icon="item.icon" size="48" color="warning"></v-icon>
                  </div>
                  <h3 class="text-h5 font-weight-bold mb-3">{{ item.title }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">{{ item.description }}</p>
                </v-card>
              </v-col>
            </v-row>

            <!-- Shipping Table -->
            <v-card elevation="2" class="mt-6">
              <v-table>
                <thead class="bg-surface">
                  <tr>
                    <th class="text-warning font-weight-bold pa-4">{{ $t('wilayaGroup') || 'الولايات' }}</th>
                    <th class="text-warning font-weight-bold pa-4">{{ $t('deliveryTime') || 'مدة التوصيل' }}</th>
                    <th class="text-warning font-weight-bold pa-4">{{ $t('shippingFee') || 'تكلفة الشحن' }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="pa-4">الجزائر العاصمة</td>
                    <td class="pa-4">24 - 48 ساعة</td>
                    <td class="pa-4 font-weight-bold text-success">مجاني</td>
                  </tr>
                  <tr>
                    <td class="pa-4">ولايات الشمال</td>
                    <td class="pa-4">2 - 4 أيام</td>
                    <td class="pa-4 font-weight-bold">400 د.ج</td>
                  </tr>
                  <tr>
                    <td class="pa-4">ولايات الجنوب والهضاب</td>
                    <td class="pa-4">3 - 6 أيام</td>
                    <td class="pa-4 font-weight-bold">700 د.ج</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>

            <!-- Important Notes -->
            <v-card elevation="2" class="mt-6 pa-6" color="grey-lighten-5">
              <h4 class="text-h5 font-weight-bold text-warning mb-4 d-flex align-center gap-2">
                <v-icon size="24" color="warning">mdi-information</v-icon>
                ملاحظات هامة:
              </h4>
              <v-list density="compact" class="text-body-2 text-medium-emphasis">
                <v-list-item>
                  <v-list-item-title>يتم البدء في تجهيز الطلب فور تأكيده هاتفياً أو إلكترونياً.</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>تختلف مدة التوصيل حسب توفر المنتج في المخزن أو الحاجة لتصنيعه.</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>الشحن مجاني لجميع الطلبات التي تتجاوز قيمتها 10,000 د.ج.</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Policy Items - Dynamic loading from API
const policyItems = ref([]);

const fetchPolicyItems = async () => {
  try {
    const response = await fetch('/api/shipping-policy/items');
    if (response.ok) {
      const data = await response.json();
      policyItems.value = data.map(item => ({
        icon: item.icon || 'mdi-truck',
        title: item.title,
        description: item.description
      }));
    }
  } catch (error) {
    console.error('Failed to fetch shipping policy items:', error);
    // Fallback to static data
    policyItems.value = [
      {
        icon: 'mdi-clock-fast',
        title: t('deliverySpeed') || 'سرعة التوصيل',
        description: t('deliverySpeedDesc') || 'نحرص على توصيل طلباتكم في أسرع وقت ممكن عبر شبكة واسعة من الشركاء.'
      },
      {
        icon: 'mdi-map-marker-multiple',
        title: t('wideCoverage') || 'تغطية شاملة',
        description: t('wideCoverageDesc') || 'نوفر خدمة التوصيل لجميع الولايات الـ 58 في الجزائر.'
      },
      {
        icon: 'mdi-package-variant-closed',
        title: t('securePackaging') || 'تغليف آمن',
        description: t('securePackagingDesc') || 'يتم تغليف التصاميم بعناية فائقة لضمان وصولها بحالة ممتازة.'
      },
      {
        icon: 'mdi-headset',
        title: t('orderTracking') || 'تتبع الطلب',
        description: t('orderTrackingDesc') || 'يمكنك تتبع حالة طلبك لحظة بلحظة من خلال حسابك أو عبر الهاتف.'
      }
    ];
  }
};

// Lifecycle
onMounted(() => {
  fetchPolicyItems();
});
</script>

<style scoped>
/* Vuetify handles most styling */
.policy-icon-wrapper {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
