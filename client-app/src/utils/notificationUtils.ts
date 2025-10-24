// Utility for showing browser notifications with a custom icon
export function showBrowserNotification(title: string, options?: NotificationOptions) {
	if (window.Notification && Notification.permission === 'granted') {
		const icon = '/favicon.jpg';
		new Notification(title, { ...options, icon });
	}
}
