import i18n from '@/plugins/i18n';

class CategoryService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    this.cache = new Map();
    this.cacheTTL = 10 * 60 * 1000; // 10 دقائق
  }

  /**
   * جلب جميع الفئات من قاعدة البيانات
   */
  async getAllCategories() {
    const cacheKey = `categories_all_${i18n.global.locale.value || i18n.global.locale}`;
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiBaseUrl}/categories/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const categories = this._transformCategories(data);
      
      this._setCache(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return this._getFallbackCategories();
    }
  }

  /**
   * جلب فئة معينة بالـ slug
   */
  async getCategoryBySlug(slug) {
    const cacheKey = `category_${slug}_${i18n.global.locale.value || i18n.global.locale}`;
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiBaseUrl}/categories/${slug}/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const category = this._transformCategory(data);
      
      this._setCache(cacheKey, category);
      return category;
    } catch (error) {
      console.error(`❌ Error fetching category ${slug}:`, error);
      return this._getFallbackCategory(slug);
    }
  }

  /**
   * جلب الفئات الفرعية لفئة رئيسية
   */
  async getSubCategories(parentSlug) {
    try {
      // في الباكيند يمكن إضافة علاقة الفئات الفرعية لاحقاً
      // حالياً سنستخدم بيانات ثابتة محسّنة
      const subCategoriesMap = {
        'cars': [
          { id: 1, emoji: '⚫', titleKey: 'matteCars', descKey: 'matteCarsDesc', link: '/search?q=matte' },
          { id: 2, emoji: '✨', titleKey: 'glossyCars', descKey: 'glossyCarsDesc', link: '/search?q=glossy' },
          { id: 3, emoji: '🎨', titleKey: 'satinCars', descKey: 'satinCarsDesc', link: '/search?q=satin' },
          { id: 4, emoji: '🪞', titleKey: 'chromeCars', descKey: 'chromeCarsDesc', link: '/search?q=chrome' },
        ],
        'ceilings': [
          { id: 1, emoji: '🌌', titleKey: 'starryCeilings', descKey: 'starryCeilingsDesc', link: '/search?q=starry' },
          { id: 2, emoji: '🏢', titleKey: 'stretchCeilings', descKey: 'stretchCeilingsDesc', link: '/search?q=stretch' },
          { id: 3, emoji: '🎨', titleKey: 'decorativeCeilings', descKey: 'decorativeCeilingsDesc', link: '/search?q=decorative' },
        ],
        'doors': [
          { id: 1, emoji: '🚪', titleKey: 'woodenDoors', descKey: 'woodenDoorsDesc', link: '/search?q=wooden' },
          { id: 2, emoji: '🏢', titleKey: 'modernDoors', descKey: 'modernDoorsDesc', link: '/search?q=modern' },
          { id: 3, emoji: '✨', titleKey: 'glassDoors', descKey: 'glassDoorsDesc', link: '/search?q=glass' },
        ],
        'furniture': [
          { id: 1, emoji: '🛋️', titleKey: 'sofas', descKey: 'sofasDesc', link: '/search?q=sofa' },
          { id: 2, emoji: '🪑', titleKey: 'chairs', descKey: 'chairsDesc', link: '/search?q=chair' },
          { id: 3, emoji: '🛏️', titleKey: 'beds', descKey: 'bedsDesc', link: '/search?q=bed' },
        ],
        'kitchens': [
          { id: 1, emoji: '🍳', titleKey: 'modernKitchens', descKey: 'modernKitchensDesc', link: '/search?q=modern' },
          { id: 2, emoji: '🏠', titleKey: 'classicKitchens', descKey: 'classicKitchensDesc', link: '/search?q=classic' },
          { id: 3, emoji: '✨', titleKey: 'minimalistKitchens', descKey: 'minimalistKitchensDesc', link: '/search?q=minimalist' },
        ],
        'tiles': [
          { id: 1, emoji: '🧱', titleKey: 'ceramicTiles', descKey: 'ceramicTilesDesc', link: '/search?q=ceramic' },
          { id: 2, emoji: '💎', titleKey: 'marbleTiles', descKey: 'marbleTilesDesc', link: '/search?q=marble' },
          { id: 3, emoji: '🎨', titleKey: 'patternedTiles', descKey: 'patternedTilesDesc', link: '/search?q=patterned' },
        ],
        'walls': [
          { id: 1, emoji: '🖼️', titleKey: '3dWallpapers', descKey: '3dWallpapersDesc', link: '/search?q=3d' },
          { id: 2, emoji: '🌿', titleKey: 'natureDesigns', descKey: 'natureDesignsDesc', link: '/search?q=nature' },
          { id: 3, emoji: '🏢', titleKey: 'officeWalls', descKey: 'officeWallsDesc', link: '/search?q=office' },
        ],
      };

      return subCategoriesMap[parentSlug] || [];
    } catch (error) {
      console.error(`❌ Error fetching subcategories for ${parentSlug}:`, error);
      return [];
    }
  }

  /**
   * تحويل بيانات الفئات من الـ API
   */
  _transformCategories(data) {
    const lang = i18n.global.locale.value || i18n.global.locale;
    return data.map(category => this._transformCategory(category, lang));
  }

  /**
   * تحويل بيانات فئة واحدة
   */
  _transformCategory(category, lang = null) {
    const currentLang = lang || i18n.global.locale.value || i18n.global.locale;
    return {
      id: category.id,
      name: currentLang === 'ar' ? category.name_ar : category.name_en,
      name_ar: category.name_ar,
      name_en: category.name_en,
      slug: category.slug,
      icon: category.icon,
      waste_percent: category.waste_percent,
      product_count: category.product_count || 0
    };
  }

  /**
   * بيانات افتراضية في حال فشل الاتصال
   */
  _getFallbackCategories() {
    return [
      { id: 1, name: 'Walls', name_ar: 'الجدران', slug: 'walls', icon: 'fa-solid fa-paint-roller', product_count: 15 },
      { id: 2, name: 'Doors', name_ar: 'الأبواب', slug: 'doors', icon: 'fa-solid fa-door-open', product_count: 8 },
      { id: 3, name: 'Tiles', name_ar: 'البلاط', slug: 'tiles', icon: 'fa-solid fa-border-all', product_count: 12 },
      { id: 4, name: 'Ceilings', name_ar: 'الأسقف', slug: 'ceilings', icon: 'fa-solid fa-arrow-up', product_count: 6 },
      { id: 5, name: 'Kitchens', name_ar: 'المطابخ', slug: 'kitchens', icon: 'fa-solid fa-utensils', product_count: 10 },
      { id: 6, name: 'Cars', name_ar: 'السيارات', slug: 'cars', icon: 'fa-solid fa-car', product_count: 5 },
      { id: 7, name: 'Furniture', name_ar: 'الأثاث', slug: 'furniture', icon: 'fa-solid fa-couch', product_count: 9 }
    ];
  }

  _getFallbackCategory(slug) {
    const categories = this._getFallbackCategories();
    return categories.find(cat => cat.slug === slug) || null;
  }

  _isCacheValid(key) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp < this.cacheTTL);
  }

  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * مسح الكاش
   */
  clearCache() {
    this.cache.clear();
  }
}

export default new CategoryService();
