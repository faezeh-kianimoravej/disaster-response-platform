import axios, {
	type AxiosInstance,
	type AxiosResponse,
	type AxiosError,
	type InternalAxiosRequestConfig,
	type AxiosRequestHeaders,
	AxiosHeaders,
} from 'axios';

// Create axios instance with base configuration
const axiosInstance: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || '',
	timeout: 60000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor
axiosInstance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		// Add auth token if available
		const token = localStorage.getItem('auth_token');
		if (token) {
			const headers = config.headers;
			// Axios v1 may provide AxiosHeaders which supports .set()
			if (headers && headers instanceof AxiosHeaders) {
				headers.set('Authorization', `Bearer ${token}`);
			} else {
				// Fallback for plain object headers
				config.headers = {
					...((headers as AxiosRequestHeaders) || {}),
					Authorization: `Bearer ${token}`,
				} as AxiosRequestHeaders;
			}
		}
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
