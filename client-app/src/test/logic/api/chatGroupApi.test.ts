import { vi, describe, it, expect } from 'vitest';
import { BaseApi } from '@/api/base';

describe('api/chat/chatGroupApi', () => {
	afterEach(() => vi.restoreAllMocks());

	it('getChatGroupByIncident calls BaseApi.get and returns mapped chat group', async () => {
		vi.spyOn(BaseApi.prototype, 'get').mockResolvedValue({
			chatGroupId: 1,
			incidentId: 42,
			title: 'Warehouse Fire',
			createdAt: '2024-01-15T10:00:00Z',
			isClosed: false,
			lastMessage: {
				chatMessageId: 10,
				chatGroupId: 1,
				userId: 5,
				userFullName: 'John Doe',
				userRole: 'RESPONDER',
				messageType: 'DEFAULT',
				content: 'Test message',
				timestamp: '2024-01-15T10:30:00Z',
			},
			numberOfUnreadMessages: 2,
		});

		const chatGroupApi = await import('@/api/chat/chatGroupApi');
		const result = await chatGroupApi.getChatGroupByIncident(42);

		expect(result).toBeDefined();
		expect(result?.id).toBe(1);
		expect(result?.incidentId).toBe(42);
		expect(result?.name).toBe('Warehouse Fire');
		expect(result?.createdAt).toEqual(new Date('2024-01-15T10:00:00Z'));
		expect(result?.unreadCount).toBe(2);
		expect(result?.lastMessage?.content).toBe('Test message');
		expect(BaseApi.prototype.get).toHaveBeenCalledWith('/incident/42');
	});

	it('getChatGroupByIncident returns null on error', async () => {
		vi.spyOn(BaseApi.prototype, 'get').mockRejectedValue(new Error('Not found'));

		const chatGroupApi = await import('@/api/chat/chatGroupApi');
		const result = await chatGroupApi.getChatGroupByIncident(999);

		expect(result).toBeNull();
	});

	it('getChatGroupsByUser calls BaseApi.get and returns mapped chat groups array', async () => {
		vi.spyOn(BaseApi.prototype, 'get').mockResolvedValue([
			{
				chatGroupId: 1,
				incidentId: 42,
				title: 'Incident 1',
				createdAt: '2024-01-15T10:00:00Z',
				isClosed: false,
			},
			{
				chatGroupId: 2,
				incidentId: 43,
				title: 'Incident 2',
				createdAt: '2024-01-15T11:00:00Z',
				isClosed: false,
			},
		]);

		const chatGroupApi = await import('@/api/chat/chatGroupApi');
		const result = await chatGroupApi.getChatGroupsByUser(123);

		expect(result).toHaveLength(2);
		expect(result[0]?.id).toBe(1);
		expect(result[0]?.name).toBe('Incident 1');
		expect(result[1]?.id).toBe(2);
		expect(result[1]?.name).toBe('Incident 2');
		expect(BaseApi.prototype.get).toHaveBeenCalledWith('/user/123');
	});

	it('createChatGroup calls BaseApi.post and returns mapped chat group', async () => {
		vi.spyOn(BaseApi.prototype, 'post').mockResolvedValue({
			id: 5,
			incidentId: 100,
			name: 'New Chat Group',
			createdAt: '2024-01-15T12:00:00Z',
		});

		const chatGroupApi = await import('@/api/chat/chatGroupApi');
		const result = await chatGroupApi.createChatGroup({
			incidentId: 100,
			name: 'New Chat Group',
		});

		expect(result).toBeDefined();
		expect(result.id).toBe(5);
		expect(result.incidentId).toBe(100);
		expect(result.name).toBe('New Chat Group');
		expect(BaseApi.prototype.post).toHaveBeenCalledWith('', {
			incidentId: 100,
			name: 'New Chat Group',
		});
	});
});
