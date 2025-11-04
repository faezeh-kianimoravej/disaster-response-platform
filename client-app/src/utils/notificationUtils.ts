// Utility for showing browser notifications with a custom icon
export function showBrowserNotification(title: string, options?: NotificationOptions) {
	if (window.Notification && Notification.permission === 'granted') {
		const icon = '/favicon.jpg';
		const notification = new Notification(title, { ...options, icon });
		notification.onclick = function (event) {
			event.preventDefault();
			window.focus();
			if (window.parent) {
				window.parent.focus();
			}
		};
	}
}
