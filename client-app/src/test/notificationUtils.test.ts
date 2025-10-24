import { showBrowserNotification } from '../utils/notificationUtils';

describe('showBrowserNotification', () => {
	it('does not throw if Notification API is unavailable', () => {
		// @ts-expect-error: Simulate Notification API missing
		delete window.Notification;
		expect(() => showBrowserNotification('Test')).not.toThrow();
	});

	it('shows a notification if permission is granted', () => {
		// Mock Notification API
		const mockNotification = vi.fn();
		// @ts-expect-error: Mock Notification constructor
		window.Notification = function (title, options) {
			mockNotification(title, options);
		};
		// @ts-expect-error: Mock Notification.permission
		window.Notification.permission = 'granted';
		showBrowserNotification('Test Title', { body: 'Test Body' });
		expect(mockNotification).toHaveBeenCalledWith(
			'Test Title',
			expect.objectContaining({ body: 'Test Body', icon: '/favicon.jpg' })
		);
	});
});
