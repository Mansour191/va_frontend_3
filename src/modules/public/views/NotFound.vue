<template>
  <v-container class="py-16">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="6" class="error-content text-center">
          <v-card-text class="pa-12">
            <!-- Error Icon -->
            <div class="mb-6">
              <v-icon size="80" color="warning" class="pulse-animation">mdi-alert-triangle</v-icon>
            </div>

            <!-- Error Code -->
            <h1 class="text-h1 font-weight-bold text-warning mb-4">404</h1>

            <!-- Error Title -->
            <h2 class="text-h4 font-weight-bold text-warning mb-4">{{ $t('pageNotFound') }}</h2>

            <!-- Error Message -->
            <p class="text-h6 text-medium-emphasis mb-8">{{ $t('pageNotFoundMessage') }}</p>

            <!-- Suggestions -->
            <v-card elevation="2" class="pa-6 mb-8 bg-surface">
              <h3 class="text-h5 font-weight-bold text-warning mb-4">{{ $t('youCanTry') }}</h3>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-btn
                    to="/"
                    variant="outlined"
                    color="warning"
                    prepend-icon="mdi-home"
                    class="text-none mb-3 w-100"
                  >
                    {{ $t('backToHome') }}
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    to="/gallery"
                    variant="outlined"
                    color="warning"
                    prepend-icon="mdi-image-multiple"
                    class="text-none mb-3 w-100"
                  >
                    {{ $t('browseGallery') }}
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    to="/blog"
                    variant="outlined"
                    color="warning"
                    prepend-icon="mdi-post"
                    class="text-none mb-3 w-100"
                  >
                    {{ $t('readBlog') }}
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    to="/contact"
                    variant="outlined"
                    color="warning"
                    prepend-icon="mdi-phone"
                    class="text-none mb-3 w-100"
                  >
                    {{ $t('contactSupport') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>

            <!-- Search -->
            <div class="search-box">
              <h3 class="text-h5 font-weight-bold text-warning mb-4">{{ $t('searchInSite') }}</h3>
              <v-text-field
                v-model="searchQuery"
                :placeholder="$t('searchPlaceholder')"
                variant="outlined"
                color="warning"
                prepend-inner-icon="mdi-magnify"
                @keyup.enter="performSearch"
                @click:append="performSearch"
                append-icon="mdi-magnify"
                hide-details
                class="max-width-400 mx-auto"
              ></v-text-field>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'NotFoundView',
  data() {
    return {
      searchQuery: '',
    };
  },
  methods: {
    performSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push(`/search?q=${encodeURIComponent(this.searchQuery)}`);
      }
    },
  },
};
</script>

<style scoped>
/* Pulse animation for error icon */
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
