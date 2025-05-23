import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from "@/views/app@home/home.vue";
import Sensor from "@/views/app@sensor/sensor.vue";
import Group from "@/views/app@group/group.vue";
import axiosInstance from "@/plugins/axios";
import Statistics from "@/views/app@statistics/statistics.vue";
import Groups from "@/views/app@group/groups.vue";
import { SensorGroup, Sensor as SensorType } from '@/types';
import Login from "@/views/app@login/login.vue";
import Register from "@/views/app@register/register.vue";
import AdminUsers from "@/views/app@admin/app@users/admin-users.vue";
import AdminSensors from "@/views/app@admin/app@sensors/admin-sensors.vue";
import {showError} from "@/utils/notificationUtil.ts";
import AdminDashboard from "@/views/app@admin/admin-dashboard.vue";
import i18n from '@/plugins/i18n';

const t = i18n.global.t;

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
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false, hideForAuth: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { requiresAuth: false, hideForAuth: true }
    },

    {
        path: '/admin',
        component: () => import('@/views/app@admin/a-admin-layout.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            {
                path: '',
                name: 'AdminDashboard',
                component: AdminDashboard,
            },
            {
                path: 'users',
                name: 'AdminUsers',
                component: AdminUsers,
            },
            {
                path: 'sensors',
                name: 'AdminSensors',
                component: AdminSensors,
            },
        ]
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

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('auth_token');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

    if (!requiresAuth) {
        next();
        return;
    }

    if (requiresAuth && !isAuthenticated) {
        showError(t('auth.adminAccessRequired'));
        next({ name: 'Login' });
        return;
    }

    if (requiresAdmin) {
        const userData = localStorage.getItem('user');

        if (!userData) {
            // showError(t('auth.missingSessionData'));
            next({ name: 'Login' });
            return;
        }

        try {
            const user = JSON.parse(userData);

            if (!user.is_admin) {
                next({ name: 'Dashboard' });
                return;
            }

            next();
        } catch (error) {
            // showError(t('auth.invalidSessionData'));
            next({ name: 'Login' });
        }
    } else {
        next();
    }
});

const loadPathsForSensorRoutes = async () => {
    try {
        const prefixes = ["dashboard", "groups", "statistics"];
        const response = await axiosInstance.get<SensorGroup[]>('/sensor-groups');

        response.forEach((group: SensorGroup) => {
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

                group.sensors.forEach((sensor: SensorType) => {
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
    }
};

loadPathsForSensorRoutes()

export default router;
