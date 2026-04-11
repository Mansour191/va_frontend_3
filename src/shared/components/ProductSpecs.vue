<template>
  <div class="product-specs-info mt-4">
    <!-- Specs Grid -->
    <v-row dense>
      <v-col
        v-for="spec in specs"
        :key="spec.label"
        cols="6"
        sm="4"
        md="3"
      >
        <v-card
          class="spec-card h-100 text-center pa-3 transition-all"
          variant="tonal"
          hover
        >
          <v-icon
            :icon="spec.icon"
            size="32"
            color="primary"
            class="mb-2"
          />
          <div class="text-caption text-medium-emphasis text-uppercase mb-1">
            {{ $t(spec.label) || spec.label }}
          </div>
          <div class="text-body-2 font-weight-bold">
            {{ spec.value }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Additional Info Tabs -->
    <v-card variant="outlined" class="mt-6">
      <v-tabs
        v-model="activeTab"
        align-tabs="center"
        color="primary"
        class="mb-4"
      >
        <v-tab value="shipping">
          <v-icon start>mdi-truck</v-icon>
          {{ $t('shippingInfo') || 'الشحن والتوصيل' }}
        </v-tab>
        <v-tab value="return">
          <v-icon start>mdi-undo</v-icon>
          {{ $t('returnPolicy') || 'سياسة الإرجاع' }}
        </v-tab>
        <v-tab value="install">
          <v-icon start>mdi-file-document</v-icon>
          {{ $t('installGuide') || 'دليل التركيب' }}
        </v-tab>
      </v-tabs>
      
      <v-card-text class="pa-4">
        <v-window v-model="activeTab">
          <!-- Shipping Tab -->
          <v-window-item value="shipping">
            <v-row>
              <v-col cols="12" sm="6" class="mb-4">
                <div class="d-flex align-center ga-3">
                  <v-icon size="40" color="primary">mdi-truck</v-icon>
                  <div>
                    <h6 class="text-h6 font-weight-bold mb-1">
                      {{ $t('deliveryTime') || 'وقت التوصيل المتوقع' }}
                    </h6>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ $t('deliveryDesc') || 'يتم توصيل هذا المنتج خلال 2 - 5 أيام عمل لجميع الولايات.' }}
                    </p>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" class="mb-4">
                <div class="d-flex align-center ga-3">
                  <v-icon size="40" color="primary">mdi-shield-check</v-icon>
                  <div>
                    <h6 class="text-h6 font-weight-bold mb-1">
                      {{ $t('warranty') || 'الضمان' }}
                    </h6>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ $t('warrantyDesc') || 'ضمان لمدة سنة على ثبات الألوان وجودة الخامة ضد الماء والحرارة.' }}
                    </p>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-window-item>
          
          <!-- Return Policy Tab -->
          <v-window-item value="return">
            <p class="text-body-2 text-medium-emphasis mb-3">
              {{ $t('returnPolicyDesc') || 'يمكنك إرجاع المنتج خلال 14 يوماً من الاستلام في حال وجود عيب مصنعي أو خطأ في المواصفات المطلوبة.' }}
            </p>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>
                  <v-icon size="small" class="me-2">mdi-check-circle</v-icon>
                  {{ $t('returnCondition1') || 'يجب أن يكون المنتج في حالته الأصلية وتغليفه الأصلي.' }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>
                  <v-icon size="small" class="me-2">mdi-check-circle</v-icon>
                  {{ $t('returnCondition2') || 'لا يمكن إرجاع المنتجات المخصصة بالمقاسات إلا في حال وجود عيب مصنعي.' }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-window-item>
          
          <!-- Installation Guide Tab -->
          <v-window-item value="install">
            <div class="text-center py-4">
              <v-icon size="64" color="error" class="mb-3">mdi-file-pdf</v-icon>
              <h6 class="text-h6 font-weight-bold mb-2">
                {{ $t('installGuidePdf') || 'دليل التركيب (PDF)' }}
              </h6>
              <p class="text-body-2 text-medium-emphasis mb-4">
                {{ $t('installGuideDesc') || 'قم بتحميل دليل التركيب الموضح خطوة بخطوة لضمان أفضل نتيجة.' }}
              </p>
              <v-btn
                href="#"
                color="primary"
                variant="outlined"
                rounded="pill"
                prepend-icon="mdi-download"
              >
                {{ $t('downloadGuide') || 'تحميل الدليل' }}
              </v-btn>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  specs: { type: Array, default: () => [] }
});

const activeTab = ref('shipping');
</script>

<style scoped>
.spec-card {
  transition: all 0.3s ease;
}

.spec-card:hover {
  transform: translateY(-4px);
}

:deep(.v-tabs) {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.2);
}

:deep(.v-tab) {
  text-transform: none;
  font-weight: 600;
}

:deep(.v-tab.v-tab-item--selected) {
  color: rgb(var(--v-theme-primary));
}

:deep(.v-window-item) {
  min-height: 200px;
}
</style>
