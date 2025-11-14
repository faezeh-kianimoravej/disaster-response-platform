// Matches backend NotificationType enum
export enum NotificationType {
	NEW_INCIDENT = 'NEW_INCIDENT',
	INCIDENT_UPDATE = 'INCIDENT_UPDATE',
	INCIDENT_RESOLVED = 'INCIDENT_RESOLVED',
	RESOURCE_DEPLOYED = 'RESOURCE_DEPLOYED',
	RESOURCE_REQUEST = 'RESOURCE_REQUEST',
	RESOURCE_RETURNED = 'RESOURCE_RETURNED',
	WEATHER_WARNING = 'WEATHER_WARNING',
	GENERAL_ALERT = 'GENERAL_ALERT',
	DEPLOYMENT_REQUEST = 'DEPLOYMENT_REQUEST',
}

export interface Notification {
	notificationId: string;
	incidentId?: string;
	title: string;
	description: string;
	createdAt: string;
	read: boolean;
	notificationType: NotificationType;
	deploymentRequestId?: number;
	targetDepartmentId?: string;
}

export interface NotificationResponse {
	notifications: Notification[];
	unreadCount: number;
}
