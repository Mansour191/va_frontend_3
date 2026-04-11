<template>
  <v-menu
    v-model="showDropdown"
    location="bottom end"
    offset="10"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        prepend-icon="mdi-cash"
        variant="outlined"
        color="primary"
        class="currency-btn"
      >
        {{ currentCurrency.symbol }}
      </v-btn>
    </template>
    
    <v-card min-width="200" elevation="8">
      <v-list density="compact">
        <v-list-item
          v-for="currency in currencies"
          :key="currency.code"
          :class="{ 'bg-primary': currentCode === currency.code }"
          @click="selectCurrency(currency.code)"
        >
          <template v-slot:prepend>
            <span class="currency-symbol">{{ currency.symbol }}</span>
          </template>
          <v-list-item-title class="currency-name">{{ currency.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CurrencyService from '@/integration/services/CurrencyService';

const router = useRouter();

// State
const showDropdown = ref(false);
const currentCode = ref(CurrencyService.currentCurrency);
const currencies = ref([]);
const loading = ref(false);

// Computed
const currentCurrency = computed(() => CurrencyService.getCurrentCurrency());

// Methods
const loadCurrencies = async () => {
  loading.value = true;
  try {
    // جلب العملات من قاعدة البيانات عبر API
    const response = await CurrencyService.getAvailableCurrencies();
    currencies.value = response.data || [
      { code: 'DZD', symbol: 'د.ج', name: 'الدينار الجزائري' },
      { code: 'EUR', symbol: 'يورو', name: 'اليورو الأوروبي' },
      { code: 'USD', symbol: 'دولار', name: 'الدولار الأمريكي' },
    ];
  } catch (error) {
    console.error('❌ Error loading currencies:', error);
    // استخدام البيانات الافتراضية في حالة فشل API
    currencies.value = [
      { code: 'DZD', symbol: 'د.ج', name: 'الدينار الجزائري' },
      { code: 'EUR', symbol: 'يورو', name: 'اليورو الأوروبي' },
      { code: 'USD', symbol: 'دولار', name: 'الدولار الأمريكي' },
    ];
  } finally {
    loading.value = false;
  }
};

const selectCurrency = (code) => {
  CurrencyService.setCurrency(code);
  currentCode.value = code;
  showDropdown.value = false;
  
  // إعادة تحميل الصفحة الحالية لتحديث الأرقام
  router.go();
};

// Lifecycle
onMounted(() => {
  loadCurrencies();
});
</script>

