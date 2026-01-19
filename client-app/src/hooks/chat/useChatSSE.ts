import { useEffect, useRef, useState, useCallback } from 'react';
import {
	connectToChat,
	disconnectFromChat,
	addChatEventListener,
	removeChatEventListener,
	type ChatSSEEvent,
} from '../../api/chat/chatSseApi';
import type { SSEMessage } from '@/types/chat';

interface SSEState {
	isConnected: boolean;
	connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
	lastError?: string;
}

export function useChatSSE(chatGroupId: number, lastMessageId?: string) {
	const [state, setState] = useState<SSEState>({
		isConnected: false,
		connectionStatus: 'DISCONNECTED',
	});
	const [newMessages, setNewMessages] = useState<SSEMessage[]>([]);

	const isConnectedRef = useRef(false);
	const chatGroupIdRef = useRef(chatGroupId);

	const handleSSEEvent = useCallback((event: ChatSSEEvent) => {
		switch (event.type) {
			case 'CONNECTION_STATUS': {
				const statusData = event.data as { status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' };
				setState(prev => ({
					...prev,
					connectionStatus: statusData.status,
					isConnected: statusData.status === 'CONNECTED',
				}));
				isConnectedRef.current = statusData.status === 'CONNECTED';
				break;
			}

			case 'MESSAGE': {
				const messageData = event.data as unknown as {
					chatGroupId: number;
					chatMessageId: string | number;
					userId?: number;
					userFullName?: string;
					content: string;
					messageType?: string;
					timestamp: string | Date;
					meta?: unknown;
				};
				if (messageData.chatGroupId === chatGroupIdRef.current) {
					const meta =
						typeof messageData.meta === 'object' && messageData.meta !== null
							? (messageData.meta as Record<string, unknown>)
							: undefined;
					const newMessage: SSEMessage = {
						messageId: String(messageData.chatMessageId),
						chatGroupId: messageData.chatGroupId,
						...(messageData.userId !== undefined && { userId: messageData.userId }),
						...(messageData.userFullName !== undefined && {
							userFullName: messageData.userFullName,
						}),
						content: messageData.content,
						type:
							messageData.messageType === 'LEADER' || messageData.messageType === 'SYSTEM'
								? messageData.messageType
								: 'DEFAULT',
						timestamp:
							typeof messageData.timestamp === 'string'
								? messageData.timestamp
								: new Date(messageData.timestamp).toISOString(),
						...(meta !== undefined && { meta }),
					};
					setNewMessages(prev => [...prev, newMessage]);
				}
				break;
			}
		}
	}, []);

	// Update refs when props change
	useEffect(() => {
		chatGroupIdRef.current = chatGroupId;
	}, [chatGroupId]);

	// Connect to SSE when component mounts or chatGroupId changes
	useEffect(() => {
		if (!chatGroupId) return;
		// Add event listeners
		addChatEventListener('CONNECTION_STATUS', handleSSEEvent);
		addChatEventListener('MESSAGE', handleSSEEvent);

		// Connect
		connectToChat(chatGroupId, lastMessageId);

		return () => {
			// Clean up event listeners
			removeChatEventListener('CONNECTION_STATUS', handleSSEEvent);
			removeChatEventListener('MESSAGE', handleSSEEvent);

			// Disconnect
			disconnectFromChat();
		};
	}, [chatGroupId, lastMessageId, handleSSEEvent]);

	// Clear new messages only when explicitly changing to a different chat group
	// (not when component remounts for the same group)
	useEffect(() => {
		const prevChatGroupId = chatGroupIdRef.current;
		if (prevChatGroupId !== chatGroupId && prevChatGroupId !== 0) {
			setNewMessages([]);
		}
	}, [chatGroupId]);

	const clearNewMessages = useCallback(() => {
		setNewMessages([]);
	}, []);

	return {
		...state,
		newMessages,
		clearNewMessages,
		reconnect: () => connectToChat(chatGroupId, lastMessageId),
	};
}
