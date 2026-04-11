/**
 * FAQ Service - Handles frequently asked questions data management
 * Provides API integration for dynamic FAQ content
 */

class FAQService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  }

  /**
   * Make API request helper
   */
  async apiRequest(endpoint, options = {}) {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ FAQ API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Get FAQ items for a specific product/category
   * @param {String} productId - Product ID
   * @param {String} category - Product category
   * @returns {Promise<Array>} Array of FAQ items
   */
  static async getFAQItems(productId, category = 'general') {
    try {
      const service = new FAQService();
      const response = await service.apiRequest(`/faq/?product_id=${productId}&category=${category}`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error fetching FAQ items:', error);
      // Return default FAQ items based on category
      const defaultFAQs = getDefaultFAQs(category);
      return {
        success: true,
        data: defaultFAQs
      };
    }
  }

  /**
   * Get general FAQ items
   * @returns {Promise<Array>} Array of general FAQ items
   */
  static async getGeneralFAQs() {
    try {
      const service = new FAQService();
      const response = await service.apiRequest('/faq/general/');
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error fetching general FAQs:', error);
      return {
        success: true,
        data: getDefaultFAQs('general')
      };
    }
  }

  /**
   * Submit a new FAQ question
   * @param {Object} questionData - Question data
   * @returns {Promise<Object>} Submitted question response
   */
  static async submitQuestion(questionData) {
    try {
      const service = new FAQService();
      const response = await service.apiRequest('/faq/submit/', {
        method: 'POST',
        body: JSON.stringify(questionData)
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error submitting question:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search FAQ items
   * @param {String} query - Search query
   * @param {String} category - Category filter
   * @returns {Promise<Array>} Array of matching FAQ items
   */
  static async searchFAQs(query, category = null) {
    try {
      const service = new FAQService();
      let url = `/faq/search/?q=${encodeURIComponent(query)}`;
      if (category) {
        url += `&category=${category}`;
      }
      const response = await service.apiRequest(url);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error searching FAQs:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get FAQ categories
   * @returns {Promise<Array>} Array of FAQ categories
   */
  static async getFAQCategories() {
    try {
      const service = new FAQService();
      const response = await service.apiRequest('/faq/categories/');
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error fetching FAQ categories:', error);
      return {
        success: true,
        data: [
          { id: 'general', name: 'عام', nameEn: 'General' },
          { id: 'walls', name: 'جدران', nameEn: 'Walls' },
          { id: 'doors', name: 'أبواب', nameEn: 'Doors' },
          { id: 'cars', name: 'سيارات', nameEn: 'Cars' },
          { id: 'kitchens', name: 'مطابخ', nameEn: 'Kitchens' },
          { id: 'furniture', name: 'أثاث', nameEn: 'Furniture' },
          { id: 'ceilings', name: 'أسقف', nameEn: 'Ceilings' },
          { id: 'tiles', name: 'بلاط', nameEn: 'Tiles' }
        ]
      };
    }
  }
}

/**
 * Get default FAQ items based on category
 */
function getDefaultFAQs(category) {
  const faqDatabase = {
    general: [
      {
        id: 1,
        question: 'ما هي مدة الضمان على المنتجات؟',
        answer: 'نقدم ضمان لمدة سنة على جميع منتجاتنا ضد أي عيوب تصنيعية. يشمل الضمان ثبات الألوان وجودة الخامة.'
      },
      {
        id: 2,
        question: 'كم يستغرق وقت التوصيل؟',
        answer: 'يتم توصيل المنتجات خلال 2-5 أيام عمل لجميع الولايات الجزائرية.'
      },
      {
        id: 3,
        question: 'هل يمكن إرجاع المنتج؟',
        answer: 'نعم، يمكن إرجاع المنتج خلال 14 يوماً من تاريخ الاستلام في حال وجود عيب مصنعي.'
      }
    ],
    walls: [
      {
        id: 1,
        question: 'ما هي أفضل أنواع الفينيل للجدران؟',
        answer: 'يعتمد على استخدام الغرفة. للمناطق الرطبة مثل المطابخ والحمامات، ننصح بالفينيل المقاوم للماء.'
      },
      {
        id: 2,
        question: 'كم تدوم تغطية الجدران؟',
        answer: 'مع التركيب الصحيح والعناية المناسبة، تدوم تغطية الجدران من 5-10 سنوات.'
      }
    ],
    doors: [
      {
        id: 1,
        question: 'هل تقدمون تركيب الأبواب؟',
        answer: 'نعم، نقدم خدمة التركيب الاحترافية من قبل فنيين متخصصين.'
      },
      {
        id: 2,
        question: 'ما هي الأبعاد المتاحة للأبواب؟',
        answer: 'ننتج أبواب بجميع الأبعاد القياسية ويمكننا تصنيع أبواب حسب المقاسات المطلوبة.'
      }
    ],
    cars: [
      {
        id: 1,
        question: 'هل الفينيل سيارات آمن على الطلاء الأصلي؟',
        answer: 'نعم، منتجاتنا آمنة 100% على الطلاء الأصلي ويمكن إزالتها دون أي أثر.'
      },
      {
        id: 2,
        question: 'كم يستغرق تغليف السيارة؟',
        answer: 'يستغرق تغليف السيارة الكامل من 4-6 ساعات حسب حجم السيارة.'
      }
    ],
    kitchens: [
      {
        id: 1,
        question: 'هل الفينيل مناسب للمطابخ؟',
        answer: 'نعم، نقدم أنواع خاصة مقاومة للحرارة والرطوبة ومضادة للبكتيريا.'
      },
      {
        id: 2,
        question: 'هل يمكن تنظيف الفينيل بسهولة؟',
        answer: 'نعم، يمكن تنظيفه بسهولة باستخدام قطعة قماش ناعمة وماء دافئ.'
      }
    ],
    furniture: [
      {
        id: 1,
        question: 'هل يمكن تطبيق الفينيل على الأثاث القديم؟',
        answer: 'نعم، يمكن تجديد الأثاث القديم بتطبيق الفينيل لإعطائه مظهراً جديداً.'
      },
      {
        id: 2,
        question: 'هل الفينيل يتحمل الاستخدام اليومي؟',
        answer: 'نعم، منتجاتنا مصممة لتحمل الاستخدام اليومي المكثف.'
      }
    ],
    ceilings: [
      {
        id: 1,
        question: 'هل الفينيل الأسقف مقاوم للحريق؟',
        answer: 'نعم، منتجاتنا حاصلة على شهادات مقاومة الحريق.'
      },
      {
        id: 2,
        question: 'هل يمكن تركيب الفينيل على الأسقف المعلقة؟',
        answer: 'نعم، يمكن تركيبه على جميع أنواع الأسقف.'
      }
    ],
    tiles: [
      {
        id: 1,
        question: 'هل يمكن تطبيق الفينيل على البلاط القديم؟',
        answer: 'نعم، يمكن تطبيقه مباشرة على البلاط القديم بعد التنظيف.'
      },
      {
        id: 2,
        question: 'هل الفينيل يناسب المناطق ذات المرور العالي؟',
        answer: 'نعم، نقدم أنواع خاصة مقاومة للاهتراء للمناطق ذات المرور العالي.'
      }
    ]
  };

  return faqDatabase[category] || faqDatabase.general;
}

export default FAQService;
