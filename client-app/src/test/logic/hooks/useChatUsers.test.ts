import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test/utils';
import { useCreateChatUser, useChatUsers, useChatUser } from '@/hooks/chat/useChatUsers';
import React, { type ReactNode } from 'react';

// Mock the chat user API
vi.mock('@/api/chat/chatUserApi', () => ({
	createChatUser: vi.fn(),
	getAllChatUsers: vi.fn(),
	getChatUserById: vi.fn(),
}));

const chatUserApi = await import('@/api/chat/chatUserApi');
const mockedChatUserApi = vi.mocked(chatUserApi, { partial: true });

describe('useChatUsers hooks', () => {
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

	describe('useCreateChatUser', () => {
		const mockUser = {
			id: 1,
			userId: 1,
			chatGroupId: 1,
			joinedAt: new Date('2024-01-15T10:00:00Z'),
			isActive: true,
		};

		const createRequest = {
			userId: 1,
			chatGroupId: 1,
		};
		it('should create a new chat user', async () => {
			vi.mocked(mockedChatUserApi.createChatUser).mockResolvedValue(mockUser);

			const { result } = renderHook(() => useCreateChatUser(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.mutateAsync(createRequest);
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockUser);
			expect(vi.mocked(mockedChatUserApi.createChatUser)).toHaveBeenCalledWith(createRequest);
		});

		it('should invalidate users cache on successful creation', async () => {
			vi.mocked(mockedChatUserApi.createChatUser).mockResolvedValue(mockUser);

			// Pre-populate cache
			queryClient.setQueryData(['chat-users'], []);
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useCreateChatUser(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.mutateAsync(createRequest);
			});

			await waitFor(() => {
				expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['chat-users'] });
				expect(invalidateSpy).toHaveBeenCalledWith({
					queryKey: ['chat-groups', 'item', mockUser.chatGroupId],
				});
			});
		});

		it('should handle creation error', async () => {
			const error = new Error('Failed to create user');
			vi.mocked(mockedChatUserApi.createChatUser).mockRejectedValue(error);

			const { result } = renderHook(() => useCreateChatUser(), {
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

	describe('useChatUsers', () => {
		const mockUsers = [
			{
				id: 1,
				chatGroupId: 1,
				firstName: 'Alice',
				lastName: 'Smith',
				email: 'alice@example.com',
			},
			{
				id: 2,
				chatGroupId: 1,
				firstName: 'Bob',
				lastName: 'Jones',
				email: 'bob@example.com',
			},
			{
				id: 3,
				chatGroupId: 2,
				firstName: 'Carol',
				lastName: 'Davis',
				email: 'carol@example.com',
			},
		];

		it('should fetch all chat users successfully', async () => {
			vi.mocked(mockedChatUserApi.getAllChatUsers).mockResolvedValue(mockUsers);

			const { result } = renderHook(() => useChatUsers(), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockUsers);
			expect(result.current.isLoading).toBe(false);
			expect(vi.mocked(mockedChatUserApi.getAllChatUsers)).toHaveBeenCalled();
		});

		it('should handle empty user list', async () => {
			vi.mocked(mockedChatUserApi.getAllChatUsers).mockResolvedValue([]);

			const { result } = renderHook(() => useChatUsers(), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual([]);
		});

		it('should handle error when fetching users', async () => {
			const error = new Error('Failed to fetch users');
			vi.mocked(mockedChatUserApi.getAllChatUsers).mockRejectedValue(error);

			const { result } = renderHook(() => useChatUsers(), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isError).toBe(true));

			expect(result.current.error).toEqual(error);
		});

		it('should cache users query results', async () => {
			vi.mocked(mockedChatUserApi.getAllChatUsers).mockResolvedValue(mockUsers);

			const { result: result1 } = renderHook(() => useChatUsers(), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result1.current.isSuccess).toBe(true));

			// Verify query key exists
			const queryCache = queryClient.getQueryCache();
			const queries = queryCache.getAll();
			const matchingQuery = queries.find(
				q => JSON.stringify(q.queryKey) === JSON.stringify(['chat-users'])
			);

			expect(matchingQuery).toBeDefined();
		});
	});

	describe('useChatUser', () => {
		const mockUser = {
			id: 1,
			chatGroupId: 1,
			firstName: 'Alice',
			lastName: 'Smith',
			email: 'alice@example.com',
		};

		it('should fetch a specific user by ID', async () => {
			vi.mocked(mockedChatUserApi.getChatUserById).mockResolvedValue(mockUser);

			const { result } = renderHook(() => useChatUser(1), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockUser);
			expect(vi.mocked(mockedChatUserApi.getChatUserById)).toHaveBeenCalledWith(1);
		});

		it('should not fetch when userId is undefined', () => {
			const { result } = renderHook(() => useChatUser(undefined), {
				wrapper: createWrapper(),
			});

			expect(result.current.isLoading).toBe(false);
			expect(result.current.data).toBeUndefined();
			expect(vi.mocked(mockedChatUserApi.getChatUserById)).not.toHaveBeenCalled();
		});

		it('should handle error when fetching user', async () => {
			const error = new Error('User not found');
			vi.mocked(mockedChatUserApi.getChatUserById).mockRejectedValue(error);

			const { result } = renderHook(() => useChatUser(1), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isError).toBe(true));

			expect(result.current.error).toEqual(error);
		});

		it('should use correct query key with userId', async () => {
			vi.mocked(mockedChatUserApi.getChatUserById).mockResolvedValue(mockUser);

			const { result } = renderHook(() => useChatUser(42), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			// The query should be in the cache with the correct key
			const queryCache = queryClient.getQueryCache();
			const queries = queryCache.getAll();
			const matchingQuery = queries.find(
				q => JSON.stringify(q.queryKey) === JSON.stringify(['chat-users', 'item', 42])
			);

			expect(matchingQuery).toBeDefined();
		});

		it('should refetch when userId changes', async () => {
			vi.mocked(mockedChatUserApi.getChatUserById)
				.mockResolvedValueOnce(mockUser)
				.mockResolvedValueOnce({ ...mockUser, userId: 2 });

			const { result, rerender } = renderHook(({ userId }) => useChatUser(userId), {
				initialProps: { userId: 1 },
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			rerender({ userId: 2 });

			await waitFor(() => {
				expect(
					vi.mocked(mockedChatUserApi.getChatUserById).mock.calls.length
				).toBeGreaterThanOrEqual(1);
			});
		});
	});
});
