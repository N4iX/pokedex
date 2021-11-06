import { createApp } from 'vue';

import App from './App.vue';
import router from './router.js';
import store from './store/index.js';
import BouncingCircleSpinner from './components/spinners/BouncingCircleSpinner.vue';

const app = createApp(App);

app.use(router);
app.use(store);
app.component('bouncing-circle-spinner', BouncingCircleSpinner);

app.mount('#app');
