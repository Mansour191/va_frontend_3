<template>
  <div v-if="hasError" class="error-boundary">
    <v-alert
      type="error"
      prominent
      border="left"
      class="error-alert"
    >
      <v-alert-title>حدث خطأ غير متوقع</v-alert-title>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div v-if="showDetails && errorDetails" class="error-details">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              تفاصيل الخطأ التقنية
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <pre>{{ errorDetails }}</pre>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      
      <v-card-actions>
        <v-btn @click="retry" color="primary" variant="elevated">
          <v-icon left>mdi-refresh</v-icon>
          إعادة المحاولة
        </v-btn>
        
        <v-btn @click="toggleDetails" color="secondary" variant="text">
          <v-icon left>{{ showDetails ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
          {{ showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل' }}
        </v-btn>
        
        <v-btn @click="goHome" color="default" variant="text">
          <v-icon left>mdi-home</v-icon>
          الصفحة الرئيسية
        </v-btn>
      </v-card-actions>
    </v-alert>
  </div>
  
  <div v-else>
    <slot />
  </div>
</template>

<script>
import { ref, onErrorCaptured, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ErrorBoundary',
  
  setup() {
    const router = useRouter()
    const hasError = ref(false)
    const errorMessage = ref('')
    const errorDetails = ref('')
    const showDetails = ref(false)
    
    // Handle Vue component errors
    onErrorCaptured((error, instance, info) => {
      console.error('ErrorBoundary caught error:', { error, instance, info })
      
      hasError.value = true
      errorMessage.value = getErrorMessage(error)
      errorDetails.value = getErrorDetails(error, info)
      
      // Emit error event for global error handling
      window.dispatchEvent(new CustomEvent('vue-component-error', {
        detail: { error, instance, info }
      }))
      
      // Prevent error from propagating
      return false
    })
    
    // Handle GraphQL errors
    const handleGraphQLError = (event) => {
      const { detail } = event
      
      if (detail.errorType === 'validation') {
        errorMessage.value = 'خطأ في التحقق من البيانات'
        errorDetails.value = JSON.stringify(detail.validationErrors, null, 2)
      } else if (detail.errorType === 'authentication') {
        errorMessage.value = 'انتهت جلستك، يرجى تسجيل الدخول مرة أخرى'
        // Don't show technical details for auth errors
      } else {
        errorMessage.value = detail.message || 'حدث خطأ في الاتصال بالخادم'
        errorDetails.value = JSON.stringify(detail, null, 2)
      }
      
      hasError.value = true
    }
    
    // Handle network errors
    const handleNetworkError = (event) => {
      const { detail } = event
      
      errorMessage.value = 'مشكلة في الاتصال بالإنترنت'
      errorDetails.value = JSON.stringify(detail, null, 2)
      hasError.value = true
    }
    
    // Handle authentication errors
    const handleAuthError = (event) => {
      const { detail } = event
      
      errorMessage.value = detail.message || 'انتهت صلاحية الجلسة'
      hasError.value = true
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
    
    onMounted(() => {
      // Listen for custom error events
      window.addEventListener('graphql-validation-error', handleGraphQLError)
      window.addEventListener('graphql-user-input-error', handleGraphQLError)
      window.addEventListener('network-error', handleNetworkError)
      window.addEventListener('auth-expired', handleAuthError)
      window.addEventListener('auth-forbidden', handleAuthError)
      window.addEventListener('server-error', handleGraphQLError)
    })
    
    onUnmounted(() => {
      // Clean up event listeners
      window.removeEventListener('graphql-validation-error', handleGraphQLError)
      window.removeEventListener('graphql-user-input-error', handleGraphQLError)
      window.removeEventListener('network-error', handleNetworkError)
      window.removeEventListener('auth-expired', handleAuthError)
      window.removeEventListener('auth-forbidden', handleAuthError)
      window.removeEventListener('server-error', handleGraphQLError)
    })
    
    const getErrorMessage = (error) => {
      if (error.message) {
        // Return user-friendly message for common errors
        if (error.message.includes('Network Error')) {
          return 'مشكلة في الاتصال بالإنترنت'
        } else if (error.message.includes('401')) {
          return 'انتهت صلاحية الجلسة'
        } else if (error.message.includes('403')) {
          return 'ليس لديك صلاحية للوصول'
        } else if (error.message.includes('500')) {
          return 'خطأ في الخادم'
        }
        
        return error.message
      }
      
      return 'حدث خطأ غير متوقع'
    }
    
    const getErrorDetails = (error, info) => {
      return JSON.stringify({
        message: error.message,
        stack: error.stack,
        info: info,
        timestamp: new Date().toISOString()
      }, null, 2)
    }
    
    const retry = () => {
      hasError.value = false
      errorMessage.value = ''
      errorDetails.value = ''
      showDetails.value = false
      
      // Clear any stored validation errors
      if (window.clearValidationErrors) {
        window.clearValidationErrors()
      }
    }
    
    const toggleDetails = () => {
      showDetails.value = !showDetails.value
    }
    
    const goHome = () => {
      router.push('/')
    }
    
    return {
      hasError,
      errorMessage,
      errorDetails,
      showDetails,
      retry,
      toggleDetails,
      goHome
    }
  }
}
</script>

<style scoped>
.error-boundary {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.error-alert {
  margin-bottom: 20px;
}

.error-message {
  margin: 16px 0;
  font-size: 16px;
  line-height: 1.5;
}

.error-details {
  margin: 16px 0;
}

.error-details pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}

.v-card-actions {
  padding: 16px 0 0 0;
  gap: 8px;
}
</style>
