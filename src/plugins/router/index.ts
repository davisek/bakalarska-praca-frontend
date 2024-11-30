import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from "@/views/app@home/home.vue";
import Sensor from "@/views/app@sensor/sensor.vue";
import Group from "@/views/app@group/group.vue";
import axiosInstance from "../axios";

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
        path: '/:patMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

const loadDynamicRoutes = async () => {
    try {
        const response = await axiosInstance.get('/meta-data/groups');

        response.forEach(group => {
            router.addRoute({
                path: `/${group.group_value}`,
                name: `${group.group_name}Group`,
                component: Group,
                meta: { requiresAuth: false },
                props: { sensors: group.sensors }
            });
            group.sensors.forEach(sensor => {
                router.addRoute({
                    path: `/${group.group_value}/${sensor.type}`,
                    name: sensor.display_name,
                    component: Sensor,
                    meta: { requiresAuth: false },
                    props: () => ({
                        type: sensor.type,
                        displayName: sensor.display_name
                    }),
                });
            });
        });
    } catch (error) {
        console.error('Failed to load sensor groups:', error);
    }
}

loadDynamicRoutes()

export default router;
