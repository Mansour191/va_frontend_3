<template>
  <div class="base-table-wrapper">
    <!-- Desktop View -->
    <v-data-table
      :headers="tableHeaders"
      :items="items"
      :loading="loading"
      :sort-by="sortBy"
      :items-per-page="itemsPerPage"
      :hide-default-footer="hideFooter"
      :no-data-text="emptyText || $t('noDataFound')"
      class="elevation-1"
      @click:row="handleRowClick"
    >
      <!-- Custom slots for each column -->
      <template
        v-for="col in columns"
        :key="col.key"
        #[`item.${col.key}`]="{ item, index }"
      >
        <slot :name="`cell(${col.key})`" :item="item" :index="index">
          {{ item[col.key] }}
        </slot>
      </template>

      <!-- Loading overlay -->
      <template #loading>
        <v-skeleton-loader type="table-row@10" />
      </template>

      <!-- No data template -->
      <template #no-data>
        <div class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">
            mdi-folder-open
          </v-icon>
          <p class="text-h6 text-grey-darken-1">
            {{ emptyText || $t('noDataFound') }}
          </p>
        </div>
      </template>
    </v-data-table>

    <!-- Mobile View (Cards) -->
    <div class="mobile-table-view d-md-none">
      <template v-if="items.length > 0">
        <v-card
          v-for="(item, index) in items"
          :key="item.id || index"
          class="mb-3"
          elevation="2"
          @click="handleRowClick({ item, index })"
        >
          <v-card-text>
            <div
              v-for="col in columns"
              :key="col.key"
              class="mobile-row-item"
            >
              <div class="text-caption text-grey-darken-1 mb-1">
                {{ col.label }}
              </div>
              <div class="mobile-cell-content">
                <slot :name="`cell(${col.key})`" :item="item" :index="index">
                  {{ item[col.key] }}
                </slot>
              </div>
              <v-divider v-if="col.key !== columns[columns.length - 1].key" class="my-2" />
            </div>
          </v-card-text>
        </v-card>
      </template>
      
      <v-card v-else class="text-center py-8" elevation="0">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">
          mdi-folder-open
        </v-icon>
        <p class="text-h6 text-grey-darken-1">
          {{ emptyText || $t('noDataFound') }}
        </p>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  columns: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: '' },
  itemsPerPage: { type: Number, default: 10 },
  hideFooter: { type: Boolean, default: false }
});

const emit = defineEmits(['row-click', 'sort']);

// Computed properties for v-data-table
const tableHeaders = computed(() => {
  return props.columns.map(col => ({
    title: col.label,
    key: col.key,
    sortable: col.sortable || false,
    width: col.width || 'auto'
  }));
});

const sortBy = computed(() => {
  return props.columns
    .filter(col => col.sortable)
    .map(col => ({
      key: col.key,
      order: col.defaultSort || 'asc'
    }));
});

// Methods
const handleRowClick = (event, { item, index }) => {
  emit('row-click', { item, index });
};

const handleSort = (key) => {
  emit('sort', { key });
};
</script>

<style scoped>
.base-table-wrapper {
  position: relative;
}

.mobile-table-view {
  margin-top: 16px;
}

.mobile-row-item {
  margin-bottom: 12px;
}

.mobile-row-item:last-child {
  margin-bottom: 0;
}

.mobile-cell-content {
  font-weight: 500;
}

@media (max-width: 960px) {
  .base-table-wrapper .v-data-table {
    display: none;
  }
  
  .mobile-table-view {
    display: block !important;
  }
}
</style>
