import { ref, computed, watch } from 'vue'

// State
const isDark = ref(false)

// Computed
const themeClass = computed(() => isDark.value ? 'dark-theme' : 'light-theme')

// Methods
const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  updateThemeClass()
}

const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  // Default to dark mode as specified
  isDark.value = savedTheme === 'dark' || (!savedTheme && systemPrefersDark)
  updateThemeClass()
}

const updateThemeClass = () => {
  document.documentElement.classList.toggle('dark-theme', isDark.value)
  document.documentElement.classList.toggle('light-theme', !isDark.value)
}

// Watch for system theme changes
watch(
  () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  (systemPrefersDark) => {
    if (!localStorage.getItem('theme')) {
      isDark.value = systemPrefersDark
      updateThemeClass()
    }
  }
)

export function useTheme() {
  return {
    isDark,
    themeClass,
    toggleTheme,
    initTheme
  }
}
