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
			gcTime: 1000 * 60 * 60 * 24, // 24 hours (previously cacheTime)
			retry: (failureCount) => {
				// Don't retry when offline
				if (!navigator.onLine) return false;
				return failureCount < 1;
			},
			retryOnMount: false, // Prevent retry on mount when offline
			refetchOnWindowFocus: false, // Disable automatic refetch
			refetchOnReconnect: true, // Re-fetch when network reconnects
			refetchOnMount: false, // Don't refetch on mount, use cache
			networkMode: 'offlineFirst', // Always use cache when offline
		},
		mutations: {
			retry: (failureCount) => {
				// Don't retry mutations when offline
				if (!navigator.onLine) return false;
				return failureCount < 1;
			},
			networkMode: 'online', // Only allow mutations when online
		},
	},
});

// Handle online/offline events for React Query
window.addEventListener('online', () => {
	// When coming back online, resume mutations and refetch stale data
	queryClient.resumePausedMutations();
	queryClient.refetchQueries({ 
		type: 'active',
		stale: true
	});
});

window.addEventListener('offline', () => {
	// When going offline, don't clear anything - just pause mutations
	// Keep all cached data intact for offline usage
	console.log('App went offline - using cached data');
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
			{process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	</React.StrictMode>
);

// Register service worker for PWA functionality
const updateSW = registerSW({
	immediate: true,
	onNeedRefresh() {
		// Auto-update in development, prompt user in production
		if (process.env.NODE_ENV === 'development') {
			updateSW(true);
		} else {
			// In production, you could show a toast to user here
			// For now, auto-update to ensure offline functionality works
			updateSW(true);
		}
	},
	onOfflineReady() {
		console.log('App ready to work offline');
	},
	onRegisteredSW(swUrl, _r) {
		console.log('Service worker registered:', swUrl);
	},
});
