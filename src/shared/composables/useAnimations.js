import { ref } from 'vue';
import { useMotion } from '@vueuse/motion';

export function useFadeInUp(delay = 0) {
    const variants = {
        initial: {
            opacity: 0,
            y: 20,
        },
        enter: {
            opacity: 1,
            y: 0,
            transition: {
                delay,
                duration: 600,
                ease: 'easeOut',
            },
        },
    };

    return { variants };
}

export function useSlideInRight(delay = 0) {
    const variants = {
        initial: {
            opacity: 0,
            x: 100,
        },
        enter: {
            opacity: 1,
            x: 0,
            transition: {
                delay,
                duration: 500,
                ease: 'easeOut',
            },
        },
    };

    return { variants };
}

export function useScaleIn(delay = 0) {
    const variants = {
        initial: {
            opacity: 0,
            scale: 0.9,
        },
        enter: {
            opacity: 1,
            scale: 1,
            transition: {
                delay,
                duration: 400,
                ease: 'easeOut',
            },
        },
    };

    return { variants };
}

export function usePulseGlow() {
    const variants = {
        initial: {
            opacity: 1,
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)',
        },
        animate: {
            opacity: 0.8,
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.8)',
            transition: {
                duration: 2000,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'reverse',
            },
        },
    };

    return { variants };
}

// Stagger animation for lists
export function useStaggerAnimation(baseDelay = 100) {
    const variants = {
        initial: {
            opacity: 0,
            y: 20,
        },
        enter: (index) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: index * baseDelay,
                duration: 400,
                ease: 'easeOut',
            },
        }),
    };

    return { variants };
}

// Hover animations
export function useHoverAnimation() {
    const variants = {
        initial: {
            scale: 1,
            transition: {
                duration: 200,
            },
        },
        hover: {
            scale: 1.02,
            transition: {
                duration: 200,
            },
        },
    };

    return { variants };
}

// Loading animation
export function useLoadingAnimation() {
    const variants = {
        initial: {
            rotate: 0,
        },
        animate: {
            rotate: 360,
            transition: {
                duration: 1000,
                ease: 'linear',
                repeat: Infinity,
            },
        },
    };

    return { variants };
}
