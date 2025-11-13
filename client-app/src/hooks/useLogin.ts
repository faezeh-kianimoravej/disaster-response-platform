import { useState } from 'react';
import { login as apiLogin } from '@/api/user';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types/user';
import type { ApiError } from '@/api/base';

export function useLogin() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const auth = useAuth();

	async function login(email: string, password: string): Promise<User | null> {
		setLoading(true);
		setError(null);
		try {
			localStorage.removeItem('auth_token');
			localStorage.removeItem('user_data');
			const response = await apiLogin(email, password);

			// Store token in localStorage
			localStorage.setItem('auth_token', response.token);

			// Fetch full user profile by matching email from listUsers
			let user: User | null = null;
			try {
				const users = await import('@/api/user').then(m => m.listUsers());
				user = users.find(u => u.email === response.email) || null;
			} catch {
				// fallback to minimal user object
				user = {
					userId: 0,
					firstName: '',
					lastName: '',
					email: response.email,
					mobile: '',
					roles: response.roles,
					deleted: false,
				};
			}
			if (!user) {
				user = {
					userId: 0,
					firstName: '',
					lastName: '',
					email: response.email,
					mobile: '',
					roles: response.roles,
					deleted: false,
				};
			}
			localStorage.setItem('user_data', JSON.stringify(user));
			auth?.setAuth?.({
				isLoggedIn: true,
				user,
				token: response.token,
			});
			setLoading(false);
			return user;
		} catch (err) {
			const apiError = err as ApiError;
			setError(apiError.message || 'Login failed');
			setLoading(false);
			return null;
		}
	}

	function logout() {
		// Clear all auth data from localStorage
		localStorage.removeItem('auth_token');
		localStorage.removeItem('user_data');

		auth?.setAuth?.({
			isLoggedIn: false,
			user: null,
			token: undefined,
		});
	}

	return { login, logout, loading, error };
}
