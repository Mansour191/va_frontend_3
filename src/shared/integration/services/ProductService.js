import i18n from '@/plugins/i18n';
import { useQuery } from '@apollo/client';
import { 
  PRODUCTS_ESSENTIAL_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  PRODUCTS_BY_CATEGORY_QUERY
} from '@/integration/graphql/products.graphql';

class ProductService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 دقائق
  }

  /**
   * جلب المنتجات حسب الفئة
   */
  async getProductsByCategory(categorySlug, limit = 12) {
    const cacheKey = `products_${categorySlug}_${limit}_${i18n.global.locale.value || i18n.global.locale}`;
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const { default: apolloClient } = await import('@/shared/plugins/apolloPlugin');
      
      const result = await apolloClient.query({
        query: PRODUCTS_ESSENTIAL_QUERY,
        variables: {
          filter: { category: categorySlug },
          first: limit
        }
      });
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      const products = this._transformGraphQLProducts(result.data?.products?.edges || []);
      
      this._setCache(cacheKey, products);
      return products;
    } catch (error) {
      console.error(`❌ Error fetching products for category ${categorySlug}:`, error);
      return this._getFallbackProducts(categorySlug, limit);
    }
  }

  /**
   * جلب جميع المنتجات
   */
  async getAllProducts(limit = 20) {
    const cacheKey = `products_all_${limit}_${i18n.global.locale.value || i18n.global.locale}`;
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const { default: apolloClient } = await import('@/shared/plugins/apolloPlugin');
      
      const result = await apolloClient.query({
        query: PRODUCTS_ESSENTIAL_QUERY,
        variables: {
          first: limit
        }
      });
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      const products = this._transformGraphQLProducts(result.data?.products?.edges || []);
      
      this._setCache(cacheKey, products);
      return products;
    } catch (error) {
      console.error('❌ Error fetching all products:', error);
      return this._getFallbackProducts('all', limit);
    }
  }

  /**
   * جلب تفاصيل منتج معين
   */
  async getProductBySlug(slug) {
    const cacheKey = `product_${slug}_${i18n.global.locale.value || i18n.global.locale}`;
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const { default: apolloClient } = await import('@/shared/plugins/apolloPlugin');
      
      const result = await apolloClient.query({
        query: PRODUCT_BY_SLUG_QUERY,
        variables: { slug }
      });
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      const product = this._transformGraphQLProduct(result.data?.products?.edges?.[0]?.node);
      
      this._setCache(cacheKey, product);
      return product;
    } catch (error) {
      console.error(`❌ Error fetching product ${slug}:`, error);
      return this._getFallbackProduct(slug);
    }
  }

  /**
   * تحويل بيانات المنتجات من GraphQL
   */
  _transformGraphQLProducts(edges) {
    const lang = i18n.global.locale.value || i18n.global.locale;
    return edges.map(edge => this._transformGraphQLProduct(edge.node, lang));
  }

  /**
   * تحويل بيانات منتج واحد من GraphQL
   */
  _transformGraphQLProduct(product, lang = null) {
    if (!product) return null;
    
    const currentLang = lang || i18n.global.locale.value || i18n.global.locale;
    
    // Process images to ensure absolute URLs
    const processedImages = (product.images || []).map(image => ({
      ...image,
      imageUrl: this._processImageUrl(image.imageUrl || image.url)
    }));
    
    return {
      id: product.id,
      title: currentLang === 'ar' ? product.nameAr : product.nameEn,
      title_ar: product.nameAr,
      title_en: product.nameEn,
      slug: product.slug,
      description: currentLang === 'ar' ? product.descriptionAr : product.descriptionEn,
      description_ar: product.descriptionAr,
      description_en: product.descriptionEn,
      image: this._processImageUrl(product.image) || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
      base_price: product.basePrice || product.price,
      cost: product.cost,
      stock: product.stock,
      on_sale: product.onSale,
      discount_percent: product.discountPercent,
      is_new: product.isNew,
      category: product.category,
      category_name: currentLang === 'ar' ? product.category?.nameAr : product.category?.nameEn,
      category_slug: product.category?.slug,
      images: processedImages,
      variants: product.variants || [],
      created_at: product.createdAt,
      link: `/products/${product.slug}`,
      summary: currentLang === 'ar' ? product.descriptionAr?.substring(0, 150) : product.descriptionEn?.substring(0, 150)
    };
  }

  /**
   * تحويل بيانات المنتجات من الـ API (Legacy - for fallback)
   */
  _transformProducts(data) {
    const lang = i18n.global.locale.value || i18n.global.locale;
    return data.map(product => this._transformProduct(product, lang));
  }

  /**
   * تحويل بيانات منتج واحد (Legacy - for fallback)
   */
  _transformProduct(product, lang = null) {
    const currentLang = lang || i18n.global.locale.value || i18n.global.locale;
    
    // Process images to ensure absolute URLs
    const processedImages = (product.images || []).map(image => ({
      ...image,
      imageUrl: this._processImageUrl(image.imageUrl)
    }));
    
    return {
      id: product.id,
      title: currentLang === 'ar' ? product.name_ar : product.name_en,
      title_ar: product.name_ar,
      title_en: product.name_en,
      slug: product.slug,
      description: currentLang === 'ar' ? product.description_ar : product.description_en,
      description_ar: product.description_ar,
      description_en: product.description_en,
      image: this._processImageUrl(product.image) || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
      base_price: product.base_price,
      cost: product.cost,
      stock: product.stock,
      on_sale: product.on_sale,
      discount_percent: product.discount_percent,
      is_new: product.is_new,
      category: product.category,
      category_name: currentLang === 'ar' ? product.category?.name_ar : product.category?.name_en,
      category_slug: product.category?.slug,
      images: processedImages,
      variants: product.variants || [],
      created_at: product.created_at,
      link: `/products/${product.slug}`,
      summary: currentLang === 'ar' ? product.description_ar?.substring(0, 150) : product.description_en?.substring(0, 150)
    };
  }

  /**
   * تحويل رابط الصورة إلى رابط كامل (Absolute URL)
   */
  _processImageUrl(imageUrl) {
    if (!imageUrl) return null;
    
    // If already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // For GraphQL, we assume images are served from the same domain
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
    return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
  }

  /**
   * بيانات افتراضية للمنتجات
   */
  _getFallbackProducts(categorySlug, limit = 12) {
    const fallbackProducts = {
      'cars': [
        {
          id: 1, title: 'Sport Car Vinyl', title_ar: 'فينيل سيارة رياضية', slug: 'sport-car-vinyl',
          image: 'https://images.unsplash.com/photo-1493238794027-773f47e9c854?q=80&w=800&auto=format&fit=crop',
          base_price: 150, stock: 5, category_name: 'Cars', link: '/products/sport-car-vinyl',
          summary: 'High-quality vinyl wrap for sports cars with glossy finish'
        },
        {
          id: 2, title: 'Matte Black Wrap', title_ar: 'لفافة أسود مطفي', slug: 'matte-black-wrap',
          image: 'https://images.unsplash.com/photo-1552519507-da3b142c42e3?q=80&w=800&auto=format&fit=crop',
          base_price: 120, stock: 8, category_name: 'Cars', link: '/products/matte-black-wrap',
          summary: 'Premium matte black vinyl wrap for luxury vehicles'
        }
      ],
      'walls': [
        {
          id: 3, title: '3D Wall Panel', title_ar: 'لوحة جدار ثلاثية الأبعاد', slug: '3d-wall-panel',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop',
          base_price: 85, stock: 15, category_name: 'Walls', link: '/products/3d-wall-panel',
          summary: 'Modern 3D wall panels for contemporary interiors'
        },
        {
          id: 4, title: 'Marble Wallpaper', title_ar: 'ورق جدران رخام', slug: 'marble-wallpaper',
          image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800&auto=format&fit=crop',
          base_price: 65, stock: 23, category_name: 'Walls', link: '/products/marble-wallpaper',
          summary: 'Elegant marble effect wallpaper for luxury interiors'
        }
      ],
      'doors': [
        {
          id: 5, title: 'Wood Door Wrap', title_ar: 'لفافة باب خشبي', slug: 'wood-door-wrap',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
          base_price: 95, stock: 12, category_name: 'Doors', link: '/products/wood-door-wrap',
          summary: 'Realistic wood grain vinyl wrap for interior and exterior doors'
        }
      ]
    };

    const products = fallbackProducts[categorySlug] || fallbackProducts['cars'];
    return products.slice(0, limit);
  }

  _getFallbackProduct(slug) {
    const allProducts = [
      ...this._getFallbackProducts('cars', 10),
      ...this._getFallbackProducts('walls', 10),
      ...this._getFallbackProducts('doors', 10)
    ];
    return allProducts.find(p => p.slug === slug) || null;
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

  clearCache() {
    this.cache.clear();
  }
}

export default new ProductService();
