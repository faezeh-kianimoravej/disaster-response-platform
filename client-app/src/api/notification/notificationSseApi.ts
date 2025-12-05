import {
	GenericSSEApi,
	type GenericSSEEvent,
	type ConnectionStatusData,
} from '@/api/genericSseApi';

// Types for SSE events
export type NotificationSSEEvent = GenericSSEEvent<'NOTIFICATION' | 'CONNECTION_STATUS'>;

export interface NotificationSSEData {
	notificationId: string;
	title: string;
	description: string;
	read: boolean;
	createdAt?: string;
	notificationType?: string;
	incidentId?: string;
	deploymentRequestId?: number;
	targetDepartmentId?: string;
	[key: string]: unknown;
}

// Re-export for convenience
export type ConnectionStatusSSEData = ConnectionStatusData;

// Event handlers type
export type NotificationSSEEventHandler = (event: NotificationSSEEvent) => void;

// Notification-specific SSE API wrapper
class NotificationSSEApi {
	private api = new GenericSSEApi<NotificationSSEEvent>();
	private streamUrls: Map<string, string> = new Map();
	private streamParams: Map<string, Record<string, number>> = new Map();

	/**
	 * Connect to notification SSE stream for a specific stream type
	 * @param streamKey Unique key for the stream (e.g., 'incident-{regionId}' or 'deployment-{departmentId}')
	 * @param streamUrl The full URL endpoint for the stream
	 * @param lastNotificationId Optional last notification ID for resuming
	 */
	connect(streamKey: string, streamUrl: string, lastNotificationId?: number): void {
		this.streamUrls.set(streamKey, streamUrl);
		const params: Record<string, number> = {};
		if (lastNotificationId) {
			params.lastNotificationId = lastNotificationId;
		}
		this.streamParams.set(streamKey, params);

		this.api.connect(streamKey, streamUrl, { eventName: 'notification' }, params);
	}

	/**
	 * Disconnect from a specific notification stream
	 */
	disconnect(streamKey: string): void {
		this.api.disconnect(streamKey);
		this.streamUrls.delete(streamKey);
		this.streamParams.delete(streamKey);
	}

	/**
	 * Disconnect all streams
	 */
	disconnectAll(): void {
		this.api.disconnectAll();
		this.streamUrls.clear();
		this.streamParams.clear();
	}

	/**
	 * Add an event listener for specific event types on a stream
	 */
	addEventListener(
		streamKey: string,
		eventType: NotificationSSEEvent['type'],
		handler: NotificationSSEEventHandler
	): void {
		this.api.addEventListener(streamKey, eventType, handler);
	}

	/**
	 * Remove an event listener
	 */
	removeEventListener(
		streamKey: string,
		eventType: NotificationSSEEvent['type'],
		handler: NotificationSSEEventHandler
	): void {
		this.api.removeEventListener(streamKey, eventType, handler);
	}

	/**
	 * Check if a stream is currently connected
	 */
	isConnected(streamKey: string): boolean {
		return this.api.isConnected(streamKey);
	}
}

// Private instance
const notificationSSEApi = new NotificationSSEApi();

// Export public functions
export function connectToNotificationStream(
	streamKey: string,
	streamUrl: string,
	lastNotificationId?: number
): void {
	return notificationSSEApi.connect(streamKey, streamUrl, lastNotificationId);
}

export function disconnectFromNotificationStream(streamKey: string): void {
	return notificationSSEApi.disconnect(streamKey);
}

export function disconnectFromAllNotificationStreams(): void {
	return notificationSSEApi.disconnectAll();
}

export function addNotificationEventListener(
	streamKey: string,
	eventType: NotificationSSEEvent['type'],
	handler: NotificationSSEEventHandler
): void {
	return notificationSSEApi.addEventListener(streamKey, eventType, handler);
}

export function removeNotificationEventListener(
	streamKey: string,
	eventType: NotificationSSEEvent['type'],
	handler: NotificationSSEEventHandler
): void {
	return notificationSSEApi.removeEventListener(streamKey, eventType, handler);
}

export function isNotificationStreamConnected(streamKey: string): boolean {
	return notificationSSEApi.isConnected(streamKey);
}
