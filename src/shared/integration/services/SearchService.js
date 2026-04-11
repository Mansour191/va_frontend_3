/**
 * SearchService.js
 * خدمة البحث الموحد للمنتجات والمقالات والتصاميم
 */

import ERPNextService from './ERPNextService';
import BlogService from './BlogService';

class SearchService {
  constructor() {
    // محاكاة بيانات المعرض (يمكن جلبها من API لاحقاً)
    this.galleryItems = [
      { id: 1, title: 'خزانة ملابس عصرية', category: 'furniture', image: 'https://i.postimg.cc/Qx9tkDDn/wardrobe.png', type: 'design' },
      { id: 2, title: 'طاولة خشبية راقية', category: 'furniture', image: 'https://i.postimg.cc/htCcH3cZ/table1.png', type: 'design' },
      { id: 3, title: 'باب منزلق مزخرف', category: 'doors', image: 'https://i.postimg.cc/wjXjw0mj/slider-decore2.png', type: 'design' },
      { id: 4, title: 'مدخل جداري فخم', category: 'walls', image: 'https://i.postimg.cc/7L0DfPgY/Entrance1.png', type: 'design' },
      { id: 5, title: 'مطبخ عصري متكامل', category: 'kitchens', image: 'https://i.postimg.cc/0QKmBBJ9/kitchen2.png', type: 'design' },
    ];
  }

  /**
   * البحث الشامل في جميع المصادر
   */
  async globalSearch(params) {
    const { query, category, minPrice, maxPrice, type, page = 1, limit = 12 } = params;
    
    console.log('🔍 بدء البحث المتقدم:', params);

    try {
      const [productsRes, blogPosts] = await Promise.all([
        this.searchProducts(query, category, minPrice, maxPrice),
        this.searchBlog(query)
      ]);

      const designs = this.searchGallery(query, category);

      // دمج النتائج وتصنيفها
      let allResults = [
        ...productsRes.map(p => ({ ...p, type: 'product', source: 'ERPNext' })),
        ...blogPosts.map(p => ({ ...p, type: 'article', source: 'Blogger' })),
        ...designs.map(d => ({ ...d, type: 'design', source: 'Gallery' }))
      ];

      // فلترة حسب النوع إذا طلب المستخدم
      if (type && type !== 'all') {
        allResults = allResults.filter(item => item.type === type);
      }

      // الترتيب (يمكن إضافة خيارات ترتيب لاحقاً)
      allResults.sort((a, b) => (a.relevance || 0) - (b.relevance || 0));

      // ترقيم الصفحات
      const total = allResults.length;
      const start = (page - 1) * limit;
      const paginatedResults = allResults.slice(start, start + limit);

      return {
        results: paginatedResults,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('❌ خطأ في البحث الشامل:', error);
      throw error;
    }
  }

  /**
   * البحث في منتجات ERPNext مع الفلترة
   */
  async searchProducts(query, category, minPrice, maxPrice) {
    try {
      const response = await ERPNextService.getProducts();
      let products = response.data || [];

      if (query) {
        const q = query.toLowerCase();
        products = products.filter(p => 
          p.item_name.toLowerCase().includes(q) || 
          p.item_code.toLowerCase().includes(q)
        );
      }

      if (category && category !== 'all') {
        products = products.filter(p => p.item_group.toLowerCase() === category.toLowerCase());
      }

      if (minPrice) {
        products = products.filter(p => p.standard_rate >= minPrice);
      }

      if (maxPrice) {
        products = products.filter(p => p.standard_rate <= maxPrice);
      }

      return products.map(p => ({
        id: p.item_code,
        title: p.item_name,
        price: p.standard_rate,
        image: p.image || '/assets/placeholder.png',
        category: p.item_group,
        link: `/product/${p.item_code}`
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * البحث في مقالات Blogger
   */
  async searchBlog(query) {
    if (!query) return [];
    try {
      // بما أن API بلوجر لا يدعم البحث النصي المباشر بسهولة عبر JSON Feed، 
      // سنقوم بجلب أحدث المقالات والبحث فيها محلياً (كحل مؤقت)
      const posts = await BlogService.getPostsByLabel({ ar: 'ديكور', en: 'Decor' }, 20);
      const q = query.toLowerCase();
      
      return posts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.summary.toLowerCase().includes(q)
      ).map(p => ({
        ...p,
        link: p.link // الرابط موجود بالفعل
      }));
    } catch (error) {
      console.error('Error searching blog:', error);
      return [];
    }
  }

  /**
   * البحث في معرض التصاميم
   */
  searchGallery(query, category) {
    let designs = [...this.galleryItems];

    if (query) {
      const q = query.toLowerCase();
      designs = designs.filter(d => d.title.toLowerCase().includes(q));
    }

    if (category && category !== 'all') {
      designs = designs.filter(d => d.category === category);
    }

    return designs.map(d => ({
      ...d,
      link: '/gallery' // يوجه لمعرض الصور
    }));
  }
}

export default new SearchService();
