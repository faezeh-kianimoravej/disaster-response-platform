import axios, {
	type AxiosInstance,
	type AxiosResponse,
	type AxiosError,
	type InternalAxiosRequestConfig,
} from 'axios';

// Create axios instance with base configuration
const axiosInstance: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || '',
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor
axiosInstance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		// Add auth token if available
		// const token = localStorage.getItem('token');
		// if (token) {
		// 	// Axios v1 uses AxiosHeaders which supports .set()
		// 	config.headers?.set?.('Authorization', `Bearer ${token}`);
		// }
		return config;
	},
	(error: AxiosError | unknown) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => response,
	(error: AxiosError | unknown) => {
		// Handle common errors
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			// Handle unauthorized
		}
		return Promise.reject(error);
	}
);

export { axiosInstance as axios };
