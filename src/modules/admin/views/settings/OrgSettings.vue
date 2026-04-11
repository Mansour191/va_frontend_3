<template>
  <v-container class="py-6">
    <!-- Page Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">
          <v-icon color="primary" class="me-2">mdi-domain</v-icon>
          {{ $t('organizationSettings') }}
        </h1>
        <p class="text-body-2 text-medium-emphasis">{{ $t('organizationSettingsDesc') }}</p>
      </div>
      <v-btn
        :loading="loading"
        :disabled="loading || !hasChanges"
        color="primary"
        variant="elevated"
        prepend-icon="mdi-content-save"
        @click="saveOrganization"
      >
        {{ $t('saveChanges') }}
      </v-btn>
    </div>

    <!-- Loading State -->
    <v-card v-if="loading && !organization" elevation="2" class="mb-6">
      <v-card-text class="pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="48" class="mb-4"></v-progress-circular>
        <p class="text-h6">{{ $t('loadingOrganizationData') }}</p>
      </v-card-text>
    </v-card>

    <!-- Organization Form -->
    <v-form v-if="organization" ref="orgForm" v-model="formData" @submit.prevent="saveOrganization">
      <v-row>
        <!-- Basic Information -->
        <v-col cols="12">
          <v-card elevation="2" class="mb-6">
            <v-card-title class="d-flex align-center ga-2 pa-4">
              <v-icon color="primary">mdi-information</v-icon>
              <span class="text-h6">{{ $t('basicInformation') }}</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.name_ar"
                    :label="$t('nameArabic')"
                    :rules="[requiredRule]"
                    variant="outlined"
                    prepend-inner-icon="mdi-translate"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.name_en"
                    :label="$t('nameEnglish')"
                    :rules="[requiredRule]"
                    variant="outlined"
                    prepend-inner-icon="mdi-translate"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.slogan_ar"
                    :label="$t('sloganArabic')"
                    variant="outlined"
                    prepend-inner-icon="mdi-format-quote-open"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.slogan_en"
                    :label="$t('sloganEnglish')"
                    variant="outlined"
                    prepend-inner-icon="mdi-format-quote-open"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Contact Information -->
        <v-col cols="12">
          <v-card elevation="2" class="mb-6">
            <v-card-title class="d-flex align-center ga-2 pa-4">
              <v-icon color="primary">mdi-phone</v-icon>
              <span class="text-h6">{{ $t('contactInformation') }}</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.contact_email"
                    :label="$t('email')"
                    :rules="[emailRule, requiredRule]"
                    variant="outlined"
                    type="email"
                    prepend-inner-icon="mdi-email"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="formData.phone_1"
                    :label="$t('phone1')"
                    :rules="[requiredRule]"
                    variant="outlined"
                    prepend-inner-icon="mdi-phone"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="formData.phone_2"
                    :label="$t('phone2')"
                    variant="outlined"
                    prepend-inner-icon="mdi-phone"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="formData.address"
                    :label="$t('address')"
                    :rules="[requiredRule]"
                    variant="outlined"
                    rows="3"
                    prepend-inner-icon="mdi-map-marker"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.tax_number"
                    :label="$t('taxNumber')"
                    variant="outlined"
                    prepend-inner-icon="mdi-receipt"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Location & Maps -->
        <v-col cols="12">
          <v-card elevation="2" class="mb-6">
            <v-card-title class="d-flex align-center ga-2 pa-4">
              <v-icon color="primary">mdi-map</v-icon>
              <span class="text-h6">{{ $t('locationAndMaps') }}</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.latitude"
                    :label="$t('latitude')"
                    variant="outlined"
                    type="number"
                    step="any"
                    prepend-inner-icon="mdi-latitude"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.longitude"
                    :label="$t('longitude')"
                    variant="outlined"
                    type="number"
                    step="any"
                    prepend-inner-icon="mdi-longitude"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.google_place_id"
                    :label="$t('googlePlaceId')"
                    variant="outlined"
                    prepend-inner-icon="mdi-google-maps"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.maps_url"
                    :label="$t('mapsUrl')"
                    variant="outlined"
                    prepend-inner-icon="mdi-link"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <!-- Map Preview & Picker -->
              <v-row class="mt-4">
                <v-col cols="12">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <h3 class="text-h6">{{ $t('mapPreview') }}</h3>
                    <v-btn
                      color="primary"
                      variant="outlined"
                      prepend-icon="mdi-map-marker-plus"
                      @click="openMapPicker"
                    >
                      {{ $t('pickLocation') }}
                    </v-btn>
                  </div>
                  
                  <div class="map-container" v-if="formData.latitude && formData.longitude">
                    <iframe
                      :src="`https://maps.google.com/maps?q=${formData.latitude},${formData.longitude}&z=15&output=embed`"
                      width="100%"
                      height="300"
                      style="border:0;"
                      allowfullscreen=""
                      loading="lazy"
                    ></iframe>
                  </div>
                  
                  <v-alert
                    v-else
                    type="info"
                    variant="tonal"
                    class="mt-4"
                  >
                    {{ $t('noCoordinatesMessage') }}
                  </v-alert>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- About Section -->
        <v-col cols="12">
          <v-card elevation="2" class="mb-6">
            <v-card-title class="d-flex align-center ga-2 pa-4">
              <v-icon color="primary">mdi-text</v-icon>
              <span class="text-h6">{{ $t('aboutSection') }}</span>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="formData.about_ar"
                    :label="$t('aboutArabic')"
                    variant="outlined"
                    rows="4"
                    prepend-inner-icon="mdi-text"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="6">
                  <v-textarea
                    v-model="formData.about_en"
                    :label="$t('aboutEnglish')"
                    variant="outlined"
                    rows="4"
                    prepend-inner-icon="mdi-text"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Social Links Manager -->
        <v-col cols="12">
          <SocialLinksManager />
        </v-col>

        <!-- Payment Methods Manager -->
        <v-col cols="12">
          <PaymentMethodsManager />
        </v-col>

        <!-- Coupons Manager -->
        <v-col cols="12">
          <CouponsManager />
        </v-col>
      </v-row>
    </v-form>

    <!-- Success/Error Messages -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppConfig } from '@/composables/useAppConfig';
import SocialLinksManager from './SocialLinksManager.vue';
import PaymentMethodsManager from './PaymentMethodsManager.vue';
import CouponsManager from './CouponsManager.vue';

const { t } = useI18n();
const { 
  organization, 
  loading, 
  updateOrganization, 
  initialize: initializeOrg 
} = useAppConfig();

// Form data
const formData = ref({});
const originalData = ref({});
const orgForm = ref(null);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

// Validation rules
const requiredRule = v => !!v || t('fieldRequired');
const emailRule = v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || t('invalidEmail');

// Computed properties
const hasChanges = computed(() => {
  if (!originalData.value) return false;
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value);
});

// Methods
const initializeFormData = () => {
  if (!organization.value) return;
  
  formData.value = {
    id: organization.value.id,
    name_ar: organization.value.name_ar || '',
    name_en: organization.value.name_en || '',
    slogan_ar: organization.value.slogan_ar || '',
    slogan_en: organization.value.slogan_en || '',
    about_ar: organization.value.about_ar || '',
    about_en: organization.value.about_en || '',
    contact_email: organization.value.contact_email || '',
    phone_1: organization.value.phone_1 || '',
    phone_2: organization.value.phone_2 || '',
    address: organization.value.address || '',
    tax_number: organization.value.tax_number || '',
    latitude: organization.value.latitude || '',
    longitude: organization.value.longitude || '',
    google_place_id: organization.value.google_place_id || '',
    maps_url: organization.value.maps_url || ''
  };
  
  // Store original data for change detection
  originalData.value = JSON.parse(JSON.stringify(formData.value));
};

const saveOrganization = async () => {
  if (!orgForm.value?.validate()) {
    showMessage(t('pleaseFixErrors'), 'error');
    return;
  }
  
  try {
    const result = await updateOrganization(formData.value);
    
    if (result.success) {
      showMessage(t('organizationUpdatedSuccessfully'), 'success');
      originalData.value = JSON.parse(JSON.stringify(formData.value));
    } else {
      showMessage(result.message || t('updateFailed'), 'error');
    }
  } catch (error) {
    console.error('Error updating organization:', error);
    showMessage(t('updateFailed'), 'error');
  }
};

const openMapPicker = () => {
  // Open Google Maps in a new window for location picking
  const url = `https://www.google.com/maps/search/?api=1&query=${formData.value.address || 'Algeria'}`;
  window.open(url, '_blank', 'width=800,height=600');
  
  // In a real implementation, you would integrate a proper map picker component
  // For now, this opens Google Maps where user can find coordinates
  showMessage(t('mapPickerInstructions'), 'info');
};

const showMessage = (message, color = 'success') => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  showSnackbar.value = true;
};

// Watch for organization changes
watch(organization, (newOrg) => {
  if (newOrg) {
    initializeFormData();
  }
}, { immediate: true });

// Initialize on mount
onMounted(async () => {
  await initializeOrg();
});
</script>

<style scoped>
.map-container {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.map-container iframe {
  border: none;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
</style>
