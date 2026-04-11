import BaseService from './BaseService';

class PostService extends BaseService {
  async getPost(id) {
    return await this.get(`/posts/${id}`);
  }
  
  async getPosts() {
    return await this.get('/posts');
  }
  
  async getPostBySlug(slug) {
    return await this.get(`/posts/slug/${slug}`);
  }
  
  async createPost(postData) {
    return await this.post('/posts', postData);
  }
  
  async updatePost(id, postData) {
    return await this.put(`/posts/${id}`, postData);
  }
  
  async deletePost(id) {
    return await this.delete(`/posts/${id}`);
  }
  
  async getPostsByCategory(category) {
    return await this.get(`/posts/category/${category}`);
  }
  
  async searchPosts(query) {
    return await this.get(`/posts/search?q=${encodeURIComponent(query)}`);
  }
  
  // Mock data fallback
  getMockPost(id) {
    const mockPosts = {
      1: {
        id: 1,
        title: 'كيف تختار الفينيل المناسب لمشاريعك؟',
        content: `
          <h2 class="text-h2 text-center text-primary mb-8">📘 دليل المبتدئين: كيف تختار الفينيل المناسب لمشاريعك؟</h2>
          
          <div class="mb-8">
            <v-card class="pa-6" color="surface" elevation="4">
              <p class="text-body-1 text-center">
                ✨ إذا كنت جديداً في عالم الفينيل اللاصق، قد تشعر بالحيرة عند اختيار النوع المناسب لمشروعك. لا تقلق! هذا الدليل الشامل سيساعدك على فهم كل ما تحتاج معرفته.
              </p>
            </v-card>
          </div>
          
          <v-card class="pa-6 mb-8" elevation="2">
            <h3 class="text-h5 mb-4 text-primary">📌 في هذا الدليل:</h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-circle-small</v-icon>
                    </template>
                    <v-list-item-title>
                      <a href="#types" class="text-primary text-decoration-none">أنواع الفينيل المختلفة</a>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-circle-small</v-icon>
                    </template>
                    <v-list-item-title>
                      <a href="#finish" class="text-primary text-decoration-none">الفرق بين اللامع والمطفي</a>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-circle-small</v-icon>
                    </template>
                    <v-list-item-title>
                      <a href="#tips" class="text-primary text-decoration-none">نصائح الشراء</a>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-circle-small</v-icon>
                    </template>
                    <v-list-item-title>
                      <a href="#mistakes" class="text-primary text-decoration-none">أخطاء شائعة تجنبها</a>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-circle-small</v-icon>
                    </template>
                    <v-list-item-title>
                      <a href="#faq" class="text-primary text-decoration-none">أسئلة وأجوبة</a>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card>
          
          <div id="types" class="my-12">
            <h3 class="text-h4 mb-6 text-primary border-b pb-2">🔰 أنواع الفينيل حسب الاستخدام</h3>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-card class="pa-6 h-100" elevation="2" hover>
                  <div class="text-h6 text-center mb-4">🪑</div>
                  <h4 class="text-h5 text-center mb-3 text-primary">فينيل الأثاث</h4>
                  <p class="text-body-1 mb-4">مصمم خصيصاً للأسطح الخشبية والمدهونة. يتميز بقوة التصاق عالية ومقاومة للخدش. مثالي لتجديد الخزائن، الطاولات، والأدراج.</p>
                  <v-chip color="primary" variant="tonal" class="mb-2">
                    <v-icon start>mdi-check</v-icon>
                    مناسب لـ: الخشب، الـ MDF، الأسطح المدهونة
                  </v-chip>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-card class="pa-6 h-100" elevation="2" hover>
                  <div class="text-h6 text-center mb-4">🧱</div>
                  <h4 class="text-h5 text-center mb-3 text-primary">فينيل الجدران</h4>
                  <p class="text-body-1 mb-4">أخف وزناً وأسهل في الإزالة. مصمم للأسطح الملساء مثل الجدران المدهونة والزجاج. يأتي بتصاميم وألوان لا حصر لها.</p>
                  <v-chip color="primary" variant="tonal" class="mb-2">
                    <v-icon start>mdi-check</v-icon>
                    مناسب لـ: الجدران الملساء، الزجاج، المرايا
                  </v-chip>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-card class="pa-6 h-100" elevation="2" hover>
                  <div class="text-h6 text-center mb-4">🚗</div>
                  <h4 class="text-h5 text-center mb-3 text-primary">فينيل السيارات</h4>
                  <p class="text-body-1 mb-4">مقاوم للعوامل الجوية والحرارة. يتميز بمرونة عالية تسمح بتطبيقه على الأسطح المنحنية للسيارات والدراجات النارية.</p>
                  <v-chip color="primary" variant="tonal" class="mb-2">
                    <v-icon start>mdi-check</v-icon>
                    مناسب لـ: السيارات، الدراجات، الأسطح الخارجية
                  </v-chip>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-card class="pa-6 h-100" elevation="2" hover>
                  <div class="text-h6 text-center mb-4">🪟</div>
                  <h4 class="text-h5 text-center mb-3 text-primary">فينيل النوافذ</h4>
                  <p class="text-body-1 mb-4">شبه شفاف أو مزخرف، يستخدم للزخرفة مع السماح بدخول الضوء. مثالي للمكاتب والحمامات وأبواب الزجاج.</p>
                  <v-chip color="primary" variant="tonal" class="mb-2">
                    <v-icon start>mdi-check</v-icon>
                    مناسب لـ: النوافذ، الأبواب الزجاجية، الفواصل
                  </v-chip>
                </v-card>
              </v-col>
            </v-row>
          </div>
        `,
        slug: 'how-to-choose-vinyl-for-your-projects',
        category: 'guide',
        author: 'فريق فينيل آرت',
        publishedAt: '2024-01-15',
        tags: ['دليل', 'فينيل', 'مبتدئين'],
        featured: true
      }
    };
    
    return mockPosts[id] || null;
  }
  
  getMockPosts() {
    return [
      {
        id: 1,
        title: 'كيف تختار الفينيل المناسب لمشاريعك؟',
        slug: 'how-to-choose-vinyl-for-your-projects',
        excerpt: 'دليل شامل للمبتدئين في عالم الفينيل اللاصق',
        category: 'guide',
        publishedAt: '2024-01-15',
        featured: true
      },
      {
        id: 2,
        title: 'أفضل أنواع الفينيل للأثاث',
        slug: 'best-vinyl-types-for-furniture',
        excerpt: 'مقارنة بين أنواع الفينيل المختلفة للأثاث',
        category: 'comparison',
        publishedAt: '2024-01-10',
        featured: false
      }
    ];
  }
}

export default new PostService();
