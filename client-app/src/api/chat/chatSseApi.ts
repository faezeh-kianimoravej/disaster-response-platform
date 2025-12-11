import {
	GenericSSEApi,
	type GenericSSEEvent,
	type ConnectionStatusData,
} from '@/api/genericSseApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types for SSE events
export type ChatSSEEvent = GenericSSEEvent<'MESSAGE' | 'CONNECTION_STATUS'>;

export interface ChatMessageSSEData {
	messageId: string;
	chatGroupId: number;
	userId?: number;
	userFullName?: string;
	content: string;
	type: 'DEFAULT' | 'LEADER' | 'SYSTEM';
	timestamp: string;
	meta?: Record<string, unknown>;
}

// Re-export for convenience
export type ConnectionStatusSSEData = ConnectionStatusData;

// Event handlers type
export type ChatSSEEventHandler = (event: ChatSSEEvent) => void;

// Chat-specific SSE API wrapper
class ChatSSEApi {
	private api = new GenericSSEApi<ChatSSEEvent>();
	private readonly connectionKey = 'chat';

	/**
	 * Connect to chat SSE stream for a specific chat group
	 * Auth token is automatically added from localStorage via the generic API
	 * @param chatGroupId The chat group to listen for events
	 * @param lastMessageId Optional last message ID for resuming from a specific point
	 */
	connect(chatGroupId: number, lastMessageId?: string): void {
		const params: Record<string, string | number> = {};
		if (lastMessageId) {
			params.lastMessageId = lastMessageId;
		}

		this.api.connect(
			this.connectionKey,
			`${API_BASE_URL}/chat/${chatGroupId}/subscribe`,
			{ eventName: 'chat-message' },
			params
		);
	}

	/**
	 * Disconnect from the SSE stream
	 */
	disconnect(): void {
		this.api.disconnect(this.connectionKey);
	}

	/**
	 * Add an event listener for specific event types
	 */
	addEventListener(eventType: ChatSSEEvent['type'], handler: ChatSSEEventHandler): void {
		this.api.addEventListener(this.connectionKey, eventType, handler);
	}

	/**
	 * Remove an event listener
	 */
	removeEventListener(eventType: ChatSSEEvent['type'], handler: ChatSSEEventHandler): void {
		this.api.removeEventListener(this.connectionKey, eventType, handler);
	}

	/**
	 * Remove all event listeners
	 */
	removeAllEventListeners(): void {
		this.api.clearHandlersForKey(this.connectionKey);
	}

	/**
	 * Check if currently connected
	 */
	isConnected(): boolean {
		return this.api.isConnected(this.connectionKey);
	}

	/**
	 * Get the current connection state
	 */
	getConnectionState(): number | null {
		return this.api.getReadyState(this.connectionKey);
	}
}

// Private instance
const chatSSEApi = new ChatSSEApi();

// Export public functions
export function connectToChat(chatGroupId: number, lastMessageId?: string): void {
	return chatSSEApi.connect(chatGroupId, lastMessageId);
}

export function disconnectFromChat(): void {
	return chatSSEApi.disconnect();
}

export function addChatEventListener(
	eventType: ChatSSEEvent['type'],
	handler: ChatSSEEventHandler
): void {
	return chatSSEApi.addEventListener(eventType, handler);
}

export function removeChatEventListener(
	eventType: ChatSSEEvent['type'],
	handler: ChatSSEEventHandler
): void {
	return chatSSEApi.removeEventListener(eventType, handler);
}
