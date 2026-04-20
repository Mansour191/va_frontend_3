// Conversation History Routes

const ConversationRoutes = [
  {
    path: '/history',
    name: 'ConversationHistory',
    component: () => import('@/views/ConversationHistory.vue'),
    meta: {
      requiresAuth: true,
      title: 'Conversation History',
      description: 'View and manage conversation history'
    }
  },
  {
    path: '/history/:id',
    name: 'ConversationDetail',
    component: () => import('@/views/ConversationDetail.vue'),
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Conversation Details',
      description: 'View specific conversation details'
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/Chat.vue'),
    meta: {
      requiresAuth: true,
      title: 'Chat',
      description: 'Live chat interface'
    }
  },
  {
    path: '/chat/:sessionId',
    name: 'ChatSession',
    component: () => import('@/views/Chat.vue'),
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Chat Session',
      description: 'Continue specific chat session'
    }
  }
];

export default ConversationRoutes;
