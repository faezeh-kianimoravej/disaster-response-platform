import { useState } from 'react';
import { login as apiLogin } from '@/api/user';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types/user';
import type { ApiError } from '@/api/base';

export function useLogin() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const auth = useAuth();

	async function login(email: string, password: string): Promise<boolean> {
		setLoading(true);
		setError(null);
		try {
			const response = await apiLogin(email, password);

			// Create a User object from the login response
			const user: User = {
				userId: 0, // We don't get userId from login response, will be set when fetching user details
				firstName: '',
				lastName: '',
				email: response.email,
				mobile: '',
				roles: response.roles,
				deleted: false,
			};

			// Store token in localStorage
			localStorage.setItem('auth_token', response.token);
			localStorage.setItem('user_email', response.email);

			// Update auth state with the token and user info
			auth?.setAuth?.({
				isLoggedIn: true,
				user,
				token: response.token,
			});

			setLoading(false);
			return true;
		} catch (err) {
			const apiError = err as ApiError;
			setError(apiError.message || 'Login failed');
			setLoading(false);
			return false;
		}
	}

	function logout() {
		// Clear token from localStorage
		localStorage.removeItem('auth_token');
		localStorage.removeItem('user_email');

		auth?.setAuth?.({
			isLoggedIn: false,
			user: null,
			token: undefined,
		});
	}

	return { login, logout, loading, error };
}
