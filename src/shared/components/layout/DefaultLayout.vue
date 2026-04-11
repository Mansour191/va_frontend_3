<template>
  <div class="app-wrapper">
    <Header />

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <!-- Map Section (عرضها في جميع الصفحات) -->
      <section v-if="$route.path !== '/contact'" class="map-section container">
        <div class="row">
          <div class="col-12">
            <h4 class="map-title">
              <i class="fa-solid fa-map-marker-alt"></i>
              {{ $t('mapTitle') }}
            </h4>
            <div class="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13374.981897722519!2d5.172593343991056!3d36.33623060243317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12f32e2e76af0f63%3A0x123a8ef4c7f02763!2zQcOvbiBSb3Vh!5e1!3m2!1sen!2sdz!4v1773563421474!5m2!1sen!2sdz"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Header from '@/shared/components/layout/AppHeader.vue';
import Footer from '@/shared/components/layout/AppFooter.vue';
</script>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-deep);
}

.main-content {
  flex: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.map-title {
  color: #d4af37;
  font-size: 1.3rem;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.map-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid #333333;
  transition: all 0.3s ease;
  margin-bottom: 40px;
}

.map-container:hover {
  border-color: #d4af37;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 20px rgba(212, 175, 55, 0.2);
  transform: translateY(-5px);
}

.map-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
  filter: grayscale(50%) invert(90%) hue-rotate(180deg);
  transition: filter 0.3s ease;
}

.map-container:hover iframe {
  filter: grayscale(30%) invert(90%) hue-rotate(180deg);
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
