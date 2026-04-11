<template>
  <v-main class="addresses-page">
    <!-- Background Effects -->
    <div class="bg-effects">
      <v-overlay 
        v-model="overlayActive" 
        class="gradient-overlay" 
        persistent 
        opacity="0.1"
      />
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>

    <v-container>
      <v-card class="glass-card" elevation="8">
        <!-- Header -->
        <v-card-title class="pa-6">
          <v-row align="center" justify="space-between">
            <v-col>
              <div class="header-content">
                <h1 class="text-h4 font-weight-bold mb-2">
                  <v-icon class="me-2">mdi-map-marker</v-icon>
                  العناوين
                </h1>
                <p class="text-body-1 text-medium-emphasis">إدارة عناوين الشحن والتوصيل</p>
              </div>
            </v-col>
            <v-col cols="auto">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="showAddForm = true"
              >
                إضافة عنوان
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>

        <v-divider />

        <!-- Addresses List -->
        <v-card-text class="pa-6">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <v-progress-circular
              indeterminate
              color="primary"
              size="48"
              class="mb-4"
            />
            <p class="text-body-1 text-medium-emphasis">جاري تحميل العناوين...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="addresses.length === 0" class="text-center py-12">
            <v-icon size="80" color="primary" class="mb-4">mdi-map-marker</v-icon>
            <h3 class="text-h5 mb-2">لا توجد عناوين</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">لم تقم بإضافة أي عناوين بعد</p>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showAddForm = true"
            >
              إضافة أول عنوان
            </v-btn>
          </div>

          <!-- Addresses Grid -->
          <v-row v-else>
            <v-col 
              v-for="address in addresses" 
              :key="address.id" 
              cols="12" 
              md="6"
              lg="4"
            >
              <v-card 
                class="address-card h-100"
                :class="{ 'default-address': address.isDefault }"
                elevation="2"
                hover
              >
                <v-card-title class="d-flex align-center justify-space-between">
                  <div>
                    <h3 class="text-h6">{{ address.title }}</h3>
                    <p class="text-body-2 text-medium-emphasis">{{ address.name }}</p>
                  </div>
                  <div class="d-flex gap-1">
                    <v-btn
                      v-if="!address.isDefault"
                      size="small"
                      variant="text"
                      color="warning"
                      @click="setDefault(address.id)"
                    >
                      <v-icon>mdi-star</v-icon>
                      افتراضي
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="text"
                      @click="editAddress(address)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteAddress(address.id)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-card-title>

                <v-divider />

                <v-card-text>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-account</v-icon>
                      </template>
                      <v-list-item-title>{{ address.name }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-phone</v-icon>
                      </template>
                      <v-list-item-title>{{ address.phone }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-map-marker</v-icon>
                      </template>
                      <v-list-item-title>{{ address.fullAddress }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="address.instructions">
                      <template v-slot:prepend>
                        <v-icon>mdi-information</v-icon>
                      </template>
                      <v-list-item-title>{{ address.instructions }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>

                <v-card-actions v-if="address.isDefault">
                  <v-chip color="warning" variant="tonal" size="small">
                    <v-icon start>mdi-star</v-icon>
                    العنوان الافتراضي
                  </v-chip>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Add/Edit Address Dialog -->
    <v-dialog v-model="showAddForm" max-width="600" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editingAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد' }}</span>
        </v-card-title>
        
        <v-card-text>
          <v-form ref="addressForm" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="addressForm.title"
                  label="عنوان العنوان"
                  placeholder:="مثلاً: المنزل، العمل"
                  variant="outlined"
                  :rules="[v => !!v || 'هذا الحقل مطلوب']"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="addressForm.name"
                  label="الاسم الكامل"
                  variant="outlined"
                  :rules="[v => !!v || 'هذا الحقل مطلوب']"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="addressForm.phone"
                  label="رقم الهاتف"
                  variant="outlined"
                  :rules="[v => !!v || 'هذا الحقل مطلوب']"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="addressForm.streetAddress"
                  label="عنوان الشارع"
                  variant="outlined"
                  :rules="[v => !!v || 'هذا الحقل مطلوب']"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="addressForm.city"
                  label="المدينة"
                  variant="outlined"
                  :rules="[v => !!v || 'هذا الحقل مطلوب']"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="addressForm.postalCode"
                  label="الرمز البريدي"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="addressForm.instructions"
                  label="تعليمات التوصيل (اختياري)"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeForm">إلغاء</v-btn>
          <v-btn 
            color="primary" 
            @click="saveAddress"
            :loading="saving"
            :disabled="!formValid"
          >
            {{ editingAddress ? 'تحديث' : 'حفظ' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
<script setup>
import { ref, reactive, onMounted } from 'vue';

// Reactive data
const overlayActive = ref(true);
const loading = ref(false);
const saving = ref(false);
const showAddForm = ref(false);
const editingAddress = ref(null);
const formValid = ref(false);
const addressForm = ref(null);

const addresses = ref([
  {
    id: 1,
    title: 'المنزل',
    name: 'أحمد محمد',
    phone: '0551234567',
    streetAddress: 'شارع النخالة، بناية 12',
    city: 'الجزائر',
    postalCode: '16000',
    fullAddress: 'شارع النخالة، بناية 12، الجزائر',
    instructions: 'الطابق الثالث، شقة رقم 8',
    isDefault: true
  },
  {
    id: 2,
    title: 'العمل',
    name: 'أحمد محمد',
    phone: '0559876543',
    streetAddress: 'شارع الحرية، مركز الأعمال',
    city: 'الجزائر',
    postalCode: '16000',
    fullAddress: 'شارع الحرية، مركز الأعمال، الجزائر',
    instructions: 'الاستقبال الأرضي',
    isDefault: false
  }
]);

const addressFormData = reactive({
  title: '',
  name: '',
  phone: '',
  streetAddress: '',
  city: '',
  postalCode: '',
  instructions: ''
});

// Methods
const loadAddresses = async () => {
  loading.value = true;
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In real app, fetch from API
  } catch (error) {
    console.error('Error loading addresses:', error);
  } finally {
    loading.value = false;
  }
};

const editAddress = (address) => {
  editingAddress.value = address;
  Object.assign(addressFormData, address);
  showAddForm.value = true;
};

const deleteAddress = async (id) => {
  if (confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
    try {
      // Simulate API call
      addresses.value = addresses.value(addr => addr.id !== id);
      console.log('Address deleted:', id);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  }
};

const setDefault = async (id) => {
  try {
    // Simulate API call
    addresses.value.forEach(addr => {
      addr.isDefault = addr.id === id;
    });
    console.log('Default address set:', id);
  } catch (error) {
    console.error('Error setting default address:', error);
  }
};

const saveAddress = async () => {
  if (!formValid.value) return;
  
  saving.value = true;
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (editingAddress.value) {
      // Update existing address
      const index = addresses.value.findIndex(addr => addr.id === editingAddress.value.id);
      if (index !== -1) {
        addresses.value[index] = { ...addressFormData, id: editingAddress.value.id };
      }
    } else {
      // Add new address
      const newAddress = {
        ...addressFormData,
        id: Date.now(),
        fullAddress: `${addressFormData.streetAddress}, ${addressFormData.city}`,
        isDefault: addresses.value.length === 0
      };
      addresses.value.push(newAddress);
    }
    
    closeForm();
  } catch (error) {
    console.error('Error saving address:', error);
  } finally {
    saving.value = false;
  }
};

const closeForm = () => {
  showAddForm.value = false;
  editingAddress.value = null;
  Object.assign(addressFormData, {
    title: '',
    name: '',
    phone: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    instructions: ''
  });
};

onMounted(() => {
  loadAddresses();
});
</script>

<style scoped>
.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.glass-card {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 24px;
  margin-top: 80px;
}

.address-card {
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.address-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.default-address {
  border-color: var(--v-theme-warning);
  background: rgba(var(--v-theme-warning), 0.05);
}

@media (max-width: 768px) {
  .glass-card {
    margin-top: 20px;
    border-radius: 16px;
  }
}
</style>
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد' }}</h2>
          <button class="close-btn" @click="closeModal">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveAddress" class="address-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">عنوان العنوان *</label>
              <input 
                type="text" 
                v-model="addressForm.title" 
                class="form-input"
                placeholder="مثلاً: المنزل، العمل"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">الاسم الكامل *</label>
              <input 
                type="text" 
                v-model="addressForm.name" 
                class="form-input"
                placeholder="الاسم المستلم"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">رقم الهاتف *</label>
              <input 
                type="tel" 
                v-model="addressForm.phone" 
                class="form-input"
                placeholder="رقم الهاتف"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">الولاية *</label>
              <select v-model="addressForm.wilaya" @change="onWilayaChange(addressForm.wilaya)" class="form-input" required>
                <option value="">اختر الولاية</option>
                <option v-for="wilaya in wilayas" :key="wilaya.code" :value="wilaya.name">
                  {{ wilaya.name }}
                </option>
              </select>
                <option value="أدرار">أدرار</option>
                <option value="المدية">المدية</option>
                <option value="معسكر">معسكر</option>
                <option value="الشلف">الشلف</option>
                <option value="النعامة">النعامة</option>
                <option value="تقرت">تقرت</option>
                <option value="البيض">البيض</option>
                <option value="إليزي">إليزي</option>
                <option value="تندوف">تندوف</option>
                <option value="تميموسان">تميموسان</option>
                <option value="ورقلة">ورقلة</option>
                <option value="غرداية">غرداية</option>
                <option value="خنشلة">خنشلة</option>
                <option value="سوق أهراس">سوق أهراس</option>
                <option value="أم البواقي">أم البواقي</option>
                <option value="بسكرة">بسكرة</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">البلدية *</label>
            <select v-model="addressForm.commune" @change="onCommuneChange(addressForm.commune)" class="form-input" required>
              <option value="">اختر البلدية</option>
              <option v-for="commune in communes" :key="commune.code" :value="commune.name">
                {{ commune.name }}
              </option>
            </select>
          </div>
            <div class="form-group">
            <label class="form-label">العنوان *</label>
            <input 
              type="text" 
              v-model="addressForm.address" 
              class="form-input"
              placeholder="الشارع، المبنى، الرقم"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">ملاحظات التوصيل</label>
            <textarea 
              v-model="addressForm.instructions" 
              class="form-textarea"
              placeholder="أي ملاحظات إضافية للتوصيل (اختياري)"
              rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeModal">
              إلغاء
            </button>
            <button type="submit" class="save-btn" :disabled="loading">
              <i class="fa-solid fa-save"></i>
              <span v-if="!loading">{{ editingAddress ? 'تحديث' : 'حفظ' }}</span>
              <span v-else class="loading-text">
                <i class="fa-solid fa-spinner fa-spin"></i>
                جاري الحفظ...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import AddressService from '@/integration/services/AddressService';

const addressService = AddressService;
const loading = ref(false);
const showAddForm = ref(false);
const editingAddress = ref(null);

const addresses = ref([]);
const wilayas = ref([]);
const communes = ref([]);

const addressForm = reactive({
  title: '',
  name: '',
  phone: '',
  wilaya: '',
  wilayaCode: '',
  commune: '',
  communeCode: '',
  address: '',
  instructions: ''
});

// Mock data - في الواقع سيتم جلبها من GraphQL
const mockAddresses = [
  {
    id: 1,
    title: 'المنزل',
    name: 'أحمد محمد',
    phone: '+213 66 123 4567',
    wilaya: 'الجزائر',
    address: 'شارع العربي بن مهدي، رقم 45، الدائرة 1',
    instructions: 'بجانب البنك، الطابق الثاني',
    isDefault: true
  },
  {
    id: 2,
    title: 'العمل',
    name: 'أحمد محمد',
    phone: '+213 66 123 4567',
    wilaya: 'الجزائر',
    address: 'مركز الأعمال، شارع ديدوش مراد، رقم 12',
    instructions: 'استقبال في الطابق الأول',
    isDefault: false
  }
];

const closeModal = () => {
  showAddForm.value = false;
  editingAddress.value = null;
  resetForm();
};

const resetForm = () => {
  Object.assign(addressForm, {
    title: '',
    name: '',
    phone: '',
    wilaya: '',
    wilayaCode: '',
    commune: '',
    communeCode: '',
    address: '',
    instructions: ''
  });
  communes.value = [];
};

const editAddress = (address) => {
  editingAddress.value = address;
  Object.assign(addressForm, {
    ...address,
    wilaya: address.wilaya,
    wilayaCode: address.wilayaCode,
    commune: address.commune,
    communeCode: address.communeCode
  });
  // Load communes for the selected wilaya
  if (address.wilayaCode) {
    loadCommunes(address.wilayaCode);
  }
};

const saveAddress = async () => {
  try {
    loading.value = true;
    
    if (editingAddress.value) {
      // Update existing address
      const address = await addressService.updateAddress(editingAddress.value.id, addressForm);
      const index = addresses.value.findIndex(a => a.id === editingAddress.value.id);
      if (index !== -1) {
        addresses.value[index] = address;
      }
    } else {
      // Add new address
      const address = await addressService.createAddress(addressForm);
      addresses.value.push(address);
    }
    
    closeModal();
  } catch (error) {
    console.error('Error saving address:', error);
    // Show error message to user
  } finally {
    loading.value = false;
  }
};

const deleteAddress = async (addressId) => {
  if (confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
    try {
      await addressService.deleteAddress(addressId);
      addresses.value = addresses.value.filter(a => a.id !== addressId);
    } catch (error) {
      console.error('Error deleting address:', error);
      // Show error message to user
    }
  }
};

const setDefault = async (addressId) => {
  try {
    await addressService.setDefaultAddress(addressId);
    addresses.value.forEach(address => {
      address.isDefault = address.id === addressId;
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    // Show error message to user
  }
};

const loadAddresses = async () => {
  try {
    loading.value = true;
    addresses.value = await addressService.getAddresses();
  } catch (error) {
    console.error('Error loading addresses:', error);
  } finally {
    loading.value = false;
  }
};

const loadWilayas = async () => {
  try {
    wilayas.value = await addressService.getWilayas();
  } catch (error) {
    console.error('Error loading wilayas:', error);
  }
};

const loadCommunes = async (wilayaCode) => {
  if (!wilayaCode) {
    communes.value = [];
    return;
  }
  
  try {
    communes.value = await addressService.getCommunes(wilayaCode);
  } catch (error) {
    console.error('Error loading communes:', error);
    communes.value = [];
  }
};

const onWilayaChange = (wilayaName) => {
  const selectedWilaya = wilayas.value.find(w => w.name === wilayaName);
  if (selectedWilaya) {
    addressForm.wilayaCode = selectedWilaya.code;
    addressForm.commune = '';
    addressForm.communeCode = '';
    loadCommunes(selectedWilaya.code);
  }
};

const onCommuneChange = (communeName) => {
  const selectedCommune = communes.value.find(c => c.name === communeName);
  if (selectedCommune) {
    addressForm.communeCode = selectedCommune.code;
  }
};

onMounted(() => {
  loadAddresses();
  loadWilayas();
});
</script>

<style scoped>
/* ===== Addresses Page ===== */
.addresses-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
}

/* Background Effects */
.bg-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(212, 175, 55, 0.12) 0%, transparent 50%);
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%);
  filter: blur(2px);
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

/* Addresses Container */
.addresses-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1000px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.08),
              inset 0 0 30px rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent);
}

/* Header */
.addresses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.page-title i {
  color: #d4af37;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
}

.add-address-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-address-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  font-size: 48px;
  color: #d4af37;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 18px;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-icon {
  font-size: 64px;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 24px;
}

.empty-title {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.empty-text {
  font-size: 16px;
  margin: 0 0 32px 0;
}

.add-first-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

/* Addresses Grid */
.addresses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.address-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.address-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.address-card.default {
  border-color: rgba(212, 175, 55, 0.3);
  background: rgba(212, 175, 55, 0.05);
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.address-info {
  flex: 1;
}

.address-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.address-name {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
}

.address-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.default-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 6px;
  color: #d4af37;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.default-btn:hover {
  background: rgba(212, 175, 55, 0.3);
  color: #ffffff;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
}

.edit-btn:hover {
  background: rgba(0, 123, 255, 0.3);
  color: #ffffff;
}

.delete-btn {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.delete-btn:hover {
  background: rgba(220, 53, 69, 0.3);
  color: #ffffff;
}

.address-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-line {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.address-line i {
  color: #d4af37;
  width: 16px;
  text-align: center;
}

.default-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 4px;
  color: #d4af37;
  font-size: 12px;
  font-weight: 500;
}

/* Modal */
.address-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
}

.modal-header h2 {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #dc3545;
}

.address-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .addresses-page {
    padding: 10px;
  }
  
  .glass-card {
    padding: 20px;
  }
  
  .addresses-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .addresses-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .address-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .address-actions {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .save-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
