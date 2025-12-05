import { useCallback, useEffect, useState } from 'react';
import { NotificationType, type Notification } from '@/types/notification';
import type { User } from '@/types/user';
import { config } from '@/config';
import { markNotificationAsRead } from '@/api/notification/notification';
import { showBrowserNotification } from '@/utils/notificationUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	connectToNotificationStream,
	disconnectFromNotificationStream,
	addNotificationEventListener,
	removeNotificationEventListener,
	type NotificationSSEEvent,
	type NotificationSSEData,
} from '@/api/notification/notificationSseApi';

function normalizeNotification(data: NotificationSSEData): Notification {
	const normalized: Notification = {
		notificationId: String(data.notificationId),
		title: data.title ?? 'Notification',
		description: data.description ?? '',
		createdAt: data.createdAt ?? new Date().toISOString(),
		read: data.read ?? false,
		notificationType: (data.notificationType as NotificationType) ?? NotificationType.GENERAL_ALERT,
	};

	if (data.incidentId !== undefined) normalized.incidentId = data.incidentId;
	if (data.deploymentRequestId !== undefined)
		normalized.deploymentRequestId = data.deploymentRequestId;
	if (data.targetDepartmentId !== undefined)
		normalized.targetDepartmentId = data.targetDepartmentId;

	return normalized;
}

export default function useNotifications(
	user?: User | null,
	onNewNotification?: (n: Notification) => void
) {
	const roles = user?.roles ?? [];

	const regionId = roles.find(r => r.regionId)?.regionId ?? null;
	const departmentId = roles.find(r => r.departmentId)?.departmentId ?? null;

	const isRegionUser = regionId != null;

	const targetKey = isRegionUser ? regionId : departmentId;
	const targetType = isRegionUser ? 'region' : 'department';

	const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	const queryClient = useQueryClient();

	// ---------------- FIRST LOAD ----------------

	const listQuery = useQuery<Notification[], Error>({
		queryKey: ['notifications', targetType, targetKey],
		queryFn: async () => {
			const url = isRegionUser
				? `${config.api.baseURL}/notifications/incidents?regionId=${regionId}`
				: `${config.api.baseURL}/notifications/deployment?departmentId=${departmentId}`;

			const res = await fetch(url);
			if (!res.ok) throw new Error('Failed to fetch notifications');
			return res.json();
		},
		enabled: !!targetKey,
	});

	// --------------- SSE STREAM ----------------

	const handleSSEEvent = useCallback(
		(event: NotificationSSEEvent) => {
			if (event.type !== 'NOTIFICATION') return;

			const notification = normalizeNotification(event.data as NotificationSSEData);

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
		},
		[
			targetType,
			targetKey,
			lastNotificationId,
			queryClient,
			onNewNotification,
			setLastNotificationId,
		]
	);

	useEffect(() => {
		if (!targetKey) return;

		const streamKey = isRegionUser ? `incident-${regionId}` : `deployment-${departmentId}`;
		const streamUrl = isRegionUser
			? `${config.api.baseURL}/notifications/incidents/stream/${regionId}`
			: `${config.api.baseURL}/notifications/deployment/stream/${departmentId}`;

		// Add event listener
		addNotificationEventListener(streamKey, 'NOTIFICATION', handleSSEEvent);
		addNotificationEventListener(streamKey, 'CONNECTION_STATUS', (event: NotificationSSEEvent) => {
			const statusData = event.data as { status: string };
			setIsConnected(statusData.status === 'CONNECTED');
		});

		// Connect
		connectToNotificationStream(streamKey, streamUrl, lastNotificationId ?? undefined);

		return () => {
			removeNotificationEventListener(streamKey, 'NOTIFICATION', handleSSEEvent);
			disconnectFromNotificationStream(streamKey);
		};
	}, [regionId, departmentId, targetKey, isRegionUser, lastNotificationId, handleSSEEvent]);

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
