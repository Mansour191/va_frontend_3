<template>
  <v-container class="auth-page" fluid>
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="auth-card" elevation="8">
          <v-card-text class="pa-8">
            <!-- Header -->
            <div class="text-center mb-8">
              <v-icon size="64" color="primary" class="mb-4">
                mdi-key
              </v-icon>
              <h2 class="text-h4 font-weight-bold text-primary mb-2">
                {{ $t('forgotPassword') }}
              </h2>
              <p class="text-body-1 text-medium-emphasis">
                {{ $t('forgotPasswordDesc') || 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.' }}
              </p>
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
                v-model="email"
                :label="$t('email')"
                type="email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                required
                :rules="emailRules"
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
                <v-icon start>mdi-send</v-icon>
                {{ $t('send') }}
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
import { useI18n } from 'vue-i18n';
import { auth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const { t } = useI18n();
const email = ref('');
const loading = ref(false);
const error = ref(null);
const success = ref(null);

// Email validation rules
const emailRules = [
  v => !!v || 'البريد الإلكتروني مطلوب',
  v => /.+@.+\..+/.test(v) || 'البريد الإلكتروني غير صالح'
];

const handleReset = async () => {
  loading.value = true;
  error.value = null;
  success.value = null;
  try {
    await sendPasswordResetEmail(auth, email.value);
    success.value = t('resetLinkSent') || 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.';
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
