// src/plugins/autoAnimate.js
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

export default function install(app) {
  app.use(autoAnimatePlugin, {
    // Default animation settings
    duration: 250,
    easing: 'ease-in-out',
    // Custom animations for different use cases
    disrespectMotion: false,
  })
}
