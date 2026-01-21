import { useRef, useEffect, useState, useCallback } from 'react';
import type { Message } from '@/types/chat';
import MessageList from '@/components/features/chat/MessageList';
import MessageComposer from '@/components/features/chat/MessageComposer';
import { useMessagesByGroup } from '@/hooks/chat/useChatMessages';
import { useChatSSE } from '@/hooks/chat/useChatSSE';
import { useMarkMessagesRead } from '@/hooks/chat/useChatGroups';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { normalizeDate, toLocalISOString } from '@/utils/dateTime';

interface Props {
	chatGroupId: number;
	initialMessages?: Message[];
	currentUserId?: number | undefined;
}

export default function ChatWindow({ chatGroupId, initialMessages = [], currentUserId }: Props) {
	if (!chatGroupId) {
		return (
			<div className="flex flex-col h-[600px] border border-slate-200 rounded-lg bg-slate-50">
				<div className="flex-1 flex items-center justify-center text-red-600">
					No chat group selected
				</div>
			</div>
		);
	}

	return (
		<ChatWindowContent
			chatGroupId={chatGroupId}
			initialMessages={initialMessages}
			currentUserId={currentUserId}
		/>
	);
}

function ChatWindowContent({
	chatGroupId,
	initialMessages,
	currentUserId,
}: {
	chatGroupId: number;
	initialMessages: Message[];
	currentUserId?: number | undefined;
}) {
	const listRef = useRef<HTMLDivElement | null>(null);

	const {
		data: fetchedMessages = [],
		isLoading: messagesLoading,
		error: messagesError,
		refetch: refetchMessages,
	} = useMessagesByGroup(chatGroupId);

	const { newMessages: sseMessages, connectionStatus } = useChatSSE(chatGroupId);

	// Refetch messages when SSE connection is restored after being disconnected
	const lastConnectionStatusRef = useRef<string>('DISCONNECTED');
	useEffect(() => {
		const prevStatus = lastConnectionStatusRef.current;
		lastConnectionStatusRef.current = connectionStatus;

		// If we just reconnected, refetch to catch missed messages
		if (prevStatus === 'DISCONNECTED' && connectionStatus === 'CONNECTED') {
			refetchMessages();
		}
	}, [connectionStatus, refetchMessages]);

	const { mutate: markAsRead } = useMarkMessagesRead();

	const [localMessages, setLocalMessages] = useState<Message[]>([]);
	const lastMarkedMessageIdRef = useRef<string | null>(null);

	useEffect(() => {
		// Only remove local messages when we actually find their server/SSE versions
		// Add a small delay to ensure we don't remove messages too eagerly
		const timeoutId = setTimeout(() => {
			setLocalMessages(prev =>
				prev.filter(localMsg => {
					// For local messages with the 'local' meta flag, check more carefully
					const isLocalOptimistic = localMsg.meta?.local === true;

					if (!isLocalOptimistic) {
						return true;
					}

					// Check if message exists in fetched messages by content/userId
					const hasServerVersion = fetchedMessages.some(
						serverMsg =>
							serverMsg.content.trim() === localMsg.content.trim() &&
							serverMsg.userId === localMsg.userId &&
							// Also check timestamp proximity (within 10 seconds)
							Math.abs(
								new Date(serverMsg.timestamp).getTime() - new Date(localMsg.timestamp).getTime()
							) < 10000
					);

					// Check if message exists in SSE messages by content/userId
					const hasSSEVersion = sseMessages.some(
						sseMsg =>
							sseMsg.content.trim() === localMsg.content.trim() &&
							sseMsg.userId === localMsg.userId &&
							// Also check timestamp proximity (within 10 seconds)
							Math.abs(
								new Date(sseMsg.timestamp).getTime() - new Date(localMsg.timestamp).getTime()
							) < 10000
					);

					// Keep the local message only if neither server nor SSE version exists
					return !hasServerVersion && !hasSSEVersion;
				})
			);
		}, 500); // Small delay to prevent race conditions

		return () => clearTimeout(timeoutId);
	}, [fetchedMessages, sseMessages]);

	const allMessages: Message[] = [
		...initialMessages.map(msg => ({
			...msg,
			userFullName: msg.userId === currentUserId ? 'You' : msg.userFullName,
		})),
		...fetchedMessages.map(msg => ({
			chatMessageId: msg.id,
			chatGroupId: msg.chatGroupId,
			userId: msg.userId,
			userFullName: msg.userId === currentUserId ? 'You' : msg.userFullName,
			type: msg.type,
			content: msg.content,
			timestamp: toLocalISOString(msg.timestamp),
			meta: msg.meta,
		})),
		...sseMessages.map(msg => ({
			chatMessageId: msg.messageId,
			chatGroupId: msg.chatGroupId,
			userId: msg.userId,
			userFullName: msg.userId === currentUserId ? 'You' : msg.userFullName,
			type: msg.type,
			content: msg.content,
			timestamp: toLocalISOString(msg.timestamp),
			meta: msg.meta,
		})),
		...localMessages.map(m => ({
			...m,
			timestamp: normalizeDate(m.timestamp),
		})),
	].sort((a, b) => {
		const timeA = new Date(a.timestamp).getTime();
		const timeB = new Date(b.timestamp).getTime();

		if (isNaN(timeA) && isNaN(timeB)) return 0;
		if (isNaN(timeA)) return 1;
		if (isNaN(timeB)) return -1;

		return timeA - timeB;
	});

	useEffect(() => {
		const el = listRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [allMessages.length]);

	// Mark messages as read when viewing the chat
	useEffect(() => {
		if (!currentUserId || !chatGroupId || allMessages.length === 0) return;

		// Get the latest message ID from fetched/SSE messages (exclude local optimistic)
		const serverMessages = [
			...fetchedMessages.map(m => ({ id: m.id, timestamp: m.timestamp })),
			...sseMessages.map(m => ({ id: m.messageId, timestamp: new Date(m.timestamp) })),
		].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

		const latestMessage = serverMessages[0];

		// Only mark as read if it's a different message than we last marked
		if (latestMessage?.id && latestMessage.id !== lastMarkedMessageIdRef.current) {
			// Debounce: only mark as read after a short delay
			const timer = setTimeout(() => {
				markAsRead(
					{
						groupId: chatGroupId,
						userId: currentUserId,
						messageId: latestMessage.id,
					},
					{
						onSuccess: () => {
							lastMarkedMessageIdRef.current = latestMessage.id;
						},
						onError: error => {
							// Log for debugging failed mark-as-read operations
							// eslint-disable-next-line no-console
							console.warn('[ChatWindow] Failed to mark messages as read:', error);
						},
					}
				);
			}, 500);

			return () => clearTimeout(timer);
		}

		return undefined;
	}, [fetchedMessages.length, sseMessages.length, chatGroupId, currentUserId, markAsRead]);

	// Reset the last marked message when switching chat groups
	useEffect(() => {
		lastMarkedMessageIdRef.current = null;
	}, [chatGroupId]);

	// Handle visibility changes to refetch messages when user returns to chat
	const handleVisibilityChange = useCallback(() => {
		if (!document.hidden && chatGroupId) {
			// User returned to the tab - refetch messages to catch any that were missed
			refetchMessages();
		}
	}, [chatGroupId, refetchMessages]);

	useEffect(() => {
		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [handleVisibilityChange]);

	const handleSend = (content: string, type: Message['type'] = 'DEFAULT') => {
		const msg: Message = {
			chatMessageId: `local-${Date.now()}`,
			chatGroupId: chatGroupId,
			userId: currentUserId,
			userFullName: currentUserId ? 'You' : 'Anonymous',
			type,
			content,
			timestamp: new Date().toISOString(),
		};

		const localMeta = (msg as unknown as { meta?: Record<string, unknown> }).meta ?? {};
		const localMsg: Message = { ...msg, meta: { ...localMeta, local: true } } as Message;
		setLocalMessages(prev => [...prev, localMsg]);
	};

	if (messagesError) {
		return (
			<div className="flex flex-col h-[600px] border border-slate-200 rounded-lg bg-slate-50">
				<div className="flex-1 flex items-center justify-center">
					<ErrorRetryBlock
						message={`Error loading messages: ${messagesError?.message || 'Unknown error'}`}
						onRetry={refetchMessages}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-[600px] border border-slate-200 rounded-lg bg-slate-50">
			{/* Connection status indicator */}
			{connectionStatus !== 'CONNECTED' && (
				<div
					className={`px-3 py-1 text-xs text-center border-b ${
						connectionStatus === 'RECONNECTING'
							? 'bg-yellow-50 text-yellow-700 border-yellow-200'
							: 'bg-red-50 text-red-700 border-red-200'
					}`}
				>
					{connectionStatus === 'RECONNECTING' ? 'Reconnecting...' : 'Disconnected'}
				</div>
			)}

			<div ref={listRef} className="flex-1 overflow-auto">
				{messagesLoading ? (
					<LoadingPanel text="Loading messages..." className="h-full" />
				) : (
					<MessageList messages={allMessages} currentUserId={currentUserId} />
				)}
			</div>
			<MessageComposer onSend={handleSend} incidentId={chatGroupId} />
		</div>
	);
}
