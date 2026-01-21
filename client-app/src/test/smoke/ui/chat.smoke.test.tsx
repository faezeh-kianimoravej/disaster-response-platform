import React from 'react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import type { Message, SSEMessage } from '@/types/chat';
import type { ChatGroup } from '@/types/chat';
import { renderWithProviders } from '@/test/utils';
import ChatWindow from '@/components/features/chat/ChatWindow';
import MessageComposer from '@/components/features/chat/MessageComposer';
import MessageItem from '@/components/features/chat/MessageItem';
import MessageList from '@/components/features/chat/MessageList';

// Mock toast provider to avoid timers/DOM work from toasts
vi.mock('@/components/toast/ToastProvider', () => ({
	ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	useToast: () => ({
		showToast: vi.fn(),
		showError: vi.fn(),
		showSuccess: vi.fn(),
		showWarning: vi.fn(),
	}),
}));

// Stable references so ChatWindow effects don't loop on new array instances
const emptyMessages: Message[] = [];
const emptySSEMessages: SSEMessage[] = [];
const emptyGroups: ChatGroup[] = [];

// Mock chat message hooks
vi.mock('@/hooks/chat/useChatMessages', () => ({
	useMessagesByGroup: vi.fn(() => ({
		data: emptyMessages,
		isLoading: false,
		error: null,
		refetch: vi.fn(() => Promise.resolve()),
	})),
	useSendMessage: vi.fn(() => ({
		mutate: vi.fn(),
		mutateAsync: vi.fn(() => Promise.resolve()),
		isLoading: false,
		error: null,
	})),
	useMessageById: vi.fn(() => ({
		data: null,
		isLoading: false,
		error: null,
	})),
}));

// Mock chat groups hook
vi.mock('@/hooks/chat/useChatGroups', () => ({
	useChatGroups: vi.fn(() => ({
		data: emptyGroups,
		isLoading: false,
		error: null,
	})),
	useMarkMessagesRead: vi.fn(() => ({
		mutate: vi.fn((_, options) => options?.onSuccess?.()),
		mutateAsync: vi.fn(() => Promise.resolve()),
		isLoading: false,
		error: null,
	})),
}));

// Mock chat SSE hook
vi.mock('@/hooks/chat/useChatSSE', () => ({
	useChatSSE: vi.fn(() => ({
		isConnected: true,
		connectionStatus: 'CONNECTED',
		lastError: undefined,
		newMessages: emptySSEMessages,
	})),
}));

// Minimal props for smoke tests
const baseMessage = {
	chatMessageId: 'msg-1',
	chatGroupId: 1,
	content: 'Hello',
	timestamp: new Date().toISOString(),
	userId: 1,
	type: 'DEFAULT' as const,
	userFullName: 'Test User',
};

describe('Chat UI smoke tests', () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeAll(() => {
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterAll(() => {
		consoleErrorSpy.mockRestore();
	});

	it('renders ChatWindow without crashing', () => {
		renderWithProviders(
			<ChatWindow chatGroupId={1} initialMessages={[baseMessage]} currentUserId={1} />,
			{
				auth: {
					isLoggedIn: true,
					user: {
						userId: 1,
						firstName: 'Test',
						lastName: 'User',
						email: 'test@example.com',
						mobile: '000',
						roles: [],
						deleted: false,
					},
					token: 'test-token',
				},
			}
		);
		expect(document.body).toBeInTheDocument();
	});

	it('renders MessageComposer without crashing', () => {
		renderWithProviders(<MessageComposer onSend={() => {}} />, {
			auth: {
				isLoggedIn: true,
				user: {
					userId: 1,
					firstName: 'Test',
					lastName: 'User',
					email: 'test@example.com',
					mobile: '000',
					roles: [],
					deleted: false,
				},
				token: 'test-token',
			},
		});
		expect(document.body).toBeInTheDocument();
	});

	it('renders MessageItem without crashing', () => {
		renderWithProviders(<MessageItem msg={baseMessage} isOwn={true} />, {
			auth: {
				isLoggedIn: true,
				user: {
					userId: 1,
					firstName: 'Test',
					lastName: 'User',
					email: 'test@example.com',
					mobile: '000',
					roles: [],
					deleted: false,
				},
				token: 'test-token',
			},
		});
		expect(document.body).toBeInTheDocument();
	});

	it('renders MessageList without crashing', () => {
		renderWithProviders(<MessageList messages={[baseMessage]} currentUserId={1} />, {
			auth: {
				isLoggedIn: true,
				user: {
					userId: 1,
					firstName: 'Test',
					lastName: 'User',
					email: 'test@example.com',
					mobile: '000',
					roles: [],
					deleted: false,
				},
				token: 'test-token',
			},
		});
		expect(document.body).toBeInTheDocument();
	});
});
