<template>
  <div class="order-timeline">
    <v-card v-if="loading" class="pa-4">
      <v-skeleton-loader type="list-item"></v-skeleton-loader>
    </v-card>

    <v-card v-else-if="timeline.length === 0" class="pa-8 text-center">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">
        mdi-timeline-outline
      </v-icon>
      <div class="text-h6 mb-2">لا يوجد سجل أحداث</div>
      <div class="text-body-2 text-medium-emphasis">
        لم يتم تسجيل أي أحداث لهذا الطلب حتى الآن
      </div>
    </v-card>

    <v-card v-else class="timeline-card">
      <v-card-title class="pa-4 border-b">
        <div class="d-flex align-center">
          <v-icon class="me-2" color="primary">mdi-timeline-text</v-icon>
          <span class="text-h5">سجل أحداث الطلب</span>
          <v-chip
            v-if="timeline.length > 0"
            size="small"
            color="primary"
            class="ms-auto"
          >
            {{ timeline.length }} حدث
          </v-chip>
        </div>
      </v-card-title>

      <v-card-text class="pa-0">
        <v-timeline density="compact">
          <v-timeline-item
            v-for="(event, index) in timeline"
            :key="event.id"
            :dot-color="getEventColor(event.status)"
            :icon="getEventIcon(event.status)"
            size="small"
          >
            <template #opposite>
              <div class="text-caption text-medium-emphasis">
                {{ formatRelativeTime(event.timestamp) }}
              </div>
            </template>

            <template #default>
              <v-card
                variant="outlined"
                class="timeline-event mb-2"
                :class="getEventClass(event.status)"
              >
                <v-card-text class="pa-3">
                  <!-- Event Header -->
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center">
                      <v-icon :color="getEventColor(event.status)" class="me-2">
                        {{ getEventIcon(event.status) }}
                      </v-icon>
                      <span class="font-weight-medium">
                        {{ getStatusText(event.status) }}
                      </span>
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatDateTime(event.timestamp) }}
                    </div>
                  </div>

                  <!-- Event Note -->
                  <div v-if="event.note" class="event-note">
                    <p class="text-body-2 mb-0">{{ event.note }}</p>
                  </div>

                  <!-- User Info -->
                  <div v-if="event.user" class="event-user mt-2">
                    <v-chip
                      size="x-small"
                      variant="outlined"
                      color="grey-lighten-1"
                      prepend-icon="mdi-account"
                    >
                      {{ event.user_name || event.user.username }}
                    </v-chip>
                  </div>

                  <!-- System Badge -->
                  <div v-else class="event-system mt-2">
                    <v-chip
                      size="x-small"
                      variant="flat"
                      color="blue-grey-lighten-2"
                      prepend-icon="mdi-cog"
                    >
                      نظام تلقائي
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </template>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { provideApolloClient } from '@vue/apollo-composable'
import { client } from '@/shared/plugins/apolloPlugin'
import { ORDER_TIMELINE_QUERY } from '@/integration/graphql/orders.graphql'

// Ensure Apollo Client is available
provideApolloClient(client)

// Props
const props = defineProps({
  orderId: {
    type: String,
    required: true
  }
})

// Reactive data
const loading = ref(true)
const error = ref(null)

// GraphQL Query
const { result, loading: queryLoading, error: queryError } = useQuery(
  ORDER_TIMELINE_QUERY,
  () => ({
    orderId: props.orderId
  }),
  {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
    pollInterval: 30000 // Refresh every 30 seconds
  }
)

// Computed
const timeline = computed(() => {
  if (result.value?.order?.timeline) {
    return result.value.order.timeline.sort((a, b) => {
      // Sort by timestamp descending (newest first)
      return new Date(b.timestamp) - new Date(a.timestamp)
    })
  }
  return []
})

// Methods
function getEventColor(status) {
  const colors = {
    'pending': 'orange',
    'confirmed': 'blue',
    'processing': 'purple',
    'shipped': 'cyan',
    'delivered': 'green',
    'cancelled': 'red',
    'refunded': 'grey',
    'returned': 'amber'
  }
  return colors[status] || 'grey'
}

function getEventIcon(status) {
  const icons = {
    'pending': 'mdi-clock-outline',
    'confirmed': 'mdi-check-circle',
    'processing': 'mdi-cog',
    'shipped': 'mdi-truck',
    'delivered': 'mdi-package-check',
    'cancelled': 'mdi-close-circle',
    'refunded': 'mdi-cash-refund',
    'returned': 'mdi-package-variant'
  }
  return icons[status] || 'mdi-information'
}

function getStatusText(status) {
  const statusTexts = {
    'pending': 'في الانتظار',
    'confirmed': 'مؤكد',
    'processing': 'قيد المعالجة',
    'shipped': 'تم الشحن',
    'delivered': 'تم التسليم',
    'cancelled': 'ملغي',
    'refunded': 'تم استرداد المبلغ',
    'returned': 'تم الإرجاع'
  }
  return statusTexts[status] || status
}

function formatDateTime(timestamp) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return date.toLocaleString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return date.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) {
    return 'الآن'
  } else if (diffMins < 60) {
    return `منذ ${diffMins} دقيقة`
  } else if (diffHours < 24) {
    return `منذ ${diffHours} ساعة`
  } else if (diffDays < 7) {
    return `منذ ${diffDays} يوم`
  } else {
    return date.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

// Watchers
watch(() => queryLoading.value, (newLoading) => {
  loading.value = newLoading
})

watch(() => queryError.value, (newError) => {
  error.value = newError
})

// Error handling
watch(() => error.value, (newError) => {
  if (newError) {
    console.error('❌ OrderTimeline Error:', newError)
  }
})

// Lifecycle
onMounted(() => {
  console.log('📅 OrderTimeline component mounted for order:', props.orderId)
})
</script>

<style scoped>
.order-timeline {
  max-width: 800px;
  margin: 0 auto;
}

.timeline-card {
  border-radius: 12px;
  overflow: hidden;
}

.timeline-event {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.timeline-event:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.event-note {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.event-user,
.event-system {
  display: flex;
  justify-content: flex-end;
}

.v-timeline {
  padding: 16px;
}

.v-timeline-item {
  margin-bottom: 16px;
}

/* Status-specific styling */
.timeline-event.pending {
  border-left: 4px solid #ff9800;
}

.timeline-event.confirmed {
  border-left: 4px solid #2196f3;
}

.timeline-event.processing {
  border-left: 4px solid #9c27b0;
}

.timeline-event.shipped {
  border-left: 4px solid #00bcd4;
}

.timeline-event.delivered {
  border-left: 4px solid #4caf50;
}

.timeline-event.cancelled {
  border-left: 4px solid #f44336;
}

.timeline-event.refunded {
  border-left: 4px solid #9e9e9e;
}

.timeline-event.returned {
  border-left: 4px solid #ffc107;
}

/* Responsive design */
@media (max-width: 600px) {
  .order-timeline {
    margin: 0;
  }
  
  .timeline-event {
    margin: 0 8px;
  }
  
  .v-timeline {
    padding: 8px;
  }
}
</style>
