// src\views\dashboard\forecasting\components\ForecastChart.vue
<template>
  <div class="forecast-chart">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import Chart from 'chart.js/auto';

const { t } = useI18n();

// Props
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  predictions: {
    type: Array,
    default: () => [],
  },
  historical: {
    type: Array,
    default: () => [],
  },
});

// State
const chartCanvas = ref(null);
const chart = ref(null);

// Methods
const initChart = () => {
  if (!chartCanvas.value) return;

  if (chart.value) {
    chart.value.destroy();
  }

  const ctx = chartCanvas.value.getContext('2d');

  // Prepare data
  const labels = generateLabels();
  const historicalData = props.historical.length
    ? props.historical
    : generateMockHistorical();
  const predictionData = props.predictions.length
    ? props.predictions
    : generateMockPredictions();

  chart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('actualSales') || 'المبيعات الفعلية',
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
          label: t('forecast') || 'التوقعات',
          data: predictionData,
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
              label += new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: 'SAR',
                minimumFractionDigits: 0,
              }).format(context.raw);
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
              return new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: 'SAR',
                minimumFractionDigits: 0,
                notation: 'compact',
              }).format(value);
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
      elements: {
        line: {
          tension: 0.4,
        },
      },
      animations: {
        tension: {
          duration: 1000,
          easing: 'linear',
          from: 0.8,
          to: 0.4,
          loop: false,
        },
      },
    },
  });
};

const generateLabels = () => {
  const labels = [];
  const totalDays = Math.max(props.historical.length, props.predictions.length, 30);

  for (let i = 1; i <= totalDays; i++) {
    if (i === 1) {
      labels.push(t('day1') || 'اليوم 1');
    } else if (i === totalDays) {
      labels.push(`${t('day') || 'يوم'} ${i}`);
    } else if (i % 5 === 0) {
      labels.push(`${t('day') || 'يوم'} ${i}`);
    } else {
      labels.push('');
    }
  }

  return labels;
};

const generateMockHistorical = () => {
  return Array(30)
    .fill(0)
    .map(() => Math.floor(Math.random() * 800 + 400));
};

const generateMockPredictions = () => {
  return Array(30)
    .fill(0)
    .map((_, i) => Math.floor(Math.random() * 600 + 500 + i * 10));
};

// Watchers
watch(() => props.data, () => {
  nextTick(() => {
    initChart();
  });
}, { deep: true });

// Lifecycle
onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});
</script>

<style scoped>
.forecast-chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
  position: relative;
}
</style>
