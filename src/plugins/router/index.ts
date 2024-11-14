import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from "@/views/app@home/home.vue";
import Temperature from "@/views/app@temperature/temperature.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/home'
    },

    {
        path: '/home',
        name: 'Home',
        component: Home,
        meta: {requiresAuth: false}
    },

    {
        path: '/temperature',
        name: 'Temperature',
        component: Temperature,
        meta: {requiresAuth: false}
    },

    {
        path: '/:patMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
