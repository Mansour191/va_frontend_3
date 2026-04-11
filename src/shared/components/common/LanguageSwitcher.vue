<template>
  <div class="language-switcher" v-click-outside="closeMenu">
    <button 
      class="lang-btn" 
      @click="toggleLanguageMenu"
      aria-haspopup="true"
      :aria-expanded="showLanguageMenu"
      :aria-label="$t('chooseLanguage')"
    >
      <v-icon icon="mdi-translate" size="14" aria-hidden="true"></v-icon>
      <span class="lang-text">{{
        currentLang === 'ar' ? 'AR' : 
        currentLang === 'en' ? 'EN' : 
        currentLang === 'fr' ? 'FR' : 
        currentLang === 'ch' ? '中文' : 
        currentLang.toUpperCase()
      }}</span>
      <v-icon icon="mdi-chevron-down" :class="{ 'rotate': showLanguageMenu }" size="12"></v-icon>
    </button>
    
    <transition name="slide-up">
      <div 
        class="lang-dropdown" 
        v-if="showLanguageMenu"
        role="menu"
      >
        <div 
          v-for="lang in languages"
          :key="lang.code"
          class="lang-option"
          :class="{ active: currentLang === lang.code }"
          @click="changeLanguage(lang.code)"
          role="menuitem"
          tabindex="0"
        >
          <div class="lang-info">
            <span class="flag-icon" :class="`flag-${lang.code}`"></span>
            <span>{{ lang.name }}</span>
          </div>
          <i v-if="currentLang === lang.code" class="mdi mdi-check check-icon"></i>
        </div>

        <!-- Reset to Arabic Button -->
        <div 
          v-if="currentLang !== 'ar'"
          class="lang-option reset-option"
          @click="resetToArabic"
          role="menuitem"
          tabindex="0"
        >
          <div class="lang-info">
            <v-icon icon="mdi-refresh" size="16" aria-hidden="true"></v-icon>
            <span>إعادة تعيين العربية</span>
          </div>
        </div>

        <div class="dropdown-divider"></div>
        
        <!-- AI Translation Option -->
        <div 
          class="lang-option ai-option"
          @click="handleAITranslate"
          role="menuitem"
          tabindex="0"
        >
          <div class="lang-info">
            <v-icon icon="mdi-robot" size="16" aria-hidden="true"></v-icon>
            <span>{{ $t('aiTranslate') || 'ترجمة بالذكاء الاصطناعي' }}</span>
          </div>
          <div class="ai-badge">AI</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import AIService from '@/shared/services/ai/AIService';

const { locale, t } = useI18n();
const aiTranslate = inject('aiTranslate');
const aiState = inject('aiState');

const showLanguageMenu = ref(false);
const isTranslating = ref(false);
const languages = [
  { code: 'ar', name: 'العربية' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ch', name: '中文' },
];

const currentLang = computed(() => locale.value);

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value;
};

const closeMenu = () => {
  showLanguageMenu.value = false;
};

const changeLanguage = (lang) => {
  // Validate language code
  if (!['ar', 'en', 'fr', 'ch'].includes(lang)) {
    console.error('Invalid language code:', lang);
    return;
  }
  
  try {
    locale.value = lang;
    localStorage.setItem('language', lang);
    // Update document direction based on language
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    showLanguageMenu.value = false;
    
    // Reset AI translation when switching back to Arabic
    if (lang === 'ar') {
      isTranslating.value = false;
      aiState.isAITranslateEnabled = false;
      localStorage.setItem('ai_translate_enabled', 'false');
      console.log('AI Translation disabled for Arabic locale');
    }
    
    // Dispatch a global event for language change if needed
    window.dispatchEvent(new CustomEvent('language-changed', { detail: lang }));
    
    // Trigger AI translation for non-Arabic languages
    if (lang !== 'ar') {
      setTimeout(() => {
        handleAITranslate();
        // Also trigger comprehensive translation
        if (window.translateAllElements) {
          window.translateAllElements(lang);
        }
      }, 500);
    }
  } catch (error) {
    console.error('Language change error:', error);
    // Show user-friendly error message
    alert(t('languageChangeError') || 'حدث خطأ أثناء تغيير اللغة. يرجى المحاولة مرة أخرى.');
  }
};

const handleAITranslate = async () => {
  showLanguageMenu.value = false;
  
  // Allow AI translation for all languages
  isTranslating.value = true;
  console.log('AI Translation requested for locale:', currentLang.value);
  console.log('Current language code:', currentLang.value);
  console.log('Available languages:', ['ar', 'en', 'fr', 'ch']);
  
  try {
    // ترجمة العناصر التي تحمل توجيه v-ai-t تلقائياً
    // بالإضافة إلى ذلك، سنبحث عن أي نص غير مترجم في الصفحة (اختياري)
    const elementsToTranslate = document.querySelectorAll('[v-ai-t]');
    console.log('Elements found to translate:', elementsToTranslate.length);
    
    // ترجمة العناصر الموجودة إلى اللغة الحالية
    for (const element of elementsToTranslate) {
      if (element.textContent) {
        // إزالة البادئات القديمة
        let cleanText = element.textContent.replace(/^\[(AI Translated|Traduit par IA|AI翻译)\]/, '');
        
        // ترجمة النص إلى اللغة الحالية
        if (currentLang.value !== 'ar') {
          console.log('Translating text:', cleanText);
          console.log('To language:', currentLang.value);
          const translatedText = await AIService.translate(cleanText, currentLang.value);
          console.log('Translation result:', translatedText);
          element.textContent = translatedText;
        }
      }
    }
    
    // We can also trigger a global "AI Mode" that component can react to
    aiState.isAITranslateEnabled = true;
    localStorage.setItem('ai_translate_enabled', 'true');
    
    alert(t('aiTranslationStarted') || 'بدأت الترجمة الذكية للمحتوى المفتوح حالياً');
  } catch (error) {
    console.error('AI Translation Error:', error);
  } finally {
    isTranslating.value = false;
  }
};

// Custom directive for clicking outside
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.lang-btn {
  background: var(--bg-surface, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
  color: var(--text-main, #fff);
  padding: 8px 15px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
  font-weight: 600;
}

.lang-btn:hover {
  border-color: var(--gold-primary, #d4af37);
  background: rgba(212, 175, 55, 0.1);
  transform: translateY(-1px);
}

.lang-btn .fa-chevron-down {
  font-size: 0.7rem;
  transition: transform 0.3s ease;
  opacity: 0.7;
}

.lang-btn .fa-chevron-down.rotate {
  transform: rotate(180deg);
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: var(--bg-surface, rgba(26, 26, 46, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 8px;
  z-index: 9999;
  overflow: hidden;
}

.lang-option {
  padding: 12px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  color: var(--text-secondary, #a0a0a0);
}

.lang-option:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--gold-primary, #d4af37);
  padding-inline-start: 20px;
}

.lang-option.active {
  background: rgba(212, 175, 55, 0.1);
  color: var(--gold-primary, #d4af37);
  font-weight: 700;
}

.lang-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flag-icon {
  width: 20px;
  height: 16px;
  margin-right: 8px;
  border-radius: 2px;
  display: inline-block;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  font-weight: bold;
  color: white;
}

.flag-ar {
  background: linear-gradient(135deg, #009639 0%, #00d4ff 100%);
}

.flag-ar::before {
  content: "🇩🇦";
}

.flag-en {
  background: linear-gradient(135deg, #012169 0%, #1e3a8a 100%);
}

.flag-en::before {
  content: "🇬🇧";
}

.flag-fr {
  background: linear-gradient(135deg, #002395 0%, #0055a4 100%);
}

.flag-fr::before {
  content: "🇫🇷";
}

.flag-ch {
  background: linear-gradient(135deg, #de2910 0%, #ff6b35 100%);
}

.flag-ch::before {
  content: "🇨🇳";
}

.lang-option:hover .flag-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.lang-option.active .flag-icon {
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.3);
  transform: scale(1.05);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-subtle, rgba(255, 255, 255, 0.1));
  margin: 8px;
}

.ai-option {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0.1) 100%);
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.ai-option:hover {
  background: var(--gold-gradient, linear-gradient(135deg, #d4af37 0%, #ffd700 100%));
  color: #1a1a2e;
}

.ai-icon {
  color: var(--gold-primary, #d4af37);
}

.ai-option:hover .ai-icon {
  color: #1a1a2e;
}

.reset-option {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0.1) 100%);
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.reset-option:hover {
  background: var(--gold-gradient, linear-gradient(135deg, #d4af37 0%, #ffd700 100%));
  color: #1a1a2e;
}

.reset-option:hover .ai-icon {
  color: #1a1a2e;
}

.reset-option:hover .v-icon {
  color: #1a1a2e;
}

.ai-badge {
  font-size: 0.65rem;
  background: var(--gold-primary, #d4af37);
  color: #1a1a2e;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 800;
}

.ai-option:hover .ai-badge {
  background: #1a1a2e;
  color: var(--gold-primary, #d4af37);
}

.reset-option:hover .ai-badge {
  background: #1a1a2e;
  color: var(--gold-primary, #d4af37);
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
