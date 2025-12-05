import { NotificationProvider } from './NotificationContext';
import { ToastProvider } from '../components/toast/ToastProvider';
import { KeycloakProvider } from './KeycloakProvider';
import AuthProvider from './AuthProvider';
import React from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<KeycloakProvider>
			<AuthProvider>
				<ToastProvider>
					<NotificationProvider>{children}</NotificationProvider>
				</ToastProvider>
			</AuthProvider>
		</KeycloakProvider>
	);
}
