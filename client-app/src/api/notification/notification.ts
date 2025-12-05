import { BaseApi } from '@/api/base';
import type { Notification } from '@/types/notification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const notificationApi = new BaseApi(`${API_BASE_URL}/notifications`);

// Fetch all notifications for a region
export async function fetchNotifications(regionId: number): Promise<Notification[]> {
	const data = await notificationApi.get<Notification[]>('', { regionId });
	return data;
}

// Mark a notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
	await notificationApi.put<void>(`/${id}/read`);
}
