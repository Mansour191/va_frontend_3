import { createStore } from 'vuex';
import ui from './modules/ui';
import user from './modules/user';
import cart from './modules/cart';
import wishlist from './modules/wishlist';
import reviews from './modules/reviews';
import integrationStore from '@/shared/integration/store';

const store = createStore({
  modules: {
    ui,
    user,
    cart,
    wishlist,
    reviews,
    integration: integrationStore,
  },
});

export default store;
