/**
 * seo.js
 * بلجن لإدارة الكلمات الدلالية (Meta Tags) وتحسين محركات البحث
 */

const siteTitle = 'Vinyl Art | فينيل آرت للطلب المخصص';
const defaultDesc = 'اكتشف عالم الفينيل آرت في الجزائر. تصاميم مخصصة للجدران، الأثاث، والسيارات بجودة عالية.';

export default {
  install: (app) => {
    const setMeta = (tags) => {
      const { title, description, image, url } = tags;

      // تحديث العنوان
      if (title) {
        document.title = `${title} | Vinyl Art`;
      } else {
        document.title = siteTitle;
      }

      // تحديث الوصف
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', description || defaultDesc);

      // تحديث Open Graph (للفيس بوك وواتساب)
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title || siteTitle);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', description || defaultDesc);

      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute('content', image || '/assets/og-image.jpg');

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', url || window.location.href);
    };

    // إضافة الوظيفة لـ global properties لتكون متاحة في جميع المكونات
    app.config.globalProperties.$seo = setMeta;
  }
};
