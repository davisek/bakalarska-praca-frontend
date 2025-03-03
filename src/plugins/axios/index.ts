import axios, {AxiosError, AxiosInstance, AxiosResponse} from 'axios';
import { PaginatedResponse } from '@/types';
import router from "../router";
import {showError} from "../../utils/notificationUtil.ts";

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

// axiosInstance.interceptors.response.use(
//     (response: AxiosResponse) => {
//         // Transform the response data if it has a specific structure
//         if (response.data && 'data' in response.data && 'current_page' in response.data) {
//             return response.data as PaginatedResponse<any>;
//         }
//         return response.data.data ?? response.data;
//     },
//     (error: AxiosError) => {
//         // Handle auth errors
//         if (error.response) {
//             const status = error.response.status;
//
//             // Unauthorized - token is invalid or expired
//             if (status === 401) {
//                 // Clear auth data
//                 localStorage.removeItem('auth_token');
//                 localStorage.removeItem('user');
//
//                 // If not already on login page, redirect to login
//                 if (router.currentRoute.value.path !== '/login') {
//                     showError('Your session has expired. Please log in again.');
//                     router.push('/login');
//                 }
//             }
//
//             // Forbidden - user doesn't have required permissions
//             if (status === 403) {
//                 showError('You do not have permission to access this resource.');
//             }
//         }
//
//         return Promise.reject(error);
//     }
// );

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.data && 'data' in response.data && 'current_page' in response.data) {
            return response.data as PaginatedResponse<any>;
        }
        return response.data.data ?? response.data;
    },
    error => Promise.reject(error)
);

export default axiosInstance;