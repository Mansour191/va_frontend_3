import { MotionPlugin } from '@vueuse/motion';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'; // التأكد من المسار الصحيح للـ Vue plugin

export default {
    install: (app) => {
        // Don't use app.use here - plugins are already applied in main.js
        // This prevents duplicate plugin warnings
        console.log('ℹ️ VueUse plugins already handled in main.js, skipping duplicate installation');
    }
};