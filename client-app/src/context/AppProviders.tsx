import { NotificationProvider } from './NotificationContext';
import { UserContext } from './UserContext';
import { ToastProvider } from '../components/toast/ToastProvider';
import React from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<ToastProvider>
			<NotificationProvider>
				<UserContext.Provider value={{ isLoggedIn: true, regionId: 1 }}>
					{children}
				</UserContext.Provider>
			</NotificationProvider>
		</ToastProvider>
	);
}
