/**
 * AIService.js
 * خدمة متخصصة للتعامل مع عمليات الترجمة والذكاء الاصطناعي (OpenAI / DeepL / Mock)
 */

class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_AI_API_KEY || '';
    this.provider = import.meta.env.VITE_AI_PROVIDER || 'mock'; // 'openai', 'deepl', 'mock'
    this.cache = new Map();
  }

  /**
   * ترجمة نص معين باستخدام الذكاء الاصطناعي
   * @param {string} text - النص المراد ترجمته
   * @param {string} targetLang - اللغة المستهدفة (ar, en, fr)
   * @param {string} sourceLang - اللغة المصدر (اختياري)
   */
  async translate(text, targetLang, sourceLang = 'auto') {
    if (!text || text.trim() === '') return '';
    
    // تنظيف النص والتحقق من التكرار في الذاكرة المؤقتة
    const cacheKey = `${text.substring(0, 50)}_${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let translatedText = '';

      if (this.provider === 'openai' && this.apiKey) {
        translatedText = await this._translateWithOpenAI(text, targetLang);
      } else if (this.provider === 'deepl' && this.apiKey) {
        translatedText = await this._translateWithDeepL(text, targetLang);
      } else {
        // محاكاة الترجمة للذكاء الاصطناعي (Mock) في حال عدم وجود مفتاح API
        translatedText = await this._translateMock(text, targetLang);
      }

      // حفظ في الذاكرة المؤقتة
      this.cache.set(cacheKey, translatedText);
      return translatedText;
    } catch (error) {
      console.error('❌ AI Translation Error:', error);
      return text; // في حال الفشل نرجع النص الأصلي كخيار أخير
    }
  }

  /**
   * ترجمة كائن (Object) يحتوي على نصوص متعددة (مثل وصف منتج وعنوانه)
   */
  async translateObject(obj, targetLang, fields = ['title', 'description', 'excerpt', 'summary']) {
    const translatedObj = { ...obj };
    const promises = fields.map(async (field) => {
      if (obj[field]) {
        translatedObj[field] = await this.translate(obj[field], targetLang);
      }
    });

    await Promise.all(promises);
    return translatedObj;
  }

  // --- محركات الترجمة الخاصة ---

  async _translateWithOpenAI(text, targetLang) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a professional translator for an e-commerce platform called "Vinyl Art". 
                      Translate the provided text into ${targetLang}. 
                      Maintain the professional tone and formatting (if any).`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  async _translateWithDeepL(text, targetLang) {
    // محرك DeepL (مثال سريع)
    const langMap = { 
      ar: 'AR', 
      en: 'EN-US', 
      fr: 'FR',
      ch: 'ZH' // ✅ إضافة اللغة الصينية
    };
    const target = langMap[targetLang] || 'EN-US';
    
    const params = new URLSearchParams();
    params.append('auth_key', this.apiKey);
    params.append('text', text);
    params.append('target_lang', target);

    const response = await fetch(`https://api-free.deepl.com/v2/translate?${params.toString()}`);
    const data = await response.json();
    return data.translations[0].text;
  }

  async _translateMock(text, targetLang) {
    // محاكاة للترجمة في بيئة التطوير
    return new Promise((resolve) => {
      setTimeout(() => {
        const prefixes = { 
          ar: '[مترجم] ', 
          en: '[AI Translated] ', 
          fr: '[Traduit par IA] ',
          ch: '[AI翻译] ' // ✅ إضافة اللغة الصينية
        };
        resolve(`${prefixes[targetLang] || ''}${text}`);
      }, 500);
    });
  }
}

export default new AIService();
