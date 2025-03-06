import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import axiosInstance from '@/plugins/axios';
import { showSuccess, showError } from '@/utils/notificationUtil';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const router = useRouter();
    const isAuthenticated = ref(false);
    const user = ref(null);
    const loading = ref(false);

    const initializeAuth = () => {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');

        isAuthenticated.value = !!token;
        if (userData) {
            try {
                user.value = JSON.parse(userData);
            } catch (e) {
                console.error('Error parsing user data:', e);
                user.value = null;
            }
        }
    };

    const verifyToken = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            isAuthenticated.value = false;
            return false;
        }

        try {
            await axiosInstance.get('/auth/verify-token');
            return true;
        } catch (err) {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                isAuthenticated.value = false;
                user.value = null;
            }
            return false;
        }
    };

    const login = async (credentials) => {
        loading.value = true;

        try {
            const response = await axiosInstance.post('/auth/login', credentials);
            if (response.type === 'success' && response.token) {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                isAuthenticated.value = true;
                user.value = response.user;

                showSuccess(response.message || 'Login successful');
                return true;
            } else {
                showError(response.message || 'Login failed');
                return false;
            }
        } catch (err) {
            if (err.response && err.response.data) {
                const errorData = err.response.data;

                if (errorData.errors) {
                    const firstError = Object.values(errorData.errors)[0];
                    showError(Array.isArray(firstError) ? firstError[0] : 'Validation error');

                    return {
                        success: false,
                        errors: errorData.errors
                    };
                } else {
                    showError('Login failed. Please check your credentials and try again.');
                }
            } else {
                showError('An unexpected error occurred. Please try again.');
            }
            return false;
        } finally {
            loading.value = false;
        }
    };

    const logout = async () => {
        loading.value = true;
        let response;
        try {
            response = await axiosInstance.post('/auth/logout');
        } catch (err) {
            showError('Logout unsuccessful');
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            isAuthenticated.value = false;
            user.value = null;
            loading.value = false;
            showSuccess(response.message);
        }
    };

    initializeAuth();

    if (typeof window !== 'undefined') {
        window.addEventListener('storage', (e) => {
            if (e.key === 'auth_token') {
                initializeAuth();
            }
        });
    }

    const checkAuthOnInit = async () => {
        initializeAuth();
        if (isAuthenticated.value) {
            await verifyToken();
        }
    };

    checkAuthOnInit();

    return {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        initializeAuth,
        verifyToken,
        checkAuthOnInit
    };
});