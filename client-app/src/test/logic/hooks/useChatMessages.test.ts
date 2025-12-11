import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test/utils';
import { useSendMessage, useMessagesByGroup, useMessageById } from '@/hooks/chat/useChatMessages';
import React, { type ReactNode } from 'react';

// Mock the chat message API
vi.mock('@/api/chat/chatMessageApi', () => ({
	createChatMessage: vi.fn(),
	getChatMessagesByGroup: vi.fn(),
	getChatMessageById: vi.fn(),
}));

const chatMessageApi = await import('@/api/chat/chatMessageApi');
const mockedChatMessageApi = vi.mocked(chatMessageApi, { partial: true });

describe('useChatMessages hooks', () => {
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

	describe('useSendMessage', () => {
		const mockMessage = {
			id: 'msg-1',
			chatGroupId: 1,
			userId: 1,
			content: 'Hello team',
			type: 'DEFAULT' as const,
			timestamp: new Date('2024-01-15T10:00:00Z'),
			updatedAt: new Date('2024-01-15T10:00:00Z'),
		};

		const createRequest = {
			chatGroupId: 1,
			userId: 1,
			content: 'Hello team',
			type: 'DEFAULT' as const,
		};
		it('should send a message successfully', async () => {
			vi.mocked(mockedChatMessageApi.createChatMessage).mockResolvedValue(mockMessage);

			const { result } = renderHook(() => useSendMessage(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.mutateAsync(createRequest);
			});

			await waitFor(() => {
				expect(result.current.isSuccess).toBe(true);
			});

			expect(result.current.data).toEqual(mockMessage);
			expect(vi.mocked(mockedChatMessageApi.createChatMessage)).toHaveBeenCalledWith(createRequest);
		});

		it('should invalidate messages cache on successful send', async () => {
			vi.mocked(mockedChatMessageApi.createChatMessage).mockResolvedValue(mockMessage);

			// Pre-populate cache
			queryClient.setQueryData(['chat-messages'], []);
			const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

			const { result } = renderHook(() => useSendMessage(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.mutateAsync(createRequest);
			});

			await waitFor(() => {
				// Should only invalidate groups (not messages) since SSE handles real-time message updates
				expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['chat-groups'] });
			});
		});

		it('should handle send error', async () => {
			const error = new Error('Failed to send message');
			vi.mocked(mockedChatMessageApi.createChatMessage).mockRejectedValue(error);

			const { result } = renderHook(() => useSendMessage(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.mutateAsync(createRequest).catch(() => {});
			});

			await waitFor(() => {
				expect(result.current.isError).toBe(true);
			});
		});

		it('should track mutation state correctly', async () => {
			vi.mocked(mockedChatMessageApi.createChatMessage).mockImplementation(
				() => new Promise(resolve => setTimeout(() => resolve(mockMessage), 50))
			);

			const { result } = renderHook(() => useSendMessage(), {
				wrapper: createWrapper(),
			});

			expect(result.current.isPending).toBe(false);

			const mutationPromise = result.current.mutateAsync(createRequest);

			await waitFor(() => expect(result.current.isPending).toBe(true));

			await act(async () => {
				await mutationPromise;
			});

			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
				expect(result.current.isSuccess).toBe(true);
			});
		});
	});

	describe('useMessagesByGroup', () => {
		const mockMessages = [
			{
				id: 'msg-1',
				chatGroupId: 1,
				userId: 1,
				content: 'Hello',
				type: 'DEFAULT' as const,
				timestamp: new Date('2024-01-15T10:00:00Z'),
				updatedAt: new Date('2024-01-15T10:00:00Z'),
			},
			{
				id: 'msg-2',
				chatGroupId: 1,
				userId: 2,
				content: 'Hi there',
				type: 'DEFAULT' as const,
				timestamp: new Date('2024-01-15T10:01:00Z'),
				updatedAt: new Date('2024-01-15T10:01:00Z'),
			},
		];

		it('should fetch messages for a chat group', async () => {
			vi.mocked(mockedChatMessageApi.getChatMessagesByGroup).mockResolvedValue(mockMessages);

			const { result } = renderHook(() => useMessagesByGroup(1), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockMessages);
			expect(vi.mocked(mockedChatMessageApi.getChatMessagesByGroup)).toHaveBeenCalledWith(1);
		});

		it('should not fetch when groupId is undefined', () => {
			const { result } = renderHook(() => useMessagesByGroup(undefined), {
				wrapper: createWrapper(),
			});

			expect(result.current.isLoading).toBe(false);
			expect(result.current.data).toBeUndefined();
			expect(vi.mocked(mockedChatMessageApi.getChatMessagesByGroup)).not.toHaveBeenCalled();
		});

		it('should handle empty message list', async () => {
			vi.mocked(mockedChatMessageApi.getChatMessagesByGroup).mockResolvedValue([]);

			const { result } = renderHook(() => useMessagesByGroup(1), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual([]);
		});

		it('should handle error when fetching messages', async () => {
			const error = new Error('Failed to fetch messages');
			vi.mocked(mockedChatMessageApi.getChatMessagesByGroup).mockRejectedValue(error);

			const { result } = renderHook(() => useMessagesByGroup(1), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isError).toBe(true));

			expect(result.current.error).toEqual(error);
		});

		it('should use correct query key with groupId', async () => {
			vi.mocked(mockedChatMessageApi.getChatMessagesByGroup).mockResolvedValue([]);

			const { result } = renderHook(() => useMessagesByGroup(42), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			const queryCache = queryClient.getQueryCache();
			const queries = queryCache.getAll();
			const matchingQuery = queries.find(
				q => JSON.stringify(q.queryKey) === JSON.stringify(['chat-messages', 'group', 42])
			);

			expect(matchingQuery).toBeDefined();
		});
	});

	describe('useMessageById', () => {
		const mockMessage = {
			id: 'msg-1',
			chatGroupId: 1,
			userId: 1,
			content: 'Hello',
			type: 'DEFAULT' as const,
			timestamp: new Date('2024-01-15T10:00:00Z'),
			updatedAt: new Date('2024-01-15T10:00:00Z'),
		};

		it('should fetch a specific message by ID', async () => {
			vi.mocked(mockedChatMessageApi.getChatMessageById).mockResolvedValue(mockMessage);

			const { result } = renderHook(() => useMessageById('msg-1'), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockMessage);
			expect(vi.mocked(mockedChatMessageApi.getChatMessageById)).toHaveBeenCalledWith('msg-1');
		});

		it('should not fetch when messageId is undefined', () => {
			const { result } = renderHook(() => useMessageById(undefined), {
				wrapper: createWrapper(),
			});

			expect(result.current.isLoading).toBe(false);
			expect(result.current.data).toBeUndefined();
			expect(vi.mocked(mockedChatMessageApi.getChatMessageById)).not.toHaveBeenCalled();
		});

		it('should handle error when fetching message', async () => {
			const error = new Error('Message not found');
			vi.mocked(mockedChatMessageApi.getChatMessageById).mockRejectedValue(error);

			const { result } = renderHook(() => useMessageById('msg-1'), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isError).toBe(true));

			expect(result.current.error).toEqual(error);
		});

		it('should use correct query key with messageId', async () => {
			vi.mocked(mockedChatMessageApi.getChatMessageById).mockResolvedValue(mockMessage);

			const { result } = renderHook(() => useMessageById('msg-123'), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			const queryCache = queryClient.getQueryCache();
			const queries = queryCache.getAll();
			const matchingQuery = queries.find(
				q => JSON.stringify(q.queryKey) === JSON.stringify(['chat-messages', 'item', 'msg-123'])
			);

			expect(matchingQuery).toBeDefined();
		});
	});
});
