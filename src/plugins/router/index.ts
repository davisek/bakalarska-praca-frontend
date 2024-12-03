import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from "@/views/app@home/home.vue";
import Sensor from "@/views/app@sensor/sensor.vue";
import Group from "@/views/app@group/group.vue";
import axiosInstance from "@/plugins/axios";
import Statistics from "@/views/app@statistics/statistics.vue";
import Groups from "@/views/app@group/groups.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/dashboard'
    },

    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Home,
        meta: {requiresAuth: false}
    },

    {
        path: '/groups',
        name: 'Groups',
        component: Groups,
        meta: {requiresAuth: false}
    },

    {
        path: '/statistics',
        name: 'Statistics',
        component: Statistics,
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

const loadPathsForSensorRoutes = async () => {
    try {
        const prefixes = ["dashboard", "groups", "statistics"];
        const response = await axiosInstance.get('/sensor-groups');

        response.forEach(group => {
            prefixes.forEach(prefix => {
                router.addRoute({
                    path: `/${prefix}/${group.group_value}`,
                    name: `${group.group_name}${prefix.charAt(0).toUpperCase() + prefix.slice(1)}Group`,
                    component: Group,
                    meta: { requiresAuth: false },
                    props: () => ({
                        sensors: group.sensors
                    }),
                });

                group.sensors.forEach(sensor => {
                    router.addRoute({
                        path: `/${prefix}/${group.group_value}/${sensor.type}`,
                        name: `${sensor.display_name}${prefix.charAt(0).toUpperCase() + prefix.slice(1)}`,
                        component: Sensor,
                        meta: { requiresAuth: false },
                        props: () => ({
                            sensor: sensor,
                        }),
                    });
                });
            });
        });
    } catch (error) {
        console.error('Failed to load sensor groups:', error);
    }
};

loadPathsForSensorRoutes()

export default router;
