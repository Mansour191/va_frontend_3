<template>
  <v-container class="py-8">
    <!-- Page Title -->
    <div class="text-center mb-8">
      <h1 class="text-h2 font-weight-bold text-warning d-flex align-center justify-center gap-4">
        <v-icon size="48" color="warning">mdi-shield-check</v-icon>
        {{ $t('privacyPageTitle') }}
      </h1>
    </div>

    <!-- Introduction -->
    <v-card elevation="4" class="intro-box mb-8" color="surface">
      <v-card-text class="pa-6">
        <p class="text-h6 text-medium-emphasis">{{ $t('privacyIntroText') }}</p>
      </v-card-text>
    </v-card>

    <!-- Section 1 -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-database</v-icon>
          {{ $t('privacySection1Title') }}
        </h2>
        <v-list density="compact" class="mb-4">
          <v-list-item>
            <v-list-item-title class="text-body-1">{{ $t('privacySection1Item1') }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title class="text-body-1">{{ $t('privacySection1Item2') }}</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-alert type="info" variant="tonal" class="mt-4">
          <template #prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          {{ $t('privacySection1Note') }}
        </v-alert>
      </v-card-text>
    </v-card>
        <!-- Section 2 -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-chart-line</v-icon>
          {{ $t('privacySection2Title') }}
        </h2>
        <v-list density="compact" class="mb-4">
          <v-list-item>
            <v-list-item-title class="text-body-1">{{ $t('privacySection2Item1') }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title class="text-body-1">{{ $t('privacySection2Item2') }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title class="text-body-1">{{ $t('privacySection2Item3') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Section 3 -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-lock</v-icon>
          {{ $t('privacySection3Title') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis mb-4">{{ $t('privacySection3Text') }}</p>
        <v-alert type="warning" variant="tonal" class="mt-4">
          <template #prepend>
            <v-icon>mdi-shield-check</v-icon>
          </template>
          {{ $t('privacySection3Note') }}
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Section 4 - Intellectual Property Rights -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-copyright</v-icon>
          {{ $t('privacySection4Title') }}
        </h2>
        <v-list density="compact" class="mb-4">
          <v-list-item>
            <v-list-item-title class="text-body-1">{{ $t('privacySection4Item1') }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title class="text-body-1">{{ $t('privacySection4Item2') }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title class="text-body-1">{{ $t('privacySection4Item3') }}</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-alert type="error" variant="tonal" class="mt-4">
          <v-alert-title>{{ $t('privacySection4Warning') }}</v-alert-title>
          {{ $t('privacySection4WarningText') }}
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Section 5 -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-share</v-icon>
          {{ $t('privacySection5Title') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis">{{ $t('privacySection5Text') }}</p>
      </v-card-text>
    </v-card>

    <!-- Section 6 -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-link</v-icon>
          {{ $t('privacySection6Title') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis">{{ $t('privacySection6Text') }}</p>
      </v-card-text>
    </v-card>

    <!-- Section 7 -->
    <v-card elevation="4" class="section-card mb-6">
      <v-card-text class="pa-6">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-sync</v-icon>
          {{ $t('privacySection7Title') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis">{{ $t('privacySection7Text') }}</p>
      </v-card-text>
    </v-card>

    <!-- Section 8 - Contact -->
    <v-card elevation="6" class="contact-card mb-8" color="surface">
      <v-card-text class="pa-8">
        <h2 class="text-h4 font-weight-bold text-warning mb-6 d-flex align-center gap-3">
          <v-icon size="32" color="warning">mdi-headset</v-icon>
          {{ $t('privacySection8Title') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis mb-6">{{ $t('privacySection8Text') }}</p>

        <v-row>
          <!-- Email -->
          <v-col cols="12" sm="6">
            <v-card elevation="2" class="pa-4 text-center h-100">
              <div class="contact-icon-wrapper mb-3">
                <v-icon size="40" color="warning">mdi-email</v-icon>
              </div>
              <div class="contact-details">
                <h3 class="text-h6 font-weight-bold mb-2">{{ $t('privacyContactEmailTitle') }}</h3>
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
                <h3 class="text-h6 font-weight-bold mb-2">{{ $t('privacyContactPhoneTitle') }}</h3>
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
// Privacy page - no special logic needed
</script>

<style scoped>
/* Vuetify handles most styling */
</style>
