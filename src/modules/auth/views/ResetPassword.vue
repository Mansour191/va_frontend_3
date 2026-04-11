<template>
  <v-container class="auth-page" fluid>
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="auth-card" elevation="8">
          <v-card-text class="pa-8">
            <!-- Header -->
            <div class="text-center mb-8">
              <v-icon size="64" color="primary" class="mb-4">
                mdi-lock-open
              </v-icon>
              <h2 class="text-h4 font-weight-bold text-primary mb-2">
                {{ $t('resetPasswordTitle') || 'إعادة تعيين كلمة المرور' }}
              </h2>
            </div>

            <!-- Error Alert -->
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mb-6"
              closable
              @update:model-value="error = null"
            >
              <v-alert-title>
                <v-icon start>mdi-alert-circle</v-icon>
                خطأ
              </v-alert-title>
              {{ error }}
            </v-alert>

            <!-- Success Alert -->
            <v-alert
              v-if="success"
              type="success"
              variant="tonal"
              class="mb-6"
              closable
              @update:model-value="success = null"
            >
              <v-alert-title>
                <v-icon start>mdi-check-circle</v-icon>
                تم بنجاح
              </v-alert-title>
              {{ success }}
            </v-alert>

            <!-- Reset Form -->
            <v-form @submit.prevent="handleReset" v-if="!success">
              <v-text-field
                v-model="password"
                :label="$t('newPassword') || 'كلمة المرور الجديدة'"
                type="password"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                required
                :rules="passwordRules"
                class="mb-4"
              />

              <v-text-field
                v-model="confirmPassword"
                :label="$t('confirmPassword')"
                type="password"
                prepend-inner-icon="mdi-lock-check"
                variant="outlined"
                required
                :rules="confirmPasswordRules"
                class="mb-4"
              />

              <v-btn
                type="submit"
                block
                size="large"
                color="primary"
                :loading="loading"
                class="mb-4"
              >
                <v-icon start>mdi-content-save</v-icon>
                {{ $t('reset') || 'حفظ كلمة المرور الجديدة' }}
              </v-btn>
            </v-form>

            <!-- Footer Link -->
            <div class="text-center mt-6">
              <router-link 
                to="/login" 
                class="text-decoration-none text-primary font-weight-medium"
              >
                <v-icon start size="small">mdi-arrow-left</v-icon>
                {{ $t('login') }}
              </router-link>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth } from '@/firebase';
import { confirmPasswordReset } from 'firebase/auth';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref(null);
const success = ref(null);

// Password validation rules
const passwordRules = [
  v => !!v || 'كلمة المرور مطلوبة',
  v => v.length >= 8 || 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
];

// Confirm password validation rules
const confirmPasswordRules = [
  v => !!v || 'تأكيد كلمة المرور مطلوب',
  v => v === password.value || 'كلمتا المرور غير متطابقتين'
];

const handleReset = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = t('passwordsDoNotMatch') || 'كلمتا المرور غير متطابقتين';
    return;
  }

  const token = route.params.token;
  if (!token) {
    error.value = 'رابط غير صالح';
    return;
  }

  loading.value = true;
  error.value = null;
  success.value = null;
  try {
    await confirmPasswordReset(auth, token, password.value);
    success.value = t('passwordResetSuccess') || 'تمت إعادة تعيين كلمة المرور بنجاح.';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 80vh;
  background: linear-gradient(135deg, var(--gradient-dark));
}

.auth-card {
  backdrop-filter: blur(20px);
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid var(--border-primary);
}

/* Custom styles for dark luxury theme */
.v-text-field :deep(.v-field) {
  background-color: rgba(10, 10, 10, 0.5);
  border-color: var(--border-secondary);
}

.v-text-field :deep(.v-field:hover) {
  border-color: var(--color-primary);
}

.v-text-field :deep(.v-field--focused) {
  border-color: var(--color-primary);
  box-shadow: var(--gold-glow);
}

.v-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.v-alert {
  backdrop-filter: blur(10px);
}
</style>
