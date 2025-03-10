import axios, {AxiosError, AxiosInstance, AxiosResponse} from 'axios';
import { PaginatedResponse } from '@/types';
import {showError} from "@/utils/notificationUtil";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_AXIOS_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.data && 'data' in response.data && 'meta' in response.data) {
            return {
                data: response.data.data,
                ...response.data.meta,
                links: response.data.links
            };
        }
        return response.data.data ?? response.data;
    }
);

export const setupAuthErrorHandling = (router: any) => {
    axiosInstance.interceptors.response.use(
        response => response,
        (error: AxiosError) => {
            if (error.response) {
                const status = error.response.status;

                if (status === 401) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');

                    if (router.currentRoute.value.path !== '/login') {
                        showError('Your session has expired. Please log in again.');
                        router.push('/login');
                    }
                }

                if (status === 403) {
                    showError('You do not have permission to access this resource.');
                }
            }

            return Promise.reject(error);
        }
    );
};

export default axiosInstance;