import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test/utils';
import {
	useChatGroups,
	useChatGroupById,
	useCreateChatGroup,
	useAddUserToChatGroup,
} from '@/hooks/chat/useChatGroups';
import React, { type ReactNode } from 'react';

// Mock the chat group API
vi.mock('@/api/chat/chatGroupApi', () => ({
	getChatGroupsByUser: vi.fn(),
	getChatGroupById: vi.fn(),
	createChatGroup: vi.fn(),
	addUserToChatGroup: vi.fn(),
}));

const chatGroupApi = await import('@/api/chat/chatGroupApi');
const mockedChatGroupApi = vi.mocked(chatGroupApi, { partial: true });

describe('useChatGroups hooks', () => {
	let queryClient: QueryClient;

	const createWrapper = () => {
		// eslint-disable-next-line react/display-name
		return ({ children }: { children: ReactNode }) =>
			React.createElement(QueryClientProvider, { client: queryClient }, children);
	};

	beforeEach(() => {
		vi.clearAllMocks();
		queryClient = createTestQueryClient();
	});

	describe('useChatGroups', () => {
		const mockChatGroups = [
			{
				id: 1,
				incidentId: 101,
				name: 'Incident Response Team',
				createdAt: new Date('2024-01-15T10:00:00Z'),
				updatedAt: new Date('2024-01-15T10:00:00Z'),
				members: [
					{ userId: 1, firstName: 'Alice', lastName: 'Smith' },
					{ userId: 2, firstName: 'Bob', lastName: 'Jones' },
				],
			},
			{
				id: 2,
				name: 'Dispatch Coordination',
				createdAt: new Date('2024-01-15T11:00:00Z'),
				updatedAt: new Date('2024-01-15T11:00:00Z'),
				members: [
					{ userId: 1, firstName: 'Alice', lastName: 'Smith' },
					{ userId: 3, firstName: 'Carol', lastName: 'Davis' },
				],
			},
		];

		it('should fetch chat groups for a user successfully', async () => {
			vi.mocked(mockedChatGroupApi.getChatGroupsByUser).mockResolvedValue(mockChatGroups);

			const { result } = renderHook(() => useChatGroups(1), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockChatGroups);
			expect(result.current.isLoading).toBe(false);
			expect(vi.mocked(mockedChatGroupApi.getChatGroupsByUser)).toHaveBeenCalledWith(1);
		});

		it('should not fetch when userId is null', () => {
			const { result } = renderHook(() => useChatGroups(null), {
				wrapper: createWrapper(),
			});

			expect(result.current.isLoading).toBe(false);
			expect(result.current.data).toBeUndefined();
			expect(vi.mocked(mockedChatGroupApi.getChatGroupsByUser)).not.toHaveBeenCalled();
		});

		it('should not fetch when userId is undefined', () => {
			const { result } = renderHook(() => useChatGroups(undefined), {
				wrapper: createWrapper(),
			});

			expect(result.current.isLoading).toBe(false);
			expect(result.current.data).toBeUndefined();
			expect(vi.mocked(mockedChatGroupApi.getChatGroupsByUser)).not.toHaveBeenCalled();
		});

		it('should handle error state', async () => {
			const error = new Error('Failed to fetch chat groups');
			vi.mocked(mockedChatGroupApi.getChatGroupsByUser).mockRejectedValue(error);

			const { result } = renderHook(() => useChatGroups(1), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isError).toBe(true));

			expect(result.current.data).toBeUndefined();
			expect(result.current.error).toEqual(error);
		});

		it('should use correct query key with userId', async () => {
			vi.mocked(mockedChatGroupApi.getChatGroupsByUser).mockResolvedValue([]);

			const { result } = renderHook(() => useChatGroups(42), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			const queryCache = queryClient.getQueryCache();
			const queries = queryCache.getAll();
			const matchingQuery = queries.find(
				q => JSON.stringify(q.queryKey) === JSON.stringify(['chat-groups', 42])
			);

			expect(matchingQuery).toBeDefined();
		});
	});

	describe('useChatGroupById', () => {
		const mockChatGroup = {
			id: 1,
			name: 'Incident Response Team',
			createdAt: new Date('2024-01-15T10:00:00Z'),
			updatedAt: new Date('2024-01-15T10:00:00Z'),
			members: [
				{ userId: 1, firstName: 'Alice', lastName: 'Smith' },
				{ userId: 2, firstName: 'Bob', lastName: 'Jones' },
			],
		};

		it('should fetch a specific chat group by ID', async () => {
			vi.mocked(mockedChatGroupApi.getChatGroupById).mockResolvedValue(mockChatGroup);

			const { result } = renderHook(() => useChatGroupById(1), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockChatGroup);
			expect(vi.mocked(mockedChatGroupApi.getChatGroupById)).toHaveBeenCalledWith(1);
		});

		it('should not fetch when groupId is undefined', () => {
			const { result } = renderHook(() => useChatGroupById(undefined), {
				wrapper: createWrapper(),
			});

			expect(result.current.isLoading).toBe(false);
			expect(result.current.data).toBeUndefined();
			expect(vi.mocked(mockedChatGroupApi.getChatGroupById)).not.toHaveBeenCalled();
		});

		it('should handle error when fetching group', async () => {
			const error = new Error('Group not found');
			vi.mocked(mockedChatGroupApi.getChatGroupById).mockRejectedValue(error);

			const { result } = renderHook(() => useChatGroupById(1), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isError).toBe(true));

			expect(result.current.error).toEqual(error);
		});
	});

	describe('useCreateChatGroup', () => {
		const createRequest = {
			name: 'New Group',
			userIds: [1, 2, 3],
			incidentId: 777,
		};

		const createdGroup = {
			id: 99,
			incidentId: 777,
			name: 'New Group',
			createdAt: new Date(),
			updatedAt: new Date(),
			members: [
				{ userId: 1, firstName: 'Alice', lastName: 'Smith' },
				{ userId: 2, firstName: 'Bob', lastName: 'Jones' },
				{ userId: 3, firstName: 'Carol', lastName: 'Davis' },
			],
		};

		it('should create a new chat group', async () => {
			vi.mocked(mockedChatGroupApi.createChatGroup).mockResolvedValue(createdGroup);

			const { result } = renderHook(() => useCreateChatGroup(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.mutateAsync(createRequest);
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(createdGroup);
			expect(vi.mocked(mockedChatGroupApi.createChatGroup)).toHaveBeenCalledWith(createRequest);
		});

		it('should invalidate groups cache on successful creation', async () => {
			vi.mocked(mockedChatGroupApi.createChatGroup).mockResolvedValue(createdGroup);

			// Pre-populate cache
			queryClient.setQueryData(['chat-groups'], []);
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useCreateChatGroup(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.mutateAsync(createRequest);
			});

			await waitFor(() => {
				expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['chat-groups'] });
			});
		});

		it('should handle creation error', async () => {
			const error = new Error('Failed to create group');
			vi.mocked(mockedChatGroupApi.createChatGroup).mockRejectedValue(error);

			const { result } = renderHook(() => useCreateChatGroup(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.mutateAsync(createRequest).catch(() => {});
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});
		});
	});

	describe('useAddUserToChatGroup', () => {
		it('should add user to chat group', async () => {
			vi.mocked(mockedChatGroupApi.addUserToChatGroup).mockResolvedValue(undefined);

			const { result } = renderHook(() => useAddUserToChatGroup(), {
				wrapper: createWrapper(),
			});

			const payload = { groupId: 1, userId: 5 };

			await act(async () => {
				await result.current.mutateAsync(payload);
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(vi.mocked(mockedChatGroupApi.addUserToChatGroup)).toHaveBeenCalledWith(1, 5);
		});

		it('should invalidate group cache when user is added', async () => {
			vi.mocked(mockedChatGroupApi.addUserToChatGroup).mockResolvedValue(undefined);

			// Pre-populate group cache
			queryClient.setQueryData(['chat-groups', 'item', 1], { id: 1, members: [] });
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useAddUserToChatGroup(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.mutateAsync({ groupId: 1, userId: 5 });
			});

			await waitFor(() => {
				expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['chat-groups', 'item', 1] });
				expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['chat-users'] });
			});
		});

		it('should handle error when adding user', async () => {
			const error = new Error('User already in group');
			vi.mocked(mockedChatGroupApi.addUserToChatGroup).mockRejectedValue(error);

			const { result } = renderHook(() => useAddUserToChatGroup(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.mutateAsync({ groupId: 1, userId: 5 }).catch(() => {});
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});
		});
	});
});
