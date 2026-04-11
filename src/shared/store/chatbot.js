import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatbotStore = defineStore('chatbot', () => {
  // State
  const isOpen = ref(false)
  const isMinimized = ref(false)
  const unreadCount = ref(0)
  const currentSession = ref(null)
  const conversations = ref([])
  const isLoading = ref(false)
  const isTyping = ref(false)

  // Computed
  const hasUnreadMessages = computed(() => unreadCount.value > 0)
  const isChatbotActive = computed(() => isOpen.value && !isMinimized.value)

  // Actions
  const open = () => {
    isOpen.value = true
    isMinimized.value = false
    clearUnreadCount()
  }

  const close = () => {
    isOpen.value = false
    isMinimized.value = false
  }

  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  const minimize = () => {
    isMinimized.value = true
  }

  const maximize = () => {
    isMinimized.value = false
  }

  const addUnreadMessage = () => {
    if (!isOpen.value || isMinimized.value) {
      unreadCount.value++
    }
  }

  const clearUnreadCount = () => {
    unreadCount.value = 0
  }

  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setTyping = (typing) => {
    isTyping.value = typing
  }

  const createSession = () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    currentSession.value = sessionId
    conversations.value.push({
      id: sessionId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return sessionId
  }

  const addMessage = (message) => {
    if (!currentSession.value) {
      createSession()
    }

    const session = conversations.value.find(s => s.id === currentSession.value)
    if (session) {
      session.messages.push({
        ...message,
        timestamp: new Date(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
      session.updatedAt = new Date()

      if (message.role === 'bot') {
        addUnreadMessage()
      }
    }
  }

  const getCurrentSession = () => {
    return conversations.value.find(s => s.id === currentSession.value)
  }

  const getSessionMessages = () => {
    const session = getCurrentSession()
    return session ? session.messages : []
  }

  const clearSession = () => {
    if (currentSession.value) {
      const session = conversations.value.find(s => s.id === currentSession.value)
      if (session) {
        session.messages = []
        session.updatedAt = new Date()
      }
    }
  }

  const deleteSession = (sessionId) => {
    conversations.value = conversations.value.filter(s => s.id !== sessionId)
    if (currentSession.value === sessionId) {
      currentSession.value = null
    }
  }

  const getAllSessions = () => {
    return conversations.value.sort((a, b) => b.updatedAt - a.updatedAt)
  }

  const exportChat = () => {
    const session = getCurrentSession()
    if (session) {
      return {
        sessionId: session.id,
        createdAt: session.createdAt,
        messages: session.messages,
        exportedAt: new Date()
      }
    }
    return null
  }

  // Reset store
  const reset = () => {
    isOpen.value = false
    isMinimized.value = false
    unreadCount.value = 0
    currentSession.value = null
    conversations.value = []
    isLoading.value = false
    isTyping.value = false
  }

  return {
    // State
    isOpen,
    isMinimized,
    unreadCount,
    currentSession,
    conversations,
    isLoading,
    isTyping,

    // Computed
    hasUnreadMessages,
    isChatbotActive,

    // Actions
    open,
    close,
    toggle,
    minimize,
    maximize,
    addUnreadMessage,
    clearUnreadCount,
    setLoading,
    setTyping,
    createSession,
    addMessage,
    getCurrentSession,
    getSessionMessages,
    clearSession,
    deleteSession,
    getAllSessions,
    exportChat,
    reset
  }
})
