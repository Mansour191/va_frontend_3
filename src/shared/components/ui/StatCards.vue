<template>
  <v-row class="stats-cards">
    <v-col
      v-for="stat in stats"
      :key="stat.label"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card class="stat-card" elevation="2">
        <v-card-text class="pa-4">
          <div class="d-flex align-center">
            <div class="stat-icon" :class="`bg-${getStatColor(stat.color)}`">
              <v-icon :icon="stat.icon" :color="getStatColor(stat.color)" size="24" />
            </div>
            <div class="stat-content flex-grow-1">
              <div class="stat-value text-h4 font-weight-bold">{{ stat.value }}</div>
              <div class="stat-label text-body-2 text-medium-emphasis">{{ stat.label }}</div>
            </div>
            <div v-if="stat.trend !== undefined" class="stat-trend">
              <v-chip
                :color="stat.trend > 0 ? 'success' : 'error'"
                variant="tonal"
                size="small"
                class="trend-chip"
              >
                <v-icon
                  :icon="stat.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down'"
                  size="16"
                  class="me-1"
                />
                {{ Math.abs(stat.trend) }}%
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
// Helper method to convert color names to Vuetify colors
const getStatColor = (color) => {
  const colorMap = {
    'primary': 'primary',
    'secondary': 'secondary',
    'success': 'success',
    'error': 'error',
    'warning': 'warning',
    'info': 'info',
    'gold': 'warning',
    'blue': 'info',
    'green': 'success',
    'red': 'error',
    'orange': 'warning'
  };
  return colorMap[color] || 'primary';
};

defineProps({
  stats: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
  margin-right: 16px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  line-height: 1.4;
}

.stat-trend {
  margin-left: 8px;
}

.trend-chip {
  font-weight: 500;
}

@media (max-width: 600px) {
  .stat-icon {
    width: 40px;
    height: 40px;
    margin-left: 12px;
    margin-right: 12px;
  }
  
  .stat-value {
    font-size: 1.25rem !important;
  }
  
  .stat-trend {
    margin-left: 4px;
  }
}
</style>
