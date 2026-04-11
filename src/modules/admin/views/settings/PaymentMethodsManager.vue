<template>
  <v-card elevation="2" class="mb-6">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-credit-card</v-icon>
        <span class="text-h6">{{ $t('paymentMethodsManager') }}</span>
      </div>
      <v-btn
        color="primary"
        variant="elevated"
        prepend-icon="mdi-plus"
        @click="openAddModal"
      >
        {{ $t('addPaymentMethod') }}
      </v-btn>
    </v-card-title>
    
    <v-card-text class="pa-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="mt-4">{{ $t('loadingPaymentMethods') }}</p>
      </div>
      
      <!-- Payment Methods Table -->
      <v-data-table
        v-else-if="paymentMethods.length > 0"
        :headers="headers"
        :items="paymentMethods"
        :loading="loading"
        class="payment-methods-table"
        elevation="0"
      >
        <!-- Name Column -->
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center ga-2">
            <v-icon :icon="item.display_icon" size="20"></v-icon>
            <div>
              <div class="text-body-2 font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.payment_type }}</div>
            </div>
          </div>
        </template>
        
        <!-- Account Info Column -->
        <template v-slot:item.account_info="{ item }">
          <div v-if="item.account_name">
            <div class="text-body-2">{{ item.account_name }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.safe_account_number }}</div>
          </div>
          <span v-else class="text-medium-emphasis">-</span>
        </template>
        
        <!-- Fees Column -->
        <template v-slot:item.fees="{ item }">
          <div class="text-body-2">
            <div v-if="item.fee_percentage > 0">
              {{ item.fee_percentage }}% {{ $t('fee') }}
            </div>
            <div v-if="item.fee_fixed > 0">
              {{ formatCurrency(item.fee_fixed) }} {{ $t('fixedFee') }}
            </div>
            <div v-if="item.fee_percentage === 0 && item.fee_fixed === 0" class="text-medium-emphasis">
              {{ $t('noFees') }}
            </div>
          </div>
        </template>
        
        <!-- Status Column -->
        <template v-slot:item.is_active="{ item }">
          <v-switch
            v-model="item.is_active"
            :label="item.is_active ? $t('active') : $t('inactive')"
            color="success"
            hide-details
            density="compact"
            @change="togglePaymentMethodStatus(item)"
          ></v-switch>
        </template>
        
        <!-- Default Column -->
        <template v-slot:item.is_default="{ item }">
          <v-chip
            v-if="item.is_default"
            color="warning"
            size="small"
            variant="tonal"
          >
            <v-icon start>mdi-star</v-icon>
            {{ $t('default') }}
          </v-chip>
          <v-btn
            v-else
            size="small"
            variant="text"
            color="warning"
            @click="setDefaultPaymentMethod(item)"
          >
            <v-icon>mdi-star-outline</v-icon>
          </v-btn>
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
              :disabled="item.is_default"
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
          mdi-credit-card-outline
        </v-icon>
        <h3 class="text-h5 mb-2">{{ $t('noPaymentMethods') }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ $t('noPaymentMethodsDesc') }}
        </p>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="openAddModal"
        >
          {{ $t('addFirstPaymentMethod') }}
        </v-btn>
      </v-card>
    </v-card-text>
  </v-card>
  
  <!-- Add/Edit Payment Method Modal -->
  <v-dialog v-model="showModal" max-width="800" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">
          {{ editingPaymentMethod ? $t('editPaymentMethod') : $t('addPaymentMethod') }}
        </span>
        <v-btn icon="mdi-close" variant="text" @click="closeModal"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-4">
        <v-form ref="paymentForm" v-model="formValid">
          <v-row>
            <!-- Basic Information -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name_ar"
                :label="$t('nameArabic')"
                :rules="[requiredRule]"
                variant="outlined"
                prepend-inner-icon="mdi-translate"
                :hint="$t('nameArabicHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name_en"
                :label="$t('nameEnglish')"
                :rules="[requiredRule]"
                variant="outlined"
                prepend-inner-icon="mdi-translate"
                :hint="$t('nameEnglishHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            
            <!-- Payment Type and Gateway -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.payment_type"
                :label="$t('paymentType')"
                :items="paymentTypes"
                item-title="text"
                item-value="value"
                :rules="[requiredRule]"
                variant="outlined"
                prepend-inner-icon="mdi-credit-card"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.gateway_provider"
                :label="$t('gatewayProvider')"
                variant="outlined"
                prepend-inner-icon="mdi-gateway"
                :hint="$t('gatewayProviderHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            
            <!-- Account Information -->
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <h6 class="text-h6 mb-3">{{ $t('accountInformation') }}</h6>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.account_name"
                :label="$t('accountName')"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :hint="$t('accountNameHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.account_number"
                :label="$t('accountNumber')"
                variant="outlined"
                prepend-inner-icon="mdi-numeric"
                :hint="$t('accountNumberHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="formData.iban"
                :label="$t('iban')"
                variant="outlined"
                prepend-inner-icon="mdi-bank-transfer"
                :hint="$t('ibanHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            
            <!-- Instructions -->
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <h6 class="text-h6 mb-3">{{ $t('paymentInstructions') }}</h6>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-textarea
                v-model="formData.instructions_ar"
                :label="$t('instructionsArabic')"
                variant="outlined"
                rows="4"
                prepend-inner-icon="mdi-text"
                :hint="$t('instructionsArabicHint')"
                persistent-hint
              ></v-textarea>
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="formData.instructions_en"
                :label="$t('instructionsEnglish')"
                variant="outlined"
                rows="4"
                prepend-inner-icon="mdi-text"
                :hint="$t('instructionsEnglishHint')"
                persistent-hint
              ></v-textarea>
            </v-col>
            
            <!-- Visual Elements -->
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <h6 class="text-h6 mb-3">{{ $t('visualElements') }}</h6>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.icon"
                :label="$t('iconClass')"
                variant="outlined"
                prepend-inner-icon="mdi-iconify"
                :hint="$t('iconClassHint')"
                persistent-hint
                placeholder="fas fa-university"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-file-input
                v-model="formData.logo_file"
                :label="$t('logo')"
                variant="outlined"
                prepend-inner-icon="mdi-image"
                :hint="$t('logoHint')"
                persistent-hint
                accept="image/*"
                show-size
              ></v-file-input>
            </v-col>
            
            <!-- Display and Control -->
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <h6 class="text-h6 mb-3">{{ $t('displayControl') }}</h6>
            </v-col>
            
            <v-col cols="12" md="3">
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
            <v-col cols="12" md="3">
              <v-text-field
                v-model="formData.max_amount"
                :label="$t('maxAmount')"
                type="number"
                variant="outlined"
                prepend-inner-icon="mdi-currency-usd"
                :hint="$t('maxAmountHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="formData.fee_percentage"
                :label="$t('feePercentage')"
                type="number"
                step="0.01"
                variant="outlined"
                prepend-inner-icon="mdi-percent"
                :hint="$t('feePercentageHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="formData.fee_fixed"
                :label="$t('feeFixed')"
                type="number"
                variant="outlined"
                prepend-inner-icon="mdi-cash"
                :hint="$t('feeFixedHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            
            <!-- Status -->
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <v-row>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="formData.is_active"
                    :label="$t('active')"
                    color="success"
                    hide-details
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="formData.is_default"
                    :label="$t('default')"
                    color="warning"
                    hide-details
                  ></v-switch>
                </v-col>
              </v-row>
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
          @click="savePaymentMethod"
        >
          {{ editingPaymentMethod ? $t('update') : $t('add') }}
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
        <p>{{ $t('confirmDeletePaymentMethod') }}</p>
        <v-chip
          v-if="deletingPaymentMethod"
          color="primary"
          class="mt-2"
        >
          {{ deletingPaymentMethod.name }}
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
          @click="deletePaymentMethod"
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
const { paymentMethods, refreshPaymentMethods } = useAppConfig();
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
const editingPaymentMethod = ref(null);
const deletingPaymentMethod = ref(null);
const formValid = ref(false);
const paymentForm = ref(null);

// Form data
const formData = ref({
  name_ar: '',
  name_en: '',
  payment_type: 'cash',
  gateway_provider: '',
  account_name: '',
  account_number: '',
  iban: '',
  instructions_ar: '',
  instructions_en: '',
  icon: '',
  logo_file: null,
  order_index: 0,
  is_active: true,
  is_default: false,
  max_amount: null,
  fee_percentage: 0,
  fee_fixed: 0
});

// Payment types
const paymentTypes = computed(() => [
  { text: t('cashOnDelivery'), value: 'cash' },
  { text: t('bankTransfer'), value: 'bank_transfer' },
  { text: t('electronicWallet'), value: 'wallet' },
  { text: t('creditCard'), value: 'card' },
  { text: t('other'), value: 'other' }
]);

// Table headers
const headers = computed(() => [
  { title: t('name'), key: 'name', sortable: true },
  { title: t('accountInfo'), key: 'account_info', sortable: false },
  { title: t('fees'), key: 'fees', sortable: false },
  { title: t('status'), key: 'is_active', sortable: false },
  { title: t('default'), key: 'is_default', sortable: false },
  { title: t('actions'), key: 'actions', sortable: false, align: 'end' }
]);

// Validation rules
const requiredRule = v => !!v || t('fieldRequired');

// Methods
const openAddModal = () => {
  editingPaymentMethod.value = null;
  formData.value = {
    name_ar: '',
    name_en: '',
    payment_type: 'cash',
    gateway_provider: '',
    account_name: '',
    account_number: '',
    iban: '',
    instructions_ar: '',
    instructions_en: '',
    icon: '',
    logo_file: null,
    order_index: paymentMethods.value.length,
    is_active: true,
    is_default: paymentMethods.value.length === 0,
    max_amount: null,
    fee_percentage: 0,
    fee_fixed: 0
  };
  showModal.value = true;
};

const openEditModal = (paymentMethod) => {
  editingPaymentMethod.value = paymentMethod;
  formData.value = {
    id: paymentMethod.id,
    name_ar: paymentMethod.name_ar,
    name_en: paymentMethod.name_en,
    payment_type: paymentMethod.payment_type,
    gateway_provider: paymentMethod.gateway_provider,
    account_name: paymentMethod.account_name,
    account_number: paymentMethod.account_number,
    iban: paymentMethod.iban,
    instructions_ar: paymentMethod.instructions_ar,
    instructions_en: paymentMethod.instructions_en,
    icon: paymentMethod.icon,
    logo_file: null,
    order_index: paymentMethod.order_index,
    is_active: paymentMethod.is_active,
    is_default: paymentMethod.is_default,
    max_amount: paymentMethod.max_amount,
    fee_percentage: paymentMethod.fee_percentage,
    fee_fixed: paymentMethod.fee_fixed
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingPaymentMethod.value = null;
  formData.value = {
    name_ar: '',
    name_en: '',
    payment_type: 'cash',
    gateway_provider: '',
    account_name: '',
    account_number: '',
    iban: '',
    instructions_ar: '',
    instructions_en: '',
    icon: '',
    logo_file: null,
    order_index: 0,
    is_active: true,
    is_default: false,
    max_amount: null,
    fee_percentage: 0,
    fee_fixed: 0
  };
  if (paymentForm.value) {
    paymentForm.value.resetValidation();
  }
};

const savePaymentMethod = async () => {
  if (!paymentForm.value?.validate()) return;
  
  saving.value = true;
  try {
    const mutation = editingPaymentMethod.value
      ? `
        mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput!) {
          updatePaymentMethod(input: $input) {
            success
            message
            paymentMethod {
              id
              name
              is_active
              is_default
            }
          }
        }
      `
      : `
        mutation CreatePaymentMethod($input: CreatePaymentMethodInput!) {
          createPaymentMethod(input: $input) {
            success
            message
            paymentMethod {
              id
              name
              is_active
              is_default
            }
          }
        }
      `;
    
    const variables = {
      input: formData.value
    };
    
    const response = await executeMutation(mutation, variables);
    
    if (response?.data?.[editingPaymentMethod.value ? 'updatePaymentMethod' : 'createPaymentMethod']?.success) {
      showMessage(
        editingPaymentMethod.value 
          ? t('paymentMethodUpdatedSuccessfully') 
          : t('paymentMethodAddedSuccessfully'), 
        'success'
      );
      closeModal();
      await refreshPaymentMethods();
    } else {
      throw new Error(response?.data?.[editingPaymentMethod.value ? 'updatePaymentMethod' : 'createPaymentMethod']?.message || 'Failed to save payment method');
    }
  } catch (error) {
    console.error('Error saving payment method:', error);
    showMessage(error.message || t('saveFailed'), 'error');
  } finally {
    saving.value = false;
  }
};

const togglePaymentMethodStatus = async (paymentMethod) => {
  try {
    const mutation = `
      mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput!) {
        updatePaymentMethod(input: $input) {
          success
          message
        }
      }
    `;
    
    const variables = {
      input: {
        id: paymentMethod.id,
        is_active: paymentMethod.is_active
      }
    };
    
    const response = await executeMutation(mutation, variables);
    
    if (response?.data?.updatePaymentMethod?.success) {
      showMessage(t('paymentMethodStatusUpdated'), 'success');
      await refreshPaymentMethods();
    } else {
      throw new Error(response?.data?.updatePaymentMethod?.message || 'Failed to update status');
    }
  } catch (error) {
    console.error('Error toggling payment method status:', error);
    showMessage(error.message || t('updateFailed'), 'error');
    // Revert the change
    paymentMethod.is_active = !paymentMethod.is_active;
  }
};

const setDefaultPaymentMethod = async (paymentMethod) => {
  try {
    const mutation = `
      mutation SetDefaultPaymentMethod($id: ID!) {
        setDefaultPaymentMethod(id: $id) {
          success
          message
        }
      }
    `;
    
    const variables = { id: paymentMethod.id };
    
    const response = await executeMutation(mutation, variables);
    
    if (response?.data?.setDefaultPaymentMethod?.success) {
      showMessage(t('defaultPaymentMethodSet'), 'success');
      await refreshPaymentMethods();
    } else {
      throw new Error(response?.data?.setDefaultPaymentMethod?.message || 'Failed to set default');
    }
  } catch (error) {
    console.error('Error setting default payment method:', error);
    showMessage(error.message || t('updateFailed'), 'error');
  }
};

const confirmDelete = (paymentMethod) => {
  deletingPaymentMethod.value = paymentMethod;
  showDeleteDialog.value = true;
};

const deletePaymentMethod = async () => {
  deleting.value = true;
  try {
    const mutation = `
      mutation DeletePaymentMethod($id: ID!) {
        deletePaymentMethod(id: $id) {
          success
          message
        }
      }
    `;
    
    const variables = { id: deletingPaymentMethod.value.id };
    
    const response = await executeMutation(mutation, variables);
    
    if (response?.data?.deletePaymentMethod?.success) {
      showMessage(t('paymentMethodDeletedSuccessfully'), 'success');
      showDeleteDialog.value = false;
      deletingPaymentMethod.value = null;
      await refreshPaymentMethods();
    } else {
      throw new Error(response?.data?.deletePaymentMethod?.message || 'Failed to delete payment method');
    }
  } catch (error) {
    console.error('Error deleting payment method:', error);
    showMessage(error.message || t('deleteFailed'), 'error');
  } finally {
    deleting.value = false;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount || 0);
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
    await refreshPaymentMethods();
  } catch (error) {
    console.error('Error loading payment methods:', error);
    showMessage(t('loadFailed'), 'error');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.payment-methods-table {
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
