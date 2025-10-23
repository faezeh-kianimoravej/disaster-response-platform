import { axios } from '@/axios';

export async function fetchNotifications(regionId?: number) {
	const response = await axios.get('/notifications', {
		params: regionId ? { regionId } : undefined,
	});
	return response.data;
}

export async function markNotificationAsRead(id: string) {
	await axios.put(`/notifications/${id}/read`);
}
