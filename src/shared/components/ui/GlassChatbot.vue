<template>
  <div class="glass-chatbot-wrapper">
    <!-- Chat FAB -->
    <v-fab
      v-if="!isOpen"
      icon="mdi-robot-happy-outline"
      size="x-large"
      extended
      color="primary"
      class="chat-fab"
      @click="isOpen = true"
    >
      <v-badge
        v-if="unreadCount > 0"
        :content="unreadCount"
        color="error"
        offset-x="3"
        offset-y="3"
      >
        <v-icon size="32">mdi-robot-happy-outline</v-icon>
      </v-badge>
      <v-icon v-else size="32">mdi-robot-happy-outline</v-icon>
      <template v-slot:append>
        <span class="text-caption font-weight-medium">مساعد Paclos</span>
      </template>
    </v-fab>

    <!-- Chat Window -->
    <v-expand-transition>
      <v-card
        v-if="isOpen"
        class="chat-window"
        width="400"
        height="600"
        rounded="xl"
        elevation="24"
      >
        <!-- Header -->
        <v-toolbar color="primary" density="comfortable">
          <v-avatar size="40" class="elevation-2">
            <v-img src="/logo.svg" alt="Paclos Logo" />
          </v-avatar>
          <v-toolbar-title class="ms-3">
            <div class="text-subtitle-1 font-weight-bold">مساعد Paclos الذكي</div>
            <div class="text-caption d-flex align-center">
              <v-badge dot color="success" inline class="me-1"></v-badge>
              متصل الآن
            </div>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="isOpen = false"
          />
        </v-toolbar>

        <!-- Messages Container -->
        <v-card-text class="chat-messages-container pa-4">
          <v-virtual-scroll
            :items="messages"
            :item-height="80"
            height="400"
            class="messages-scroll"
          >
            <template v-slot:default="{ item: msg, index }">
              <div
                :class="[
                  'd-flex mb-4 align-end',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                ]"
              >
                <v-chip
                  :color="msg.role === 'user' ? 'primary' : 'surface-variant'"
                  :variant="msg.role === 'user' ? 'elevated' : 'tonal'"
                  class="message-chip"
                  max-width="80%"
                >
                  <span class="text-body-2">{{ msg.text }}</span>
                  <div class="text-caption mt-1 opacity-70">
                    {{ msg.time }}
                  </div>
                </v-chip>
              </div>
            </template>
          </v-virtual-scroll>
          
          <!-- Typing Indicator -->
          <div v-if="isTyping" class="d-flex justify-start mb-4">
            <v-chip color="surface-variant" variant="tonal" class="typing-chip">
              <v-progress-circular
                indeterminate
                size="16"
                width="2"
                class="me-2"
              />
              <span class="typing-dots">جاري الكتابة</span>
            </v-chip>
          </div>
        </v-card-text>

        <v-divider />
        
        <!-- Input Area -->
        <v-card-actions class="pa-3 bg-surface-variant">
          <v-text-field
            v-model="userInput"
            placeholder="كيف يمكنني مساعدتك؟"
            variant="solo-filled"
            density="comfortable"
            rounded="pill"
            hide-details
            class="chat-input"
            @keyup.enter="sendMessage"
          >
            <template v-slot:append-inner>
              <v-btn
                icon="mdi-send-variant"
                variant="elevated"
                color="primary"
                size="small"
                :disabled="!userInput.trim()"
                @click="sendMessage"
              />
            </template>
          </v-text-field>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import ChatService from '@/integration/services/ChatService';

const { t } = useI18n();

// State
const isOpen = ref(false);
const userInput = ref('');
const isTyping = ref(false);
const unreadCount = ref(1);
const messages = ref([
  { 
    role: 'bot', 
    text: t('chatbot.welcome') || 'مرحباً بك في Paclos! كيف يمكنني مساعدتك في تجديد منزلك اليوم؟', 
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
]);

// Methods
const sendMessage = async () => {
  if (!userInput.value.trim()) return;

  // Add user message
  const userMessage = {
    role: 'user',
    text: userInput.value,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  
  messages.value.push(userMessage);
  const query = userInput.value;
  userInput.value = '';
  isTyping.value = true;

  // Scroll to bottom
  await nextTick();

  try {
    // Send message to backend API
    const response = await ChatService.sendMessage(query);
    
    isTyping.value = false;
    messages.value.push({
      role: 'bot',
      text: response.message || t('chatbot.defaultResponse') || 'شكراً لتواصلك. فريق Paclos سيقوم بالرد على استفسارك في أقرب وقت ممكن.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    isTyping.value = false;
    messages.value.push({
      role: 'bot',
      text: t('chatbot.error') || 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  await nextTick();
};

// Lifecycle
onMounted(() => {
  // Initialize chat service if needed
  console.log('✅ GlassChatbot mounted');
});
</script>

<style scoped>
.glass-chatbot-wrapper {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9999;
}

.chat-fab {
  width: 64px !important;
  height: 64px !important;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%) !important;
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.3) !important;
}

.chat-window {
  position: absolute;
  bottom: 80px;
  left: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgb(var(--v-theme-surface)) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2) !important;
}

.chat-messages-container {
  flex-grow: 1;
  overflow: hidden;
  background: rgb(var(--v-theme-surface-variant));
}

.messages-scroll {
  height: 100%;
}

.message-chip {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.4;
  min-height: auto;
}

.typing-chip {
  padding: 8px 16px;
}

.typing-dots {
  font-size: 0.875rem;
  opacity: 0.7;
}

.chat-input {
  background: rgb(var(--v-theme-surface));
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .glass-chatbot-wrapper {
    bottom: 16px;
    left: 16px;
  }
  
  .chat-window {
    width: calc(100vw - 32px) !important;
    height: 500px !important;
  }
  
  .chat-fab {
    width: 56px !important;
    height: 56px !important;
  }
}
</style>
