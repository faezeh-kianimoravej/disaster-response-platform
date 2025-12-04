import { axios } from '@/lib/axios';
import { AxiosError } from 'axios';

export interface ApiError {
	message: string;
	status: number;
	code?: string;
	validationErrors?: Record<string, string>;
}

/**
 * Simple base API class for CRUD operations
 */
export class BaseApi {
	protected baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	/**
	 * GET request with optional params
	 */
	async get<T>(endpoint = '', params?: Record<string, unknown>): Promise<T> {
		try {
			const response = await axios.get<T>(`${this.baseUrl}${endpoint}`, { params });
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * POST request
	 */
	async post<T>(endpoint = '', data?: unknown): Promise<T> {
		try {
			const response = await axios.post<T>(`${this.baseUrl}${endpoint}`, data);
			return (response.data ?? null) as T;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * PUT request
	 */
	async put<T>(endpoint = '', data?: unknown): Promise<T> {
		try {
			const response = await axios.put<T>(`${this.baseUrl}${endpoint}`, data);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * PATCH request
	 */
	async patch<T>(endpoint = '', data?: unknown): Promise<T> {
		try {
			const response = await axios.patch<T>(`${this.baseUrl}${endpoint}`, data);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * DELETE request
	 */
	async delete<T = void>(endpoint = ''): Promise<T> {
		try {
			const response = await axios.delete<T>(`${this.baseUrl}${endpoint}`);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Error handling
	 */
	protected handleError(error: unknown): ApiError {
		if (error && typeof error === 'object' && 'response' in error) {
			const axiosError = error as AxiosError;
			const data = axiosError.response?.data as
				| {
						message?: string;
						error?: string;
						errors?: Record<string, string>;
						fieldErrors?: Record<string, string>;
						validationErrors?: Record<string, string>;
				  }
				| undefined;
			const validationErrors = data?.errors || data?.fieldErrors || data?.validationErrors;
			// Prefer backend-provided message if present; fallback to Axios message
			const serverMessage = data?.message || data?.error;

			const apiError: ApiError = {
				message: serverMessage || axiosError.message,
				status: axiosError.response?.status || 500,
				...(axiosError.code && { code: axiosError.code }),
				...(validationErrors && { validationErrors }),
			};

			// eslint-disable-next-line no-console
			console.error('[API Error] Request failed:', {
				url: axiosError.config?.url,
				method: axiosError.config?.method,
				status: axiosError.response?.status,
				message: apiError.message,
				validationErrors,
				fullResponseData: data,
				fullError: axiosError,
			});
			return apiError;
		}

		const err = error as { message?: string; status?: number; code?: string };
		const apiError: ApiError = {
			message: err.message || 'An unexpected error occurred',
			status: err.status || 500,
			...(err.code && { code: err.code }),
		};

		// eslint-disable-next-line no-console
		console.error('[API Error] Unexpected error:', apiError);

		return apiError;
	}
}
