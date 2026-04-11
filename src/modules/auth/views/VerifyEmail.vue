<template>
  <v-container class="auth-page" fluid>
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="auth-card" elevation="8">
          <v-card-text class="pa-8">
            <!-- Header -->
            <div class="text-center mb-8">
              <v-icon size="64" color="primary" class="mb-4">
                mdi-email-open-text
              </v-icon>
              <h2 class="text-h4 font-weight-bold text-primary mb-2">
                {{ $t('verifyEmailTitle') || 'تفعيل البريد الإلكتروني' }}
              </h2>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular 
                indeterminate 
                color="primary" 
                size="48"
                class="mb-4"
              />
              <p class="text-body-1 text-medium-emphasis">
                {{ $t('verifying') || 'جاري التحقق...' }}
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { auth } from '@/firebase';
import { applyActionCode } from 'firebase/auth';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const loading = ref(true);
const error = ref(null);
const success = ref(null);

onMounted(async () => {
  const token = route.params.token;
  if (!token) {
    error.value = 'رابط غير صالح';
    loading.value = false;
    return;
  }

  try {
    await applyActionCode(auth, token);
    success.value = t('emailVerifiedSuccess') || 'تم تفعيل البريد الإلكتروني بنجاح.';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
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

.v-alert {
  backdrop-filter: blur(10px);
}
</style>
