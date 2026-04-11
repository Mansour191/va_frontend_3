<template>
  <v-card class="royal-table-card" elevation="4" rounded="xl">
    <!-- Header Toolbar -->
    <v-toolbar color="surface-variant" density="comfortable" class="px-4">
      <v-toolbar-title class="text-h6 font-weight-bold">
        <v-icon color="primary" class="me-2">mdi-table</v-icon>
        {{ title }}
      </v-toolbar-title>
      
      <v-spacer></v-spacer>

      <!-- Search Field -->
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        :label="$t('search') || 'بحث سريع...'"
        variant="solo"
        hide-details
        rounded="lg"
        class="search-field hidden-sm-and-down"
        density="compact"
        clearable
      />

      <!-- Action Buttons -->
      <v-btn-group class="ms-2" variant="outlined" density="compact">
        <v-btn
          icon="mdi-filter-variant"
          :title="$t('filter') || 'تصفية'"
          @click="$emit('filter')"
        />
        <v-btn
          icon="mdi-export-variant"
          :title="$t('export') || 'تصدير'"
          @click="$emit('export')"
        />
        <v-btn
          icon="mdi-refresh"
          :title="$t('refresh') || 'تحديث'"
          @click="$emit('refresh')"
          :loading="loading"
        />
      </v-btn-group>
    </v-toolbar>

    <!-- Data Table -->
    <v-data-table-server
      :headers="headers"
      :items="data"
      :search="search"
      :loading="loading"
      :items-per-page="rows"
      :items-length="totalItems"
      v-model:page="page"
      v-model:items-per-page="rows"
      class="royal-table"
      hover
      @update:options="handleOptionsUpdate"
    >
      <!-- Loading Skeleton -->
      <template v-slot:loading>
        <v-skeleton-loader type="table-row-divider@5" class="pa-4" />
      </template>

      <!-- No Data -->
      <template v-slot:no-data>
        <div class="text-center pa-8">
          <v-icon size="64" color="info" class="mb-4">mdi-table-off</v-icon>
          <p class="text-h6 text-medium-emphasis">
            {{ $t('noData') || 'لا توجد بيانات متاحة' }}
          </p>
          <v-btn
            v-if="!loading"
            color="primary"
            variant="outlined"
            prepend-icon="mdi-refresh"
            @click="$emit('refresh')"
            class="mt-2"
          >
            {{ $t('refresh') || 'تحديث' }}
          </v-btn>
        </div>
      </template>

      <!-- Custom Item Rendering -->
      <template v-slot:item="{ item, column }">
        <slot :name="'item-' + column.key" :item="item" :column="column">
          <v-list-item class="pa-0">
            <v-list-item-title class="text-body-2 font-weight-medium">
              {{ item[column.key] }}
            </v-list-item-title>
          </v-list-item>
        </slot>
      </template>

      <!-- Bottom Pagination -->
      <template v-slot:bottom>
        <v-divider />
        <div class="d-flex align-center justify-space-between pa-4">
          <div class="text-caption text-medium-emphasis">
            <v-icon size="small" class="me-1">mdi-database</v-icon>
            {{ $t('totalRecords') || 'إجمالي السجلات' }}: {{ totalItems }}
          </div>
          
          <v-pagination
            v-model="page"
            :length="Math.ceil(totalItems / rows)"
            :disabled="loading"
            active-color="primary"
            density="comfortable"
            variant="elevated"
            rounded="lg"
            show-first-last
          />
        </div>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
const props = defineProps({
  title: { type: String, default: 'جدول البيانات الملكي' },
  data: { type: Array, required: true },
  headers: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  rows: { type: Number, default: 10 },
  totalItems: { type: Number, default: 0 }
});

// Emits
const emit = defineEmits(['filter', 'export', 'refresh', 'options-update']);

// State
const search = ref('');
const page = ref(1);
const itemsPerPage = ref(props.rows);

// Computed
const totalPages = computed(() => Math.ceil(props.totalItems / itemsPerPage.value));

// Methods
const handleOptionsUpdate = (options) => {
  emit('options-update', options);
};

// Watch for changes
watch(() => props.rows, (newRows) => {
  itemsPerPage.value = newRows;
});

watch(() => props.totalItems, () => {
  if (page.value > totalPages.value) {
    page.value = 1;
  }
});
</script>

<style scoped>
.royal-table-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.search-field {
  max-width: 300px;
}

/* Table styling */
:deep(.v-data-table-server) {
  background: rgb(var(--v-theme-surface));
}

:deep(.v-data-table-server .v-data-table__thead) {
  background: rgb(var(--v-theme-surface-variant));
}

:deep(.v-data-table-server .v-data-table__th) {
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 0.75rem !important;
  color: rgb(var(--v-theme-on-surface-variant)) !important;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.2);
}

:deep(.v-data-table-server .v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.04) !important;
}

:deep(.v-data-table-server .v-data-table__td) {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
  padding: 16px;
}

:deep(.v-data-table-server .v-data-table__tr:last-child .v-data-table__td) {
  border-bottom: none;
}

/* Loading skeleton */
:deep(.v-skeleton-loader__table-row-divider) {
  background: rgb(var(--v-theme-surface-variant));
}

/* Pagination */
:deep(.v-pagination__item) {
  border-radius: 8px;
}

:deep(.v-pagination__item--is-active) {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

/* Responsive */
@media (max-width: 960px) {
  .search-field {
    max-width: 200px;
  }
}

@media (max-width: 600px) {
  .search-field {
    display: none;
  }
  
  :deep(.v-data-table-server .v-data-table__th) {
    font-size: 0.7rem !important;
    padding: 8px;
  }
  
  :deep(.v-data-table-server .v-data-table__td) {
    padding: 8px;
  }
}
</style>
