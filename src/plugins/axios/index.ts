import axios, {AxiosInstance, AxiosResponse} from 'axios';
import { PaginatedResponse } from '@/types';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_AXIOS_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

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