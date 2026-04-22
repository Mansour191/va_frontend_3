<!-- src/components/GoogleMap.vue -->
<template>
  <section class="google-map-section py-12">
    <v-container>
      <!-- Header -->
      <v-row class="mb-8">
        <v-col cols="12" class="text-center">
          <h2 class="text-h4 font-weight-bold mb-4">
            <v-icon color="primary" class="me-3">mdi-map-marker</v-icon>
            {{ $t('ourLocation') || 'موقعنا' }}
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-6">
            {{ $t('locationDesc') || 'نحن موجودون في قلب مدينة الجزائر لتقديم أفضل الخدمات لعملائنا' }}
          </p>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <v-row v-if="loading">
        <v-col cols="12" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
          <p class="text-body-1 text-medium-emphasis">
            {{ $t('loadingLocation') || 'جاري تحميل معلومات الموقع...' }}
          </p>
        </v-col>
      </v-row>

      <!-- Main Content: Map and Contact Info -->
      <v-row v-else>
        <v-col cols="12" lg="8" class="mb-6 mb-lg-0">
          <v-card class="map-container" elevation="4">
            <!-- Leaflet Map Container -->
            <div id="leaflet-map" class="map-wrapper"></div>

            <!-- Map Controls -->
            <v-card-actions class="pa-2 bg-surface-variant">
              <v-btn
                variant="text"
                prepend-icon="mdi-crosshairs-gps"
                size="small"
                @click="centerOnUser"
                :disabled="!userLocation"
              >
                {{ $t('myLocation') || 'موقعي' }}
              </v-btn>
              <v-btn
                variant="text"
                prepend-icon="mdi-routes"
                size="small"
                @click="findBestRoute"
                :loading="findingRoute"
              >
                {{ $t('findBestRoute') || 'أقصر طريق' }}
              </v-btn>
              <v-btn
                variant="text"
                prepend-icon="mdi-fit-to-page"
                size="small"
                @click="fitBounds"
              >
                {{ $t('fitView') || 'عرض المسار' }}
              </v-btn>
              <v-btn
                v-if="routeInfo"
                variant="text"
                prepend-icon="mdi-close"
                size="small"
                @click="resetRoute"
              >
                {{ $t('cancel') || 'إلغاء' }}
              </v-btn>
              <v-spacer />
              <v-btn
                variant="text"
                prepend-icon="mdi-share"
                size="small"
                @click="shareLocation"
              >
                {{ $t('share') || 'مشاركة' }}
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- Route Info Card (عند وجود طريق محسن) -->
          <v-card v-if="routeInfo" class="route-info-card mt-2" elevation="1">
            <v-card-text class="pa-2">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon color="info" size="20" class="me-2">mdi-routes</v-icon>
                  <span class="text-caption font-weight-bold">{{ $t('bestRoute') || 'أقصر طريق' }}</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="16" class="me-1">mdi-clock</v-icon>
                  <span class="text-caption">{{ routeInfo.duration }}</span>
                  <span class="mx-2">|</span>
                  <v-icon size="16" class="me-1">mdi-ruler</v-icon>
                  <span class="text-caption">{{ routeInfo.distance }}</span>
                </div>
              </div>
              <div class="text-caption mt-1 text-medium-emphasis">
                {{ routeInfo.description }}
              </div>
            </v-card-text>
          </v-card>

          <!-- Distance Info Card -->
          <v-card class="distance-card mt-4" elevation="2" :class="distanceCardClass">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon :color="distanceIconColor" class="me-2" size="24">
                    {{ distanceIcon }}
                  </v-icon>
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      {{ $t('distanceToOffice') || 'المسافة إلى المقر' }}
                    </div>
                    <div class="text-h5 font-weight-bold" :style="{ color: distanceColor }">
                      {{ formattedDistance }}
                    </div>
                  </div>
                </div>
                <v-chip :color="distanceChipColor" variant="elevated" size="small">
                  {{ distanceStatus }}
                </v-chip>
              </div>

              <!-- Progress Bar -->
              <v-progress-linear
                :model-value="distanceProgress"
                :color="distanceColor"
                height="6"
                rounded
                class="mt-3"
              />

              <!-- Dynamic Message -->
              <div class="text-caption mt-2 text-center" :style="{ color: distanceColor }">
                {{ distanceMessage }}
              </div>
            </v-card-text>
          </v-card>

          <!-- Network and Speed Info -->
          <v-card class="network-info-card mt-2" elevation="1">
            <v-card-text class="pa-2">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon :color="networkColor" size="20" class="me-2">mdi-cellphone</v-icon>
                  <span class="text-caption">{{ networkStatus }}</span>
                </div>
                <div class="d-flex align-center" v-if="currentSpeed > 0">
                  <v-icon color="info" size="16" class="me-1">mdi-speedometer</v-icon>
                  <span class="text-caption">{{ formattedSpeed }}</span>
                </div>
                <div class="d-flex align-center" v-if="locationAccuracy">
                  <v-icon :color="accuracyColor" size="16" class="me-1">mdi-crosshairs-gps</v-icon>
                  <span class="text-caption">{{ formattedAccuracy }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Contact Info Card -->
        <v-col cols="12" lg="4">
          <v-card class="contact-info-card h-100" elevation="4">
            <v-card-title class="text-h5 font-weight-bold mb-4">
              <v-icon color="primary" class="me-2">mdi-information</v-icon>
              {{ $t('contactInfo') || 'معلومات التواصل' }}
            </v-card-title>

            <v-card-text>
              <!-- Address -->
              <div class="contact-item mb-4">
                <div class="d-flex align-start">
                  <v-icon color="primary" class="me-3 mt-1">mdi-map-marker-radius</v-icon>
                  <div>
                    <h3 class="text-h6 font-weight-medium mb-1">
                      {{ $t('address') || 'العنوان' }}
                    </h3>
                    <p class="text-body-2 text-medium-emphasis">
                      {{ locationData.address?.street }}<br>
                      {{ locationData.address?.city }}<br>
                      {{ locationData.address?.country }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Phone -->
              <div class="contact-item mb-4">
                <div class="d-flex align-start">
                  <v-icon color="primary" class="me-3 mt-1">mdi-phone</v-icon>
                  <div>
                    <h3 class="text-h6 font-weight-medium mb-1">
                      {{ $t('phone') || 'الهاتف' }}
                    </h3>
                    <div class="d-flex flex-column gap-1">
                      <v-btn
                        v-for="phone in phones"
                        :key="phone"
                        :href="`tel:${phone}`"
                        variant="text"
                        size="small"
                        class="text-body-2 text-medium-emphasis justify-start pa-0"
                      >
                        <v-icon size="16" start>mdi-phone</v-icon>
                        {{ phone }}
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="contact-item mb-4">
                <div class="d-flex align-start">
                  <v-icon color="primary" class="me-3 mt-1">mdi-email</v-icon>
                  <div>
                    <h3 class="text-h6 font-weight-medium mb-1">
                      {{ $t('email') || 'البريد الإلكتروني' }}
                    </h3>
                    <div class="d-flex flex-column gap-1">
                      <v-btn
                        v-for="email in emails"
                        :key="email"
                        :href="`mailto:${email}`"
                        variant="text"
                        size="small"
                        class="text-body-2 text-medium-emphasis justify-start pa-0"
                      >
                        <v-icon size="16" start>mdi-email</v-icon>
                        {{ email }}
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Working Hours -->
              <div class="contact-item mb-4">
                <div class="d-flex align-start">
                  <v-icon color="primary" class="me-3 mt-1">mdi-clock</v-icon>
                  <div>
                    <h3 class="text-h6 font-weight-medium mb-1">
                      {{ $t('workingHours') || 'ساعات العمل' }}
                    </h3>
                    <p class="text-body-2 text-medium-emphasis">
                      {{ $t('weekdays') || 'من الأحد إلى الخميس' }}: {{ locationData.workingHours?.weekdays }}<br>
                      {{ $t('saturday') || 'الجمعة والسبت' }}: {{ locationData.workingHours?.saturday }}<br>
                      {{ $t('sunday') || 'الأحد' }}: {{ locationData.workingHours?.sunday }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- WhatsApp -->
              <div class="contact-item">
                <div class="d-flex align-start">
                  <v-icon color="success" class="me-3 mt-1">mdi-whatsapp</v-icon>
                  <div>
                    <h3 class="text-h6 font-weight-medium mb-1">
                      {{ $t('whatsapp') || 'واتساب' }}
                    </h3>
                    <v-btn
                      :href="`https://wa.me/${locationData.contact?.whatsapp?.replace(/[^0-9]/g, '')}`"
                      color="success"
                      variant="elevated"
                      size="small"
                      prepend-icon="mdi-whatsapp"
                    >
                      {{ $t('chatOnWhatsApp') || 'محادثة على واتساب' }}
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-directions"
                block
                @click="openDirections"
              >
                {{ $t('getDirections') || 'احصل على الاتجاهات' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Contact Form -->
      <v-row class="mt-8">
        <v-col cols="12">
          <v-card class="quick-contact-card" elevation="4">
            <v-card-title class="text-h5 font-weight-bold mb-4">
              <v-icon color="primary" class="me-2">mdi-message-text</v-icon>
              {{ $t('quickContact') || 'تواصل معنا بسرعة' }}
            </v-card-title>

            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="quickForm.name"
                    :label="$t('fullName') || 'الاسم الكامل'"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    :rules="nameRules"
                    required
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="quickForm.phone"
                    :label="$t('phoneNumber') || 'رقم الهاتف'"
                    variant="outlined"
                    prepend-inner-icon="mdi-phone"
                    type="tel"
                    :rules="phoneRules"
                    required
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-btn
                    color="primary"
                    variant="elevated"
                    size="large"
                    prepend-icon="mdi-send"
                    block
                    @click="sendQuickMessage"
                    :loading="sending"
                    :disabled="!isFormValid"
                  >
                    {{ $t('sendMessage') || 'إرسال رسالة' }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Nearby Branches -->
      <v-row v-if="nearbyBranches.length > 0" class="mt-8">
        <v-col cols="12">
          <v-card class="nearby-branches-card" elevation="4">
            <v-card-title class="text-h5 font-weight-bold mb-4">
              <v-icon color="primary" class="me-2">mdi-store-multiple</v-icon>
              {{ $t('nearbyBranches') || 'الفروع القريبة' }}
            </v-card-title>

            <v-card-text>
              <v-row dense>
                <v-col
                  v-for="branch in nearbyBranches"
                  :key="branch.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card variant="outlined" class="branch-card">
                    <v-card-text>
                      <h6 class="text-h6 font-weight-bold mb-2">{{ branch.name }}</h6>
                      <p class="text-body-2 text-medium-emphasis mb-2">{{ branch.address }}</p>
                      <div class="d-flex align-center justify-space-between">
                        <v-btn
                          :href="`tel:${branch.phone}`"
                          variant="text"
                          size="small"
                          prepend-icon="mdi-phone"
                        >
                          {{ branch.phone }}
                        </v-btn>
                        <v-btn
                          variant="text"
                          size="small"
                          prepend-icon="mdi-directions"
                          @click="openDirectionsToBranch(branch)"
                        >
                          {{ $t('directions') || 'اتجاهات' }}
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Low Accuracy Warning -->
      <v-row v-if="lowAccuracyWarning" class="mt-2">
        <v-col cols="12">
          <v-alert type="warning" density="compact" variant="tonal">
            <div class="d-flex align-center">
              <v-icon size="20" class="me-2">mdi-alert</v-icon>
              <span>{{ $t('lowAccuracyWarning') || 'دقة الموقع منخفضة (±' + Math.round(locationAccuracy) + ' متر). حاول الاقتراب من نافذة الحافلة أو تشغيل GPS' }}</span>
            </div>
          </v-alert>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocationInfo, useNearbyBranches, useSendQuickMessage } from '@/shared/composables/useGraphQL';

// إصلاح مشكلة أيقونات Leaflet في Vue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const { t } = useI18n();

// موقع المؤسسة (فينيل آرت - الجزائر العاصمة)
const OFFICE_LOCATION = {
  lat: 36.7538,
  lng: 3.0588,
  name: 'فينيل آرت - المقر الرئيسي',
  address: 'الجزائر العاصمة، الجزائر'
};

// --- State ---
const loading = ref(true);
const sending = ref(false);
const locationData = ref({});
const nearbyBranches = ref([]);

// Map and Location Tracking
let map = null;
let userMarker = null;
let officeMarker = null;
let routeLine = null;
let watchId = null;
let locationHistory = [];

// User State
const userLocation = ref(null);
const distance = ref(null);
const currentSpeed = ref(0);
const locationAccuracy = ref(null);
const networkProvider = ref(null);
const isMoving = ref(false);
const lastLocationTime = ref(null);
const lastLocationCoords = ref(null);

// Route State
const findingRoute = ref(false);
const routeInfo = ref(null);
let routingControl = null;

// Quick Form State
const quickForm = reactive({
  name: '',
  phone: ''
});

// --- Computed Properties ---
const isFormValid = computed(() => {
  return quickForm.name.length >= 3 && quickForm.phone.length >= 10 && /^[0-9+\-\s]+$/.test(quickForm.phone);
});

const formattedDistance = computed(() => {
  if (!distance.value) return 'غير معروف';
  if (distance.value < 1000) return `${Math.round(distance.value)} متر`;
  return `${(distance.value / 1000).toFixed(1)} كم`;
});

const distanceColor = computed(() => {
  if (!distance.value) return '#9e9e9e';
  if (distance.value < 500) return '#4caf50';
  if (distance.value < 2000) return '#8bc34a';
  if (distance.value < 5000) return '#ffc107';
  return '#f44336';
});

const distanceChipColor = computed(() => {
  if (!distance.value) return 'grey';
  if (distance.value < 500) return 'success';
  if (distance.value < 2000) return 'success';
  if (distance.value < 5000) return 'warning';
  return 'error';
});

const distanceIcon = computed(() => {
  if (!distance.value) return 'mdi-map-marker-question';
  if (distance.value < 500) return 'mdi-flag-checkered';
  if (distance.value < 2000) return 'mdi-walk';
  if (distance.value < 5000) return 'mdi-car';
  return 'mdi-rocket';
});

const distanceIconColor = computed(() => distanceColor.value);

const distanceStatus = computed(() => {
  if (!distance.value) return 'جاري التحديد';
  if (distance.value < 500) return 'قريب جداً';
  if (distance.value < 2000) return 'قريب';
  if (distance.value < 5000) return 'متوسط';
  return 'بعيد';
});

const distanceMessage = computed(() => {
  if (!distance.value) return 'قم بتشغيل خاصية تحديد الموقع لرؤية المسافة';
  if (distance.value < 500) return '🎉 أنت على بعد خطوات! تفضل بزيارتنا';
  if (distance.value < 2000) return '🚶 يمكنك الوصول سيراً على الأقدام خلال دقائق';
  if (distance.value < 5000) return '🚗 مسافة قريبة بالسيارة';
  return '🛣️ قد تحتاج إلى مواصلات للوصول إلينا';
});

const distanceProgress = computed(() => {
  if (!distance.value) return 0;
  const maxDistance = 10000;
  const progress = Math.max(0, Math.min(100, 100 - (distance.value / maxDistance) * 100));
  return Math.round(progress);
});

const distanceCardClass = computed(() => {
  if (!distance.value) return '';
  if (distance.value < 500) return 'distance-very-close';
  if (distance.value < 2000) return 'distance-close';
  if (distance.value < 5000) return 'distance-medium';
  return 'distance-far';
});

const formattedAccuracy = computed(() => {
  if (!locationAccuracy.value) return 'غير معروف';
  if (locationAccuracy.value < 50) return `±${Math.round(locationAccuracy.value)}م (دقيق)`;
  if (locationAccuracy.value < 150) return `±${Math.round(locationAccuracy.value)}م (جيد)`;
  return `±${Math.round(locationAccuracy.value)}م (تقريبي)`;
});

const accuracyColor = computed(() => {
  if (!locationAccuracy.value) return 'grey';
  if (locationAccuracy.value < 50) return 'success';
  if (locationAccuracy.value < 150) return 'warning';
  return 'error';
});

const lowAccuracyWarning = computed(() => {
  return locationAccuracy.value > 150;
});

const formattedSpeed = computed(() => {
  const speedKmh = currentSpeed.value * 3.6;
  if (speedKmh < 1) return 'متوقف';
  if (speedKmh < 5) return 'مشي';
  if (speedKmh < 20) return 'دراجة';
  if (speedKmh < 50) return 'حافلة/سيارة';
  return 'سرعة عالية';
});

const networkStatus = computed(() => {
  switch(networkProvider.value) {
    case 'AT': return '📡 اتصالات الجزائر';
    case 'Mobilis': return '📡 موبيليس';
    case 'Djezzy': return '📡 جيزي';
    case 'Ooredoo': return '📡 أوريدو';
    default: return '📡 شبكة جوال';
  }
});

const networkColor = computed(() => {
  switch(networkProvider.value) {
    case 'AT': return 'blue';
    case 'Mobilis': return 'green';
    case 'Djezzy': return 'orange';
    case 'Ooredoo': return 'purple';
    default: return 'grey';
  }
});

const phones = computed(() => {
  const phone = locationData.value.contact?.phone || '+213 66 314 0341';
  return phone.includes('\n') ? phone.split('\n') : [phone];
});

const emails = computed(() => {
  const email = locationData.value.contact?.email || 'contact@paclos.dz';
  return email.includes('\n') ? email.split('\n') : [email];
});

const nameRules = [
  v => !!v || (t('nameRequired') || 'الاسم مطلوب'),
  v => v.length >= 3 || (t('nameMinLength') || 'يجب أن يكون الاسم 3 أحرف على الأقل')
];

const phoneRules = [
  v => !!v || (t('phoneRequired') || 'رقم الهاتف مطلوب'),
  v => /^[0-9+\-\s]+$/.test(v) || (t('phoneInvalid') || 'رقم الهاتف غير صالح'),
  v => v.length >= 10 || (t('phoneMinLength') || 'يجب أن يكون رقم الهاتف 10 أرقام على الأقل')
];

// --- Helper Functions ---
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getLineColor = (dist) => {
  if (dist < 500) return '#4caf50';
  if (dist < 2000) return '#8bc34a';
  if (dist < 5000) return '#ffc107';
  return '#f44336';
};

const getLineWeight = (dist) => {
  if (dist < 500) return 8;
  if (dist < 2000) return 6;
  if (dist < 5000) return 4;
  return 3;
};

const smoothLocation = (currentLat, currentLng) => {
  if (locationHistory.length === 0) {
    return { lat: currentLat, lng: currentLng };
  }
  let totalWeight = 0;
  let weightedLat = 0;
  let weightedLng = 0;
  locationHistory.forEach((loc, index) => {
    const weight = index + 1;
    weightedLat += loc.lat * weight;
    weightedLng += loc.lng * weight;
    totalWeight += weight;
  });
  weightedLat += currentLat * (locationHistory.length + 1);
  weightedLng += currentLng * (locationHistory.length + 1);
  totalWeight += locationHistory.length + 1;
  return { lat: weightedLat / totalWeight, lng: weightedLng / totalWeight };
};

// --- Map Functions ---
const updateRoute = (userLatLng) => {
  if (routeLine) routeLine.remove();
  const officeLatLng = [OFFICE_LOCATION.lat, OFFICE_LOCATION.lng];
  const dist = distance.value || 0;
  routeLine = L.polyline([userLatLng, officeLatLng], {
    color: getLineColor(dist),
    weight: getLineWeight(dist),
    opacity: 0.9,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(map);
  if (dist < 1000) routeLine.setStyle({ color: '#ffd700', weight: getLineWeight(dist) + 2 });
};

const updateUserMarker = (latLng) => {
  if (userMarker) userMarker.remove();
  const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<div class="user-pulse"><div class="pulse-ring"></div><div class="user-dot"></div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
  userMarker = L.marker(latLng, { icon: userIcon, zIndexOffset: 1000 })
    .addTo(map)
    .bindPopup('📍 موقعك الحالي')
    .openPopup();
};

const updateUserLocation = (position) => {
  const rawLat = position.coords.latitude;
  const rawLng = position.coords.longitude;
  const accuracy = position.coords.accuracy;
  const speed = position.coords.speed || 0;
  const timestamp = Date.now();

  locationAccuracy.value = accuracy;
  currentSpeed.value = speed;

  let finalLat = rawLat;
  let finalLng = rawLng;
  if (speed > 5 && accuracy > 100) {
    const smoothed = smoothLocation(rawLat, rawLng);
    finalLat = smoothed.lat;
    finalLng = smoothed.lng;
  }

  locationHistory.push({ lat: finalLat, lng: finalLng, timestamp, accuracy });
  if (locationHistory.length > 5) locationHistory.shift();

  const latLng = [finalLat, finalLng];
  userLocation.value = latLng;
  const officeLatLng = L.latLng(OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
  const userLatLng = L.latLng(finalLat, finalLng);
  distance.value = userLatLng.distanceTo(officeLatLng);

  updateUserMarker(latLng);
  updateRoute(latLng);

  if (lastLocationCoords.value && lastLocationTime.value) {
    const timeDiff = (timestamp - lastLocationTime.value) / 1000;
    if (timeDiff > 0) {
      const dist = calculateDistance(finalLat, finalLng, lastLocationCoords.value.lat, lastLocationCoords.value.lng);
      if (dist / timeDiff > 1) isMoving.value = true;
    }
  }
  lastLocationCoords.value = { lat: finalLat, lng: finalLng };
  lastLocationTime.value = timestamp;
};

const centerOnUser = () => {
  if (userLocation.value) map.setView(userLocation.value, 15);
};

const fitBounds = () => {
  if (userLocation.value) {
    const bounds = L.latLngBounds([userLocation.value[0], userLocation.value[1]], [OFFICE_LOCATION.lat, OFFICE_LOCATION.lng]);
    map.fitBounds(bounds, { padding: [50, 50] });
  } else {
    map.setView([OFFICE_LOCATION.lat, OFFICE_LOCATION.lng], 13);
  }
};

// --- Route Functions ---
const formatRouteDistance = (meters) => {
  if (meters < 1000) return `${Math.round(meters)} متر`;
  return `${(meters / 1000).toFixed(1)} كم`;
};

const formatRouteDuration = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)} ثانية`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} دقيقة`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours} ساعة ${minutes} دقيقة`;
};

const getTransportMode = (speed) => {
  const speedKmh = speed * 3.6;
  if (speedKmh < 1) return 'walking';
  if (speedKmh < 20) return 'bike';
  return 'car';
};

const findRouteWithOSRM = async (startLat, startLng, endLat, endLng) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 'Ok' && data.routes?.length > 0) {
      const route = data.routes[0];
      return { success: true, distance: route.distance, duration: route.duration, geometry: route.geometry.coordinates };
    }
    return { success: false };
  } catch (error) {
    console.error('OSRM error:', error);
    return { success: false };
  }
};

const drawOptimalRoute = (coordinates) => {
  if (routingControl) routingControl.remove();
  const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
  routingControl = L.polyline(latLngs, {
    color: '#d4af37', weight: 5, opacity: 0.9, dashArray: '5, 10', lineCap: 'round'
  }).addTo(map);
  const bounds = L.latLngBounds(latLngs);
  map.fitBounds(bounds, { padding: [50, 50] });
};

const findBestRoute = async () => {
  if (!userLocation.value) {
    alert('يرجى تحديد موقعك أولاً');
    return;
  }
  findingRoute.value = true;
  routeInfo.value = null;
  try {
    const startLat = userLocation.value[0];
    const startLng = userLocation.value[1];
    const endLat = OFFICE_LOCATION.lat;
    const endLng = OFFICE_LOCATION.lng;
    let route = await findRouteWithOSRM(startLat, startLng, endLat, endLng);
    if (route.success) {
      const transportMode = getTransportMode(currentSpeed.value);
      let modeText = transportMode === 'walking' ? '🚶 مشياً' : (transportMode === 'bike' ? '🚲 بالدراجة' : '🚗 بالسيارة');
      routeInfo.value = {
        distance: formatRouteDistance(route.distance),
        duration: formatRouteDuration(route.duration),
        description: `${modeText} - أقصر طريق ${formatRouteDistance(route.distance)}`
      };
      drawOptimalRoute(route.geometry);
    } else {
      routeInfo.value = {
        distance: formattedDistance.value,
        duration: 'غير متوفر',
        description: `📏 المسافة المباشرة: ${formattedDistance.value} (تقريبي)`
      };
      if (routeLine) {
        routeLine.setStyle({ color: '#d4af37', weight: 6 });
        setTimeout(() => routeLine.setStyle({ color: getLineColor(distance.value), weight: getLineWeight(distance.value) }), 3000);
      }
    }
  } catch (error) {
    console.error('خطأ في البحث عن الطريق:', error);
    routeInfo.value = {
      distance: formattedDistance.value,
      duration: 'غير متوفر',
      description: 'تعذر حساب الطريق الأمثل. يتم عرض المسافة المباشرة.'
    };
  } finally {
    findingRoute.value = false;
  }
};

const resetRoute = () => {
  if (routingControl) {
    routingControl.remove();
    routingControl = null;
  }
  routeInfo.value = null;
  if (userLocation.value) updateRoute(userLocation.value);
};

// --- Geolocation Tracking ---
const detectNetworkProvider = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const isp = data.org || '';
    if (isp.includes('AT') || isp.includes('Algerie Telecom')) networkProvider.value = 'AT';
    else if (isp.includes('Mobilis') || isp.includes('ATM')) networkProvider.value = 'Mobilis';
    else if (isp.includes('Djezzy') || isp.includes('Orascom')) networkProvider.value = 'Djezzy';
    else if (isp.includes('Ooredoo') || isp.includes('Wataniya')) networkProvider.value = 'Ooredoo';
    else networkProvider.value = 'unknown';
  } catch (error) {
    console.log('فشل كشف الشبكة');
    networkProvider.value = 'unknown';
  }
};

const startTracking = async () => {
  await detectNetworkProvider();
  if (!('geolocation' in navigator)) {
    console.log('المتصفح لا يدعم تحديد الموقع');
    return;
  }
  let timeout = 15000;
  if (networkProvider.value === 'Mobilis') timeout = 8000;
  else if (networkProvider.value === 'AT' || networkProvider.value === 'Djezzy' || networkProvider.value === 'Ooredoo') timeout = 10000;

  navigator.geolocation.getCurrentPosition(
    (position) => updateUserLocation(position),
    (error) => console.warn('خطأ في الحصول على الموقع:', error.message),
    { enableHighAccuracy: true, timeout: timeout, maximumAge: 0 }
  );
  watchId = navigator.geolocation.watchPosition(
    (position) => updateUserLocation(position),
    (error) => console.error('خطأ في تتبع الموقع:', error.message),
    { enableHighAccuracy: true, maximumAge: 0, timeout: timeout }
  );
};

const stopTracking = () => {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
};

// --- Map Initialization ---
const initMap = () => {
  const container = document.getElementById('leaflet-map');
  if (!container) return;
  map = L.map('leaflet-map').setView([OFFICE_LOCATION.lat, OFFICE_LOCATION.lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);
  const officeIcon = L.divIcon({
    className: 'office-marker',
    html: `<div class="office-pin"><i class="mdi mdi-domain"></i><span class="office-name">فينيل آرت</span></div>`,
    iconSize: [120, 40],
    iconAnchor: [60, 20]
  });
  officeMarker = L.marker([OFFICE_LOCATION.lat, OFFICE_LOCATION.lng], { icon: officeIcon, zIndexOffset: 500 })
    .addTo(map)
    .bindPopup(`<div class="office-popup"><strong>${OFFICE_LOCATION.name}</strong><br>${OFFICE_LOCATION.address}</div>`)
    .openPopup();
  startTracking();
};

// --- Data Fetching & Actions ---
const { 
  data: locationDataFromAPI, 
  loading: locationLoading, 
  error: locationError 
} = useLocationInfo();

const { 
  data: branchesData, 
  loading: branchesLoading, 
  error: branchesError 
} = useNearbyBranches(OFFICE_LOCATION.lat, OFFICE_LOCATION.lng, 50);

const { 
  execute: sendQuickMessageAPI, 
  loading: sendingAPI, 
  error: messageError 
} = useSendQuickMessage();

// Computed properties
const loadingAPI = computed(() => locationLoading.value || branchesLoading.value);
const nearbyBranchesFromAPI = computed(() => branchesData?.nearbyBranches || []);

const loadLocationData = async () => {
  // GraphQL composables handle automatic data fetching
  console.log('📍 Location data loaded via GraphQL');
};

const openDirections = () => {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${OFFICE_LOCATION.lat},${OFFICE_LOCATION.lng}`, '_blank');
};

const openDirectionsToBranch = (branch) => {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${branch.coordinates?.lat},${branch.coordinates?.lng}`, '_blank');
};

const shareLocation = async () => {
  try {
    const address = `${locationData.value.address?.street}, ${locationData.value.address?.city}`;
    const shareData = {
      title: t('shareLocation') || 'موقع Paclos',
      text: `${t('visitUsAt') || 'زورنا في'}: ${address}`,
      url: window.location.href
    };
    if (navigator.share) await navigator.share(shareData);
    else await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
  } catch (error) {
    console.error('❌ Error sharing location:', error);
  }
};

const sendQuickMessage = async () => {
  if (!isFormValid.value) return;
  
  try {
    // Use GraphQL mutation
    const result = await sendQuickMessage({
      name: quickForm.name, 
      phone: quickForm.phone, 
      type: 'quick_contact', 
      source: 'location_page'
    });
    
    if (result?.sendQuickMessage?.success) {
      // Reset form
      quickForm.name = '';
      quickForm.phone = '';
      showQuickForm.value = false;
      
      // Show success message
      alert('تم إرسال رسالتك بنجاح!');
    } else {
      alert('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    }
  } catch (error) {
    console.error('❌ Error sending quick message:', error);
    alert('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
  }
};

// --- Lifecycle ---
onMounted(async () => {
  await loadLocationData();
  await nextTick();
  initMap();
});

onUnmounted(() => {
  stopTracking();
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.google-map-section {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface-variant), 0.8), rgba(var(--v-theme-primary), 0.05));
}

.map-container {
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

/* Distance Card */
.distance-card {
  transition: all 0.3s ease;
  border-right: 4px solid;
}
.distance-card.distance-very-close { border-right-color: #4caf50; background: rgba(76, 175, 80, 0.1); }
.distance-card.distance-close { border-right-color: #8bc34a; background: rgba(139, 195, 74, 0.1); }
.distance-card.distance-medium { border-right-color: #ffc107; background: rgba(255, 193, 7, 0.1); }
.distance-card.distance-far { border-right-color: #f44336; background: rgba(244, 67, 54, 0.1); }

/* Network Info Card */
.network-info-card {
  background: rgba(var(--v-theme-surface), 0.7);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

/* Contact Card */
.contact-info-card {
  background: rgba(var(--v-theme-surface), 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}
.contact-item { transition: transform 0.3s ease; }
.contact-item:hover { transform: translateX(4px); }

/* Quick Contact Card */
.quick-contact-card {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

/* Nearby Branches */
.nearby-branches-card {
  background: rgba(var(--v-theme-surface), 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}
.branch-card {
  transition: all 0.3s ease;
}
.branch-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Route Info Card */
.route-info-card {
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
}

/* Custom Leaflet Markers */
.office-pin {
  background: #d4af37;
  color: #1a1a2e;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.user-marker { position: relative; }
.user-pulse { position: relative; width: 30px; height: 30px; }
.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(33, 150, 243, 0.4);
  border-radius: 50%;
  animation: pulse 1.5s ease-out infinite;
}
.user-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #2196f3;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}
@keyframes pulse {
  0% { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}
.office-popup { text-align: center; font-family: inherit; }

/* RTL Support */
[dir="rtl"] .distance-card { border-right: none; border-left: 4px solid; }
[dir="rtl"] .contact-item:hover { transform: translateX(-4px); }

/* Responsive */
@media (max-width: 960px) { .map-wrapper { height: 300px; } }
@media (max-width: 600px) {
  .google-map-section { padding: 2rem 0; }
  .map-wrapper { height: 250px; }
  .distance-card .text-h5 { font-size: 1.25rem; }
}
</style>
