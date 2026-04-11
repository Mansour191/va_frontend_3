<template>
  <div class="pagination-wrapper">
    <v-row align="center" justify="space-between">
      <!-- Pagination Info -->
      <v-col cols="12" md="auto" class="pagination-info">
        <span class="text-body-2 text-medium-emphasis">
          عرض {{ (currentPage - 1) * itemsPerPage + 1 }} -
          {{ Math.min(currentPage * itemsPerPage, totalItems) }}
          من {{ totalItems }}
        </span>
      </v-col>

      <!-- Pagination Controls -->
      <v-col cols="12" md="auto">
        <v-pagination
          v-model="currentPageModel"
          :length="totalPages"
          :total-visible="visiblePageCount"
          :disabled="loading"
          class="pagination-controls"
        />
      </v-col>

      <!-- Items Per Page -->
      <v-col cols="12" md="auto">
        <v-select
          v-model="itemsPerPageModel"
          :items="pageSizesOptions"
          variant="outlined"
          density="compact"
          hide-details
          class="per-page-select"
          style="max-width: 150px"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  pageSizes: { type: Array, default: () => [5, 10, 25, 50, 100] },
  loading: { type: Boolean, default: false },
  visiblePageCount: { type: Number, default: 5 }
});

const emit = defineEmits(['update:currentPage', 'update:itemsPerPage']);

// Computed
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

const currentPageModel = computed({
  get: () => props.currentPage,
  set: (value) => emit('update:currentPage', value)
});

const itemsPerPageModel = computed({
  get: () => props.itemsPerPage,
  set: (value) => emit('update:itemsPerPage', value)
});

const pageSizesOptions = computed(() => {
  return props.pageSizes.map(size => ({
    title: `${size} لكل صفحة`,
    value: size
  }));
});
</script>

<style scoped>
.pagination-wrapper {
  margin-top: 16px;
  margin-bottom: 16px;
}

.pagination-info {
  font-size: 0.875rem;
}

@media (max-width: 960px) {
  .pagination-wrapper .v-row {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  
  .pagination-info {
    order: -1;
  }
}
