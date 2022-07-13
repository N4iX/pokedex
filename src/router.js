import { createRouter, createWebHistory } from "vue-router";

import Home from './pages/Home.vue';
import PokemonDetails from './pages/PokemonDetails.vue';
import Favourite from './pages/Favourite.vue';
import PageNotFound from './pages/PageNotFound.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/home' },
        {
            path: '/home',
            component: Home
        },
        {
            path: '/pokemon/:id',
            component: PokemonDetails,
            props: true
        },
        {
            path: '/favourite',
            component: Favourite
        },
        {
            path: '/:notFound(.*)',
            component: PageNotFound
        }
    ],
    scrollBehavior() {
        // always scroll to top
        return { top: 0 };
    }
});

export default router;