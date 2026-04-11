<template>
  <v-card elevation="2" class="mb-6">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-share-variant</v-icon>
        <span class="text-h6">{{ $t('socialLinksManager') }}</span>
      </div>
      <v-btn
        color="primary"
        variant="elevated"
        prepend-icon="mdi-plus"
        @click="openAddModal"
      >
        {{ $t('addSocialLink') }}
      </v-btn>
    </v-card-title>
    
    <v-card-text class="pa-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="mt-4">{{ $t('loadingSocialLinks') }}</p>
      </div>
      
      <!-- Social Links Table -->
      <v-data-table
        v-else-if="socialLinks.length > 0"
        :headers="headers"
        :items="socialLinks"
        :loading="loading"
        class="social-links-table"
        elevation="0"
      >
        <!-- Platform Column -->
        <template v-slot:item.platform_name="{ item }">
          <div class="d-flex align-center ga-2">
            <v-icon :icon="item.fa_icon_class || item.icon_class" size="20"></v-icon>
            <span>{{ item.platform_display_name || item.platform_name }}</span>
          </div>
        </template>
        
        <!-- URL Column -->
        <template v-slot:item.url="{ item }">
          <v-btn
            :href="item.url"
            target="_blank"
            variant="text"
            size="small"
            color="primary"
            prepend-icon="mdi-open-in-new"
            class="text-decoration-none"
          >
            {{ $t('openLink') }}
          </v-btn>
        </template>
        
        <!-- Type Column -->
        <template v-slot:item.platform_type="{ item }">
          <v-chip
            :color="getPlatformTypeColor(item.platform_type)"
            size="small"
            variant="flat"
          >
            {{ getPlatformTypeDisplay(item.platform_type) }}
          </v-chip>
        </template>
        
        <!-- Status Column -->
        <template v-slot:item.is_active="{ item }">
          <v-switch
            v-model="item.is_active"
            :label="item.is_active ? $t('active') : $t('inactive')"
            color="success"
            hide-details
            density="compact"
            @change="toggleSocialLinkStatus(item)"
          ></v-switch>
        </template>
        
        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="openEditModal(item)"
            ></v-btn>
            <v-btn
              icon="mdi-drag-vertical"
              size="small"
              variant="text"
              color="grey"
              class="drag-handle"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="confirmDelete(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
      
      <!-- Empty State -->
      <v-card
        v-else
        variant="outlined"
        class="text-center py-8"
        color="grey-lighten-4"
      >
        <v-icon size="64" color="grey-lighten-1" class="mb-4">
          mdi-share-variant-outline
        </v-icon>
        <h3 class="text-h6 mb-2">{{ $t('noSocialLinks') }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ $t('noSocialLinksDesc') }}
        </p>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="openAddModal"
        >
          {{ $t('addFirstSocialLink') }}
        </v-btn>
      </v-card>
    </v-card-text>
  </v-card>
  
  <!-- Add/Edit Modal -->
  <v-dialog v-model="showModal" max-width="600" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">
          {{ editingLink ? $t('editSocialLink') : $t('addSocialLink') }}
        </span>
        <v-btn icon="mdi-close" variant="text" @click="closeModal"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-4">
        <v-form ref="socialForm" v-model="formValid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.platform_name"
                :label="$t('platformName')"
                :rules="[requiredRule]"
                variant="outlined"
                prepend-inner-icon="mdi-account-group"
                :hint="$t('platformNameHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.platform_type"
                :label="$t('platformType')"
                :items="platformTypes"
                item-title="text"
                item-value="value"
                :rules="[requiredRule]"
                variant="outlined"
                prepend-inner-icon="mdi-category"
              ></v-select>
            </v-col>
            
            <v-col cols="12">
              <v-text-field
                v-model="formData.url"
                :label="$t('url')"
                :rules="[urlRule, requiredRule]"
                variant="outlined"
                prepend-inner-icon="mdi-link"
                :hint="$t('urlHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.icon_class"
                :label="$t('iconClass')"
                variant="outlined"
                prepend-inner-icon="mdi-iconify"
                :hint="$t('iconClassHint')"
                persistent-hint
                placeholder="fa-brands fa-facebook"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.order_index"
                :label="$t('orderIndex')"
                type="number"
                variant="outlined"
                prepend-inner-icon="mdi-sort-numeric-ascending"
                :hint="$t('orderIndexHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            
            <v-col cols="12">
              <v-switch
                v-model="formData.is_active"
                :label="$t('active')"
                color="success"
                hide-details
              ></v-switch>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closeModal">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          :loading="saving"
          :disabled="!formValid"
          color="primary"
          variant="elevated"
          @click="saveSocialLink"
        >
          {{ editingLink ? $t('update') : $t('add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6 pa-4">
        {{ $t('confirmDelete') }}
      </v-card-title>
      
      <v-card-text class="pa-4">
        <p>{{ $t('confirmDeleteSocialLink') }}</p>
        <v-chip
          v-if="deletingLink"
          :color="getPlatformTypeColor(deletingLink.platform_type)"
          class="mt-2"
        >
          {{ deletingLink.platform_display_name || deletingLink.platform_name }}
        </v-chip>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="showDeleteDialog = false">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          :loading="deleting"
          color="error"
          variant="elevated"
          @click="deleteSocialLink"
        >
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <!-- Success/Error Messages -->
  <v-snackbar
    v-model="showSnackbar"
    :color="snackbarColor"
    :timeout="3000"
    location="top"
  >
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppConfig } from '@/composables/useAppConfig';
import { useGraphQL } from '@/shared/composables/useGraphQL';

const { t } = useI18n();
const { socialLinks, refreshOrganization } = useAppConfig();
const { executeMutation } = useGraphQL();

// State
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showModal = ref(false);
const showDeleteDialog = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const editingLink = ref(null);
const deletingLink = ref(null);
const formValid = ref(false);
const socialForm = ref(null);

// Form data
const formData = ref({
  platform_name: '',
  platform_type: 'public',
  url: '',
  icon_class: '',
  order_index: 0,
  is_active: true
});

// Platform types
const platformTypes = computed(() => [
  { text: t('publicPlatform'), value: 'public' },
  { text: t('internalPlatform'), value: 'internal' },
  { text: t('partnersPlatform'), value: 'partners' }
]);

// Table headers
const headers = computed(() => [
  { title: t('platform'), key: 'platform_name', sortable: true },
  { title: t('url'), key: 'url', sortable: false },
  { title: t('type'), key: 'platform_type', sortable: true },
  { title: t('status'), key: 'is_active', sortable: false },
  { title: t('actions'), key: 'actions', sortable: false, align: 'end' }
]);

// Validation rules
const requiredRule = v => !!v || t('fieldRequired');
const urlRule = v => {
  if (!v) return true;
  try {
    new URL(v);
    return true;
  } catch {
    return t('invalidUrl');
  }
};

// Methods
const getPlatformTypeColor = (type) => {
  const colors = {
    public: 'success',
    internal: 'warning',
    partners: 'info'
  };
  return colors[type] || 'grey';
};

const getPlatformTypeDisplay = (type) => {
  const displays = {
    public: t('publicPlatform'),
    internal: t('internalPlatform'),
    partners: t('partnersPlatform')
  };
  return displays[type] || type;
};

const openAddModal = () => {
  editingLink.value = null;
  formData.value = {
    platform_name: '',
    platform_type: 'public',
    url: '',
    icon_class: '',
    order_index: socialLinks.value.length,
    is_active: true
  };
  showModal.value = true;
};

const openEditModal = (link) => {
  editingLink.value = link;
  formData.value = {
    id: link.id,
    platform_name: link.platform_name,
    platform_type: link.platform_type,
    url: link.url,
    icon_class: link.icon_class,
    order_index: link.order_index,
    is_active: link.is_active
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingLink.value = null;
  formData.value = {
    platform_name: '',
    platform_type: 'public',
    url: '',
    icon_class: '',
    order_index: 0,
    is_active: true
  };
  if (socialForm.value) {
    socialForm.value.resetValidation();
  }
};

const saveSocialLink = async () => {
  if (!socialForm.value?.validate()) return;
  
  saving.value = true;
  try {
    const mutation = editingLink.value
      ? `
        mutation UpdateSocialLink($input: UpdateSocialLinkInput!) {
          updateSocialLink(input: $input) {
            success
            message
            socialLink {
              id
              platform_name
              platform_type
              url
              icon_class
              order_index
              is_active
            }
          }
        }
      `
      : `
        mutation CreateSocialLink($input: CreateSocialLinkInput!) {
          createSocialLink(input: $input) {
            success
            message
            socialLink {
              id
              platform_name
              platform_type
              url
              icon_class
              order_index
              is_active
            }
          }
        }
      `;
    
    const variables = {
      input: formData.value
    };
    
    const response = await executeMutation(mutation, variables);
    
    if (response?.data?.[editingLink.value ? 'updateSocialLink' : 'createSocialLink']?.success) {
      showMessage(
        editingLink.value 
          ? t('socialLinkUpdatedSuccessfully') 
          : t('socialLinkAddedSuccessfully'), 
        'success'
      );
      closeModal();
      await refreshOrganization();
    } else {
      throw new Error(response?.data?.[editingLink.value ? 'updateSocialLink' : 'createSocialLink']?.message || 'Failed to save social link');
    }
  } catch (error) {
    console.error('Error saving social link:', error);
    showMessage(error.message || t('saveFailed'), 'error');
  } finally {
    saving.value = false;
  }
};

const toggleSocialLinkStatus = async (link) => {
  try {
    const mutation = `
      mutation UpdateSocialLink($input: UpdateSocialLinkInput!) {
        updateSocialLink(input: $input) {
          success
          message
        }
      }
    `;
    
    const variables = {
      input: {
        id: link.id,
        is_active: link.is_active
      }
    };
    
    const response = await executeMutation(mutation, variables);
    
    if (response?.data?.updateSocialLink?.success) {
      showMessage(t('socialLinkStatusUpdated'), 'success');
      await refreshOrganization();
    } else {
      throw new Error(response?.data?.updateSocialLink?.message || 'Failed to update status');
    }
  } catch (error) {
    console.error('Error toggling social link status:', error);
    showMessage(error.message || t('updateFailed'), 'error');
    // Revert the change
    link.is_active = !link.is_active;
  }
};

const confirmDelete = (link) => {
  deletingLink.value = link;
  showDeleteDialog.value = true;
};

const deleteSocialLink = async () => {
  deleting.value = true;
  try {
    const mutation = `
      mutation DeleteSocialLink($id: ID!) {
        deleteSocialLink(id: $id) {
          success
          message
        }
      }
    `;
    
    const variables = { id: deletingLink.value.id };
    
    const response = await executeMutation(mutation, variables);
    
    if (response?.data?.deleteSocialLink?.success) {
      showMessage(t('socialLinkDeletedSuccessfully'), 'success');
      showDeleteDialog.value = false;
      deletingLink.value = null;
      await refreshOrganization();
    } else {
      throw new Error(response?.data?.deleteSocialLink?.message || 'Failed to delete social link');
    }
  } catch (error) {
    console.error('Error deleting social link:', error);
    showMessage(error.message || t('deleteFailed'), 'error');
  } finally {
    deleting.value = false;
  }
};

const showMessage = (message, color = 'success') => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  showSnackbar.value = true;
};

// Initialize
onMounted(async () => {
  loading.value = true;
  try {
    await refreshOrganization();
  } catch (error) {
    console.error('Error loading social links:', error);
    showMessage(t('loadFailed'), 'error');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.social-links-table {
  border-radius: 8px;
  overflow: hidden;
}

.drag-handle {
  cursor: move;
}

.v-data-table >>> .v-data-table__th {
  font-weight: 600;
}

.v-switch {
  margin-top: 0;
}
</style>
