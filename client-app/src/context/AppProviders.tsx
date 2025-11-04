import { NotificationProvider } from './NotificationContext';
import { AuthContext } from './AuthContext';
import type { AuthState } from './AuthContext';
import type { User } from '@/types/user';
import { ToastProvider } from '../components/toast/ToastProvider';
import React from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
	// Start as unauthenticated
	const [authState, setAuthState] = React.useState<AuthState>({
		isLoggedIn: false,
		user: null,
		token: undefined,
	});
	const [isRestoring, setIsRestoring] = React.useState(true);

	const setAuth = (a: AuthState) => setAuthState(a);

	const updateUser = (patch: Partial<User> | null) => {
		setAuthState(
			prev =>
				({
					...prev,
					user: patch === null ? null : { ...(prev.user ?? ({} as User)), ...patch },
				}) as AuthState
		);
	};

	// Restore auth from localStorage on mount
	React.useEffect(() => {
		const token = localStorage.getItem('auth_token');
		const email = localStorage.getItem('user_email');

		if (token && email) {
			// Restore user from stored credentials
			// For now, we'll create a minimal user object
			// In a real app, you'd fetch user details from the API using the token
			const restoredUser: User = {
				userId: 0,
				firstName: '',
				lastName: '',
				email,
				mobile: '',
				roles: [],
				deleted: false,
			};

			setAuthState({
				isLoggedIn: true,
				user: restoredUser,
				token,
			});
		}

		setIsRestoring(false);
	}, []);

	const contextValue = {
		...authState,
		setAuth,
		updateUser,
	};

	// Show loading state while restoring auth
	if (isRestoring) {
		return null;
	}

	return (
		<ToastProvider>
			<NotificationProvider>
				<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
			</NotificationProvider>
		</ToastProvider>
	);
}
