import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || '',
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor
axiosInstance.interceptors.request.use(
	config => {
		// Add auth token if available
		// const token = localStorage.getItem('token');
		// if (token) {
		//   config.headers.Authorization = `Bearer ${token}`;
		// }
		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

// Response interceptor
axiosInstance.interceptors.response.use(
	response => {
		return response;
	},
	error => {
		// Handle common errors
		if (error.response?.status === 401) {
			// Handle unauthorized
		}
		return Promise.reject(error);
	}
);

export { axiosInstance as axios };
