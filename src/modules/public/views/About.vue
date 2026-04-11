<template>
  <v-container class="py-8">
    <!-- Page Title -->
    <div class="text-center mb-8">
      <h1 class="text-h2 font-weight-bold text-warning d-flex align-center justify-center gap-4">
        <v-icon size="48" color="warning">mdi-account-group</v-icon>
        {{ $t('about') }}
      </h1>
      <v-divider class="my-4" color="warning" thickness="3"></v-divider>
    </div>

    <!-- Statistics -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" md="4" v-for="stat in statistics" :key="stat.label">
        <v-card elevation="4" class="stat-card text-center h-100" hover>
          <v-card-text class="pa-6">
            <div class="stat-icon-wrapper mb-4">
              <v-icon :icon="stat.icon" size="48" color="warning"></v-icon>
            </div>
            <div class="text-h4 font-weight-bold text-warning mb-2">{{ stat.number }}</div>
            <div class="text-body-2 text-medium-emphasis text-uppercase">{{ stat.label }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Vision -->
    <v-card elevation="6" class="vision-card mb-8" color="surface">
      <v-card-text class="pa-8 text-center">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center justify-center gap-3">
          <v-icon size="36" color="warning">mdi-eye</v-icon>
          {{ $t('visionTitle') }}
        </h2>
        <p class="text-h6 text-medium-emphasis">{{ $t('visionText') }}</p>
      </v-card-text>
    </v-card>

    <!-- Core Values -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" md="4" v-for="value in values" :key="value.title">
        <v-card elevation="4" class="value-card text-center h-100" hover>
          <v-card-text class="pa-6">
            <div class="value-icon-wrapper mb-4">
              <v-icon :icon="value.icon" size="40" color="warning"></v-icon>
            </div>
            <h3 class="text-h5 font-weight-bold text-warning mb-3">{{ value.title }}</h3>
            <p class="text-body-2 text-medium-emphasis">{{ value.description }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Expertise Section -->
    <div class="text-center mb-8">
      <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center justify-center gap-3">
        <v-icon size="36" color="warning">mdi-star</v-icon>
        {{ $t('expertiseTitle') || 'خبرتنا' }}
      </h2>
      <div class="d-flex align-center justify-center gap-4 mb-6">
        <v-divider color="warning" thickness="2" length="60"></v-divider>
        <v-icon size="24" color="warning">mdi-certificate</v-icon>
        <v-divider color="warning" thickness="2" length="60"></v-divider>
      </div>
    </div>

    <v-row class="mb-8">
      <v-col cols="12" md="6" v-for="expertise in expertise" :key="expertise.title">
        <v-card :elevation="expertise.highlight ? 8 : 4" class="expertise-card h-100" :color="expertise.highlight ? 'surface' : undefined" hover>
          <v-card-text class="pa-6">
            <div class="d-flex justify-end mb-4">
              <span class="text-h2 font-weight-bold text-warning opacity-20">{{ expertise.number }}</span>
            </div>
            <div class="expertise-icon-wrapper mb-4">
              <v-icon :icon="expertise.icon" size="56" color="warning"></v-icon>
            </div>
            <h3 class="text-h5 font-weight-bold text-warning mb-3">{{ expertise.title }}</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">{{ expertise.description }}</p>
            <v-list density="compact">
              <v-list-item v-for="feature in expertise.features" :key="feature" class="px-0">
                <template #prepend>
                  <v-icon size="20" color="warning" class="me-2">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-medium-emphasis">{{ feature }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mission -->
    <v-card elevation="6" class="mission-card mb-8" color="surface">
      <v-card-text class="pa-8 text-center">
        <h2 class="text-h4 font-weight-bold text-warning mb-4 d-flex align-center justify-center gap-3">
          <v-icon size="36" color="warning">mdi-bullhorn</v-icon>
          {{ $t('missionTitle') }}
        </h2>
        <p class="text-h6 text-medium-emphasis">{{ $t('missionText') }}</p>
      </v-card-text>
    </v-card>

    <!-- Quote Footer -->
    <div class="text-center">
      <v-icon size="48" color="warning" class="mb-4 opacity-30">mdi-format-quote-close</v-icon>
      <p class="text-h6 text-medium-emphasis font-italic">{{ $t('quoteText') }}</p>
    </div>
  </v-container>
</template>

<script>
export default {
  name: 'AboutView',
  data() {
    return {
      statistics: [
        {
          icon: 'mdi-project-diagram',
          number: '500+',
          label: this.$t('statProjects')
        },
        {
          icon: 'mdi-emoticon-happy',
          number: '300+',
          label: this.$t('statClients')
        },
        {
          icon: 'mdi-trophy',
          number: '5+',
          label: this.$t('statYears')
        }
      ],
      values: [
        {
          icon: 'mdi-diamond-stone',
          title: this.$t('valueQualityTitle'),
          description: this.$t('valueQualityText')
        },
        {
          icon: 'mdi-lightbulb',
          title: this.$t('valueCreativityTitle'),
          description: this.$t('valueCreativityText')
        },
        {
          icon: 'mdi-handshake',
          title: this.$t('valueTrustTitle'),
          description: this.$t('valueTrustText')
        }
      ],
      expertise: [
        {
          number: '01',
          icon: 'mdi-palette',
          title: this.$t('expertiseArtTitle'),
          description: this.$t('expertiseArtText'),
          highlight: false,
          features: [
            this.$t('uniqueDesigns') || 'تصاميم فريدة',
            this.$t('vibrantColors') || 'ألوان زاهية',
            this.$t('highPrecision') || 'دقة عالية'
          ]
        },
        {
          number: '02',
          icon: 'mdi-chip',
          title: this.$t('expertiseTechTitle'),
          description: this.$t('expertiseTechText'),
          highlight: true,
          features: [
            this.$t('modernPrinting') || 'طباعة حديثة',
            this.$t('preciseCutting') || 'قص دقيق',
            this.$t('highQualityMaterials') || 'مواد عالية الجودة'
          ]
        }
      ]
    };
  }
};
</script>

<style scoped>
/* Vuetify handles most styling, only custom animations needed */
.stat-card:hover .stat-icon-wrapper,
.value-card:hover .value-icon-wrapper,
.expertise-card:hover .expertise-icon-wrapper {
  transform: scale(1.1) rotate(360deg);
  transition: transform 0.6s ease;
}

.stat-icon-wrapper,
.value-icon-wrapper,
.expertise-icon-wrapper {
  transition: transform 0.6s ease;
  will-change: transform;
}

.v-card--hover {
  transition: all 0.3s ease;
  will-change: transform, box-shadow;
}
</style>
