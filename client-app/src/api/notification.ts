import { axios } from '@/axios';

// Fetch all notifications for a region
export async function fetchNotifications(regionId: number) {
	const response = await axios.get('/notifications', {
		params: { regionId },
	});
	return response.data;
}

// Mark a notification as read
export async function markNotificationAsRead(id: string) {
	await axios.put(`/notifications/${id}/read`);
}
