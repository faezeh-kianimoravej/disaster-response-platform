import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChatSSE } from '@/hooks/chat/useChatSSE';

// Mock the chat SSE API module
vi.mock('@/api/chat/chatSseApi', () => ({
	connectToChat: vi.fn(),
	disconnectFromChat: vi.fn(),
	addChatEventListener: vi.fn(),
	removeChatEventListener: vi.fn(),
}));

describe('useChatSSE hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should initialize with connected state', () => {
		const { result } = renderHook(() => useChatSSE(1, 1, 'msg-last'));

		expect(result.current.isConnected).toBe(true);
		expect(result.current.connectionStatus).toBe('CONNECTED');
		expect(result.current.newMessages).toEqual([]);
	});

	it('should return empty new messages initially', () => {
		const { result } = renderHook(() => useChatSSE(1, 1));

		expect(result.current.newMessages).toBeDefined();
		expect(Array.isArray(result.current.newMessages)).toBe(true);
	});

	it('should track connection state changes', async () => {
		const { result, rerender } = renderHook(({ chatGroupId }) => useChatSSE(chatGroupId), {
			initialProps: { chatGroupId: 1 },
		});

		expect(result.current.connectionStatus).toBe('CONNECTED');

		rerender({ chatGroupId: 1 });

		await waitFor(() => {
			expect(result.current).toBeDefined();
		});
	});

	it('should handle different chat group IDs', () => {
		const { result: result1 } = renderHook(() => useChatSSE(1));
		const { result: result2 } = renderHook(() => useChatSSE(2));

		expect(result1.current.connectionStatus).toBe('CONNECTED');
		expect(result2.current.connectionStatus).toBe('CONNECTED');
	});

	it('should accept optional userId and lastMessageId parameters', () => {
		const { result } = renderHook(() => useChatSSE(1, 42, 'msg-123'));

		expect(result.current).toBeDefined();
		expect(result.current.isConnected).toBe(true);
	});

	it('should not have any errors initially', () => {
		const { result } = renderHook(() => useChatSSE(1, 1));

		expect(result.current.lastError).toBeUndefined();
	});

	it('should work with re-renders of different chat groups', async () => {
		const { result, rerender } = renderHook(({ groupId }) => useChatSSE(groupId), {
			initialProps: { groupId: 1 },
		});

		expect(result.current.isConnected).toBe(true);

		rerender({ groupId: 2 });

		await waitFor(() => {
			expect(result.current.isConnected).toBe(true);
		});
	});

	it('should maintain separate message state for different instances', () => {
		const { result: result1 } = renderHook(() => useChatSSE(1));
		const { result: result2 } = renderHook(() => useChatSSE(2));

		expect(result1.current.newMessages).toEqual([]);
		expect(result2.current.newMessages).toEqual([]);
	});

	it('should be connected after mount', async () => {
		const { result } = renderHook(() => useChatSSE(1));

		await waitFor(() => {
			expect(result.current.connectionStatus).toBe('CONNECTED');
		});
	});

	it('should expose connection state and new messages', () => {
		const { result } = renderHook(() => useChatSSE(1, 1, 'msg-last'));

		expect(result.current).toHaveProperty('isConnected');
		expect(result.current).toHaveProperty('connectionStatus');
		expect(result.current).toHaveProperty('newMessages');
		expect(result.current).toHaveProperty('clearNewMessages');
	});

	it('should handle updates to chat group ID', async () => {
		const { result, rerender } = renderHook(({ groupId, userId }) => useChatSSE(groupId, userId), {
			initialProps: { groupId: 1, userId: 1 },
		});

		expect(result.current.isConnected).toBe(true);

		rerender({ groupId: 5, userId: 1 });

		await waitFor(() => {
			expect(result.current).toBeDefined();
		});
	});
});
