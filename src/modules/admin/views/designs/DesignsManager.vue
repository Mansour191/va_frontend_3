<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 designs-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-palette</v-icon>
              {{ $t('designsManager') || 'إدارة التصاميم' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('designsManagerSubtitle') || 'عرض وإدارة جميع تصاميم الفينيل المتاحة' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="exportDesigns"
              variant="tonal"
              color="success"
              prepend-icon="mdi-download"
            >
              {{ $t('export') || 'تصدير' }}
            </v-btn>
            <v-btn
              @click="openDesignModal"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-plus"
            >
              {{ $t('newDesign') || 'تصميم جديد' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col
        v-for="stat in designStats"
        :key="stat.label"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card variant="elevated" class="stat-card">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div class="stat-content">
                <h3 class="text-h4 font-weight-bold text-white mb-1">{{ stat.value }}</h3>
                <p class="text-caption text-medium-emphasis mb-0">{{ stat.label }}</p>
              </div>
              <v-avatar
                :color="stat.color"
                variant="tonal"
                size="50"
                class="stat-icon"
              >
                <v-icon :color="stat.color" size="28">{{ stat.icon }}</v-icon>
              </v-avatar>
            </div>
            <div class="stat-trend mt-2" :class="{ 'text-success': stat.trend > 0, 'text-error': stat.trend < 0 }">
              <v-icon :color="stat.trend > 0 ? 'success' : 'error'" size="16">
                {{ stat.trend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
              </v-icon>
              <span class="text-caption font-weight-medium">{{ Math.abs(stat.trend) }}%</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search and Filters -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              :label="$t('searchDesigns') || 'بحث باسم التصميم أو الفنان...'"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              clearable
              @input="debouncedSearch"
            />
          </v-col>
          <v-col cols="12" md="6">
            <div class="d-flex ga-2">
              <v-select
                v-model="categoryFilter"
                :label="$t('category') || 'التصنيف'"
                :items="categoryOptions"
                variant="outlined"
                clearable
                hide-details
              />
              <v-select
                v-model="styleFilter"
                :label="$t('style') || 'النمط'"
                :items="styleOptions"
                variant="outlined"
                clearable
                hide-details
              />
              <v-select
                v-model="statusFilter"
                :label="$t('status') || 'الحالة'"
                :items="statusOptions"
                variant="outlined"
                clearable
                hide-details
              />
              <v-btn
                @click="showAdvancedFilters = !showAdvancedFilters"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-filter-variant"
              >
                {{ $t('advancedFilters') || 'فلاتر متقدمة' }}
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Advanced Filters -->
        <v-expand-transition>
          <div v-show="showAdvancedFilters" class="mt-4">
            <v-row>
              <v-col cols="12" md="4">
                <v-label>{{ $t('priceRange') || 'نطاق السعر' }}</v-label>
                <div class="d-flex ga-2">
                  <v-text-field
                    v-model="priceRange.min"
                    :placeholder="$t('minPrice') || 'أقل سعر'"
                    type="number"
                    variant="outlined"
                    hide-details
                  />
                  <span class="align-self-center">-</span>
                  <v-text-field
                    v-model="priceRange.max"
                    :placeholder="$t('maxPrice') || 'أعلى سعر'"
                    type="number"
                    variant="outlined"
                    hide-details
                  />
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <v-label>{{ $t('dateRange') || 'نطاق التاريخ' }}</v-label>
                <div class="d-flex ga-2">
                  <v-text-field
                    v-model="dateFrom"
                    type="date"
                    variant="outlined"
                    hide-details
                  />
                  <v-text-field
                    v-model="dateTo"
                    type="date"
                    variant="outlined"
                    hide-details
                  />
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <v-label>{{ $t('rating') || 'التقييم' }}</v-label>
                <v-select
                  v-model="ratingFilter"
                  :items="ratingOptions"
                  variant="outlined"
                  clearable
                  hide-details
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-label>{{ $t('dominantColors') || 'الألوان السائدة' }}</v-label>
                <div class="d-flex ga-2 flex-wrap">
                  <v-checkbox
                    v-for="color in colors"
                    :key="color.value"
                    v-model="color.selected"
                    :label="color.name"
                    hide-details
                    density="compact"
                  >
                    <template v-slot:label>
                      <div class="d-flex align-center ga-2">
                        <div
                          class="color-dot"
                          :style="{ backgroundColor: color.code }"
                        ></div>
                        <span>{{ color.name }}</span>
                      </div>
                    </template>
                  </v-checkbox>
                </div>
              </v-col>
            </v-row>
            <div class="d-flex ga-2 mt-4">
              <v-btn @click="applyAdvancedFilters" color="primary" variant="elevated">
                <v-icon>mdi-check</v-icon>
                {{ $t('apply') || 'تطبيق' }}
              </v-btn>
              <v-btn @click="resetAdvancedFilters" variant="tonal">
                <v-icon>mdi-undo</v-icon>
                {{ $t('reset') || 'إعادة تعيين' }}
              </v-btn>
            </div>
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <!-- Table Toolbar -->
    <v-card variant="elevated" class="mb-4">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center ga-2">
            <v-icon color="primary">mdi-view-list</v-icon>
            <h3 class="text-h6 font-weight-medium text-white">
              {{ $t('designsList') || 'قائمة التصاميم' }}
            </h3>
            <v-chip color="primary" variant="tonal" size="small">
              {{ filteredDesigns.length }} {{ $t('designs') || 'تصميم' }}
            </v-chip>
          </div>
          <div class="d-flex ga-2">
            <v-btn
              @click="refreshTable"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-refresh"
            >
              {{ $t('refresh') || 'تحديث' }}
            </v-btn>
            <v-btn
              @click="toggleColumns"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-view-column"
            >
              {{ $t('columns') || 'أعمدة' }}
            </v-btn>
            <v-btn
              @click="toggleViewMode"
              variant="tonal"
              color="primary"
              :prepend-icon="viewMode === 'grid' ? 'mdi-view-list' : 'mdi-view-module'"
            >
              {{ viewMode === 'grid' ? ($t('list') || 'قائمة') : ($t('grid') || 'شبكة') }}
            </v-btn>
          </div>
        </div>

        <!-- Columns Selector -->
        <v-expand-transition>
          <div v-show="showColumnsSelector && viewMode === 'list'" class="mt-4">
            <div class="d-flex align-center ga-2 mb-3">
              <v-icon>mdi-eye</v-icon>
              <span class="text-body-2 font-weight-medium">
                {{ $t('showHideColumns') || 'إظهار/إخفاء الأعمدة' }}
              </span>
            </div>
            <div class="d-flex ga-2 flex-wrap">
              <v-checkbox
                v-for="column in columns"
                :key="column.key"
                v-model="column.visible"
                :label="column.label"
                hide-details
                density="compact"
              />
            </div>
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <!-- Grid View -->
    <v-row v-if="viewMode === 'grid'" class="mb-6">
      <v-col
        v-for="design in paginatedDesigns"
        :key="design.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card variant="elevated" class="design-card" :class="{ 'design-card-inactive': !design.active }">
          <v-card-text class="pa-0">
            <!-- Card Actions -->
            <div class="card-actions">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    @click="toggleDesignMenu(design.id)"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item @click="editDesign(design)" prepend-icon="mdi-pencil">
                    {{ $t('edit') || 'تعديل' }}
                  </v-list-item>
                  <v-list-item @click="duplicateDesign(design)" prepend-icon="mdi-content-copy">
                    {{ $t('duplicate') || 'نسخ' }}
                  </v-list-item>
                  <v-list-item @click="toggleDesignStatus(design)" :prepend-icon="design.active ? 'mdi-eye-off' : 'mdi-eye'">
                    {{ design.active ? ($t('hide') || 'إخفاء') : ($t('publish') || 'نشر') }}
                  </v-list-item>
                  <v-list-item v-if="!design.featured" @click="setAsFeatured(design)" prepend-icon="mdi-star">
                    {{ $t('feature') || 'تمييز' }}
                  </v-list-item>
                  <v-divider />
                  <v-list-item @click="confirmDelete(design)" prepend-icon="mdi-delete" class="text-error">
                    {{ $t('delete') || 'حذف' }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <!-- Design Image -->
            <div class="design-image">
              <v-img :src="design.image" :alt="design.name" aspect-ratio="16/9" cover />
              <v-chip class="design-category-badge" size="small" variant="tonal">
                {{ getCategoryLabel(design.category) }}
              </v-chip>
              <v-chip v-if="design.featured" class="featured-badge" color="warning" size="small" variant="tonal">
                <v-icon size="12">mdi-star</v-icon>
              </v-chip>
            </div>

            <!-- Design Info -->
            <div class="design-info pa-3">
              <h3 class="design-name text-h6 font-weight-medium mb-1">{{ design.name }}</h3>
              <p class="design-artist text-caption text-medium-emphasis mb-2">
                <v-icon size="12" class="me-1">mdi-account</v-icon>
                {{ design.artist }}
              </p>

              <!-- Rating -->
              <div class="design-rating mb-2">
                <v-rating
                  :model-value="design.rating"
                  color="warning"
                  density="compact"
                  size="small"
                  readonly
                />
                <span class="text-caption text-medium-emphasis">({{ design.reviews }})</span>
              </div>

              <!-- Tags -->
              <div class="design-tags mb-2">
                <v-chip
                  v-for="tag in design.tags.slice(0, 3)"
                  :key="tag"
                  size="x-small"
                  variant="tonal"
                  class="me-1"
                >
                  {{ tag }}
                </v-chip>
                <v-chip
                  v-if="design.tags.length > 3"
                  size="x-small"
                  variant="tonal"
                  color="grey"
                >
                  +{{ design.tags.length - 3 }}
                </v-chip>
              </div>

              <!-- Footer -->
              <div class="design-footer d-flex justify-space-between align-center">
                <div class="design-price text-body-2 font-weight-bold">{{ design.price }} ر.س</div>
                <div class="design-usage text-caption text-medium-emphasis">
                  <v-icon size="12" class="me-1">mdi-cart</v-icon>
                  {{ design.usageCount }} {{ $t('users') || 'مستخدم' }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Empty State -->
      <v-col v-if="filteredDesigns.length === 0" cols="12">
        <v-card variant="outlined" class="text-center pa-6">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-palette</v-icon>
          <h3 class="text-h6 font-weight-medium mb-2">{{ $t('noDesigns') || 'لا توجد تصاميم' }}</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ $t('noDesignsFound') || 'لم يتم العثور على تصاميم تطابق معايير البحث' }}
          </p>
          <v-btn @click="resetFilters" color="primary" variant="elevated" prepend-icon="mdi-refresh">
            {{ $t('resetFilters') || 'إعادة تعيين الفلاتر' }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- List View -->
    <v-card v-else variant="elevated" class="mb-6">
      <v-card-text class="pa-0">
        <v-data-table
          :headers="tableHeaders"
          :items="paginatedDesigns"
          :loading="loading"
          :search="searchQuery"
          items-per-page="itemsPerPage"
          class="designs-table"
        >
          <template #[`item.image`]="{ item }">
            <v-avatar size="40" rounded="0">
              <v-img :src="item.image" :alt="item.name" />
            </v-avatar>
          </template>

          <template #[`item.name`]="{ item }">
            <div>
              <div class="text-body-2 font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.artist }}</div>
            </div>
          </template>

          <template #[`item.category`]="{ item }">
            <v-chip :color="getCategoryColor(item.category)" variant="tonal" size="small">
              {{ getCategoryLabel(item.category) }}
            </v-chip>
          </template>

          <template #[`item.style`]="{ item }">
            <v-chip color="primary" variant="tonal" size="small">
              {{ getStyleLabel(item.style) }}
            </v-chip>
          </template>

          <template #[`item.price`]="{ item }">
            <span class="text-body-2 font-weight-medium">{{ item.price }} ر.س</span>
          </template>

          <template #[`item.rating`]="{ item }">
            <div class="d-flex align-center ga-1">
              <v-rating
                :model-value="item.rating"
                color="warning"
                density="compact"
                size="small"
                readonly
              />
              <span class="text-caption text-medium-emphasis">({{ item.reviews }})</span>
            </div>
          </template>

          <template #[`item.status`]="{ item }">
            <v-chip :color="item.active ? 'success' : 'error'" variant="tonal" size="small">
              {{ item.active ? ($t('active') || 'نشط') : ($t('inactive') || 'غير نشط') }}
            </v-chip>
          </template>

          <template #[`item.featured`]="{ item }">
            <v-icon v-if="item.featured" color="warning" size="20">mdi-star</v-icon>
          </template>

          <template #[`item.actions`]="{ item }">
            <div class="d-flex ga-1">
              <v-btn
                @click="viewDesign(item)"
                icon="mdi-eye"
                variant="text"
                size="small"
                color="primary"
              />
              <v-btn
                @click="editDesign(item)"
                icon="mdi-pencil"
                variant="text"
                size="small"
                color="warning"
              />
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item @click="duplicateDesign(item)" prepend-icon="mdi-content-copy">
                    {{ $t('duplicate') || 'نسخ' }}
                  </v-list-item>
                  <v-list-item @click="toggleDesignStatus(item)" :prepend-icon="item.active ? 'mdi-eye-off' : 'mdi-eye'">
                    {{ item.active ? ($t('hide') || 'إخفاء') : ($t('publish') || 'نشر') }}
                  </v-list-item>
                  <v-list-item v-if="!item.featured" @click="setAsFeatured(item)" prepend-icon="mdi-star">
                    {{ $t('feature') || 'تمييز' }}
                  </v-list-item>
                  <v-divider />
                  <v-list-item @click="confirmDelete(item)" prepend-icon="mdi-delete" class="text-error">
                    {{ $t('delete') || 'حذف' }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Bulk Actions Footer -->
    <v-card v-if="selectedDesigns.length > 0" variant="elevated" class="mb-6">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center ga-2">
            <v-icon color="success">mdi-check-circle</v-icon>
            <span class="text-body-2">{{ $t('selectedDesigns') || 'تم تحديد' }} {{ selectedDesigns.length }} {{ $t('designs') || 'تصميم' }}</span>
            <v-btn @click="clearSelection" icon="mdi-close" variant="text" size="small" />
          </div>
          <div class="d-flex ga-2">
            <v-btn @click="bulkUpdateStatus('active')" color="success" variant="tonal" prepend-icon="mdi-eye">
              {{ $t('publish') || 'نشر' }}
            </v-btn>
            <v-btn @click="bulkUpdateStatus('inactive')" color="warning" variant="tonal" prepend-icon="mdi-eye-off">
              {{ $t('hide') || 'إخفاء' }}
            </v-btn>
            <v-btn @click="bulkSetFeatured" color="primary" variant="tonal" prepend-icon="mdi-star">
              {{ $t('feature') || 'تمييز' }}
            </v-btn>
            <v-btn @click="bulkDelete" color="error" variant="tonal" prepend-icon="mdi-delete">
              {{ $t('delete') || 'حذف' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Pagination -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between">
          <div class="text-body-2 text-medium-emphasis">
            {{ $t('showing') || 'عرض' }} {{ (currentPage - 1) * itemsPerPage + 1 }} -
            {{ Math.min(currentPage * itemsPerPage, filteredDesigns.length) }}
            {{ $t('of') || 'من' }} {{ filteredDesigns.length }}
          </div>
          <div class="d-flex align-center ga-2">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
              variant="elevated"
            />
            <v-select
              v-model="itemsPerPage"
              :items="paginationOptions"
              variant="outlined"
              density="compact"
              style="width: 120px;"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Design Dialog -->
    <v-dialog v-model="showDesignModal" max-width="800px" persistent>
      <v-card>
        <v-card-title class="pa-4">
          <h3 class="text-h5 font-weight-medium d-flex align-center ga-2">
            <v-icon color="primary">mdi-palette</v-icon>
            {{ modalTitle }}
          </h3>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeDesignModal" />
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-form ref="designForm" v-model="validForm" @submit.prevent="saveDesign">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentDesign.name"
                  :label="$t('designName') || 'اسم التصميم'"
                  required
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentDesign.artist"
                  :label="$t('artist') || 'الفنان'"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentDesign.category"
                  :label="$t('category') || 'التصنيف'"
                  :items="categoryOptions"
                  required
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentDesign.style"
                  :label="$t('style') || 'النمط'"
                  :items="styleOptions"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentDesign.price"
                  :label="$t('price') || 'السعر'"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  variant="outlined"
                  prefix="ر.س"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentDesign.active"
                  :label="$t('status') || 'الحالة'"
                  :items="[
                    { title: $t('active') || 'نشط', value: true },
                    { title: $t('inactive') || 'غير نشط', value: false }
                  ]"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            
            <v-text-field
              v-model="currentDesign.description"
              :label="$t('description') || 'الوصف'"
              variant="outlined"
              rows="3"
              auto-grow
            />
            
            <v-label class="mb-2">{{ $t('tags') || 'الكلمات الدلالية' }}</v-label>
            <div class="d-flex flex-column ga-2">
              <v-text-field
                v-model="tagInput"
                :placeholder="$t('addTagPlaceholder') || 'أضف كلمة دلالية ثم اضغط Enter'"
                variant="outlined"
                @keydown.enter.prevent="addTag"
                @keydown.tab.prevent="addTag"
              />
              <div class="d-flex ga-2 flex-wrap">
                <v-chip
                  v-for="(tag, index) in currentDesign.tags"
                  :key="index"
                  closable
                  @click:close="removeTag(index)"
                  size="small"
                  variant="tonal"
                  color="primary"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </div>
            
            <v-label class="mb-2">{{ $t('designImage') || 'صورة التصميم' }}</v-label>
            <div class="d-flex justify-center">
              <v-card
                v-if="currentDesign.imagePreview"
                class="image-preview"
                variant="outlined"
                max-width="200"
              >
                <v-img :src="currentDesign.imagePreview" aspect-ratio="16/9" cover />
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  size="small"
                  class="remove-image-btn"
                  @click="removeImage"
                />
              </v-card>
              <v-card
                v-else
                class="upload-area"
                variant="outlined"
                @click="triggerFileInput"
                hover
                style="cursor: pointer;"
              >
                <v-card-text class="text-center pa-6">
                  <v-icon size="48" color="primary" class="mb-2">mdi-cloud-upload</v-icon>
                  <p class="text-body-2 mb-1">{{ $t('clickToUpload') || 'انقر لرفع صورة' }}</p>
                  <p class="text-caption text-medium-emphasis">PNG, JPG (max. 2MB)</p>
                </v-card-text>
              </v-card>
            </div>
            <input
              ref="fileInput"
              type="file"
              @change="handleImageUpload"
              accept="image/*"
              style="display: none"
            />
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="closeDesignModal" variant="tonal">
            {{ $t('cancel') || 'إلغاء' }}
          </v-btn>
          <v-btn @click="saveDesign" color="primary" variant="elevated" :disabled="!validForm">
            <v-icon>mdi-content-save</v-icon>
            {{ isEditing ? ($t('update') || 'تحديث') : ($t('add') || 'إضافة') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Design Dialog -->
    <v-dialog v-model="showViewModal" max-width="800px">
      <v-card>
        <v-card-title class="pa-4">
          <h3 class="text-h5 font-weight-medium d-flex align-center ga-2">
            <v-icon color="primary">mdi-palette</v-icon>
            {{ $t('designDetails') || 'تفاصيل التصميم' }}
          </h3>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeViewModal" />
        </v-card-title>
        
        <v-card-text class="pa-4" v-if="selectedDesign">
          <v-row>
            <v-col cols="12" md="6">
              <v-img :src="selectedDesign.image" :alt="selectedDesign.name" aspect-ratio="16/9" cover />
            </v-col>
            <v-col cols="12" md="6">
              <h3 class="text-h6 font-weight-medium mb-2">{{ selectedDesign.name }}</h3>
              <p class="text-body-2 text-medium-emphasis mb-3">
                <v-icon size="16" class="me-1">mdi-account</v-icon>
                {{ selectedDesign.artist }}
              </p>
              
              <div class="d-flex flex-column ga-3 mb-3">
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">{{ $t('category') || 'التصنيف' }}:</span>
                  <v-chip :color="getCategoryColor(selectedDesign.category)" variant="tonal" size="small">
                    {{ getCategoryLabel(selectedDesign.category) }}
                  </v-chip>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">{{ $t('style') || 'النمط' }}:</span>
                  <v-chip color="primary" variant="tonal" size="small">
                    {{ getStyleLabel(selectedDesign.style) }}
                  </v-chip>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">{{ $t('rating') || 'التقييم' }}:</span>
                  <div class="d-flex align-center ga-1">
                    <v-rating
                      :model-value="selectedDesign.rating"
                      color="warning"
                      density="compact"
                      size="small"
                      readonly
                    />
                    <span class="text-caption text-medium-emphasis">({{ selectedDesign.reviews }})</span>
                  </div>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">{{ $t('price') || 'السعر' }}:</span>
                  <span class="text-body-2 font-weight-bold">{{ selectedDesign.price }} ر.س</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">{{ $t('usageCount') || 'عدد المستخدمين' }}:</span>
                  <span class="text-body-2">{{ selectedDesign.usageCount }}</span>
                </div>
              </div>
              
              <div class="mb-3">
                <h4 class="text-body-2 font-weight-medium mb-2">{{ $t('description') || 'الوصف' }}</h4>
                <p class="text-body-2 text-medium-emphasis">{{ selectedDesign.description || $t('noDescription') || 'لا يوجد وصف' }}</p>
              </div>
              
              <div>
                <h4 class="text-body-2 font-weight-medium mb-2">{{ $t('tags') || 'الكلمات الدلالية' }}</h4>
                <div class="d-flex ga-2 flex-wrap">
                  <v-chip
                    v-for="tag in selectedDesign.tags"
                    :key="tag"
                    size="small"
                    variant="tonal"
                    color="primary"
                  >
                    {{ tag }}
                  </v-chip>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="editFromView" color="primary" variant="elevated" prepend-icon="mdi-pencil">
            {{ $t('edit') || 'تعديل' }}
          </v-btn>
          <v-btn @click="closeViewModal" variant="tonal">
            {{ $t('close') || 'إغلاق' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteModal" max-width="400px" persistent>
      <v-card>
        <v-card-title class="pa-4">
          <h3 class="text-h5 font-weight-medium d-flex align-center ga-2">
            <v-icon color="error">mdi-delete</v-icon>
            {{ $t('confirmDelete') || 'تأكيد الحذف' }}
          </h3>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeDeleteModal" />
        </v-card-title>
        
        <v-card-text class="pa-4 text-center">
          <v-icon size="64" color="error" class="mb-4">mdi-palette</v-icon>
          <p class="text-body-1 mb-2">{{ $t('confirmDeleteDesign') || 'هل أنت متأكد من حذف التصميم' }}</p>
          <p class="text-h6 font-weight-bold text-error mb-3">"{{ designToDelete?.name }}"؟</p>
          <p class="text-body-2 text-medium-emphasis">{{ $t('cannotUndo') || 'لا يمكن التراجع عن هذا الإجراء' }}</p>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="closeDeleteModal" variant="tonal">
            {{ $t('cancel') || 'إلغاء' }}
          </v-btn>
          <v-btn @click="confirmDeleteDesign" color="error" variant="elevated" prepend-icon="mdi-delete">
            {{ $t('delete') || 'حذف' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { debounce } from 'lodash';
import DesignsService from '@/services/DesignsService';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const viewMode = ref('grid');
const showColumnsSelector = ref(false);
const selectedDesigns = ref([]);
const selectAll = ref(false);
const showDesignModal = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const selectedDesign = ref(null);
const designToDelete = ref(null);
const activeDesignMenu = ref(null);
const isEditing = ref(false);
const validForm = ref(false);
const tagInput = ref('');

// Form refs
const designForm = ref(null);
const fileInput = ref(null);

// Data Options
const categoryOptions = ref([
  { title: t('allCategories') || 'جميع التصنيفات', value: '' },
  { title: t('furniture') || 'أثاث', value: 'furniture' },
  { title: t('doors') || 'أبواب', value: 'doors' },
  { title: t('walls') || 'جدران', value: 'walls' },
  { title: t('ceilings') || 'أسقف', value: 'ceilings' },
  { title: t('tiles') || 'بلاط', value: 'tiles' },
  { title: t('kitchens') || 'مطابخ', value: 'kitchens' },
  { title: t('cars') || 'سيارات', value: 'cars' }
]);

const styleOptions = ref([
  { title: t('allStyles') || 'جميع الأنماط', value: '' },
  { title: t('modern') || 'حديث', value: 'modern' },
  { title: t('classic') || 'كلاسيكي', value: 'classic' },
  { title: t('islamic') || 'إسلامي', value: 'islamic' },
  { title: t('abstract') || 'تجريدي', value: 'abstract' },
  { title: t('nature') || 'طبيعي', value: 'nature' },
  { title: t('geometric') || 'هندسي', value: 'geometric' }
]);

const statusOptions = ref([
  { title: t('allStatuses') || 'جميع الحالات', value: '' },
  { title: t('active') || 'نشط', value: 'active' },
  { title: t('inactive') || 'غير نشط', value: 'inactive' },
  { title: t('draft') || 'مسودة', value: 'draft' }
]);

const ratingOptions = ref([
  { title: t('allRatings') || 'الكل', value: '' },
  { title: t('fourStarsPlus') || '٤ نجوم فأكثر', value: 4 },
  { title: t('threeStarsPlus') || '٣ نجوم فأكثر', value: 3 },
  { title: t('twoStarsPlus') || 'نجمتان فأكثر', value: 2 }
]);

const paginationOptions = ref([
  { title: '12 لكل صفحة', value: 12 },
  { title: '24 لكل صفحة', value: 24 },
  { title: '36 لكل صفحة', value: 36 },
  { title: '48 لكل صفحة', value: 48 }
]);

const columns = ref([
  {
    key: 'select',
    title: t('select') || 'تحديد',
    visible: true,
    sortable: false,
  },
  { key: 'image', title: t('image') || 'الصورة', visible: true, sortable: false },
  { key: 'name', title: t('name') || 'الاسم', visible: true, sortable: true },
  { key: 'category', title: t('category') || 'التصنيف', visible: true, sortable: true },
  { key: 'style', title: t('style') || 'النمط', visible: true, sortable: true },
  { key: 'price', title: t('price') || 'السعر', visible: true, sortable: true },
  { key: 'rating', title: t('rating') || 'التقييم', visible: true, sortable: true },
  { key: 'status', title: t('status') || 'الحالة', visible: true, sortable: true },
  { key: 'featured', title: t('featured') || 'مميز', visible: true, sortable: true },
  { key: 'usage', title: t('usage') || 'المستخدمون', visible: false, sortable: true },
  {
    key: 'created',
    title: t('createdAt') || 'تاريخ الإضافة',
    visible: false,
    sortable: true,
  },
]);

const tableHeaders = computed(() => columns.value.map(col => ({
  title: col.title,
  key: col.key,
  sortable: col.sortable,
  ...(col.key === 'actions' && { align: 'center' })
})));

// Data
const designs = ref([
  {
    id: 1,
    name: 'زهور الربيع',
    artist: 'فاطمة العلي',
    category: 'walls',
    style: 'nature',
    price: 45,
    rating: 4.5,
    reviews: 23,
    usageCount: 156,
    active: true,
    featured: true,
    tags: ['زهور', 'طبيعي', 'ملون'],
    image: 'https://picsum.photos/seed/spring1/200/200.jpg',
    description: 'تصميم زهور ربيعية ملونة تضفي حيوية على الجدران',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'نقوش إسلامية',
    artist: 'محمد الحسن',
    category: 'ceilings',
    style: 'islamic',
    price: 89,
    rating: 5,
    reviews: 45,
    usageCount: 89,
    active: true,
    featured: true,
    tags: ['إسلامي', 'هندسي', 'ذهبي'],
    image: 'https://picsum.photos/seed/islamic1/200/200.jpg',
    description: 'نقوش إسلامية تقليدية بتصميم عصري للأسقف',
    createdAt: '2024-01-20',
  },
  {
    id: 3,
    name: 'خشب كلاسيكي',
    artist: 'أحمد الراشد',
    category: 'doors',
    style: 'classic',
    price: 120,
    rating: 4,
    reviews: 12,
    usageCount: 45,
    active: true,
    featured: false,
    tags: ['خشب', 'كلاسيكي', 'أبواب'],
    image: 'https://picsum.photos/seed/wood1/200/200.jpg',
    description: 'تصميم خشب كلاسيكي للأبواب الداخلية',
    createdAt: '2024-01-25',
  },
  {
    id: 4,
    name: 'رخام فاخر',
    artist: 'نورة السعد',
    category: 'tiles',
    style: 'modern',
    price: 65,
    rating: 4.5,
    reviews: 8,
    usageCount: 34,
    active: false,
    featured: false,
    tags: ['رخام', 'فاخر', 'أرضيات'],
    image: 'https://picsum.photos/seed/marble1/200/200.jpg',
    description: 'تصميم رخام فاخر للأرضيات والجدران',
    createdAt: '2024-02-01',
  }
]);

const designStats = ref([
  {
    title: t('totalDesigns') || 'إجمالي التصاميم',
    value: '234',
    icon: 'mdi-palette',
    color: 'primary',
    trend: 12
  },
  {
    title: t('activeDesigns') || 'تصاميم نشطة',
    value: '189',
    icon: 'mdi-check-circle',
    color: 'success',
    trend: 8
  },
  {
    title: t('averageRating') || 'متوسط التقييم',
    value: '4.6',
    icon: 'mdi-star',
    color: 'warning',
    trend: 5
  },
  {
    title: t('totalSales') || 'إجمالي المبيعات',
    value: '3,245',
    icon: 'mdi-currency-usd',
    color: 'info',
    trend: 15
  }
]);

const colors = ref([
  { name: t('red') || 'أحمر', code: '#f44336', value: 'red', selected: false },
  { name: t('blue') || 'أزرق', code: '#2196f3', value: 'blue', selected: false },
  { name: t('green') || 'أخضر', code: '#4caf50', value: 'green', selected: false },
  { name: t('gold') || 'ذهبي', code: '#ffc107', value: 'gold', selected: false },
  { name: t('black') || 'أسود', code: '#000000', value: 'black', selected: false },
  { name: t('white') || 'أبيض', code: '#ffffff', value: 'white', selected: false }
]);

// Filters
const searchQuery = ref('');
const categoryFilter = ref('');
const styleFilter = ref('');
const statusFilter = ref('');
const ratingFilter = ref('');
const priceRange = ref({ min: '', max: '' });
const dateFrom = ref('');
const dateTo = ref('');
const showAdvancedFilters = ref(false);

// Sort
const sortKey = ref('created');
const sortOrder = ref('desc');

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(12);

// Form
const currentDesign = ref({
  id: null,
  name: '',
  artist: '',
  category: '',
  style: 'modern',
  price: 0,
  active: true,
  description: '',
  tags: [],
  image: null,
  imagePreview: ''
});

// Computed
const filteredDesigns = computed(() => {
  return designs.value.filter((design) => {
    const matchesSearch =
      !searchQuery.value ||
      design.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      design.artist.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesCategory = !categoryFilter.value || design.category === categoryFilter.value;
    const matchesStyle = !styleFilter.value || design.style === styleFilter.value;
    const matchesStatus =
      !statusFilter.value || (statusFilter.value === 'active' ? design.active : !design.active);
    const matchesRating = !ratingFilter.value || design.rating >= parseInt(ratingFilter.value);
    const matchesPrice =
      (!priceRange.value.min || design.price >= priceRange.value.min) &&
      (!priceRange.value.max || design.price <= priceRange.value.max);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStyle &&
      matchesStatus &&
      matchesRating &&
      matchesPrice
    );
  });
});

const paginatedDesigns = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredDesigns.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredDesigns.value.length / itemsPerPage.value));

const modalTitle = computed(() => {
  return isEditing.value ? (t('editDesign') || 'تعديل التصميم') : (t('addDesign') || 'إضافة تصميم جديد');
});

// API Integration Methods
const loadDesignsData = async () => {
  try {
    loading.value = true;
    const response = await DesignsService.getDesigns();
    if (response.success) {
      // Update data with API response
      designs.value = response.data.designs || designs.value;
      designStats.value = response.data.designStats || designStats.value;
    } else {
      // Use mock data as fallback
      console.log('Using mock data for designs manager');
    }
  } catch (error) {
    console.error('Error loading designs data:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('designsError') || 'خطأ في تحميل التصاميم',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

// Methods
const getCategoryLabel = (category) => {
  const map = {
    furniture: t('furniture') || 'أثاث',
    doors: t('doors') || 'أبواب',
    walls: t('walls') || 'جدران',
    ceilings: t('ceilings') || 'أسقف',
    tiles: t('tiles') || 'بلاط',
    kitchens: t('kitchens') || 'مطابخ',
    cars: t('cars') || 'سيارات'
  };
  return map[category] || category;
};

const getStyleLabel = (style) => {
  const map = {
    modern: t('modern') || 'حديث',
    classic: t('classic') || 'كلاسيكي',
    islamic: t('islamic') || 'إسلامي',
    abstract: t('abstract') || 'تجريدي',
    nature: t('nature') || 'طبيعي',
    geometric: t('geometric') || 'هندسي'
  };
  return map[style] || style;
};

const getCategoryColor = (category) => {
  const colors = {
    furniture: 'primary',
    doors: 'secondary',
    walls: 'success',
    ceilings: 'warning',
    tiles: 'info',
    kitchens: 'error',
    cars: 'purple'
  };
  return colors[category] || 'grey';
};

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
};

const toggleColumns = () => {
  showColumnsSelector.value = !showColumnsSelector.value;
};

const toggleDesignMenu = (designId) => {
  activeDesignMenu.value = activeDesignMenu.value === designId ? null : designId;
};

const openDesignModal = () => {
  isEditing.value = false;
  currentDesign.value = {
    id: null,
    name: '',
    artist: '',
    category: '',
    style: 'modern',
    price: 0,
    active: true,
    description: '',
    tags: [],
    image: null,
    imagePreview: ''
  };
  showDesignModal.value = true;
};

const editDesign = (design) => {
  isEditing.value = true;
  currentDesign.value = { ...design };
  showDesignModal.value = true;
  activeDesignMenu.value = null;
};

const viewDesign = (design) => {
  selectedDesign.value = design;
  showViewModal.value = true;
  activeDesignMenu.value = null;
};

const confirmDelete = (design) => {
  designToDelete.value = design;
  showDeleteModal.value = true;
  activeDesignMenu.value = null;
};

const duplicateDesign = (design) => {
  const newDesign = {
    ...design,
    id: Date.now(),
    name: `${design.name} (${t('copy') || 'نسخة'})`,
    featured: false
  };
  designs.value.unshift(newDesign);
  
  // Show success notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('designDuplicated') || 'تم نسخ التصميم',
    message: t('designDuplicatedSuccessfully') || 'تم نسخ التصميم بنجاح',
    timeout: 2000
  });
};

const toggleDesignStatus = (design) => {
  const index = designs.value.findIndex(d => d.id === design.id);
  if (index > -1) {
    designs.value[index].active = !design.active;
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: design.active ? (t('designDeactivated') || 'تم إخفاء التصميم') : (t('designActivated') || 'تم نشر التصميم'),
      message: design.active ? (t('designDeactivatedSuccessfully') || 'تم إخفاء التصميم بنجاح') : (t('designActivatedSuccessfully') || 'تم نشر التصميم بنجاح'),
      timeout: 2000
    });
  }
};

const setAsFeatured = (design) => {
  const index = designs.value.findIndex(d => d.id === design.id);
  if (index > -1) {
    designs.value[index].featured = true;
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('designFeatured') || 'تم تمييز التصميم',
      message: t('designFeaturedSuccessfully') || 'تم تمييز التصميم بنجاح',
      timeout: 2000
    });
  }
};

const saveDesign = async () => {
  if (!designForm.value?.validate()) return;
  
  try {
    loading.value = true;
    
    if (isEditing.value) {
      // Update existing design
      const response = await DesignsService.updateDesign(currentDesign.value);
      if (response.success) {
        const index = designs.value.findIndex(d => d.id === currentDesign.value.id);
        if (index > -1) {
          designs.value[index] = { ...designs.value[index], ...currentDesign.value };
        }
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('designUpdated') || 'تم تحديث التصميم',
          message: t('designUpdatedSuccessfully') || 'تم تحديث التصميم بنجاح',
          timeout: 2000
        });
      }
    } else {
      // Create new design
      const response = await DesignsService.createDesign(currentDesign.value);
      if (response.success) {
        const newDesign = {
          ...currentDesign.value,
          id: Date.now(),
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        designs.value.unshift(newDesign);
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('designCreated') || 'تم إنشاء التصميم',
          message: t('designCreatedSuccessfully') || 'تم إنشاء التصميم بنجاح',
          timeout: 2000
        });
      }
    }
    
    showDesignModal.value = false;
    await loadDesignsData();
  } catch (error) {
    console.error('Error saving design:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('saveError') || 'خطأ في الحفظ',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const confirmDeleteDesign = async () => {
  try {
    loading.value = true;
    
    const response = await DesignsService.deleteDesign(designToDelete.value.id);
    if (response.success) {
      const index = designs.value.findIndex(d => d.id === designToDelete.value.id);
      if (index > -1) {
        designs.value.splice(index, 1);
      }
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('designDeleted') || 'تم حذف التصميم',
        message: t('designDeletedSuccessfully') || 'تم حذف التصميم بنجاح',
        timeout: 2000
      });
      
      await loadDesignsData();
    }
  } catch (error) {
    console.error('Error deleting design:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('deleteError') || 'خطأ في الحذف',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const closeDesignModal = () => {
  showDesignModal.value = false;
};

const closeViewModal = () => {
  showViewModal.value = false;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

const editFromView = () => {
  closeViewModal();
  editDesign(selectedDesign.value);
};

const addTag = () => {
  const tag = tagInput.value.trim();
  if (tag && !currentDesign.value.tags.includes(tag)) {
    currentDesign.value.tags.push(tag);
    tagInput.value = '';
  }
};

const removeTag = (index) => {
  currentDesign.value.tags.splice(index, 1);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      currentDesign.value.imagePreview = e.target.result;
      currentDesign.value.image = file;
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  currentDesign.value.imagePreview = '';
  currentDesign.value.image = null;
};

const exportDesigns = () => {
  const designsData = {
    designs: designs.value,
    designStats: designStats.value,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(designsData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `designs-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Show success notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('designsExported') || 'تم تصدير التصاميم',
    message: t('designsExportedSuccessfully') || 'تم تصدير التصاميم بنجاح',
    timeout: 3000
  });
};

const refreshTable = async () => {
  await loadDesignsData();
  
  // Show success notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('dataRefreshed') || 'تم تحديث البيانات',
    message: t('designsDataRefreshed') || 'تم تحديث بيانات التصاميم بنجاح',
    timeout: 2000
  });
};

const applyAdvancedFilters = () => {
  // Apply advanced filters logic here
  showAdvancedFilters.value = false;
};

const resetAdvancedFilters = () => {
  priceRange.value = { min: '', max: '' };
  dateFrom.value = '';
  dateTo.value = '';
  colors.value.forEach(color => color.selected = false);
  ratingFilter.value = '';
  showAdvancedFilters.value = false;
};

const resetFilters = () => {
  searchQuery.value = '';
  categoryFilter.value = '';
  styleFilter.value = '';
  statusFilter.value = '';
  ratingFilter.value = '';
  resetAdvancedFilters();
};

const clearSelection = () => {
  selectedDesigns.value = [];
  selectAll.value = false;
};

const bulkUpdateStatus = (status) => {
  selectedDesigns.value.forEach(designId => {
    const index = designs.value.findIndex(d => d.id === designId);
    if (index > -1) {
      designs.value[index].active = status === 'active';
    }
  });
  
  clearSelection();
  
  // Show success notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: status === 'active' ? (t('designsPublished') || 'تم نشر التصاميم') : (t('designsHidden') || 'تم إخفاء التصاميم'),
    message: status === 'active' ? (t('designsPublishedSuccessfully') || 'تم نشر التصاميم المحددة بنجاح') : (t('designsHiddenSuccessfully') || 'تم إخفاء التصاميم المحددة بنجاح'),
    timeout: 2000
  });
};

const bulkSetFeatured = () => {
  selectedDesigns.value.forEach(designId => {
    const index = designs.value.findIndex(d => d.id === designId);
    if (index > -1) {
      designs.value[index].featured = true;
    }
  });
  
  clearSelection();
  
  // Show success notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('designsFeatured') || 'تم تمييز التصاميم',
    message: t('designsFeaturedSuccessfully') || 'تم تمييز التصاميم المحددة بنجاح',
    timeout: 2000
  });
};

const bulkDelete = async () => {
  if (!confirm(t('confirmBulkDelete') || 'هل أنت متأكد من حذف التصاميم المحددة؟')) return;
  
  try {
    loading.value = true;
    
    // Delete all selected designs
    for (const designId of selectedDesigns.value) {
      await DesignsService.deleteDesign(designId);
    }
    
    // Remove from local array
    designs.value = designs.value.filter(design => !selectedDesigns.value.includes(design.id));
    
    clearSelection();
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('designsDeleted') || 'تم حذف التصاميم',
      message: t('designsDeletedSuccessfully') || 'تم حذف التصاميم المحددة بنجاح',
      timeout: 2000
    });
    
    await loadDesignsData();
  } catch (error) {
    console.error('Error bulk deleting designs:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('deleteError') || 'خطأ في الحذف',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

// Debounced search
const debouncedSearch = debounce(() => {
  // Search logic is handled by computed property
}, 300);

// Lifecycle
onMounted(async () => {
  await loadDesignsData();
});

// Watch for changes
watch([currentPage, itemsPerPage], () => {
  // Reset to first page if needed
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1;
  }
});
</script>

<style scoped>
/* Design Cards */
.design-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.design-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.design-card-inactive {
  opacity: 0.7;
}

.card-actions {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  display: flex;
  gap: 4px;
}

.design-image {
  position: relative;
}

.design-category-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.featured-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.design-info {
  padding: 16px;
}

.design-name {
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 4px;
}

.design-artist {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.design-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.design-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.design-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}

.design-price {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.design-usage {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

/* Color Dots */
.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Image Upload */
.image-preview {
  position: relative;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
}

.upload-area {
  border: 2px dashed rgba(var(--v-border-color), 0.3);
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.design-card {
  animation: fadeIn 0.5s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .design-card {
    margin-bottom: 16px;
  }
  
  .design-info {
    padding: 12px;
  }
  
  .design-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}

/* Dark theme support */
.v-theme--dark .design-card {
  background-color: rgb(var(--v-theme-surface));
  border-color: rgba(var(--v-border-color), 0.2);
}

.v-theme--dark .design-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .upload-area {
  border-color: rgba(var(--v-border-color), 0.5);
}

.v-theme--dark .upload-area:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>
