<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon color="primary" size="32" class="me-3">mdi-map-marker-multiple</v-icon>
            <div>
              <h1 class="text-h5 font-weight-bold mb-0">لوحة تتبع مواقع العملاء</h1>
              <p class="text-caption text-medium-emphasis mt-1 mb-0">
                آخر تحديث: {{ lastUpdateTime }}
              </p>
            </div>
          </div>
          <v-chip color="primary" variant="tonal" class="font-weight-bold">
            <v-icon start size="16">mdi-account-search</v-icon>
            {{ customerSearchCount }} عملية بحث
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <!-- Customer Search Card -->
    <v-card variant="elevated" class="mb-6">
      <v-card-title class="pa-4">
        <v-icon color="primary" class="me-2">mdi-account-search</v-icon>
        البحث عن موقع الزبون
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="customerPhone"
              label="رقم هاتف الزبون"
              placeholder="أدخل رقم الهاتف (10 أرقام)"
              prepend-inner-icon="mdi-phone"
              clearable
              @click:clear="clearCustomerLocation"
              @keyup.enter="searchCustomerLocation"
              variant="outlined"
              :loading="searching"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              @click="searchCustomerLocation"
              :loading="searching"
              :disabled="!customerPhone || customerPhone.length < 10"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-magnify"
              block
              size="large"
            >
              {{ searching ? 'جاري البحث...' : 'تحديد الموقع' }}
            </v-btn>
          </v-col>
        </v-row>
        
        <!-- Customer Alert -->
        <v-alert
          v-if="customerAlert.show"
          :type="customerAlert.type"
          :text="customerAlert.message"
          closable
          @click:close="customerAlert.show = false"
          class="mt-4"
        >
          <template v-if="customerAlert.location" v-slot:append>
            <v-btn
              @click="centerOnCustomer"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-crosshairs-gps"
              size="small"
            >
              عرض على الخريطة
            </v-btn>
          </template>
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Location Sharing Card -->
    <v-card variant="elevated" class="mb-6">
      <v-card-title class="pa-4">
        <v-icon color="success" class="me-2">mdi-share-variant</v-icon>
        مشاركة موقع الزبون
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="customerPhoneForShare"
              label="رقم هاتف الزبون"
              placeholder="أدخل رقم الهاتف (10 أرقام)"
              prepend-inner-icon="mdi-phone"
              variant="outlined"
              density="compact"
              :error="phoneShareError"
              :error-messages="phoneShareErrorMsg"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn
              @click="sendLocationRequest"
              color="success"
              variant="elevated"
              prepend-icon="mdi-whatsapp"
              block
              :disabled="!customerPhoneForShare || customerPhoneForShare.length < 10 || sendingWhatsApp"
              :loading="sendingWhatsApp"
            >
              إرسال عبر WhatsApp
            </v-btn>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              @click="generateShareLinkOnly"
              color="info"
              variant="tonal"
              prepend-icon="mdi-link-variant"
              block
              :disabled="!customerPhoneForShare || customerPhoneForShare.length < 10"
            >
              إنشاء رابط فقط
            </v-btn>
          </v-col>
        </v-row>
        
        <v-expand-transition>
          <v-card v-if="shareLink" variant="tonal" class="mt-4 pa-3">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon color="info" class="me-2">mdi-link-variant</v-icon>
                <span class="text-caption font-weight-medium">رابط مشاركة الموقع:</span>
              </div>
              <div class="d-flex align-center ga-2">
                <v-text-field
                  :model-value="shareLink"
                  readonly
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="share-link-input"
                />
                <v-btn
                  @click="copyShareLink"
                  icon="mdi-content-copy"
                  size="small"
                  variant="tonal"
                  color="primary"
                />
              </div>
            </div>
            <div class="text-caption text-medium-emphasis mt-2">
              ⏱️ الرابط صالح لمدة {{ linkExpiryMinutes }} دقيقة
            </div>
          </v-card>
        </v-expand-transition>
        
        <!-- Pending Requests -->
        <v-card v-if="pendingRequests.length > 0" variant="outlined" class="mt-4">
          <v-card-title class="pa-3 text-subtitle-1">
            <v-icon size="20" class="me-2">mdi-clock-outline</v-icon>
            طلبات مشاركة موقع قيد الانتظار
          </v-card-title>
          <v-divider />
          <v-list density="compact">
            <v-list-item v-for="req in pendingRequests" :key="req.id">
              <template v-slot:prepend>
                <v-avatar size="32" color="warning" variant="tonal">
                  <v-icon size="18">mdi-whatsapp</v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="text-body-2">
                {{ req.phone }}
              </v-list-item-title>
              
              <v-list-item-subtitle class="text-caption">
                تم الإرسال: {{ formatTime(req.timestamp) }}
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <v-btn
                  @click="resendLocationRequest(req)"
                  icon="mdi-reload"
                  size="small"
                  variant="text"
                  color="primary"
                />
                <v-btn
                  @click="cancelLocationRequest(req.id)"
                  icon="mdi-close"
                  size="small"
                  variant="text"
                  color="error"
                />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-card-text>
    </v-card>

    <!-- Map and Tools -->
    <v-row>
      <v-col cols="12" lg="8">
        <!-- Map Container -->
        <v-card variant="elevated" class="mb-4">
          <div id="map" class="map-wrapper"></div>
          
          <!-- Map Controls -->
          <v-card-actions class="pa-2 bg-surface-variant">
            <v-btn
              @click="centerOnUser"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-crosshairs-gps"
              size="small"
            >
              موقعي
            </v-btn>
            
            <v-btn
              @click="findBestRoute"
              :loading="findingRoute"
              variant="tonal"
              color="success"
              prepend-icon="mdi-routes"
              size="small"
            >
              أقصر طريق
            </v-btn>
            
            <v-btn
              @click="fitBounds"
              variant="tonal"
              color="info"
              prepend-icon="mdi-fit-to-page"
              size="small"
            >
              عرض الكل
            </v-btn>
            
            <v-btn
              v-if="routeInfo"
              @click="resetRoute"
              variant="tonal"
              color="warning"
              prepend-icon="mdi-close"
              size="small"
            >
              إلغاء المسار
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Route Info -->
        <v-card v-if="routeInfo" variant="outlined" class="mb-4">
          <v-card-text class="pa-3">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon color="success" size="20" class="me-2">mdi-routes</v-icon>
                <span class="font-weight-bold">معلومات المسار</span>
              </div>
              <div class="d-flex align-center">
                <v-icon size="16" class="me-1">mdi-clock</v-icon>
                <span class="text-caption">{{ routeInfo.duration }}</span>
                <span class="mx-2">|</span>
                <v-icon size="16" class="me-1">mdi-ruler</v-icon>
                <span class="text-caption">{{ routeInfo.distance }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Distance Card -->
        <v-card variant="elevated" :class="distanceCardClass">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <div>
                <div class="text-caption text-medium-emphasis">المسافة إلى المقر</div>
                <div class="text-h3 font-weight-bold">{{ formattedDistance }}</div>
              </div>
              <v-chip :color="distanceChipColor" variant="tonal" size="large">
                {{ distanceStatus }}
              </v-chip>
            </div>
            
            <v-progress-linear
              :model-value="distanceProgress"
              :color="distanceColor"
              height="8"
              rounded
              class="mb-2"
            />
          </v-card-text>
        </v-card>

        <!-- Quick Stats for Manager -->
        <v-card variant="tonal" class="mt-4">
          <v-card-text class="pa-3">
            <v-row dense>
              <v-col cols="4" class="text-center">
                <div class="text-h5 font-weight-bold text-primary">{{ searchHistory.length }}</div>
                <div class="text-caption">عمليات بحث</div>
              </v-col>
              <v-col cols="4" class="text-center">
                <div class="text-h5 font-weight-bold text-success">{{ foundCustomersCount }}</div>
                <div class="text-caption">عملاء تم تحديدهم</div>
              </v-col>
              <v-col cols="4" class="text-center">
                <div class="text-h5 font-weight-bold" :class="avgDistanceColor">{{ avgDistanceText }}</div>
                <div class="text-caption">متوسط المسافة</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <!-- Search History for Manager -->
        <v-card variant="elevated" class="h-100">
          <v-card-title class="pa-4">
            <v-icon color="primary" class="me-2">mdi-history</v-icon>
            آخر عمليات البحث
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-0">
            <v-list lines="two" density="compact">
              <v-list-item
                v-for="(item, index) in searchHistory"
                :key="index"
                @click="viewPreviousSearch(item)"
                class="cursor-pointer"
              >
                <template v-slot:prepend>
                  <v-avatar :color="item.found ? 'success' : 'grey'" size="36" class="me-3">
                    <v-icon size="20">{{ item.found ? 'mdi-account-check' : 'mdi-account-question' }}</v-icon>
                  </v-avatar>
                </template>
                
                <v-list-item-title class="font-weight-medium">
                  {{ item.phone }}
                </v-list-item-title>
                
                <v-list-item-subtitle>
                  <div class="d-flex align-center">
                    <v-icon size="12" class="me-1">mdi-map-marker</v-icon>
                    <span class="text-caption">{{ item.address || (item.found ? 'موقع محدد' : 'لم يتم تحديد') }}</span>
                    <span v-if="item.distanceText" class="mx-1">•</span>
                    <span v-if="item.distanceText" class="text-caption">{{ item.distanceText }}</span>
                  </div>
                </v-list-item-subtitle>
                
                <template v-slot:append>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatTime(item.timestamp) }}
                  </div>
                </template>
              </v-list-item>
              
              <v-list-item v-if="searchHistory.length === 0">
                <div class="text-center pa-6">
                  <v-icon size="48" color="grey-lighten-1">mdi-history</v-icon>
                  <p class="text-caption mt-2">لا توجد عمليات بحث سابقة</p>
                </div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Configuration
const OFFICE_LOCATION = {
  lat: 36.7538,
  lng: 3.0588,
  name: 'فينيل آرت - المقر الرئيسي',
  address: 'الجزائر العاصمة، الجزائر'
};

// Map Variables
let map = null;
let userMarker = null;
let officeMarker = null;
let routeLine = null;
let routingControl = null;
let customerMarker = null;
let watchId = null;
let locationListeners = {};

// State
const searching = ref(false);
const findingRoute = ref(false);
const sendingWhatsApp = ref(false);
const customerPhone = ref('');
const customerPhoneForShare = ref('');
const userLocation = ref(null);
const distance = ref(null);
const routeInfo = ref(null);
const customerLocation = ref(null);
const searchHistory = ref([]);
const customerSearchCount = ref(0);
const lastUpdateTime = ref('');
const shareLink = ref('');
const phoneShareError = ref(false);
const phoneShareErrorMsg = ref('');
const pendingRequests = ref([]);
const linkExpiryMinutes = ref(30);

const customerAlert = ref({
  show: false,
  type: 'info',
  message: '',
  location: null
});

// Computed Properties
const formattedDistance = computed(() => {
  if (!distance.value) return '--';
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

const distanceStatus = computed(() => {
  if (!distance.value) return 'جاري التحديد';
  if (distance.value < 500) return 'قريب جداً';
  if (distance.value < 2000) return 'قريب';
  if (distance.value < 5000) return 'متوسط';
  return 'بعيد';
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

const foundCustomersCount = computed(() => {
  return searchHistory.value.filter(item => item.found).length;
});

const avgDistanceText = computed(() => {
  const foundCustomers = searchHistory.value.filter(item => item.found && item.distance);
  if (foundCustomers.length === 0) return '--';
  
  const avgDistance = foundCustomers.reduce((sum, item) => sum + item.distance, 0) / foundCustomers.length;
  
  if (avgDistance < 1000) return `${Math.round(avgDistance)}م`;
  return `${(avgDistance / 1000).toFixed(1)}كم`;
});

const avgDistanceColor = computed(() => {
  const foundCustomers = searchHistory.value.filter(item => item.found && item.distance);
  if (foundCustomers.length === 0) return 'text-grey';
  
  const avgDistance = foundCustomers.reduce((sum, item) => sum + item.distance, 0) / foundCustomers.length;
  
  if (avgDistance < 500) return 'text-success';
  if (avgDistance < 2000) return 'text-success';
  if (avgDistance < 5000) return 'text-warning';
  return 'text-error';
});

// Helper Functions
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'الآن';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} د`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} س`;
  return date.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
};

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

const updateRoute = (userLatLng) => {
  if (routeLine) routeLine.remove();
  const officeLatLng = [OFFICE_LOCATION.lat, OFFICE_LOCATION.lng];
  routeLine = L.polyline([userLatLng, officeLatLng], {
    color: distanceColor.value,
    weight: 4,
    opacity: 0.8,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(map);
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
    .bindPopup('📍 موقعي الحالي');
};

const updateUserLocation = (position) => {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  
  const latLng = [lat, lng];
  userLocation.value = latLng;
  
  const officeLatLng = L.latLng(OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
  const userLatLng = L.latLng(lat, lng);
  distance.value = userLatLng.distanceTo(officeLatLng);
  
  updateUserMarker(latLng);
  updateRoute(latLng);
};

const startTracking = () => {
  if (!('geolocation' in navigator)) {
    console.log('المتصفح لا يدعم تحديد الموقع');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => updateUserLocation(position),
    (error) => console.warn('خطأ:', error.message),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
  
  watchId = navigator.geolocation.watchPosition(
    (position) => updateUserLocation(position),
    (error) => console.error('خطأ:', error.message),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  );
};

const addCustomerMarker = (lat, lng, accuracy, phone, address) => {
  if (customerMarker) {
    if (customerMarker.accuracyCircle) customerMarker.accuracyCircle.remove();
    customerMarker.remove();
  }
  
  const customerIcon = L.divIcon({
    className: 'customer-marker',
    html: `<div class="customer-pulse"><div class="customer-ring"></div><div class="customer-dot"><i class="mdi mdi-account"></i></div></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
  
  customerMarker = L.marker([lat, lng], { icon: customerIcon, zIndexOffset: 900 })
    .addTo(map)
    .bindPopup(`
      <div style="text-align: center; direction: rtl;">
        <strong>📍 موقع الزبون</strong><br>
        <strong>📞 ${phone}</strong><br>
        ${address ? `🏠 ${address}<br>` : ''}
      </div>
    `)
    .openPopup();
  
  const accuracyCircle = L.circle([lat, lng], {
    color: '#ff6b6b',
    fillColor: '#ff6b6b',
    fillOpacity: 0.2,
    radius: accuracy,
    weight: 1
  }).addTo(map);
  
  customerMarker.accuracyCircle = accuracyCircle;
  map.setView([lat, lng], 13);
};

const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
    const data = await response.json();
    return data.display_name?.split(',')[0] || 'تم تحديد الموقع';
  } catch (error) {
    return 'تم تحديد الموقع';
  }
};

// Generate unique share ID
const generateShareId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

// Save share request
const saveShareRequest = (shareId, phone) => {
  const requests = JSON.parse(localStorage.getItem('location_requests') || '{}');
  requests[shareId] = { 
    phone, 
    status: 'pending', 
    timestamp: Date.now(),
    expiry: Date.now() + (linkExpiryMinutes.value * 60 * 1000)
  };
  localStorage.setItem('location_requests', JSON.stringify(requests));
  
  // Add to pending requests
  pendingRequests.value.unshift({
    id: shareId,
    phone: phone,
    timestamp: Date.now()
  });
  
  // Auto remove after expiry
  setTimeout(() => {
    cancelLocationRequest(shareId);
  }, linkExpiryMinutes.value * 60 * 1000);
};

// Listen for location share
const listenForLocationShare = (shareId, phone) => {
  // Clear existing listener
  if (locationListeners[shareId]) {
    clearInterval(locationListeners[shareId]);
  }
  
  const interval = setInterval(() => {
    const requests = JSON.parse(localStorage.getItem('location_requests') || '{}');
    const request = requests[shareId];
    
    if (request && request.status === 'shared' && request.location) {
      clearInterval(interval);
      delete locationListeners[shareId];
      
      // Calculate distance
      const distanceToOffice = calculateDistance(request.location.lat, request.location.lng, 
                                                  OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
      const distanceText = distanceToOffice < 1000 ? `${Math.round(distanceToOffice)}م` : `${(distanceToOffice / 1000).toFixed(1)}كم`;
      
      // Save customer location
      customerLocation.value = {
        found: true,
        phone: phone,
        lat: request.location.lat,
        lng: request.location.lng,
        accuracy: request.location.accuracy || 50,
        address: request.location.address || 'موقع محدد',
        distance: distanceToOffice,
        distanceText: distanceText,
        timestamp: Date.now()
      };
      
      // Add to search history
      searchHistory.value.unshift({
        phone: phone,
        address: request.location.address,
        distance: distanceToOffice,
        distanceText: distanceText,
        found: true,
        timestamp: Date.now()
      });
      
      if (searchHistory.value.length > 10) searchHistory.value.pop();
      customerSearchCount.value++;
      lastUpdateTime.value = new Date().toLocaleTimeString('ar');
      customerPhone.value = phone;
      
      addCustomerMarker(request.location.lat, request.location.lng, request.location.accuracy, 
                       phone, request.location.address);
      
      customerAlert.value = {
        show: true,
        type: 'success',
        message: `✅ استلمنا موقع الزبون ${phone}! (${distanceText})`,
        location: request.location
      };
      
      // Remove from pending requests
      const index = pendingRequests.value.findIndex(r => r.id === shareId);
      if (index !== -1) pendingRequests.value.splice(index, 1);
    }
  }, 2000);
  
  locationListeners[shareId] = interval;
};

// Generate share link
const generateShareLinkOnly = () => {
  if (!customerPhoneForShare.value || customerPhoneForShare.value.length < 10) {
    phoneShareError.value = true;
    phoneShareErrorMsg.value = 'يرجى إدخال رقم هاتف صحيح (10 أرقام)';
    return;
  }
  
  phoneShareError.value = false;
  const shareId = generateShareId();
  const fullShareLink = `${window.location.origin}/customer-share/${shareId}`;
  
  saveShareRequest(shareId, customerPhoneForShare.value);
  listenForLocationShare(shareId, customerPhoneForShare.value);
  
  shareLink.value = fullShareLink;
  
  customerAlert.value = {
    show: true,
    type: 'info',
    message: `✅ تم إنشاء رابط المشاركة للرقم ${customerPhoneForShare.value}`,
    location: null
  };
};

// Send via WhatsApp
const sendLocationRequest = async () => {
  if (!customerPhoneForShare.value || customerPhoneForShare.value.length < 10) {
    phoneShareError.value = true;
    phoneShareErrorMsg.value = 'يرجى إدخال رقم هاتف صحيح (10 أرقام)';
    return;
  }
  
  sendingWhatsApp.value = true;
  phoneShareError.value = false;
  
  try {
    const shareId = generateShareId();
    const fullShareLink = `${window.location.origin}/customer-share/${shareId}`;
    
    saveShareRequest(shareId, customerPhoneForShare.value);
    listenForLocationShare(shareId, customerPhoneForShare.value);
    
    shareLink.value = fullShareLink;
    
    const message = encodeURIComponent(
      `السلام عليكم، نود معرفة موقعك الحالي لتسهيل عملية التوصيل.\n\n` +
      `يرجى الضغط على الرابط التالي لمشاركة موقعك:\n${fullShareLink}\n\n` +
      `الرابط صالح لمدة ${linkExpiryMinutes.value} دقيقة فقط.\n\n` +
      `شكراً لتعاونك.`
    );
    
    window.open(`https://wa.me/${customerPhoneForShare.value}?text=${message}`, '_blank');
    
    customerAlert.value = {
      show: true,
      type: 'success',
      message: `✅ تم فتح WhatsApp للرقم ${customerPhoneForShare.value}. انتظر مشاركة الموقع.`,
      location: null
    };
  } catch (error) {
    console.error('WhatsApp error:', error);
    customerAlert.value = {
      show: true,
      type: 'error',
      message: 'حدث خطأ في فتح WhatsApp',
      location: null
    };
  } finally {
    sendingWhatsApp.value = false;
  }
};

// Resend location request
const resendLocationRequest = (request) => {
  customerPhoneForShare.value = request.phone;
  sendLocationRequest();
};

// Cancel location request
const cancelLocationRequest = (shareId) => {
  const requests = JSON.parse(localStorage.getItem('location_requests') || '{}');
  if (requests[shareId]) {
    delete requests[shareId];
    localStorage.setItem('location_requests', JSON.stringify(requests));
  }
  
  if (locationListeners[shareId]) {
    clearInterval(locationListeners[shareId]);
    delete locationListeners[shareId];
  }
  
  const index = pendingRequests.value.findIndex(r => r.id === shareId);
  if (index !== -1) pendingRequests.value.splice(index, 1);
  
  if (shareLink.value.includes(shareId)) {
    shareLink.value = '';
  }
};

// Copy share link
const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    customerAlert.value = {
      show: true,
      type: 'success',
      message: '✅ تم نسخ الرابط إلى الحافظة',
      location: null
    };
  } catch (error) {
    customerAlert.value = {
      show: true,
      type: 'error',
      message: 'فشل نسخ الرابط',
      location: null
    };
  }
};

// Search customer location (from saved history)
const searchCustomerLocation = async () => {
  if (!customerPhone.value || customerPhone.value.length < 10) {
    customerAlert.value = {
      show: true,
      type: 'warning',
      message: 'يرجى إدخال رقم هاتف صحيح (10 أرقام على الأقل)'
    };
    return;
  }
  
  searching.value = true;
  
  try {
    // Check if location exists in localStorage
    const requests = JSON.parse(localStorage.getItem('location_requests') || '{}');
    let foundLocation = null;
    
    for (const [shareId, request] of Object.entries(requests)) {
      if (request.phone === customerPhone.value && request.status === 'shared' && request.location) {
        foundLocation = request.location;
        break;
      }
    }
    
    if (foundLocation) {
      const distanceToOffice = calculateDistance(foundLocation.lat, foundLocation.lng, 
                                                  OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
      const distanceText = distanceToOffice < 1000 ? `${Math.round(distanceToOffice)}م` : `${(distanceToOffice / 1000).toFixed(1)}كم`;
      
      customerLocation.value = {
        found: true,
        phone: customerPhone.value,
        lat: foundLocation.lat,
        lng: foundLocation.lng,
        accuracy: foundLocation.accuracy || 50,
        address: foundLocation.address || 'موقع محدد',
        distance: distanceToOffice,
        distanceText: distanceText,
        timestamp: Date.now()
      };
      
      addCustomerMarker(foundLocation.lat, foundLocation.lng, foundLocation.accuracy, 
                       customerPhone.value, foundLocation.address);
      
      customerAlert.value = {
        show: true,
        type: 'success',
        message: `✅ تم تحديد موقع الزبون: ${customerPhone.value} (${distanceText})`,
        location: foundLocation
      };
    } else {
      // Offer to send share request
      customerAlert.value = {
        show: true,
        type: 'info',
        message: `⚠️ لا يوجد موقع محفوظ للرقم ${customerPhone.value}. هل تريد إرسال طلب مشاركة موقع؟`,
        location: null
      };
      
      customerPhoneForShare.value = customerPhone.value;
    }
    
  } catch (error) {
    console.error('Error:', error);
    customerAlert.value = {
      show: true,
      type: 'error',
      message: 'حدث خطأ في البحث عن الموقع',
      location: null
    };
  } finally {
    searching.value = false;
  }
};

const clearCustomerLocation = () => {
  if (customerMarker) {
    if (customerMarker.accuracyCircle) customerMarker.accuracyCircle.remove();
    customerMarker.remove();
    customerMarker = null;
  }
  customerLocation.value = null;
  customerAlert.value.show = false;
  customerPhone.value = '';
};

const viewPreviousSearch = (item) => {
  customerPhone.value = item.phone;
  searchCustomerLocation();
};

const centerOnUser = () => {
  if (userLocation.value) map.setView(userLocation.value, 15);
};

const centerOnCustomer = () => {
  if (customerLocation.value) {
    map.setView([customerLocation.value.lat, customerLocation.value.lng], 13);
    if (customerMarker) customerMarker.openPopup();
  }
};

const fitBounds = () => {
  if (userLocation.value && customerLocation.value) {
    const bounds = L.latLngBounds(
      [userLocation.value[0], userLocation.value[1]],
      [customerLocation.value.lat, customerLocation.value.lng]
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  } else if (userLocation.value) {
    map.setView(userLocation.value, 13);
  } else if (customerLocation.value) {
    map.setView([customerLocation.value.lat, customerLocation.value.lng], 13);
  } else {
    map.setView([OFFICE_LOCATION.lat, OFFICE_LOCATION.lng], 12);
  }
};

const findBestRoute = async () => {
  if (!userLocation.value || !customerLocation.value) {
    customerAlert.value = {
      show: true,
      type: 'warning',
      message: 'يرجى تحديد موقعك وموقع الزبون أولاً'
    };
    return;
  }
  
  findingRoute.value = true;
  
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.value[1]},${userLocation.value[0]};${customerLocation.value.lng},${customerLocation.value.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes?.length > 0) {
      const route = data.routes[0];
      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationMin = Math.round(route.duration / 60);
      
      routeInfo.value = {
        distance: `${distanceKm} كم`,
        duration: `${durationMin} دقيقة`,
        description: `🚗 المسافة بين موقعي والزبون: ${distanceKm} كم`
      };
      
      if (routingControl) routingControl.remove();
      
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      routingControl = L.polyline(coordinates, {
        color: '#d4af37',
        weight: 5,
        opacity: 0.9,
        dashArray: '5, 10'
      }).addTo(map);
      
      map.fitBounds(routingControl.getBounds(), { padding: [50, 50] });
    }
  } catch (error) {
    console.error('Route error:', error);
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

const initMap = () => {
  map = L.map('map').setView([OFFICE_LOCATION.lat, OFFICE_LOCATION.lng], 12);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  }).addTo(map);
  
  const officeIcon = L.divIcon({
    className: 'office-marker',
    html: `<div class="office-pin"><i class="mdi mdi-domain"></i><span class="office-name">المقر</span></div>`,
    iconSize: [70, 30],
    iconAnchor: [35, 15]
  });
  
  officeMarker = L.marker([OFFICE_LOCATION.lat, OFFICE_LOCATION.lng], { icon: officeIcon, zIndexOffset: 500 })
    .addTo(map)
    .bindPopup('📍 المقر الرئيسي');
  
  startTracking();
};

// Load saved requests on mount
const loadSavedRequests = () => {
  const requests = JSON.parse(localStorage.getItem('location_requests') || '{}');
  const now = Date.now();
  
  for (const [shareId, request] of Object.entries(requests)) {
    if (request.status === 'pending' && request.expiry > now) {
      pendingRequests.value.unshift({
        id: shareId,
        phone: request.phone,
        timestamp: request.timestamp
      });
      listenForLocationShare(shareId, request.phone);
    } else if (request.expiry <= now) {
      delete requests[shareId];
    }
  }
  
  localStorage.setItem('location_requests', JSON.stringify(requests));
};

// Lifecycle
onMounted(() => {
  lastUpdateTime.value = new Date().toLocaleTimeString('ar');
  loadSavedRequests();
  
  const leafletCSS = document.createElement('link');
  leafletCSS.rel = 'stylesheet';
  leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(leafletCSS);
  
  const leafletJS = document.createElement('script');
  leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  leafletJS.onload = initMap;
  document.head.appendChild(leafletJS);
});

onUnmounted(() => {
  if (watchId) navigator.geolocation.clearWatch(watchId);
  
  for (const [shareId, interval] of Object.entries(locationListeners)) {
    clearInterval(interval);
  }
});
</script>

<style scoped>
.map-wrapper {
  height: 450px;
  width: 100%;
  position: relative;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.distance-very-close {
  border-right: 4px solid #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.distance-close {
  border-right: 4px solid #8bc34a;
  background: rgba(139, 195, 74, 0.05);
}

.distance-medium {
  border-right: 4px solid #ffc107;
  background: rgba(255, 193, 7, 0.05);
}

.distance-far {
  border-right: 4px solid #f44336;
  background: rgba(244, 67, 54, 0.05);
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background: rgba(0, 0, 0, 0.05);
}

.share-link-input {
  min-width: 300px;
  font-size: 12px;
}

.user-pulse {
  position: relative;
  width: 30px;
  height: 30px;
}

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
}

.customer-pulse {
  position: relative;
  width: 40px;
  height: 40px;
}

.customer-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 107, 107, 0.4);
  border-radius: 50%;
  animation: customerPulse 1.5s ease-out infinite;
}

.customer-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  background: #ff6b6b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  color: white;
  font-size: 16px;
}

.office-pin {
  background: #d4af37;
  color: #1a1a2e;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}

@keyframes pulse {
  0% { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes customerPulse {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0; }
}

@media (max-width: 960px) {
  .map-wrapper { height: 350px; }
  .share-link-input { min-width: 200px; }
}

@media (max-width: 600px) {
  .map-wrapper { height: 300px; }
  .share-link-input { min-width: 150px; }
}
</style>
