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
		const userDataStr = localStorage.getItem('user_data');

		if (token && userDataStr) {
			try {
				const restoredUser = JSON.parse(userDataStr) as User;
				setAuthState({
					isLoggedIn: true,
					user: restoredUser,
					token,
				});
			} catch {
				// If JSON parse fails, clear invalid data
				localStorage.removeItem('auth_token');
				localStorage.removeItem('user_data');
			}
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
