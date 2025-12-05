import { useEffect, useRef, useState, useCallback } from 'react';
import {
	connectToChat,
	disconnectFromChat,
	addChatEventListener,
	removeChatEventListener,
	type ChatSSEEvent,
	type ChatMessageSSEData,
} from '../../api/chat/chatSseApi';
import type { SSEMessage } from '@/types/chat';

interface SSEState {
	isConnected: boolean;
	connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
	lastError?: string;
}

export function useChatSSE(chatGroupId: number, userId?: number, lastMessageId?: string) {
	const [state, setState] = useState<SSEState>({
		isConnected: true, // Temporarily show as connected
		connectionStatus: 'CONNECTED', // Skip SSE for now
	});
	const [newMessages, setNewMessages] = useState<SSEMessage[]>([]);

	const isConnectedRef = useRef(true); // Temporarily true
	const chatGroupIdRef = useRef(chatGroupId);

	// Update refs when props change
	useEffect(() => {
		chatGroupIdRef.current = chatGroupId;
	}, [chatGroupId]);

	// Temporarily disable SSE connection
	useEffect(() => {
		// Don't actually connect to SSE until backend is fixed
		return () => {
			// Cleanup if needed
		};
	}, [chatGroupId, lastMessageId]);

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
				const messageData = event.data as ChatMessageSSEData;
				// Only add messages for the current chat group
				if (messageData.chatGroupId === chatGroupIdRef.current) {
					const newMessage: SSEMessage = {
						messageId: messageData.messageId,
						chatGroupId: messageData.chatGroupId,
						...(messageData.userFullName !== undefined && {
							userFullName: messageData.userFullName,
						}),
						content: messageData.content,
						type: messageData.type,
						timestamp: messageData.timestamp,
						...(messageData.meta !== undefined && { meta: messageData.meta }),
					};
					setNewMessages(prev => [...prev, newMessage]);
				}
				break;
			}
		}
	}, []);

	// Connect to SSE when component mounts or chatGroupId changes
	useEffect(() => {
		if (!chatGroupId || !userId) return;
		// Add event listeners
		addChatEventListener('CONNECTION_STATUS', handleSSEEvent);
		addChatEventListener('MESSAGE', handleSSEEvent);

		// Connect
		connectToChat(chatGroupId, userId, lastMessageId);

		return () => {
			// Clean up event listeners
			removeChatEventListener('CONNECTION_STATUS', handleSSEEvent);
			removeChatEventListener('MESSAGE', handleSSEEvent);

			// Disconnect
			disconnectFromChat();
		};
	}, [chatGroupId, userId, lastMessageId, handleSSEEvent]);

	// Clear new messages when chat group changes
	useEffect(() => {
		setNewMessages([]);
	}, [chatGroupId]);

	const clearNewMessages = useCallback(() => {
		setNewMessages([]);
	}, []);

	return {
		...state,
		newMessages,
		clearNewMessages,
		reconnect: () => (userId ? connectToChat(chatGroupId, userId, lastMessageId) : undefined),
	};
}
