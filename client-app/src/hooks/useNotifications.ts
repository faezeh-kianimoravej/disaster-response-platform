import { useEffect, useState, useCallback } from 'react';
import type { Notification } from '@/types/notification';
import { config } from '@/config';
import {
	fetchNotifications as fetchNotificationsApi,
	markNotificationAsRead,
} from '@/api/notification';
import { useUser } from '@/context/UserContext';

export function useNotifications() {
	const { regionId } = useUser();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isConnected, setIsConnected] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch initial notifications
	const fetchNotifications = useCallback(async () => {
		setLoading(true);
		try {
			const data = await fetchNotificationsApi(regionId);
			// data is an array of notifications
			setNotifications(Array.isArray(data) ? data : []);
			setUnreadCount(Array.isArray(data) ? data.filter(n => !n.read).length : 0);
			setError(null);
		} catch {
			setError('Failed to fetch notifications');
		} finally {
			setLoading(false);
		}
	}, [regionId]);

	// Subscribe to SSE endpoint for real-time notifications
	useEffect(() => {
		fetchNotifications();

		const eventSource = new EventSource(`${config.api.baseURL}/regions/incidents/stream`);

		eventSource.onopen = () => {
			setIsConnected(true);
		};

		const handleNotificationEvent = (event: MessageEvent) => {
			try {
				const notification: Notification = JSON.parse(event.data);
				setNotifications(prev => {
					const exists = prev.some(n => n.notificationId === notification.notificationId);
					if (exists) {
						return prev;
					}
					return [notification, ...prev];
				});
				setUnreadCount(prev => prev + 1);
			} catch (error) {
				console.error('Failed to parse notification:', error);
			}
		};

		eventSource.addEventListener('notification', handleNotificationEvent);

		eventSource.onerror = () => {
			setIsConnected(false);
			eventSource.close();
		};

		return () => {
			eventSource.removeEventListener('notification', handleNotificationEvent);
			eventSource.close();
			setIsConnected(false);
		};
	}, [fetchNotifications]);

	const markAsRead = useCallback(async (id: string) => {
		try {
			await markNotificationAsRead(id);
			setNotifications(prev => prev.map(n => (n.notificationId === id ? { ...n, read: true } : n)));
			setUnreadCount(prev => Math.max(0, prev - 1));
			setError(null);
		} catch {
			setError('Failed to mark notification as read');
		}
	}, []);

	const markAllAsRead = useCallback(async () => {
		try {
			// Find all unread notifications
			const unread = notifications.filter(n => !n.read);
			// Send mark-as-read requests in parallel
			await Promise.all(unread.map(n => markNotificationAsRead(n.notificationId)));
			setNotifications(prev => prev.map(n => ({ ...n, read: true })));
			setUnreadCount(0);
			setError(null);
		} catch {
			setError('Failed to mark all notifications as read');
		}
	}, [notifications]);

	return {
		notifications,
		unreadCount,
		isConnected,
		loading,
		error,
		markAsRead,
		markAllAsRead,
		refresh: fetchNotifications,
	};
}
