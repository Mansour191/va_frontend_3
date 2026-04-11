<template>
  <v-footer class="footer" color="surface" elevation="8">
    <v-container>
      <v-row>
        <!-- About Column -->
        <v-col cols="12" md="3">
          <v-card class="footer-card h-100" elevation="2">
            <v-card-title class="d-flex align-center ga-2">
              <v-icon color="primary">mdi-information</v-icon>
              <span class="text-h6">{{ $t('aboutTitle') }}</span>
            </v-card-title>
            <v-card-text>
              <p class="footer-about-text">{{ organizationAbout || footerData.aboutText || $t('footerAboutText') }}</p>
              
              <!-- Stats Mini -->
              <v-row class="footer-stats-mini mt-4" density="compact">
                <v-col cols="4" class="text-center">
                  <div class="stat-mini">
                    <span class="stat-number">{{ footerData.projectsCount || '500+' }}</span>
                    <span class="stat-label">{{ $t('footerProjects') }}</span>
                  </div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="stat-mini">
                    <span class="stat-number">{{ footerData.clientsCount || '300+' }}</span>
                    <span class="stat-label">{{ $t('footerClients') }}</span>
                  </div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="stat-mini">
                    <span class="stat-number">{{ footerData.yearsCount || '5+' }}</span>
                    <span class="stat-label">{{ $t('footerYears') }}</span>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Products Column -->
        <v-col cols="12" md="3">
          <v-card class="footer-card h-100" elevation="2">
            <v-card-title class="d-flex align-center ga-2">
              <v-icon color="primary">mdi-view-grid</v-icon>
              <span class="text-h6">{{ $t('ourProducts') }}</span>
            </v-card-title>
            <v-card-text>
              <v-list density="compact" class="footer-list">
                <v-list-item
                  v-for="item in productItems"
                  :key="item.route"
                  :to="item.route"
                  prepend-icon="mdi-chevron-right"
                  class="footer-list-item"
                >
                  <v-list-item-title>{{ $t(item.key) }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Quick Links Column -->
        <v-col cols="12" md="3">
          <v-card class="footer-card h-100" elevation="2">
            <v-card-title class="d-flex align-center ga-2">
              <v-icon color="primary">mdi-link</v-icon>
              <span class="text-h6">{{ $t('importantLinks') }}</span>
            </v-card-title>
            <v-card-text>
              <v-list density="compact" class="footer-list">
                <v-list-item
                  to="/about"
                  prepend-icon="mdi-account-group"
                  class="footer-list-item"
                >
                  <v-list-item-title>{{ $t('about') }}</v-list-item-title>
                </v-list-item>
                <v-list-item
                  to="/contact"
                  prepend-icon="mdi-phone"
                  class="footer-list-item"
                >
                  <v-list-item-title>{{ $t('contact') }}</v-list-item-title>
                </v-list-item>
                <v-list-item
                  to="/gallery"
                  prepend-icon="mdi-image-multiple"
                  class="footer-list-item"
                >
                  <v-list-item-title>{{ $t('gallery') }}</v-list-item-title>
                </v-list-item>
                <v-list-item
                  to="/privacy"
                  prepend-icon="mdi-shield-check"
                  class="footer-list-item"
                >
                  <v-list-item-title>{{ $t('privacy') }}</v-list-item-title>
                </v-list-item>
                <v-list-item
                  to="/terms"
                  prepend-icon="mdi-file-document"
                  class="footer-list-item"
                >
                  <v-list-item-title>{{ $t('terms') }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Contact Column -->
        <v-col cols="12" md="3">
          <v-card class="footer-card h-100" elevation="2">
            <v-card-title class="d-flex align-center ga-2">
              <v-icon color="primary">mdi-phone</v-icon>
              <span class="text-h6">{{ $t('contactUs') }}</span>
            </v-card-title>
            <v-card-text>
              <!-- Contact Info -->
              <div class="footer-contact-info">
                <v-card
                  class="contact-item mb-3"
                  variant="outlined"
                  density="compact"
                >
                  <v-card-text class="d-flex align-center ga-3 pa-3">
                    <v-avatar size="32" color="primary">
                      <v-icon size="16" color="white">mdi-email</v-icon>
                    </v-avatar>
                    <a :href="`mailto:${contactInfo.email || 'remadnamansour7@gmail.com'}`" class="text-decoration-none">
                      {{ contactInfo.email || 'remadnamansour7@gmail.com' }}
                    </a>
                  </v-card-text>
                </v-card>
                
                <v-card
                  class="contact-item"
                  variant="outlined"
                  density="compact"
                >
                  <v-card-text class="d-flex align-center ga-3 pa-3">
                    <v-avatar size="32" color="primary">
                      <v-icon size="16" color="white">mdi-phone</v-icon>
                    </v-avatar>
                    <a :href="`tel:${contactInfo.phone1 || '0663140341'}`" class="text-decoration-none">
                      {{ contactInfo.phone1 || '0663140341' }}
                    </a>
                  </v-card-text>
                </v-card>
              </div>
              
              <!-- Social Media -->
              <div class="social-section mt-4">
                <h5 class="text-subtitle-2 mb-3">{{ $t('followUsTitle') }}</h5>
                <div class="d-flex flex-wrap ga-2">
                  <v-btn
                    v-for="social in publicSocialLinks"
                    :key="social.id"
                    :href="social.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    :icon="social.fa_icon_class || social.icon_class"
                    :color="getSocialColor(social.platform_name)"
                    variant="elevated"
                    size="small"
                    class="social-btn"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Divider -->
      <v-divider class="my-6" thickness="2">
        <v-icon color="primary" class="mx-2">mdi-star</v-icon>
      </v-divider>

      <!-- Footer Bottom -->
      <v-row class="footer-bottom">
        <v-col cols="12" md="6" class="text-center text-md-start">
          <div class="copyright d-flex align-center justify-center justify-md-start ga-2">
            <v-icon color="primary" size="small">mdi-copyright</v-icon>
            <span>{{ $t('siteTitle') }} {{ new Date().getFullYear() }} - {{ $t('allRightsReserved') }}</span>
          </div>
        </v-col>
        <v-col cols="12" md="6" class="text-center text-md-end">
          <div class="footer-legal d-flex align-center justify-center justify-md-end ga-3 flex-wrap">
            <v-btn
              to="/privacy"
              variant="text"
              size="small"
              color="primary"
            >
              {{ $t('privacy') }}
            </v-btn>
            <span class="text-caption text-medium-emphasis">|</span>
            <v-btn
              to="/terms"
              variant="text"
              size="small"
              color="primary"
            >
              {{ $t('terms') }}
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppConfig } from '@/composables/useAppConfig';
import FooterService from '@/shared/integration/services/FooterService';

const { t } = useI18n();
const { 
  organizationAbout, 
  contactInfo, 
  publicSocialLinks, 
  initialize: initializeOrg 
} = useAppConfig();

// State
const footerData = ref({});
const loading = ref(false);

// Static data with fallback
const productItems = ref([
  { route: '/furniture', key: 'furniture' },
  { route: '/doors', key: 'doors' },
  { route: '/walls', key: 'walls' },
  { route: '/ceilings', key: 'ceilings' },
  { route: '/tiles', key: 'tiles' },
  { route: '/kitchens', key: 'kitchens' },
  { route: '/cars', key: 'cars' },
]);


// Methods
const loadFooterData = async () => {
  loading.value = true;
  try {
    // جلب بيانات الفوتر من قاعدة البيانات عبر API
    const response = await FooterService.getFooterData();
    if (response.success) {
      footerData.value = response.data || {};
      
      // تحديث العناصر الديناميكية إذا وجدت
      if (response.data?.productItems) {
        productItems.value = response.data.productItems;
      }
      if (response.data?.socialLinks) {
        // Legacy support - social links are now handled by organization store
        console.log('📦 Legacy social links found, but using dynamic store data instead');
      }
      
      console.log('✅ Footer data loaded successfully:', footerData.value);
    } else {
      console.warn('⚠️ Footer API returned error:', response.error);
      // استخدام البيانات الافتراضية في حالة فشل API
    }
  } catch (error) {
    console.error('❌ Error loading footer data:', error);
    // استخدام البيانات الافتراضية في حالة فشل API
    // لا تظهر خطأ للمستخدم، فقط استخدم البيانات الافتراضية
  } finally {
    loading.value = false;
  }
};

const getSocialColor = (socialName) => {
  const colors = {
    facebook: '#1877f2',
    youtube: '#ff0000',
    whatsapp: '#25d366',
    instagram: '#e4405f',
    tiktok: '#000000',
    email: '#d44638',
  };
  return colors[socialName] || 'primary';
};

// Lifecycle
onMounted(async () => {
  // Initialize organization data
  await initializeOrg();
  
  // Load additional footer data (legacy support)
  await loadFooterData();
});
</script>

<style scoped>
.footer {
  background: linear-gradient(180deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-surface-variant)) 100%);
  border-top: 3px solid rgb(var(--v-theme-primary));
  margin-top: 40px;
}

.footer-card {
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 16px;
  transition: all 0.3s ease;
  height: 100%;
}

.footer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-shadow), 0.15);
  border-color: rgb(var(--v-theme-primary));
}

.footer-about-text {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 16px;
}

.footer-stats-mini {
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.stat-mini {
  text-align: center;
}

.stat-number {
  display: block;
  color: rgb(var(--v-theme-primary));
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 500;
}

.footer-list {
  background: transparent;
}

.footer-list-item {
  margin-bottom: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.footer-list-item:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  transform: translateX(-4px);
}

.footer-contact-info {
  margin-bottom: 16px;
}

.contact-item {
  transition: all 0.3s ease;
}

.contact-item:hover {
  transform: translateX(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-shadow), 0.1);
}

.contact-item a {
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-item a:hover {
  color: rgb(var(--v-theme-primary));
}

.social-section h5 {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.social-btn {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.social-btn:hover {
  transform: translateY(-4px) scale(1.1);
}

.footer-bottom {
  border-top: 1px solid rgba(var(--v-theme-outline), 0.2);
  padding-top: 24px;
}

.copyright {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.85rem;
}

.footer-legal {
  gap: 12px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .footer-card {
    margin-bottom: 16px;
  }
}

@media (max-width: 600px) {
  .footer-stats-mini {
    padding: 12px;
  }
  
  .stat-number {
    font-size: 1.2rem;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
}
</style>
