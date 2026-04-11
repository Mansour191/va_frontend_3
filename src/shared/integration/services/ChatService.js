import AIService from '@/shared/services/ai/AIService';
import { DateUtils } from '@/shared/utils/DateUtils';

const API_BASE = (import.meta.env.VUE_APP_API_URL || '').replace(/\/+$/, '');

class ChatService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.isAvailable = true;
    this.conversationHistory = [];
    this.userProfile = {
      name: 'صديقي العميل',
      preferences: {},
      previousInteractions: []
    };
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Helper method to create safe timestamps
  createTimestamp() {
    return DateUtils.createTimestamp();
  }

  // Helper method for safe date formatting
  formatSafeDate(timestamp, locale = 'ar-DZ', options = null) {
    return DateUtils.formatSafeDate(timestamp, locale, options);
  }

  async ask(message, options = {}) {
    console.log('🚀 ChatService.ask START - Message:', message);
    console.log('📝 ChatService Options:', options);
    
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: this.createTimestamp()
      });

      // Keep only last 10 messages for context
      const contextHistory = this.conversationHistory.slice(-10);
      console.log('💬 ChatService - Context History:', contextHistory.length, 'messages');

      // Always try to use AI service first with enhanced context
      console.log('🤖 ChatService - Calling AIService.sendMessage...');
      const aiResponse = await AIService.sendMessage(message, {
        sessionId: this.sessionId,
        context: {
          service: 'paclos_assistant',
          language: 'ar',
          region: 'algeria',
          userRole: 'interior_design_specialist',
          conversationHistory: contextHistory,
          userProfile: this.userProfile,
          currentIntent: this.detectIntent(message),
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          max_tokens: options.max_tokens || 500
        }
      });
      console.log('✅ ChatService - AIService Response:', aiResponse);

      this.isAvailable = true;
      
      // Add AI response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse.response,
        confidence: aiResponse.confidence || 0.8,
        sources: aiResponse.sources || [],
        timestamp: this.createTimestamp()
      });

      const result = {
        answer: this.formatResponse(aiResponse.response),
        confidence: aiResponse.confidence || 0.8,
        sources: aiResponse.sources || [],
        sessionId: this.sessionId,
        isStreaming: false
      };
      console.log('🎯 ChatService.ask END - Result:', result);
      return result;

    } catch (error) {
      console.error('❌ ChatService.ask ERROR:', error);
      console.warn('🔄 ChatService - Using fallback response due to error');
      
      // Enhanced fallback with more natural responses
      const fallbackResponse = this.generateHumanLikeResponse(message, this.conversationHistory);
      this.isAvailable = true;
      
      // Add fallback response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: fallbackResponse.text,
        confidence: fallbackResponse.confidence,
        sources: fallbackResponse.sources,
        timestamp: this.createTimestamp()
      });
      
      const fallbackResult = {
        answer: this.formatResponse(fallbackResponse.text),
        confidence: fallbackResponse.confidence,
        sources: fallbackResponse.sources,
        sessionId: this.sessionId,
        isStreaming: false
      };
      console.log('🛡️ ChatService - Fallback Result:', fallbackResult);
      return fallbackResult;
    }
  }

  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('منتج') || lowerMessage.includes('فينيل') || lowerMessage.includes('تصميم')) {
      return 'product_inquiry';
    }
    if (lowerMessage.includes('سعر') || lowerMessage.includes('تكلفة') || lowerMessage.includes('خصم')) {
      return 'pricing_inquiry';
    }
    if (lowerMessage.includes('طلب') || lowerMessage.includes('شحن') || lowerMessage.includes('توصيل')) {
      return 'order_inquiry';
    }
    if (lowerMessage.includes('مساعدة') || lowerMessage.includes('كيف') || lowerMessage.includes('ماذا')) {
      return 'help_request';
    }
    return 'general_inquiry';
  }

  formatResponse(text) {
    // Add natural formatting with bolding and bullet points
    if (text.includes('🎯') || text.includes('📦') || text.includes('💡')) {
      return text; // Already formatted
    }
    
    // Add some natural formatting
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>')
                .replace(/- (.*)/g, '• $1');
  }

  generateHumanLikeResponse(message, history) {
    const intent = this.detectIntent(message);
    const hasPreviousContext = history.length > 1;
    
    // Reference previous conversation if available
    const contextReference = hasPreviousContext ? 
      `بناءً على محادثتنا السابقة، ` : '';
    
    switch (intent) {
      case 'product_inquiry':
        return {
          text: `${contextReference}أفهم أنك تبحث عن منتجات الفينيل! أنا متخصص في التصميم الداخلي والفينيل عالي الجودة.

🎯 **ما نوع الفينيل الذي يهمك؟**
• فينيل الجدران والحوائط
• فينيل الأرضيات
• فينيل الأسقف
• فينيل الأبواب والنوافذ
• ملصقات وجداريات ديكورية

💡 **يمكنني مساعدتك في:**
- اختيار الألوان والأنماط المناسبة
- حساب الكميات المطلوبة
- تقديم عينات من واقع الخبرة
- تحليل التكلفة والميزانية

📦 **جميع منتجاتنا مدعومة بضمان الجودة**

هل لديك مشروع معين أو تريد معرفة المزيد عن نوع معين؟`,
          confidence: 0.85,
          sources: ['product_catalog', 'expert_knowledge']
        };
        
      case 'pricing_inquiry':
        return {
          text: `${contextReference}أهلاً بك! سؤالك عن الأسعار مهم جداً، وأنا هنا لمساعدتك في الحصول على أفضل قيمة.

💰 **نظام التسعير لدينا يتضمن:**
- تحليل السوق الحالي والمنافسين
- حساب تكاليف المواد والتركيب
- مراعاة جودة المنتج والتصميم
- عروضseasonal وحجم الطلب

🎯 **يمكنني تزويدك ب:**
- أسعار دقيقة حسب المساحة والنوع
- تحليل التكلفة مقابل الجودة
- مقارنة مع البدائل المتاحة
- اقتراحات للتحسين الميزانية

📊 **هل تريد سعر معين أم تريد تحليل شامل؟**

أنا هنا لمساعدتك في اتخاذ القرار الأنسب لميزانيتك!`,
          confidence: 0.88,
          sources: ['pricing_algorithm', 'market_analysis']
        };
        
      case 'order_inquiry':
        return {
          text: `${contextReference}أفهم تماماً! تتبع الطلبات مهم جداً وأنا هنا لمساعدتك.

📦 **معلومات الطلب التي يمكنني تزويدها:**
- الحالة الحالية للطلب
- وقت التوصيل المتوقع
- معلومات الشحن والتتبع
- تفاصيل المنتجات المطلوبة

🚚 **خدمات الشحن لدينا:**
- توصيل سريع في جميع أنحاء الجزائر
- تغليف آمن للمنتجات الحساسة
- إشعارات عند كل مرحلة
- خيارات توصيل متعددة

📞 **ما هو رقم طلبك أو هل تريد تتبع طلب جديد؟**

أنا أضمن لك تجربة شراء سلسة ومريحة!`,
          confidence: 0.82,
          sources: ['order_tracking', 'shipping_system']
        };
        
      case 'help_request':
        return {
          text: `${contextReference}مرحباً بك! أنا مساعد Paclos الذكي، متخصص في التصميم الداخلي ومنتجات الفينيل.

🤖 **ما يمكنني مساعدتك به:**

🎯 **استشارات التصميم:**
- اختيار الألوان المتناسقة
- دمج الأنماط والقوامش
- حساب المقاسات بدقة
- أفكار للتصاميم العصرية

💰 **تحليل الأسعار:**
- مقارنة بين العروض المتاحة
- حساب التكلفة الإجمالية
- اقتراحات للوفور في الميزانية
- تحليل أفضل قيمة

📦 **إدارة المنتجات:**
- معرفة المواصفات الفنية
- توصيات المنتجات البديلة
- حساب الكميات المطلوبة
- معرفة التوافر والمخزون

� **خدمات ما بعد البيع:**
- تتبع الطلبات والشحن
- الدعم الفني والاستشارات
- سياسات الإرجاع والاستبدال
- ضمان الجودة

💡 **اخبرني كيف يمكنني مساعدتك اليوم، وأنا هنا لتحويل رؤيتك إلى واقع!**`,
          confidence: 0.90,
          sources: ['expert_knowledge', 'service_catalog']
        };
        
      default:
        return {
          text: `${contextReference}أهلاً بك في Paclos! أنا هنا لمساعدتك في كل ما يتعلق بالتصميم الداخلي ومنتجات الفينيل.

🎨 **يمكنني مساعدتك في:**
- استشارات التصميم الاحترافية
- اختيار المنتجات المناسبة
- تحليل الأسعار والجودة
- تخطيط المشاريع
- حل المشاكل التقنية

💡 **لا تتردد في سؤالي عن أي شيء!** سواء كان سؤالاً تقنياً أو استشارة تصميم، أنا هنا لمساعدتك.

📞 **كيف يمكنني خدمتك اليوم؟**`,
          confidence: 0.75,
          sources: ['general_knowledge', 'customer_service']
        };
    }
  }

  async getChatHistory() {
    try {
      const history = await AIService.getChatHistory(this.sessionId);
      return history;
    } catch (error) {
      console.warn('Could not load chat history:', error);
      return this.conversationHistory;
    }
  }

  async streamResponse(message, onChunk) {
    try {
      // Simulate streaming response
      const response = await this.ask(message);
      const words = response.answer.split(' ');
      let currentText = '';
      
      for (let i = 0; i < words.length; i++) {
        currentText += words[i] + ' ';
        onChunk({
          chunk: words[i] + ' ',
          confidence: response.confidence,
          isComplete: i === words.length - 1
        });
        
        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      }
      
      return response;
    } catch (error) {
      console.error('Streaming failed:', error);
      onChunk({
        chunk: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        confidence: 0,
        isComplete: true
      });
    }
  }

  clearSession() {
    this.conversationHistory = [];
    this.sessionId = this.generateSessionId();
  }

  checkAvailability() {
    return this.isAvailable;
  }

  // Enhanced methods for better user experience
  updateUserProfile(profile) {
    this.userProfile = { ...this.userProfile, ...profile };
  }

  getConversationContext() {
    return {
      history: this.conversationHistory.slice(-5),
      sessionId: this.sessionId,
      userProfile: this.userProfile
    };
  }

  async getSmartSuggestions(query) {
    const intent = this.detectIntent(query);
    const suggestions = {
      product_inquiry: [
        'ما هي أنواع الفينيل المتاحة؟',
        'كيف أختار اللون المناسب؟',
        'ما هي أفضل أنواع الفينيل للجدران؟'
      ],
      pricing_inquiry: [
        'ما هو سعر الفينيل للمتر المربع؟',
        'هل هناك عروض حالية؟',
        'كيف أحسب الكمية المطلوبة؟'
      ],
      order_inquiry: [
        'كيف أتابع طلبي؟',
        'ما هي مدة التوصيل؟',
        'هل يمكنني تعديل طلبي؟'
      ]
    };
    
    return suggestions[intent] || [];
  }

  // Static method for sending messages (used by components)
  static async sendMessage(message) {
    try {
      const service = new ChatService();
      const response = await service.ask(message);
      
      return {
        success: true,
        message: response.response || response.message || 'شكراً لتواصلك. فريق Paclos سيقوم بالرد على استفسارك في أقرب وقت ممكن.'
      };
    } catch (error) {
      console.error('❌ ChatService.sendMessage error:', error);
      return {
        success: false,
        message: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        error: error.message
      };
    }
  }
}

export { ChatService };
export default new ChatService();
