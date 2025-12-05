import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axios } from '@/lib/axios';
import { fetchNotifications, markNotificationAsRead } from '@/api/notification/notification';

vi.mock('@/lib/axios', () => ({
	axios: {
		get: vi.fn(),
		put: vi.fn(),
	},
}));

describe('notification API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetchNotifications - GET /notifications with regionId param', async () => {
		const mockNotifications = [
			{
				notificationId: '1',
				title: 'Test Notification',
				description: 'Test Description',
				timestamp: '2025-11-04T10:00:00Z',
				regionId: 1,
				status: 'ACTIVE',
				type: 'INFO',
			},
		];

		vi.mocked(axios.get).mockResolvedValueOnce({ data: mockNotifications });

		const result = await fetchNotifications(1);

		expect(result).toEqual(mockNotifications);
		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/notifications'), {
			params: { regionId: 1 },
		});
	});

	it('markNotificationAsRead - PUT /notifications/:id/read', async () => {
		vi.mocked(axios.put).mockResolvedValueOnce({ data: undefined });

		await markNotificationAsRead('123');

		expect(axios.put).toHaveBeenCalledWith(
			expect.stringContaining('/notifications/123/read'),
			undefined
		);
	});
});
