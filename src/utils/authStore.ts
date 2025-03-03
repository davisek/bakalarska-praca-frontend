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
                if (errorData.message) {
                    showError(errorData.message);
                } else if (errorData.error) {
                    showError(errorData.error);
                } else {
                    showError('Login failed. Please check your credentials and try again.');
                }
            } else {
                showError('An unexpected error occurred. Please try again.');
            }
            console.error('Login error:', err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const logout = async () => {
        loading.value = true;

        try {
            await axiosInstance.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            isAuthenticated.value = false;
            user.value = null;
            loading.value = false;
            showSuccess('Logged out successfully');
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