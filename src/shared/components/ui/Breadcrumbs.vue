<template>
  <v-breadcrumbs :items="breadcrumbItems" class="breadcrumbs-nav">
    <template #prepend>
      <v-icon icon="mdi-home" class="me-2" />
      <router-link to="/" class="home-link">
        {{ $t('home') }}
      </router-link>
    </template>
    
    <template #default="{ item }">
      <router-link 
        v-if="item.disabled === false" 
        :to="item.href"
        class="breadcrumb-link"
      >
        {{ item.title }}
      </router-link>
      <span v-else class="breadcrumb-current">
        {{ item.title }}
      </span>
    </template>
    
    <template #divider>
      <v-icon icon="mdi-chevron-left" />
    </template>
  </v-breadcrumbs>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();

// Computed - Convert to v-breadcrumbs format
const breadcrumbItems = computed(() => {
  const pathArray = route.path.split('/').filter(p => p);
  const items = [];
  let currentPath = '';

  pathArray.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // محاولة الحصول على الترجمة للمسار
    let label = t(path) || path;
    
    // حالات خاصة للترجمة إذا لم تكن موجودة في ملفات اللغة مباشرة
    if (route.meta && route.meta.title && index === pathArray.length - 1) {
      label = route.meta.title;
    }

    items.push({
      title: label,
      href: currentPath,
      disabled: index === pathArray.length - 1 // Last item is disabled
    });
  });

  return items;
});
</script>

<style scoped>
.breadcrumbs-nav {
  padding: 16px 0;
  margin-bottom: 24px;
}

.home-link {
  text-decoration: none;
  color: inherit;
  font-weight: 500;
}

.home-link:hover {
  color: rgb(var(--v-theme-primary));
}

.breadcrumb-link {
  text-decoration: none;
  color: inherit;
}

.breadcrumb-link:hover {
  color: rgb(var(--v-theme-primary));
}

.breadcrumb-current {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
  opacity: 0.7;
}

@media (max-width: 600px) {
  .breadcrumbs-nav {
    padding: 12px 0;
    margin-bottom: 16px;
  }
}
