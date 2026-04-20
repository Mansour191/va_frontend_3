<template>
  <BaseModal
    v-model="isOpen"
    :title="isEditing ? $t('editSegmentAssignment') || 'Edit Segment Assignment' : $t('assignToSegment') || 'Assign to Segment'"
    max-width="600px"
    @close="closeModal"
  >
    <template #default>
      <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
        <v-container>
          <v-row>
            <!-- User Selection -->
            <v-col cols="12">
              <v-autocomplete
                v-model="formData.userId"
                :label="$t('selectUser') || 'Select User'"
                :items="availableUsers"
                item-title="displayName"
                item-value="id"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :loading="loadingUsers"
                :disabled="isEditing"
                required
              />
            </v-col>

            <!-- Segment Selection -->
            <v-col cols="12">
              <v-autocomplete
                v-model="formData.customersegmentId"
                :label="$t('selectSegment') || 'Select Segment'"
                :items="availableSegments"
                item-title="name"
                item-value="id"
                variant="outlined"
                prepend-inner-icon="mdi-account-group"
                :loading="loadingSegments"
                :disabled="isEditing"
                required
              />
            </v-col>

            <!-- AI Assignment -->
            <v-col cols="12" md="6">
              <v-checkbox
                v-model="formData.addedByAi"
                :label="$t('addedByAi') || 'Added by AI'"
                color="primary"
                :hint="$t('addedByAiHint') || 'This assignment was made by AI segmentation'"
                persistent-hint
              />
            </v-col>

            <!-- Engagement Score -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.engagementScore"
                :label="$t('engagementScore') || 'Engagement Score'"
                type="number"
                variant="outlined"
                prepend-inner-icon="mdi-chart-line"
                :rules="engagementScoreRules"
                :min="0"
                :max="100"
                :hint="$t('engagementScoreHint') || 'Score from 0-100 indicating customer engagement level'"
                persistent-hint
              />
            </v-col>

            <!-- Display existing assignments if editing -->
            <v-col v-if="isEditing && currentAssignment" cols="12">
              <v-card variant="outlined" class="pa-4">
                <h4 class="text-subtitle-1 font-weight-medium mb-3">
                  {{ $t('assignmentDetails') || 'Assignment Details' }}
                </h4>
                <v-row dense>
                  <v-col cols="12" md="6">
                    <div class="text-caption text-medium-emphasis">
                      {{ $t('joinedAt') || 'Joined At' }}
                    </div>
                    <div class="text-body-2">
                      {{ formatDate(currentAssignment.joinedAt) }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-caption text-medium-emphasis">
                      {{ $t('currentEngagementScore') || 'Current Engagement Score' }}
                    </div>
                    <div class="text-body-2">
                      {{ currentAssignment.engagementScore }}
                    </div>
                  </v-col>
                </v-row>
              </v-card>
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
        {{ isEditing ? ($t('update') || 'Update') : ($t('assign') || 'Assign') }}
      </v-btn>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import BaseModal from '@/shared/components/ui/BaseModal.vue';
import { 
  GET_CUSTOMER_SEGMENTS, 
  GET_CUSTOMER_SEGMENT_USERS,
  ASSIGN_USER_TO_SEGMENT,
  UPDATE_CUSTOMER_SEGMENT_USER
} from '@/integration/graphql/customerSegments.graphql';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  assignment: {
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
const loadingUsers = ref(false);
const loadingSegments = ref(false);

// Data
const availableUsers = ref([]);
const availableSegments = ref([]);
const currentAssignment = ref(null);

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isEditing = computed(() => !!props.assignment);

// Form data
const formData = ref({
  userId: null,
  customersegmentId: null,
  addedByAi: false,
  engagementScore: 0
});

// Validation rules
const engagementScoreRules = [
  (v) => v >= 0 || (t('minValue') || 'Score must be 0 or greater'),
  (v) => v <= 100 || (t('maxValue') || 'Score must be 100 or less'),
  (v) => Number.isInteger(v) || (t('integerRequired') || 'Score must be an integer')
];

// Methods
const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    // Mock users data - in real implementation, this would come from API
    availableUsers.value = [
      { id: 1, displayName: 'Ahmed Mohamed', email: 'ahmed@example.com' },
      { id: 2, displayName: 'Fatima Ali', email: 'fatima@example.com' },
      { id: 3, displayName: 'Mohammed Abdullah', email: 'mohammed@example.com' },
      { id: 4, displayName: 'Nora Salem', email: 'nora@example.com' },
      { id: 5, displayName: 'Khaled Al-Otaibi', email: 'khaled@example.com' }
    ];
  } catch (error) {
    console.error('Error loading users:', error);
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('errorLoadingUsers') || 'Error loading users',
      message: error.message,
      timeout: 5000
    });
  } finally {
    loadingUsers.value = false;
  }
};

const loadSegments = async () => {
  loadingSegments.value = true;
  try {
    const response = await store.dispatch('apollo/query', {
      query: GET_CUSTOMER_SEGMENTS
    });
    
    if (response.data?.customerSegments) {
      availableSegments.value = response.data.customerSegments.filter(segment => segment.isActive);
    }
  } catch (error) {
    console.error('Error loading segments:', error);
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('errorLoadingSegments') || 'Error loading segments',
      message: error.message,
      timeout: 5000
    });
  } finally {
    loadingSegments.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return t('notAvailable') || 'N/A';
  return new Date(dateString).toLocaleString();
};

const resetForm = () => {
  formData.value = {
    userId: null,
    customersegmentId: null,
    addedByAi: false,
    engagementScore: 0
  };
  currentAssignment.value = null;
  
  if (formRef.value) {
    formRef.value.resetValidation();
  }
};

const loadAssignmentData = () => {
  if (props.assignment) {
    currentAssignment.value = props.assignment;
    formData.value = {
      userId: props.assignment.user?.id,
      customersegmentId: props.assignment.customersegment?.id,
      addedByAi: props.assignment.addedByAi || false,
      engagementScore: props.assignment.engagementScore || 0
    };
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
    let mutation;
    let variables;
    
    if (isEditing.value) {
      mutation = UPDATE_CUSTOMER_SEGMENT_USER;
      variables = {
        id: props.assignment.id,
        input: {
          addedByAi: formData.value.addedByAi,
          engagementScore: formData.value.engagementScore
        }
      };
    } else {
      mutation = ASSIGN_USER_TO_SEGMENT;
      variables = {
        input: {
          customersegmentId: formData.value.customersegmentId,
          userId: formData.value.userId,
          addedByAi: formData.value.addedByAi,
          engagementScore: formData.value.engagementScore
        }
      };
    }

    const response = await store.dispatch('apollo/mutate', {
      mutation,
      variables
    });

    const mutationName = isEditing.value ? 'updateCustomerSegmentUser' : 'assignUserToSegment';
    
    if (response.data?.[mutationName]?.success) {
      emit('success', response.data[mutationName].customerSegmentUser);
      closeModal();
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: isEditing.value 
          ? (t('assignmentUpdated') || 'Assignment Updated')
          : (t('assignmentCreated') || 'Assignment Created'),
        message: isEditing.value 
          ? (t('assignmentUpdateSuccess') || 'Segment assignment updated successfully')
          : (t('assignmentCreateSuccess') || 'User assigned to segment successfully'),
        timeout: 3000
      });
    } else {
      throw new Error(response.errors?.[0]?.message || 'Operation failed');
    }
  } catch (error) {
    console.error('Error saving segment assignment:', error);
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
      loadAssignmentData();
      loadUsers();
      loadSegments();
    });
  }
});

watch(() => props.assignment, () => {
  if (props.modelValue) {
    loadAssignmentData();
  }
});
</script>

<style scoped>
.v-checkbox :deep(.v-label) {
  font-size: 14px;
}
</style>
