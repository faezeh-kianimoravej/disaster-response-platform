import { useEffect, useState } from 'react';
import type { Notification } from '@/types/notification';
import { config } from '@/config';
import { fetchNotifications, markNotificationAsRead } from '@/api/notification';
import { showBrowserNotification } from '@/utils/notificationUtils';
import { useAuth } from '@/context/AuthContext';
import { useNotificationContext } from '@/context/NotificationContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function useNotifications(
	onNewNotification?: (n: Notification) => void,
	regionIdParam?: number,
	options?: { enabled?: boolean }
) {
	const auth = useAuth();
	const regionId = regionIdParam ?? auth?.user?.regionId;
	const { lastNotificationId, setLastNotificationId } = useNotificationContext();
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [initialNotificationIds, setInitialNotificationIds] = useState<Set<string>>(new Set());
	const [initialLoadComplete, setInitialLoadComplete] = useState(false);

	const queryClient = useQueryClient();

	useEffect(() => {
		if (
			typeof window !== 'undefined' &&
			'Notification' in window &&
			Notification.permission === 'default'
		) {
			Notification.requestPermission();
		}
	}, []);

	const enabled = options?.enabled ?? !!regionId;
	const listQuery = useQuery<Notification[], Error>({
		queryKey: ['notifications', regionId],
		queryFn: () => fetchNotifications(Number(regionId)),
		enabled,
	});

	useEffect(() => {
		const data = listQuery.data;
		if (data) {
			const arr = Array.isArray(data) ? data : [];
			setInitialNotificationIds(new Set(arr.map(n => n.notificationId)));
			setError(null);
			setInitialLoadComplete(true);
		}
		if (listQuery.error) {
			setError(String(listQuery.error.message));
		}
	}, [listQuery.data, listQuery.error]);

	const refreshNotifications = listQuery.refetch;

	useEffect(() => {
		if (!initialLoadComplete || !regionId) return;
		const streamUrl = `${config.api.baseURL}/notifications/incidents/stream/${regionId}${lastNotificationId ? `?lastNotificationId=${lastNotificationId}` : ''}`;

		const eventSource = new EventSource(streamUrl);

		eventSource.onopen = () => setIsConnected(true);

		const handleNotificationEvent = (event: MessageEvent) => {
			try {
				const notification: Notification = JSON.parse(event.data);
				queryClient.setQueryData<Notification[] | undefined>(['notifications', regionId], prev => {
					const current = Array.isArray(prev) ? prev : [];
					const exists = current.some(n => n.notificationId === notification.notificationId);
					if (exists) return current;
					return [notification, ...current];
				});

				const isNew = !initialNotificationIds.has(notification.notificationId);
				if (isNew) {
					try {
						if (
							typeof window !== 'undefined' &&
							'Notification' in window &&
							Notification.permission === 'granted'
						) {
							showBrowserNotification(notification.title, { body: notification.description });
						}
					} catch {}
					if (onNewNotification) onNewNotification(notification);
				}
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
		queryClient,
	]);

	const markAsReadMutation = useMutation<void, Error, string>({
		mutationFn: (id: string) => markNotificationAsRead(id),
		onSuccess(_, id) {
			queryClient.setQueryData<Notification[] | undefined>(['notifications', regionId], prev =>
				prev ? prev.map(n => (n.notificationId === id ? { ...n, read: true } : n)) : prev
			);
			setError(null);
		},
		onError() {
			setError('Failed to mark notification as read');
		},
	});

	const markAllAsReadMutation = useMutation<void, Error, void>({
		mutationFn: async () => {
			const unread = (
				queryClient.getQueryData<Notification[]>(['notifications', regionId]) || []
			).filter(n => !n.read);
			await Promise.all(unread.map(n => markNotificationAsRead(n.notificationId)));
		},
		onSuccess() {
			queryClient.setQueryData<Notification[] | undefined>(['notifications', regionId], prev =>
				prev ? prev.map(n => ({ ...n, read: true })) : prev
			);
			setError(null);
		},
		onError() {
			setError('Failed to mark all notifications as read');
		},
	});

	const notificationsResult = listQuery.data ?? [];
	const derivedUnread = notificationsResult.filter(n => !n.read).length;

	return {
		notifications: notificationsResult,
		unreadCount: derivedUnread,
		isConnected,
		loading: listQuery.isFetching,
		error: listQuery.error ? String(listQuery.error.message) : error,
		markAsRead: (id: string) => markAsReadMutation.mutateAsync(id),
		markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
		fetchNotifications: refreshNotifications,
	};
}
