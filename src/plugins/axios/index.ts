import axios, { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_AXIOS_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

axiosInstance.interceptors.response.use(
    response => {
        if (response.data && 'data' in response.data && 'current_page' in response.data) {
            return response.data;
        }
        return response.data.data ?? response.data;
    },
    error => Promise.reject(error)
);

export default axiosInstance;