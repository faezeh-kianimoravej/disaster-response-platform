import { useEffect, useState, useCallback } from 'react';
import type { Notification } from '@/types/notification';
import { config } from '@/config';
import { fetchNotifications, markNotificationAsRead } from '@/api/notification';
import { useAuth } from '@/context/AuthContext';
import { useNotificationContext } from '@/context/NotificationContext';

export default function useNotifications(onNewNotification?: (n: Notification) => void) {
	const auth = useAuth();
	const regionId = auth?.user?.regionId;
	const { lastNotificationId, setLastNotificationId } = useNotificationContext();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isConnected, setIsConnected] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [initialNotificationIds, setInitialNotificationIds] = useState<Set<string>>(new Set());
	const [initialLoadComplete, setInitialLoadComplete] = useState(false);

	// Initial fetch only on mount or auth change
	useEffect(() => {
		if (!regionId) {
			setNotifications([]);
			setUnreadCount(0);
			setError(null);
			setLoading(false);
			return;
		}
		let isMounted = true;
		const fetchInitial = async () => {
			setLoading(true);
			try {
				const data = await fetchNotifications(regionId);
				if (!isMounted) return;
				setNotifications(Array.isArray(data) ? data : []);
				setUnreadCount(Array.isArray(data) ? data.filter(n => !n.read).length : 0);
				setInitialNotificationIds(
					new Set((Array.isArray(data) ? data : []).map(n => n.notificationId))
				);
				setError(null);
			} catch {
				if (!isMounted) return;
				setError('Failed to fetch notifications');
			} finally {
				if (!isMounted) return;
				setLoading(false);
				setInitialLoadComplete(true);
			}
		};
		fetchInitial();
		return () => {
			isMounted = false;
		};
	}, [regionId]);

	// Subscribe to SSE incidents endpoint for real-time notifications
	useEffect(() => {
		if (!initialLoadComplete || !regionId) return;
		const streamUrl = `${config.api.baseURL}/notifications/incidents/stream/${regionId}${lastNotificationId ? `?lastNotificationId=${lastNotificationId}` : ''}`;

		const eventSource = new EventSource(streamUrl);

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
				// Only call onNewNotification if this notification was not in the initial fetch
				if (onNewNotification && !initialNotificationIds.has(notification.notificationId)) {
					onNewNotification(notification);
				}
				// Update lastNotificationId in context if this notification is newer
				const notifIdNum = Number(notification.notificationId);
				if (!lastNotificationId || (!isNaN(notifIdNum) && notifIdNum > lastNotificationId)) {
					setLastNotificationId(notifIdNum);
				}
			} catch {}
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
	}, [
		regionId,
		lastNotificationId,
		setLastNotificationId,
		onNewNotification,
		initialNotificationIds,
		initialLoadComplete,
	]);

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
		// refresh: fetchNotificationsCallback, // Removed, function no longer exists
	};
}
