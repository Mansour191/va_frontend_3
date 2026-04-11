<template>
  <v-container class="py-8">
    <!-- Page Title -->
    <div class="text-center mb-8">
      <h1 class="text-h2 font-weight-bold text-warning">{{ $t('termsPageTitle') }}</h1>
    </div>

    <!-- Introduction -->
    <v-card elevation="4" class="intro-box mb-8" color="surface">
      <v-card-text class="pa-6">
        <p class="text-h6 text-medium-emphasis">{{ $t('termsIntroText') }}</p>
      </v-card-text>
    </v-card>

    <!-- Section 1 -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-newspaper</v-icon>
          {{ $t('termsSection1Title') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis">{{ $t('termsSection1Text') }}</p>
      </v-card-text>
    </v-card>

    <!-- Section 2 -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-copyright</v-icon>
          {{ $t('termsSection2Title') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis">{{ $t('termsSection2Text') }}</p>
      </v-card-text>
    </v-card>

    <!-- Section 3 -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-check-circle</v-icon>
          {{ $t('termsSection3Title') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis">{{ $t('termsSection3Text') }}</p>
      </v-card-text>
    </v-card>

    <!-- Section 4 -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-cart</v-icon>
          {{ $t('termsSection4Title') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis">{{ $t('termsSection4Text') }}</p>
      </v-card-text>
    </v-card>

    <!-- Section 5 -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-open-in-new</v-icon>
          {{ $t('termsSection5Title') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis">{{ $t('termsSection5Text') }}</p>
      </v-card-text>
    </v-card>

    <!-- Section 6 -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-pencil</v-icon>
          {{ $t('termsSection6Title') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis">{{ $t('termsSection6Text') }}</p>
      </v-card-text>
    </v-card>

    <!-- Section 7 with Contact Info -->
    <v-card elevation="6" class="contact-card mb-8" color="surface">
      <v-card-text class="pa-8">
        <h2 class="text-h4 font-weight-bold text-warning mb-6 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-headset</v-icon>
          {{ $t('termsSection7Title') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis mb-6">{{ $t('termsSection7Intro') }}</p>

        <v-row>
          <!-- Email -->
          <v-col cols="12" sm="6">
            <v-card elevation="2" class="pa-4 text-center h-100">
              <div class="contact-icon-wrapper mb-3">
                <v-icon size="40" color="warning">mdi-email</v-icon>
              </div>
              <div class="contact-details">
                <h3 class="text-h6 font-weight-bold mb-2">{{ $t('termsContactEmailTitle') }}</h3>
                <v-btn
                  href="mailto:remadnamansour7@gmail.com"
                  variant="text"
                  color="warning"
                  prepend-icon="mdi-email"
                  class="text-none"
                >
                  remadnamansour7@gmail.com
                </v-btn>
              </div>
            </v-card>
          </v-col>

          <!-- Phone -->
          <v-col cols="12" sm="6">
            <v-card elevation="2" class="pa-4 text-center h-100">
              <div class="contact-icon-wrapper mb-3">
                <v-icon size="40" color="warning">mdi-phone</v-icon>
              </div>
              <div class="contact-details">
                <h3 class="text-h6 font-weight-bold mb-2">{{ $t('termsContactPhoneTitle') }}</h3>
                <v-btn
                  href="tel:0663140341"
                  variant="text"
                  color="warning"
                  prepend-icon="mdi-phone"
                  class="text-none"
                >
                  0663140341
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
// Terms page - no special logic needed
</script>

<style scoped>
/* Vuetify handles most styling */
</style>
