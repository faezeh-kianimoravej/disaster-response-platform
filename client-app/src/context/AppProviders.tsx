import { NotificationProvider } from './NotificationContext';
import { AuthContext } from './AuthContext';
import type { User } from '@/types/user';
import { ToastProvider } from '../components/toast/ToastProvider';
import React from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
	// TODO: Replace with real authentication logic
	const defaultUser: User = {
		userId: 1,
		firstName: 'Region',
		lastName: 'Admin',
		email: 'region.admin@example.com',
		mobile: '1234567890',
		roles: ['Region Admin'],
		departmentId: undefined,
		municipalityId: undefined,
		regionId: 1,
	};

	const authValue = {
		isLoggedIn: true,
		user: defaultUser,
		token: 'mock-token',
	};

	return (
		<ToastProvider>
			<NotificationProvider>
				<AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
			</NotificationProvider>
		</ToastProvider>
	);
}
