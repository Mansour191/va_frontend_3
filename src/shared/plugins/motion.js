// src/plugins/motion.js
import { MotionPlugin } from '@vueuse/motion'

export default function install(app) {
  app.use(MotionPlugin, {
    // Default motion presets
    directives: {
      'motion-slide-up': {
        initial: { opacity: 0, y: 20 },
        enter: { opacity: 1, y: 0 },
        leave: { opacity: 0, y: -20 },
      },
      'motion-slide-down': {
        initial: { opacity: 0, y: -20 },
        enter: { opacity: 1, y: 0 },
        leave: { opacity: 0, y: 20 },
      },
      'motion-slide-left': {
        initial: { opacity: 0, x: 20 },
        enter: { opacity: 1, x: 0 },
        leave: { opacity: 0, x: -20 },
      },
      'motion-slide-right': {
        initial: { opacity: 0, x: -20 },
        enter: { opacity: 1, x: 0 },
        leave: { opacity: 0, x: 20 },
      },
      'motion-fade-in': {
        initial: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
      },
      'motion-scale-up': {
        initial: { opacity: 0, scale: 0.9 },
        enter: { opacity: 1, scale: 1 },
        leave: { opacity: 0, scale: 0.9 },
      },
      'motion-scale-down': {
        initial: { opacity: 0, scale: 1.1 },
        enter: { opacity: 1, scale: 1 },
        leave: { opacity: 0, scale: 1.1 },
      },
    }
  })
}
