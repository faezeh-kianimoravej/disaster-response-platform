import { NotificationProvider } from './NotificationContext';
import { AuthContext } from './AuthContext';
import type { AuthState } from './AuthContext';
import type { User } from '@/types/user';
import { ToastProvider } from '../components/toast/ToastProvider';
import React from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
	// TODO: Replace with real authentication logic
	const defaultUser: User = {
		userId: 1,
		firstName: 'Frontend',
		lastName: 'Dev',
		email: 'region.admin@example.com',
		mobile: '1234567890',
		roles: ['Region Admin'],
		departmentId: undefined,
		municipalityId: undefined,
		regionId: 1,
	};

	const [authState, setAuthState] = React.useState<AuthState>({
		isLoggedIn: true,
		user: defaultUser,
		token: 'mock-token',
	});

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

	const contextValue = {
		...authState,
		setAuth,
		updateUser,
	};

	return (
		<ToastProvider>
			<NotificationProvider>
				<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
			</NotificationProvider>
		</ToastProvider>
	);
}
