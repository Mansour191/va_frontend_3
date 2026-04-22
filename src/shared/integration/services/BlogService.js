import i18n from '@/plugins/i18n';
import { BLOG_POSTS_QUERY } from '@/integration/graphql/blog.graphql';

class BlogService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 دقائق
  }

  /**
   * جلب أحدث المقالات من قاعدة البيانات المحلية
   */
  async getLatestPosts(limit = 4) {
    const cacheKey = `latest_${limit}_${i18n.global.locale.value || i18n.global.locale}`;
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      // جلب البيانات باستخدام GraphQL
      const { default: apolloClient } = await import('@/shared/plugins/apolloPlugin');
      
      const result = await apolloClient.query({
        query: BLOG_POSTS_QUERY,
        variables: {
          first: limit,
          orderBy: '-createdAt'
        }
      });
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      const posts = this._transformGraphQLPosts(result.data?.blogPosts?.edges || []);
      
      this._setCache(cacheKey, posts);
      return posts;
    } catch (error) {
      console.warn('⚠️ GraphQL Blog API failed, using fallback data:', error.message);
      return this._getFallbackPosts(limit);
    }
  }

  /**
   * تحويل بيانات GraphQL إلى التنسيق المستخدم في الواجهة
   */
  _transformGraphQLPosts(edges) {
    const lang = i18n.global.locale.value || i18n.global.locale;
    return edges.map(edge => this._transformGraphQLPost(edge.node, lang));
  }

  /**
   * تحويل بيانات منتج واحد من GraphQL
   */
  _transformGraphQLPost(post, lang = null) {
    if (!post) return null;
    
    const currentLang = lang || i18n.global.locale.value || i18n.global.locale;
    
    return {
      id: post.id,
      title: currentLang === 'ar' ? post.titleAr : post.titleEn,
      title_ar: post.titleAr,
      title_en: post.titleEn,
      slug: post.slug,
      image: post.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
      published: post.publishedAt,
      summary: currentLang === 'ar' ? post.summaryAr : post.summaryEn,
      category: post.categoryName,
      tags: post.tags || []
    };
  }

  /**
   * تحويل بيانات الـ API إلى التنسيق المستخدم في الواجهة (Legacy)
   */
  _transformPosts(results) {
    const lang = i18n.global.locale.value || i18n.global.locale;
    return results.map(post => ({
      id: post.id,
      title: lang === 'ar' ? post.title_ar : post.title_en,
      slug: post.slug,
      image: post.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
      published: post.published_at,
      summary: lang === 'ar' ? post.summary_ar : post.summary_en,
      category: post.category_name,
      tags: post.tags ? post.tags.split(',') : []
    }));
  }

  /**
   * بيانات افتراضية عالية الجودة تظهر في حال فشل الاتصال بـ Blogger
   */
  _getFallbackPosts(limit) {
    const fallbackData = [
      {
        id: 'fallback-1',
        title: 'أفضل 5 تصاميم فينيل لجدران غرف النوم في 2026',
        link: '/blog',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
        published: new Date().toISOString(),
        summary: 'تعرف على أحدث صيحات الديكور باستخدام ورق الحائط والفينيل المخصص لغرف النوم العصرية...'
      },
      {
        id: 'fallback-2',
        title: 'كيفية العناية بملصقات السيارات لضمان بقائها سنوات طويلة',
        link: '/blog',
        image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800&auto=format&fit=crop',
        published: new Date().toISOString(),
        summary: 'نصائح احترافية لتنظيف وحماية ملصقات الفينيل على سيارتك من أشعة الشمس والحرارة العالية...'
      },
      {
        id: 'fallback-3',
        title: 'تجديد المطبخ بأقل التكاليف: سحر الفينيل اللاصق',
        link: '/blog',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
        published: new Date().toISOString(),
        summary: 'لا حاجة لتغيير خزائن المطبخ بالكامل، اكتشف كيف يمكن للفينيل أن يحول مطبخك القديم لآخر عصري...'
      },
      {
        id: 'fallback-4',
        title: 'دليل شامل لاختيار الألوان المناسبة لمساحتك الصغيرة',
        link: '/blog',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop',
        published: new Date().toISOString(),
        summary: 'الألوان الفاتحة أم الداكنة؟ تعلم كيف تختار التدرج اللوني الذي يعطي اتساعاً وهمياً لغرفتك...'
      }
    ];
    return fallbackData.slice(0, limit);
  }

  /**
   * جلب المقالات حسب التسمية (Category Slug)
   */
  async getPostsByLabel(label, maxResults = 4) {
    const lang = i18n.global.locale.value || i18n.global.locale;
    const categorySlug = typeof label === 'object' ? label.slug : label;
    const cacheKey = `label_${categorySlug}_${maxResults}_${lang}`;

    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiBaseUrl}/blog/posts/?category=${encodeURIComponent(categorySlug)}&limit=${maxResults}`;
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const results = data.results || data;
      const posts = this._transformPosts(results);
      
      this._setCache(cacheKey, posts);
      return posts;
    } catch (error) {
      console.warn(`⚠️ Local Blog API failed for category ${categorySlug}, using fallback:`, error.message);
      return this._getFallbackPosts(maxResults);
    }
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
}

export default new BlogService();
