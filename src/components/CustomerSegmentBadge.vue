<template>
  <div class="segment-badges">
    <v-chip
      v-for="assignment in assignments"
      :key="assignment.id"
      :color="getSegmentColor(assignment.customersegment?.name)"
      variant="tonal"
      size="small"
      class="segment-chip"
      closable
      @click:close="handleRemoveAssignment(assignment)"
    >
      <v-icon start size="14">{{ getSegmentIcon(assignment.customersegment?.name) }}</v-icon>
      {{ assignment.customersegment?.name }}
      
      <!-- Tooltip showing joined_at and other details -->
      <v-tooltip activator="parent" location="top">
        <div class="tooltip-content">
          <div class="tooltip-row">
            <strong>{{ $t('segment') || 'Segment' }}:</strong> {{ assignment.customersegment?.name }}
          </div>
          <div class="tooltip-row">
            <strong>{{ $t('joinedAt') || 'Joined At' }}:</strong> {{ formatDate(assignment.joinedAt) }}
          </div>
          <div v-if="assignment.addedByAi" class="tooltip-row">
            <strong>{{ $t('source') || 'Source' }}:</strong> 
            <v-icon size="12" color="primary" class="ml-1">mdi-robot</v-icon>
            {{ $t('aiAssignment') || 'AI Assignment' }}
          </div>
          <div class="tooltip-row">
            <strong>{{ $t('engagementScore') || 'Engagement' }}:</strong> 
            <v-chip 
              :color="getEngagementColor(assignment.engagementScore)" 
              variant="flat" 
              size="x-small"
              class="ml-1"
            >
              {{ assignment.engagementScore }}
            </v-chip>
          </div>
        </div>
      </v-tooltip>
      
      <!-- AI indicator icon -->
      <v-icon
        v-if="assignment.addedByAi"
        end
        size="12"
        color="primary"
        class="ml-1"
      >
        mdi-robot
      </v-icon>
    </v-chip>
    
    <!-- Add segment button -->
    <v-chip
      v-if="showAddButton"
      color="grey"
      variant="outlined"
      size="small"
      class="add-chip"
      @click="$emit('add-assignment')"
    >
      <v-icon start size="14">mdi-plus</v-icon>
      {{ $t('addSegment') || 'Add Segment' }}
    </v-chip>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  assignments: {
    type: Array,
    default: () => []
  },
  showAddButton: {
    type: Boolean,
    default: true
  },
  removable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['remove-assignment', 'add-assignment']);

const { t } = useI18n();

// Methods
const formatDate = (dateString) => {
  if (!dateString) return t('notAvailable') || 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getSegmentColor = (segmentName) => {
  const colors = {
    'VIP Customers': 'purple',
    'Regular Customers': 'blue',
    'New Customers': 'green',
    'Active Customers': 'orange',
    'Inactive Customers': 'grey',
    'Premium Customers': 'gold',
    'Loyal Customers': 'deep-purple',
    'At-Risk Customers': 'red'
  };
  
  // Default color based on segment name hash
  if (!colors[segmentName]) {
    const hash = segmentName?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    const colorOptions = ['primary', 'secondary', 'success', 'warning', 'info', 'error'];
    return colorOptions[hash % colorOptions.length];
  }
  
  return colors[segmentName];
};

const getSegmentIcon = (segmentName) => {
  const icons = {
    'VIP Customers': 'mdi-star',
    'Regular Customers': 'mdi-account',
    'New Customers': 'mdi-account-plus',
    'Active Customers': 'mdi-account-check',
    'Inactive Customers': 'mdi-account-off',
    'Premium Customers': 'mdi-crown',
    'Loyal Customers': 'mdi-heart',
    'At-Risk Customers': 'mdi-alert'
  };
  
  return icons[segmentName] || 'mdi-account-group';
};

const getEngagementColor = (score) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'info';
  return 'error';
};

const handleRemoveAssignment = (assignment) => {
  if (props.removable) {
    emit('remove-assignment', assignment);
  }
};
</script>

<style scoped>
.segment-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.segment-chip {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segment-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.add-chip {
  border-style: dashed;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-chip:hover {
  border-style: solid;
  transform: translateY(-1px);
}

.tooltip-content {
  padding: 4px;
}

.tooltip-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
}

.tooltip-row:last-child {
  margin-bottom: 0;
}

/* Engagement score chip styles */
.v-chip.v-chip--size-x-small {
  font-size: 10px;
  height: 16px;
  min-width: 16px;
}
</style>
