<template>
  <BaseModal
    v-model="isOpen"
    :title="isEditing ? $t('editCustomerSegment') || 'Edit Customer Segment' : $t('createCustomerSegment') || 'Create Customer Segment'"
    max-width="600px"
    @close="closeModal"
  >
    <template #default>
      <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
        <v-container>
          <v-row>
            <!-- Segment Name -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                :label="$t('segmentName') || 'Segment Name'"
                :rules="nameRules"
                variant="outlined"
                prepend-inner-icon="mdi-account-group"
                required
              />
            </v-col>

            <!-- Description -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                :label="$t('description') || 'Description'"
                variant="outlined"
                prepend-inner-icon="mdi-text"
                rows="3"
                :placeholder="$t('segmentDescriptionPlaceholder') || 'Describe the customer segment criteria and characteristics...'"
              />
            </v-col>

            <!-- Criteria JSON -->
            <v-col cols="12">
              <v-textarea
                v-model="criteriaText"
                :label="$t('segmentCriteria') || 'Segment Criteria'"
                variant="outlined"
                prepend-inner-icon="mdi-code-json"
                rows="4"
                :placeholder="$t('criteriaPlaceholder') || '{\n  &quot;minOrderValue&quot;: 1000,\n  &quot;orderFrequency&quot;: &quot;high&quot;\n}'"
                :error-messages="criteriaError"
                @input="validateCriteria"
              />
              <v-card-text class="text-caption text-medium-emphasis mt-2">
                {{ $t('criteriaHelp') || 'Enter JSON criteria for segment filtering. Example: {"minOrderValue": 1000, "orderFrequency": "high"}' }}
              </v-card-text>
            </v-col>

            <!-- Priority and Status -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.priority"
                :label="$t('priority') || 'Priority'"
                type="number"
                variant="outlined"
                prepend-inner-icon="mdi-sort-numeric-ascending"
                :rules="priorityRules"
                :min="0"
                :hint="$t('priorityHint') || 'Higher numbers appear first in lists'"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-checkbox
                v-model="formData.isActive"
                :label="$t('isActive') || 'Active'"
                color="primary"
                :hint="$t('isActiveHint') || 'Only active segments will be used in analytics'"
                persistent-hint
              />
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        @click="closeModal"
      >
        {{ $t('cancel') || 'Cancel' }}
      </v-btn>
      <v-btn
        variant="elevated"
        color="primary"
        :loading="loading"
        :disabled="!valid || loading"
        @click="handleSubmit"
      >
        {{ isEditing ? ($t('update') || 'Update') : ($t('create') || 'Create') }}
      </v-btn>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import BaseModal from '@/shared/components/ui/BaseModal.vue';
import { CREATE_CUSTOMER_SEGMENT, UPDATE_CUSTOMER_SEGMENT } from '@/integration/graphql/customerSegments.graphql';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  segment: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'success', 'error']);

const { t } = useI18n();
const store = useStore();

// State
const formRef = ref(null);
const valid = ref(false);
const loading = ref(false);
const criteriaText = ref('');
const criteriaError = ref('');

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isEditing = computed(() => !!props.segment);

// Form data
const formData = ref({
  name: '',
  description: '',
  criteria: {},
  isActive: true,
  priority: 0
});

// Validation rules
const nameRules = [
  (v) => !!v || (t('required') || 'Name is required'),
  (v) => (v && v.length >= 2) || (t('minLength') || 'Name must be at least 2 characters'),
  (v) => (v && v.length <= 255) || (t('maxLength') || 'Name must be less than 255 characters')
];

const priorityRules = [
  (v) => v >= 0 || (t('minValue') || 'Priority must be 0 or greater'),
  (v) => Number.isInteger(v) || (t('integerRequired') || 'Priority must be an integer')
];

// Methods
const validateCriteria = () => {
  try {
    if (!criteriaText.value.trim()) {
      formData.value.criteria = {};
      criteriaError.value = '';
      return;
    }
    
    const parsed = JSON.parse(criteriaText.value);
    formData.value.criteria = parsed;
    criteriaError.value = '';
  } catch (error) {
    criteriaError.value = t('invalidJson') || 'Invalid JSON format';
  }
};

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    criteria: {},
    isActive: true,
    priority: 0
  };
  criteriaText.value = '';
  criteriaError.value = '';
  
  if (formRef.value) {
    formRef.value.resetValidation();
  }
};

const loadSegmentData = () => {
  if (props.segment) {
    formData.value = {
      name: props.segment.name || '',
      description: props.segment.description || '',
      criteria: props.segment.criteria || {},
      isActive: props.segment.isActive ?? true,
      priority: props.segment.priority || 0
    };
    criteriaText.value = JSON.stringify(formData.value.criteria, null, 2);
  } else {
    resetForm();
  }
};

const closeModal = () => {
  isOpen.value = false;
  resetForm();
};

const handleSubmit = async () => {
  if (!formRef.value.validate()) return;
  
  loading.value = true;
  
  try {
    validateCriteria();
    if (criteriaError.value) {
      loading.value = false;
      return;
    }

    const variables = {
      input: {
        name: formData.value.name,
        description: formData.value.description,
        criteria: formData.value.criteria,
        isActive: formData.value.isActive,
        priority: formData.value.priority
      }
    };

    let mutation;
    if (isEditing.value) {
      variables.id = props.segment.id;
      mutation = UPDATE_CUSTOMER_SEGMENT;
    } else {
      mutation = CREATE_CUSTOMER_SEGMENT;
    }

    const response = await store.dispatch('apollo/mutate', {
      mutation,
      variables
    });

    if (response.data?.[isEditing.value ? 'updateCustomerSegment' : 'createCustomerSegment']?.success) {
      emit('success', response.data[isEditing.value ? 'updateCustomerSegment' : 'createCustomerSegment'].segment);
      closeModal();
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: isEditing.value ? (t('segmentUpdated') || 'Segment Updated') : (t('segmentCreated') || 'Segment Created'),
        message: isEditing.value 
          ? (t('segmentUpdateSuccess') || 'Customer segment updated successfully')
          : (t('segmentCreateSuccess') || 'Customer segment created successfully'),
        timeout: 3000
      });
    } else {
      throw new Error(response.errors?.[0]?.message || 'Operation failed');
    }
  } catch (error) {
    console.error('Error saving customer segment:', error);
    emit('error', error);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'Error',
      message: error.message || (t('unexpectedError') || 'An unexpected error occurred'),
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    nextTick(() => {
      loadSegmentData();
    });
  }
});

watch(() => props.segment, () => {
  if (props.modelValue) {
    loadSegmentData();
  }
});
</script>

<style scoped>
.v-textarea :deep(.v-field__input) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

.v-checkbox :deep(.v-label) {
  font-size: 14px;
}
</style>
