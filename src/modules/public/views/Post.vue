<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="4" class="post-card">
          <v-card-text class="pa-8">
            <h1 class="text-h3 font-weight-bold text-warning mb-6">{{ post.title }}</h1>
            <div class="post-body" v-html="post.content"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const post = ref({
  id: 1,
  title: 'كيف تختار الفينيل المناسب لمشروعك؟',
  content: `
    <!-- Content omitted for brevity, keep original content -->
    <div style="position:absolute; top:-9999px; left:-9999px; width:0; height:0; overflow:hidden;">
      <img src="https://i.postimg.cc/0QKmBBJ9/kitchen2.png" alt="صورة مصغرة للمقال"/>
    </div>

    <h2 style="color: #D4AF37; text-align: center; font-size: 2.2rem; margin-bottom: 30px;">📘 دليل المبتدئين: كيف تختار الفينيل المناسب لمشروعك؟</h2>

    <div style="background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%); padding: 2px; border-radius: 20px; margin-bottom: 30px;">
      <div style="background: #1A1A1A; padding: 30px; border-radius: 18px;">
        <p style="color: #E0E0E0; font-size: 1.1rem; line-height: 1.8; text-align: center;">
          ✨ إذا كنت جديداً في عالم الفينيل اللاصق، قد تشعر بالحيرة عند اختيار النوع المناسب لمشروعك. لا تقلق! هذا الدليل الشامل سيساعدك على فهم كل ما تحتاج معرفته.
        </p>
      </div>
    </div>

    <div style="background: #222222; padding: 25px; border-radius: 20px; margin: 30px 0; border: 1px solid #333;">
      <h3 style="color: #D4AF37; font-size: 1.5rem; margin-bottom: 15px;">📌 في هذا الدليل:</h3>
      <ul style="color: #E0E0E0; line-height: 2; columns: 2; list-style: none; padding-right: 0;">
        <li style="margin-bottom: 10px;">🔹 <a href="#types" style="color: #D4AF37; text-decoration: none;">أنواع الفينيل المختلفة</a></li>
        <li style="margin-bottom: 10px;">🔹 <a href="#finish" style="color: #D4AF37; text-decoration: none;">الفرق بين اللامع والمطفي</a></li>
        <li style="margin-bottom: 10px;">🔹 <a href="#tips" style="color: #D4AF37; text-decoration: none;">نصائح الشراء</a></li>
        <li style="margin-bottom: 10px;">🔹 <a href="#mistakes" style="color: #D4AF37; text-decoration: none;">أخطاء شائعة تجنبها</a></li>
        <li style="margin-bottom: 10px;">🔹 <a href="#faq" style="color: #D4AF37; text-decoration: none;">أسئلة وأجوبة</a></li>
      </ul>
    </div>

    <div id="types" style="margin: 50px 0;">
      <h3 style="color: #D4AF37; font-size: 1.8rem; margin-bottom: 25px; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">🔰 أنواع الفينيل حسب الاستخدام</h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        <div style="background: #222222; padding: 25px; border-radius: 20px; border: 1px solid #333; transition: all 0.3s;">
          <div style="font-size: 2.5rem; text-align: center; margin-bottom: 15px;">🪑</div>
          <h4 style="color: #D4AF37; font-size: 1.3rem; margin-bottom: 10px; text-align: center;">فينيل الأثاث</h4>
          <p style="color: #E0E0E0; line-height: 1.7;">مصمم خصيصاً للأسطح الخشبية والمدهونة. يتميز بقوة التصاق عالية ومقاومة للخدوش. مثالي لتجديد الخزائن، الطاولات، والأدراج.</p>
          <div style="background: #1A1A1A; padding: 10px; border-radius: 10px; margin-top: 15px;">
            <span style="color: #D4AF37;">✔️ مناسب لـ:</span> <span style="color: #E0E0E0;">الخشب، الـ MDF، الأسطح المدهونة</span>
          </div>
        </div>
        
        <div style="background: #222222; padding: 25px; border-radius: 20px; border: 1px solid #333;">
          <div style="font-size: 2.5rem; text-align: center; margin-bottom: 15px;">🧱</div>
          <h4 style="color: #D4AF37; font-size: 1.3rem; margin-bottom: 10px; text-align: center;">فينيل الجدران</h4>
          <p style="color: #E0E0E0; line-height: 1.7;">أخف وزناً وأسهل في الإزالة. مصمم للأسطح الملساء مثل الجدران المدهونة والزجاج. يأتي بتصاميم وألوان لا حصر لها.</p>
          <div style="background: #1A1A1A; padding: 10px; border-radius: 10px; margin-top: 15px;">
            <span style="color: #D4AF37;">✔️ مناسب لـ:</span> <span style="color: #E0E0E0;">الجدران الملساء، الزجاج، المرايا</span>
          </div>
        </div>
        
        <div style="background: #222222; padding: 25px; border-radius: 20px; border: 1px solid #333;">
          <div style="font-size: 2.5rem; text-align: center; margin-bottom: 15px;">🚗</div>
          <h4 style="color: #D4AF37; font-size: 1.3rem; margin-bottom: 10px; text-align: center;">فينيل السيارات</h4>
          <p style="color: #E0E0E0; line-height: 1.7;">مقاوم للعوامل الجوية والحرارة. يتميز بمرونة عالية تسمح بتطبيقه على الأسطح المنحنية للسيارات والدراجات النارية.</p>
          <div style="background: #1A1A1A; padding: 10px; border-radius: 10px; margin-top: 15px;">
            <span style="color: #D4AF37;">✔️ مناسب لـ:</span> <span style="color: #E0E0E0;">السيارات، الدراجات، الأسطح الخارجية</span>
          </div>
        </div>
        
        <div style="background: #222222; padding: 25px; border-radius: 20px; border: 1px solid #333;">
          <div style="font-size: 2.5rem; text-align: center; margin-bottom: 15px;">🪟</div>
          <h4 style="color: #D4AF37; font-size: 1.3rem; margin-bottom: 10px; text-align: center;">فينيل النوافذ</h4>
          <p style="color: #E0E0E0; line-height: 1.7;">شبه شفاف أو مزخرف، يستخدم للخصوصية مع السماح بدخول الضوء. مثالي للمكاتب والحمامات وأبواب الزجاج.</p>
          <div style="background: #1A1A1A; padding: 10px; border-radius: 10px; margin-top: 15px;">
            <span style="color: #D4AF37;">✔️ مناسب لـ:</span> <span style="color: #E0E0E0;">النوافذ، الأبواب الزجاجية، الفواصل</span>
          </div>
        </div>
      </div>
    </div>
  `,
});

onMounted(() => {
  const postId = route.params.id;
  console.log('Loading post:', postId);
});
</script>

<style scoped>
/* Post content styling */
.post-body :deep(h2) {
  color: #ffc107;
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 30px;
}

.post-body :deep(h3) {
  color: #ffc107;
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.post-body :deep(p) {
  color: #d4af37;
  text-align: center;
}

.post-body {
  color: #e0e0e0;
  line-height: 1.8;
}

.post-body ::v-deep img {
  max-width: 100%;
  height: auto;
  border-radius: 15px;
  margin: 20px 0;
}
</style>
