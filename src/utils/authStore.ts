import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import axiosInstance from '@/plugins/axios';
import { showSuccess, showError } from '@/utils/notificationUtil';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

export const useAuthStore = defineStore('auth', () => {
    const { t } = useI18n();
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
                // console.error('Error parsing user data:', e);
                user.value = null;
            }
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

                showSuccess(response.message || t('auth.loginSuccessful'));
                return true;
            } else {
                showError(response.message || t('auth.loginFailed'));
                return false;
            }
        } catch (err) {
            if (err.response && err.response.data) {
                const errorData = err.response.data;

                if (errorData.errors) {
                    const firstError = Object.values(errorData.errors)[0];
                    showError(Array.isArray(firstError) ? firstError[0] : t('auth.validationError'));

                    return {
                        success: false,
                        errors: errorData.errors
                    };
                } else {
                    showError(t('auth.loginFailed'));
                }
            } else {
                showError(t('auth.unexpectedError'));
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
            showError(t('auth.logoutUnsuccessful'));
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            isAuthenticated.value = false;
            user.value = null;
            loading.value = false;
            showSuccess(response.message || t('auth.logoutSuccessful'));
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
    };

    checkAuthOnInit();

    return {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        initializeAuth,
        checkAuthOnInit
    };
});