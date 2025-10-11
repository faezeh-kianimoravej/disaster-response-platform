import { axios } from '@/axios';
import { AxiosError } from 'axios';

export interface ApiError {
	message: string;
	status: number;
	code?: string;
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
			return response.data;
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
			return {
				message: axiosError.message,
				status: axiosError.response?.status || 500,
				...(axiosError.code && { code: axiosError.code }),
			};
		}

		const err = error as { message?: string; status?: number; code?: string };
		return {
			message: err.message || 'An unexpected error occurred',
			status: err.status || 500,
			...(err.code && { code: err.code }),
		};
	}
}
