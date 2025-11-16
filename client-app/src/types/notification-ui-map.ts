import { NotificationType } from './notification';

export interface NotificationUIConfig {
	icon: string;
	actionLabel?: string;
	actionUrl?: (notification: {
		incidentId?: string;
		deploymentRequestId?: number;
	}) => string | undefined;
}

const GENERIC_CONFIG: NotificationUIConfig = {
	icon: 'notifications',
};

export const NOTIFICATION_UI_MAP: Record<NotificationType, NotificationUIConfig> = {
	[NotificationType.NEW_INCIDENT]: {
		icon: 'report',
		actionLabel: 'View Incident',
		actionUrl: n => (n.incidentId ? `/incidents/${n.incidentId}` : undefined),
	},
	[NotificationType.INCIDENT_UPDATE]: GENERIC_CONFIG,
	[NotificationType.INCIDENT_RESOLVED]: GENERIC_CONFIG,
	[NotificationType.RESOURCE_DEPLOYED]: GENERIC_CONFIG,
	[NotificationType.RESOURCE_REQUEST]: GENERIC_CONFIG,
	[NotificationType.RESOURCE_RETURNED]: GENERIC_CONFIG,
	[NotificationType.WEATHER_WARNING]: GENERIC_CONFIG,
	[NotificationType.GENERAL_ALERT]: GENERIC_CONFIG,
	[NotificationType.DEPLOYMENT_REQUEST]: {
		icon: 'report',
		actionLabel: 'View Deployment Request',
		actionUrl: n =>
			n.deploymentRequestId ? `/deployment-requests/${n.deploymentRequestId}` : undefined,
	},
};
