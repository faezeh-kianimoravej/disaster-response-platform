import { useEffect, useState } from 'react';
import type { Notification } from '@/types/notification';
import { config } from '@/config';
import { markNotificationAsRead } from '@/api/notification';
import { showBrowserNotification } from '@/utils/notificationUtils';
import { useAuth } from '@/context/AuthContext';
import { useNotificationContext } from '@/context/NotificationContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function useNotifications(onNewNotification?: (n: Notification) => void) {
	const auth = useAuth();
	const roles = auth?.user?.roles ?? [];

	const regionId = roles.find(r => r.regionId)?.regionId ?? null;
	const departmentId = roles.find(r => r.departmentId)?.departmentId ?? null;

	const isRegionUser = regionId != null;

	const targetKey = isRegionUser ? regionId : departmentId;
	const targetType = isRegionUser ? 'region' : 'department';

	const { lastNotificationId, setLastNotificationId } = useNotificationContext();
	const [isConnected, setIsConnected] = useState(false);

	const queryClient = useQueryClient();

	// ---------------- FIRST LOAD ----------------

	const listQuery = useQuery<Notification[], Error>({
		queryKey: ['notifications', targetType, targetKey],
		queryFn: async () => {
			const url = isRegionUser
				? `${config.api.baseURL}/notifications/incident?regionId=${regionId}`
				: `${config.api.baseURL}/notifications/deployment?departmentId=${departmentId}`;

			const res = await fetch(url);
			if (!res.ok) throw new Error('Failed to fetch notifications');
			return res.json();
		},
		enabled: !!targetKey,
	});

	// --------------- SSE STREAM ----------------

	useEffect(() => {
		if (!targetKey) return;

		const streamUrl = isRegionUser
			? `${config.api.baseURL}/notifications/incident/stream/${regionId}${
					lastNotificationId ? `?lastNotificationId=${lastNotificationId}` : ''
				}`
			: `${config.api.baseURL}/notifications/deployment/stream/${departmentId}${
					lastNotificationId ? `?lastNotificationId=${lastNotificationId}` : ''
				}`;

		const sse = new EventSource(streamUrl);

		sse.addEventListener('notification', (event: MessageEvent) => {
			try {
				const notification: Notification = JSON.parse(event.data);

				queryClient.setQueryData<Notification[]>(['notifications', targetType, targetKey], prev => {
					if (!prev) return [notification];
					const exists = prev.some(n => n.notificationId === notification.notificationId);
					if (exists) return prev;
					return [notification, ...prev];
				});

				onNewNotification?.(notification);

				const idNum = Number(notification.notificationId);
				if (!lastNotificationId || idNum > lastNotificationId) {
					setLastNotificationId(idNum);
				}

				showBrowserNotification(notification.title ?? 'Notification', {
					body: notification.description,
				});
			} catch {}
		});

		sse.onopen = () => setIsConnected(true);
		sse.onerror = () => {
			setIsConnected(false);
			sse.close();
		};

		return () => sse.close();
	}, [regionId, departmentId, targetKey, targetType, lastNotificationId]);

	// ----------- MARK AS READ -----------

	const markAsReadMutation = useMutation<void, Error, string>({
		mutationFn: (id: string) => markNotificationAsRead(id),
		onSuccess(_, id) {
			queryClient.setQueryData<Notification[]>(['notifications', targetType, targetKey], prev =>
				prev ? prev.map(n => (n.notificationId === id ? { ...n, read: true } : n)) : prev
			);
		},
	});

	const markAllAsReadMutation = useMutation<void, Error, void>({
		mutationFn: async () => {
			const unreadNotifications = notifications.filter(n => !n.read);
			await Promise.all(unreadNotifications.map(n => markNotificationAsRead(n.notificationId)));
		},
		onSuccess() {
			queryClient.setQueryData<Notification[]>(['notifications', targetType, targetKey], prev =>
				prev ? prev.map(n => ({ ...n, read: true })) : prev
			);
		},
	});

	const notifications = listQuery.data ?? [];
	const unreadCount = notifications.filter(n => !n.read).length;

	return {
		notifications,
		unreadCount,
		isConnected,
		loading: listQuery.isFetching,
		error: listQuery.error,
		markAsRead: (id: string) => markAsReadMutation.mutateAsync(id),
		markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
		fetchNotifications: listQuery.refetch,
	};
}
