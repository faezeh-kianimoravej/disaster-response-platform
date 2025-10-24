import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProviders } from '../context/AppProviders';
import * as api from '../api/notification';
import useNotifications from '../hooks/useNotifications';

vi.mock('../api/notification');

const mockNotifications = [
	{
		notificationId: '1',
		read: false,
		createdAt: new Date().toISOString(),
		title: '',
		description: '',
		notificationType: 'NEW_INCIDENT',
	},
	{
		notificationId: '2',
		read: false,
		createdAt: new Date().toISOString(),
		title: '',
		description: '',
		notificationType: 'NEW_INCIDENT',
	},
	{
		notificationId: '3',
		read: true,
		createdAt: new Date().toISOString(),
		title: '',
		description: '',
		notificationType: 'NEW_INCIDENT',
	},
];

describe('useNotifications', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(api.fetchNotifications as jest.Mock).mockResolvedValue(mockNotifications);
		(api.markNotificationAsRead as jest.Mock).mockResolvedValue(undefined);
	});

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<AppProviders>{children}</AppProviders>
	);

	it('fetches notifications and sets unread count', async () => {
		const { result } = renderHook(() => useNotifications(), { wrapper });
		await waitFor(() => expect(result.current.notifications.length).toBe(3));
		expect(result.current.unreadCount).toBe(2);
		expect(result.current.error).toBeNull();
	});

	it('marks a notification as read', async () => {
		const { result } = renderHook(() => useNotifications(), { wrapper });
		await waitFor(() => expect(result.current.notifications.length).toBe(3));
		await act(async () => {
			await result.current.markAsRead('1');
		});
		expect(api.markNotificationAsRead).toHaveBeenCalledWith('1');
		expect(
			result.current.notifications.find(
				(n: (typeof result.current.notifications)[number]) => n.notificationId === '1'
			)?.read
		).toBe(true);
		expect(result.current.unreadCount).toBe(1);
	});

	it('marks all notifications as read', async () => {
		const { result } = renderHook(() => useNotifications(), { wrapper });
		// Wait for notifications to be loaded
		await waitFor(() => expect(result.current.notifications.length).toBeGreaterThan(0));
		await act(async () => {
			await result.current.markAllAsRead();
		});
		// Should be called for each unread notification (2 in this case)
		expect(api.markNotificationAsRead).toHaveBeenCalledTimes(2);
		expect(api.markNotificationAsRead).toHaveBeenCalledWith('1');
		expect(api.markNotificationAsRead).toHaveBeenCalledWith('2');
		expect(
			result.current.notifications.every(
				(n: (typeof result.current.notifications)[number]) => n.read
			)
		).toBe(true);
		expect(result.current.unreadCount).toBe(0);
	});
});
