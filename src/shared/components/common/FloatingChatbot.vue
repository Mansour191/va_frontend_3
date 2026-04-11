<template>
  <div class="chatbot-root">
    <!-- FAB Button (Mobile Only) -->
    <v-btn
      v-if="!isSidebar && !isFullscreen && !isOpen"
      class="chat-fab"
      color="primary"
      elevation="6"
      size="large"
      icon="mdi-message-text"
      @click="toggleChatbot"
      position="fixed"
      :style="{ bottom: '20px', right: isRTL ? 'auto' : '20px', left: isRTL ? '20px' : 'auto' }"
    >
      <v-badge
        v-if="unreadCount > 0"
        :content="unreadCount"
        color="error"
        offset-x="2"
        offset-y="2"
      />
    </v-btn>

    <!-- Sidebar Mode (Desktop) -->
    <v-card
      v-if="isSidebar && isOpen"
      class="chat-sidebar"
      :class="{ 'rtl-sidebar': isRTL, 'ltr-sidebar': !isRTL }"
      elevation="8"
    >
      <v-card-title class="chat-header">
        <div class="header-info">
          <v-avatar size="40" class="me-3">
            <img src="/logo.svg" alt="Paclos Logo" />
          </v-avatar>
          <div class="title-container">
            <div class="text-h6">Paclos Assistant</div>
            <div class="status-indicator">
              <v-icon
                :icon="isOnline ? 'mdi-circle' : 'mdi-circle-outline'"
                :color="isOnline ? 'success' : 'grey'"
                size="8"
                class="me-1"
              />
              <span class="text-caption">{{ isOnline ? 'متصل' : 'غير متصل' }}</span>
            </div>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="closeChatbot"
        />
      </v-card-title>
      
      <v-card-text class="chat-body pa-0" ref="chatBody">
        <div v-if="isLoading" class="loading-indicator d-flex align-center justify-center pa-4">
          <v-progress-circular
            indeterminate
            color="primary"
            size="24"
            class="me-2"
          />
          <span>جاري التحميل...</span>
        </div>
        
        <div v-else class="messages-container">
          <div 
            v-for="message in messages" 
            :key="message.timestamp"
            class="message"
            :class="message.role"
          >
            <div class="message-content">
              <p>{{ message.text }}</p>
              <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
            </div>
          </div>
        </div>
      </v-card-text>
      
      <v-card-actions class="chat-input pa-3">
        <v-text-field
          v-model="input"
          @keyup.enter="sendMessage"
          :placeholder="isTyping ? 'يكتب المساعد...' : 'اكتب رسالتك...'"
          :disabled="loading"
          variant="outlined"
          density="compact"
          hide-details
          append-inner-icon="mdi-send"
          @click:append-inner="sendMessage"
          class="message-input"
        />
      </v-card-actions>
    </v-card>

    <!-- Full-Screen Mode (Mobile) -->
    <v-dialog
      v-if="isFullscreen && isOpen"
      v-model="isOpen"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card class="chat-fullscreen">
        <v-card-title class="chat-header">
          <div class="header-info">
            <v-avatar size="40" class="me-3">
              <img src="/logo.svg" alt="Paclos Logo" />
            </v-avatar>
            <div class="title-container">
              <div class="text-h6">Paclos Assistant</div>
              <div class="status-indicator">
                <v-icon
                  :icon="isOnline ? 'mdi-circle' : 'mdi-circle-outline'"
                  :color="isOnline ? 'success' : 'grey'"
                  size="8"
                  class="me-1"
                />
                <span class="text-caption">{{ isOnline ? 'متصل' : 'غير متصل' }}</span>
              </div>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeChatbot"
          />
        </v-card-title>
        
        <v-card-text class="chat-body pa-0" ref="chatBody">
          <div v-if="isLoading" class="loading-indicator d-flex align-center justify-center pa-4">
            <v-progress-circular
              indeterminate
              color="primary"
              size="24"
              class="me-2"
            />
            <span>جاري التحميل...</span>
          </div>
          
          <div v-else class="messages-container">
            <div 
              v-for="message in messages" 
              :key="message.timestamp"
              class="message"
              :class="message.role"
            >
              <div class="message-content">
                <p>{{ message.text }}</p>
                <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
              </div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="chat-input pa-3">
          <v-text-field
            v-model="input"
            @keyup.enter="sendMessage"
            :placeholder="isTyping ? 'يكتب المساعد...' : 'اكتب رسالتك...'"
            :disabled="loading"
            variant="outlined"
            density="compact"
            hide-details
            append-inner-icon="mdi-send"
            @click:append-inner="sendMessage"
            class="message-input"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { nextTick, ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ChatService from '@/shared/integration/services/ChatService';
import { DateUtils } from '@/shared/utils/DateUtils';
import { useChatbotStore } from '@/shared/store/chatbot';

// Props
const props = defineProps({
  isSidebar: {
    type: Boolean,
    default: false
  },
  isFullscreen: {
    type: Boolean,
    default: false
  }
});

// Composables
const { locale } = useI18n();
const chatbotStore = useChatbotStore();

// Reactive State
const loading = ref(false);
const isLoading = ref(false); // For template loading indicator
const isVoiceInput = ref(false);
const unreadCount = ref(0);
const isOnline = ref(true);
const chatBody = ref(null);
const typingTimeout = ref(null);
const isTyping = ref(false);

// Computed Properties
const isOpen = computed(() => chatbotStore.isOpen);
const isRTL = computed(() => locale.value === 'ar');
const input = ref('');
const messages = ref([
  { 
    role: 'bot', 
    text: '🤖 مرحباً! أنا مساعد Paclos الذكي. يمكنني مساعدتك في:',
    timestamp: DateUtils.createTimestamp(),
    confidence: 1.0,
    sources: ['system']
  },
  { 
    role: 'bot', 
    text: '🎯 تحليل الأسعار والتوصيات\n📦 معلومات المنتجات\n📊 تتبع الطلبات\n🚚 معلومات الشحن',
    timestamp: DateUtils.createTimestamp(),
    confidence: 1.0,
    sources: ['system']
  },
  { 
    role: 'bot', 
    text: '💡 كيف يمكنني مساعدتك اليوم؟',
    timestamp: DateUtils.createTimestamp(),
    confidence: 1.0,
    sources: ['system']
  }
]);

// Methods
const toggleChatbot = () => {
  chatbotStore.toggle();
};

const closeChatbot = () => {
  chatbotStore.close();
};

const formatTime = (timestamp) => {
  return DateUtils.formatTime(timestamp);
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  const text = input.value.trim();
  if (!text || loading.value) return;
  
  // Add user message
  messages.value.push({ 
    role: 'user', 
    text,
    timestamp: DateUtils.createTimestamp()
  });
  input.value = '';
  loading.value = true;
  isLoading.value = true; // Set loading indicator to true
  isTyping.value = true;
  
  try {
    // Call ChatService.ask and get response
    const response = await ChatService.ask(text, {
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 500
    });
    
    // Add bot response
    messages.value.push({ 
      role: 'bot', 
      text: response.answer || response.response || 'عذراً، لم أتمكن من معالجة طلبك.',
      timestamp: DateUtils.createTimestamp(),
      confidence: response.confidence || 0.5,
      sources: response.sources || ['chatbot']
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    
    // Enhanced error handling
    messages.value.push({ 
      role: 'bot', 
      text: 'عذراً، واجهت بعض الصعافات. يمكنني مساعدتك بالمعرفة المتاحة أو يمكنك التواصل مع فريق Paclos مباشرة.',
      timestamp: DateUtils.createTimestamp(),
      confidence: 0.3,
      sources: ['error_handling'],
      isError: true
    });
    
    isOnline.value = false;
  } finally {
    // Always reset loading states
    loading.value = false;
    isLoading.value = false; // Critical: Always reset loading indicator
    isTyping.value = false;
    scrollToBottom();
  }
};

const handleTyping = () => {
  isTyping.value = true;
  
  // Clear existing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  
  // Stop typing indicator after 1 second of inactivity
  typingTimeout.value = setTimeout(() => {
    isTyping.value = false;
  }, 1000);
};

const clearChat = () => {
  if (confirm('هل أنت متأكد من مسح المحادثة؟')) {
    messages.value = [{
      role: 'bot',
      text: 'تم مسح المحادثة. كيف يمكنني مساعدتك الآن؟',
      timestamp: DateUtils.createTimestamp(),
      confidence: 1.0,
      sources: ['system']
    }];
    unreadCount.value = 0;
  }
};

const exportChat = () => {
  const chatData = {
    messages: messages.value,
    sessionId: ChatService.sessionId,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `paclos-chat-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const toggleVoiceInput = () => {
  isVoiceInput.value = !isVoiceInput.value;
  
  if (isVoiceInput.value) {
    // Initialize voice recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      startVoiceRecognition();
    } else {
      alert('ميزة التعرف على الصوت غير مدعومة في متصفحك');
      isVoiceInput.value = false;
    }
  } else {
    stopVoiceRecognition();
  }
};

const startVoiceRecognition = () => {
  // Voice recognition implementation would go here
  console.log('Voice recognition started');
};

const stopVoiceRecognition = () => {
  // Stop voice recognition
  console.log('Voice recognition stopped');
};

// Watch for new messages when chat is closed
watch(isOpen, (newValue) => {
  if (newValue) {
    unreadCount.value = 0;
    scrollToBottom();
  }
});

// Check service availability
const checkServiceStatus = () => {
  const isAvailable = ChatService.checkAvailability();
  isOnline.value = isAvailable;
  
  if (!isAvailable) {
    messages.value.push({
      role: 'bot',
      text: '⚠️ خدمة الذكاء الاصطناعي غير متاحة حالياً. يعمل النظام في الوضع الاحتياطي.',
      timestamp: new Date(),
      confidence: 0.3,
      sources: ['system']
    });
  }
};

onMounted(() => {
  checkServiceStatus();
  
  // Check service status every 30 seconds
  setInterval(checkServiceStatus, 30000);
});
</script>

<style scoped>
/* Chatbot Root Container */
.chatbot-root {
  position: fixed;
}

/* FAB Button */
.chat-fab {
  position: fixed !important;
  bottom: 20px !important;
  right: 20px !important;
  z-index: 9999;
  transition: all 0.3s ease;
}

.chat-fab:hover {
  transform: scale(1.1);
}

/* Chat Sidebar */
.chat-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  z-index: 9999;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.rtl-sidebar {
  right: auto;
  left: 0;
}

/* Chat Header */
.chat-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-surface-variant)) 0%, rgb(var(--v-theme-surface)) 100%);
  border-bottom: 1px solid rgb(var(--v-theme-outline));
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 70px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Chat Body */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: rgb(var(--v-theme-surface));
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: rgb(var(--v-theme-on-surface));
}

.messages-container {
  display: flex;
  flex-direction: column;
}

.message {
  display: flex;
  animation: messageSlide 0.3s ease-out;
}

.message.user {
  justify-content: flex-end;
}

.message.bot {
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
}

.message.user .message-content {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border-bottom-right-radius: 4px;
}

.message.bot .message-content {
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  border: 1px solid rgb(var(--v-theme-outline));
  border-bottom-left-radius: 4px;
}

.message-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

.timestamp {
  font-size: 11px;
  opacity: 0.7;
  display: block;
  margin-top: 4px;
}

/* Chat Input */
.chat-input {
  padding: 16px 20px;
  background: linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%);
  border-top: 1px solid #333;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.message-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 24px;
  padding: 12px 16px;
  color: #F5F5F5;
  font-size: 14px;
  outline: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-input:focus {
  border-color: #D4AF37;
  background: rgba(255, 255, 255, 0.08);
}

.message-input::placeholder {
  color: rgba(245, 245, 245, 0.5);
}

.send-btn {
  background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
  border: none;
  color: #0A0A0A;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading Indicator */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #F5F5F5;
  opacity: 0.8;
}

.loading-indicator i {
  animation: spin 1s linear infinite;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes messageSlide {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 1023px) {
  .chat-sidebar {
    display: none !important;
  }
}

@media (max-width: 640px) {
  .chat-fab {
    bottom: 16px;
    right: 16px;
    width: 56px;
    height: 56px;
    font-size: 20px;
  }
  
  [dir="rtl"] .chat-fab {
    right: auto;
    left: 16px;
  }
}

/* RTL Support */
[dir="rtl"] .message.user .message-content {
  border-bottom-right-radius: 16px;
  border-bottom-left-radius: 4px;
}

[dir="rtl"] .message.bot .message-content {
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 4px;
}
</style>
