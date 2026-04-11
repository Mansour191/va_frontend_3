// src/composables/useTheme.js
import { ref, computed, watch } from 'vue'

export function useTheme() {
  // Theme state with localStorage persistence - DEFAULT TO DARK MODE
  const isDark = ref(localStorage.getItem('theme') !== 'light') // Default to dark unless explicitly set to light
  
  // Computed class for html element
  const themeClass = computed(() => isDark.value ? 'my-app-dark' : '')
  
  // Toggle theme function
  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateDocumentClass()
    saveTheme()
    updateCSSVariables()
  }
  
  // Set specific theme
  const setTheme = (dark) => {
    isDark.value = dark
    updateDocumentClass()
    saveTheme()
    updateCSSVariables()
  }
  
  // Update document class
  const updateDocumentClass = () => {
    const html = document.documentElement
    const body = document.body
    
    if (isDark.value) {
      html.classList.add('dark')
      body.classList.add('my-app-dark')
      body.classList.remove('light-mode')
    } else {
      html.classList.remove('dark')
      body.classList.remove('my-app-dark')
      body.classList.add('light-mode')
    }
  }
  
  // Update CSS variables for new color scheme
  const updateCSSVariables = () => {
    const root = document.documentElement
    
    if (isDark.value) {
      // Dark Mode Colors
      root.style.setProperty('--color-bg-primary', '#121212')
      root.style.setProperty('--color-bg-surface', '#1F1F23')
      root.style.setProperty('--color-bg-secondary', '#1F1F23')
      root.style.setProperty('--color-primary', '#3B82F6')
      root.style.setProperty('--color-secondary', '#8B5CF6')
      root.style.setProperty('--color-accent', '#FF7F50')
      root.style.setProperty('--color-text-primary', '#F1F5F9')
      root.style.setProperty('--color-text-secondary', '#9CA3AF')
      root.style.setProperty('--color-text-muted', '#6B7280')
      root.style.setProperty('--color-border', '#2A2A2A')
      root.style.setProperty('--color-border-secondary', '#374151')
      root.style.setProperty('--color-hover', 'rgba(59, 130, 246, 0.1)')
      root.style.setProperty('--color-active', 'rgba(59, 130, 246, 0.2)')
    } else {
      // Light Mode Colors
      root.style.setProperty('--color-bg-primary', '#FFFFFF')
      root.style.setProperty('--color-bg-surface', '#F8FAFC')
      root.style.setProperty('--color-bg-secondary', '#F8FAFC')
      root.style.setProperty('--color-primary', '#2563EB')
      root.style.setProperty('--color-secondary', '#7C3AED')
      root.style.setProperty('--color-accent', '#FF7F50')
      root.style.setProperty('--color-text-primary', '#0F172A')
      root.style.setProperty('--color-text-secondary', '#475569')
      root.style.setProperty('--color-text-muted', '#6B7280')
      root.style.setProperty('--color-border', '#E2E8F0')
      root.style.setProperty('--color-border-secondary', '#CBD5E1')
      root.style.setProperty('--color-hover', 'rgba(37, 99, 235, 0.1)')
      root.style.setProperty('--color-active', 'rgba(37, 99, 235, 0.2)')
    }
  }
  
  // Save theme to localStorage
  const saveTheme = () => {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
  
  // Initialize theme on mount - DEFAULT TO DARK MODE
  const initTheme = () => {
    // Set dark mode as default if no theme is stored
    if (!localStorage.getItem('theme')) {
      isDark.value = true
      saveTheme()
    }
    updateDocumentClass()
    updateCSSVariables()
  }
  
  // Watch for changes
  watch(isDark, () => {
    updateDocumentClass()
    updateCSSVariables()
    saveTheme()
  })
  
  return {
    isDark: computed(() => isDark.value),
    themeClass,
    toggleTheme,
    setTheme,
    initTheme
  }
}
