<template>
  <div class="kpi-card">
    <div class="kpi-header">
      <h3>{{ title }}</h3>
      <div class="kpi-icon" v-if="icon">
        <i :class="icon"></i>
      </div>
    </div>
    <div class="kpi-value">
      <span class="value">{{ value }}</span>
      <span class="unit" v-if="unit">{{ unit }}</span>
    </div>
    <div class="kpi-change" v-if="change !== null">
      <span :class="['change-indicator', change >= 0 ? 'positive' : 'negative']">
        {{ change >= 0 ? '↑' : '↓' }} {{ Math.abs(change) }}%
      </span>
      <span class="change-period">{{ period }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KPICard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    unit: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    change: {
      type: Number,
      default: null
    },
    period: {
      type: String,
      default: 'vs last month'
    }
  }
}
</script>

<style scoped>
.kpi-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #3498db;
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.kpi-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
}

.kpi-icon {
  color: #3498db;
}

.kpi-value {
  margin-bottom: 0.5rem;
}

.value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.unit {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-left: 0.25rem;
}

.kpi-change {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.change-indicator {
  font-size: 0.8rem;
  font-weight: 600;
}

.positive {
  color: #27ae60;
}

.negative {
  color: #e74c3c;
}

.change-period {
  font-size: 0.8rem;
  color: #7f8c8d;
}
</style>
