import { ref, onMounted, onUnmounted } from 'vue';

export function useInfiniteScroll(loadMore, options = {}) {
    const {
        threshold = 100,
        root = null,
        rootMargin = '0px',
        immediate = true
    } = options;

    const isLoading = ref(false);
    const isFinished = ref(false);
    const target = ref(null);

    let observer = null;

    const loadMoreItems = async () => {
        if (isLoading.value || isFinished.value) return;

        isLoading.value = true;
        try {
            const hasMore = await loadMore();
            if (!hasMore) {
                isFinished.value = true;
                if (observer) {
                    observer.unobserve(target.value);
                }
            }
        } catch (error) {
            console.error('Error loading more items:', error);
        } finally {
            isLoading.value = false;
        }
    };

    const setupObserver = () => {
        if (!target.value) return;

        observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    loadMoreItems();
                }
            },
            {
                threshold,
                root,
                rootMargin,
            }
        );

        observer.observe(target.value);
    };

    onMounted(() => {
        if (immediate) {
            loadMoreItems();
        }
        setupObserver();
    });

    onUnmounted(() => {
        if (observer) {
            observer.disconnect();
        }
    });

    return {
        target,
        isLoading,
        isFinished,
        loadMoreItems,
    };
}
