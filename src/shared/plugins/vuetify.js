// plugins/vuetify.js
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Dark Luxury Theme - متوافق مع نظام الألوان الموحد
const darkLuxuryTheme = {
  dark: true,
  colors: {
    // الألوان الرئيسية - Dark Luxury
    primary: '#D4AF37',      // Royal Gold
    secondary: '#B8860B',    // Dark Gold  
    accent: '#F5F5F5',       // Off-White
    background: '#0A0A0A',    // Charcoal
    surface: '#1A1A1A',      // Dark Charcoal
    
    // تدرجات الذهب
    'gold-50': '#fffbeb',
    'gold-100': '#fef3c7', 
    'gold-200': '#fde68a',
    'gold-300': '#fcd34d',
    'gold-400': '#fbbf24',
    'gold-500': '#D4AF37',
    'gold-600': '#B8860B',
    'gold-700': '#92400e',
    'gold-800': '#78350f',
    'gold-900': '#451a03',
    
    // تدرجات الكاربون
    'charcoal-50': '#f5f5f5',
    'charcoal-100': '#e4e4e7',
    'charcoal-200': '#d4d4d8', 
    'charcoal-300': '#a1a1aa',
    'charcoal-400': '#71717a',
    'charcoal-500': '#52525b',
    'charcoal-600': '#3f3f46',
    'charcoal-700': '#27272a',
    'charcoal-800': '#18181b',
    'charcoal-900': '#0A0A0A',
    
    // ألوان وظيفية
    error: '#FF5252',
    info: '#2196F3', 
    success: '#4CAF50',
    warning: '#FFC107',
    
    // متغيرات إضافية للتوافق
    'primary-darken-1': '#C19A2F',
    'primary-lighten-1': '#E6C058',
    'surface-variant': '#252525',
    'on-primary': '#0A0A0A',
    'on-surface': '#F5F5F5',
    'on-background': '#F5F5F5'
  }
}

const lightBeigeTheme = {
  dark: false,
  colors: {
    primary: '#8B5A2B',
    secondary: '#C4A484',
    background: '#FDF8F0',
    surface: '#FFFFFF',
    'beige-light': '#F5F0E6',
    'beige-dark': '#E8DDCB',
  }
}

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  theme: {
    defaultTheme: 'darkLuxuryTheme',
    themes: {
      darkLuxuryTheme,
      lightBeigeTheme
    },
    variations: {
      colors: ['primary', 'secondary', 'gold-500', 'charcoal-900'],
      lighten: 3,
      darken: 3
    }
  }
})