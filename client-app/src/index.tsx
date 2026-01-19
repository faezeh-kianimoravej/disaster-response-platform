import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { registerSW } from 'virtual:pwa-register';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 60 * 24, // 24 hours
			retry: (failureCount) => {
				// Don't retry when offline
				if (!navigator.onLine) return false;
				return failureCount < 2;
			},
			retryOnMount: true,
			refetchOnWindowFocus: true, // better after returning to app
			refetchOnReconnect: true,
			refetchOnMount: true,
		},
		mutations: {
			retry: (failureCount) => {
				if (!navigator.onLine) return false;
				return failureCount < 2;
			},
			networkMode: 'online',
		},
	},
});

// Avoid multiple listeners in dev/HMR
declare global {
	interface Window {
		__rqOnlineOfflineListenersAdded?: boolean;
		__swRegistered?: boolean;
		__updateSW?: ((reloadPage?: boolean) => Promise<void>) | undefined;
	}
}

if (!window.__rqOnlineOfflineListenersAdded) {
	window.__rqOnlineOfflineListenersAdded = true;

	window.addEventListener('online', () => {
		// Resume paused mutations and force queries to become stale so they refetch properly
		try {
			queryClient.resumePausedMutations();
		} catch {
			// ignore
		}

		// Cancel any stuck in-flight requests and invalidate everything so new mounts fetch fresh data
		queryClient.cancelQueries();
		queryClient.invalidateQueries();
	});

	window.addEventListener('offline', () => {
		console.log('App went offline - using cached data');
	});
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
			{process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	</React.StrictMode>
);

// Register service worker ONLY after auth is ready
if (!window.__swRegistered) {
	window.__swRegistered = true;

	window.addEventListener('app-auth-ready', () => {
		if (window.__updateSW) return; // Already registered

		console.log('Auth ready - registering service worker');
		window.__updateSW = registerSW({
			immediate: false, // Don't register immediately
			onNeedRefresh() {
				// Auto-update to ensure offline functionality works
				window.__updateSW?.(true);
			},
			onOfflineReady() {
				console.log('App ready to work offline');
			},
			onRegisteredSW(swUrl) {
				console.log('Service worker registered:', swUrl);
			},
		});
	});

	// Handle logout: unregister service workers
	window.addEventListener('app-logout', async () => {
		console.log('Logout detected - unregistering service workers');
		try {
			if ('serviceWorker' in navigator) {
				const registrations = await navigator.serviceWorker.getRegistrations();
				await Promise.all(registrations.map(reg => reg.unregister()));
			}
			
			// Clear cache storage
			if ('caches' in window) {
				const cacheNames = await caches.keys();
				await Promise.all(cacheNames.map(name => caches.delete(name)));
			}
		} catch (error) {
			console.warn('Failed to cleanup service workers on logout:', error);
		}
		
		// Reset SW state
		window.__updateSW = undefined;
	});
}
