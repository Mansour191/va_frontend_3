/**
 * AITranslation.js Plugin
 * نظام ذكاء اصطناعي متكامل للترجمة الديناميكية لكامل الموقع
 */
import AIService from '@/shared/services/ai/AIService';
import { reactive, watch } from 'vue';
import { safeJSONParse } from '@/shared/utils/safeParser.js';

const AITranslation = {
  install(app, options = {}) {
    // الحالة العالمية للترجمة بالذكاء الاصطناعي
    const state = reactive({
      isAITranslateEnabled: localStorage.getItem('ai_translate_enabled') === 'true',
      currentLocale: localStorage.getItem('language') || 'ar',
      translations: safeJSONParse(localStorage.getItem('ai_translations_cache'), {}, 'AITranslation.js')
    });

    // مراقبة تغيير اللغة
    window.addEventListener('language-changed', (event) => {
      state.currentLocale = event.detail;
    });

    /**
     * وظيفة الترجمة بالذكاء الاصطناعي العالمية
     * @param {string} text - النص المراد ترجمته
     * @param {string} targetLang - اللغة المستهدفة (اختياري، تستخدم الحالية بشكل افتراضي)
     */
    const aiTranslate = async (text, targetLang = state.currentLocale) => {
      if (!text || targetLang === 'ar') return text;
      
      const cacheKey = `${text}_${targetLang}`;
      if (state.translations[cacheKey]) {
        return state.translations[cacheKey];
      }

      console.log('AI Translation:', {
        text,
        targetLang,
        cacheKey,
        fromCache: !!state.translations[cacheKey]
      });

      try {
        const translated = await AIService.translate(text, targetLang);
        state.translations[cacheKey] = translated;
        
        console.log('AI Translation result:', {
          original: text,
          translated,
          targetLang
        });
        
        // تحديث الكاش في التخزين المحلي (بشكل محدود لتوفير المساحة)
        const cacheEntries = Object.entries(state.translations);
        if (cacheEntries.length > 500) {
          const limitedCache = Object.fromEntries(cacheEntries.slice(-500));
          localStorage.setItem('ai_translations_cache', JSON.stringify(limitedCache));
        } else {
          localStorage.setItem('ai_translations_cache', JSON.stringify(state.translations));
        }

        return translated;
      } catch (error) {
        console.error('AI Translation Plugin Error:', error);
        return text;
      }
    };

    // إضافة الخاصية العالمية
    app.config.globalProperties.$aiT = aiTranslate;
    app.config.globalProperties.$aiState = state;

    // توفير الخاصية للمكونات التي تستخدم الـ Composition API
    app.provide('aiTranslate', aiTranslate);
    app.provide('aiState', state);

    /**
     * توجيه (Directive) للترجمة التلقائية للعناصر
     * v-ai-t
     */
    app.directive('ai-t', {
      async mounted(el, binding) {
        const originalText = el.innerText || el.textContent;
        if (!originalText || state.currentLocale === 'ar') return;

        // حفظ النص الأصلي
        el.dataset.originalText = originalText;

        const translate = async () => {
          if (state.currentLocale === 'ar') {
            el.innerText = el.dataset.originalText;
            return;
          }
          
          el.classList.add('ai-translating');
          const translated = await aiTranslate(el.dataset.originalText, state.currentLocale);
          el.innerText = translated;
          el.classList.remove('ai-translating');
          el.classList.add('ai-translated');
        };

        await translate();

        // مراقبة تغيير اللغة لتحديث الترجمة
        watch(() => state.currentLocale, async (newLocale) => {
          await translate();
        });
      },
      async updated(el, binding) {
        // إذا تغير النص داخلياً
        if (el.dataset.originalText !== (el.innerText || el.textContent) && !el.classList.contains('ai-translating') && !el.classList.contains('ai-translated')) {
           el.dataset.originalText = el.innerText || el.textContent;
           if (state.currentLocale !== 'ar') {
             const translated = await aiTranslate(el.dataset.originalText, state.currentLocale);
             el.innerText = translated;
           }
        }
      }
    });

    /**
     * دالة لترجمة جميع العناصر في الصفحة
     */
    const translateAllElements = async (targetLang) => {
      console.log('Translating all elements to:', targetLang);
      
      // البحث عن جميع العناصر القابلة للترجمة
      const allTranslatableElements = document.querySelectorAll(
        '[data-i18n], [data-translate], h1, h2, h3, h4, h5, h6, p, span, div, button, a, li, td, th'
      );
      
      console.log('Found elements to translate:', allTranslatableElements.length);
      
      for (const element of allTranslatableElements) {
        if (element.textContent && targetLang !== 'ar') {
          const originalText = element.textContent;
          const translated = await aiTranslate(originalText, targetLang);
          element.textContent = translated;
          element.classList.add('ai-translated');
          
          console.log('Translated element:', {
            tag: element.tagName,
            original: originalText,
            translated: translated
          });
        }
      }
      
      console.log('Translation completed for', targetLang);
    };

    // إضافة أنماط CSS بسيطة للترجمة
    const style = document.createElement('style');
    style.textContent = `
      .ai-translating {
        opacity: 0.6;
        filter: blur(1px);
        transition: all 0.3s ease;
      }
      .ai-translated {
        animation: fadeInTranslate 0.5s ease-out;
      }
      @keyframes fadeInTranslate {
        from { opacity: 0.5; transform: translateY(2px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);

    // جعل الدالة متاحة عالمياً
    window.translateAllElements = translateAllElements;
  }
};

export default AITranslation;
