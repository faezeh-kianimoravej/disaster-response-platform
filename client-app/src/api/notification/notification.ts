import { BaseApi } from '@/api/base';
import type { Notification } from '@/types/notification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const notificationApi = new BaseApi(`${API_BASE_URL}/notifications`);

// Fetch notifications for either a region or department, attaching auth automatically via axios instance
export async function fetchNotifications(params: {
	regionId?: number | null;
	departmentId?: number | null;
}): Promise<Notification[]> {
	const { regionId, departmentId } = params;

	if (regionId != null) {
		return notificationApi.get<Notification[]>('/incidents', { regionId });
	}

	if (departmentId != null) {
		return notificationApi.get<Notification[]>('/deployment', { departmentId });
	}

	return [];
}

// Mark a notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
	await notificationApi.put<void>(`/${id}/read`);
}
