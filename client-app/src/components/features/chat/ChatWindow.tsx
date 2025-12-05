import { useRef, useEffect, useState } from 'react';
import type { Message } from '@/types/chat';
import MessageList from '@/components/features/chat/MessageList';
import MessageComposer from '@/components/features/chat/MessageComposer';
import { useMessagesByGroup } from '@/hooks/chat/useChatMessages';
import { useChatSSE } from '@/hooks/chat/useChatSSE';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { normalizeDate } from '@/utils/dateTime';

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

// Separate component to use hooks conditionally
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

	const {
		newMessages: sseMessages,
		connectionStatus,
		clearNewMessages,
	} = useChatSSE(chatGroupId, currentUserId);

	const [localMessages, setLocalMessages] = useState<Message[]>([]);

	useEffect(() => {
		if (fetchedMessages.length > 0) {
			setLocalMessages(prev =>
				prev.filter(localMsg => {
					const hasServerVersion = fetchedMessages.some(
						serverMsg =>
							serverMsg.content === localMsg.content &&
							Math.abs(
								new Date(serverMsg.timestamp).getTime() - new Date(localMsg.timestamp).getTime()
							) < 5000
					);
					return !hasServerVersion;
				})
			);
		}
	}, [fetchedMessages]);

	const allMessages: Message[] = [
		...initialMessages,
		...fetchedMessages.map(msg => ({
			chatMessageId: msg.id,
			chatGroupId: msg.chatGroupId,
			userId: msg.userId,
			userFullName: msg.userFullName,
			type: msg.type,
			content: msg.content,
			timestamp: normalizeDate(msg.timestamp),
			meta: msg.meta,
		})),
		...sseMessages.map(msg => ({
			chatMessageId: msg.messageId,
			chatGroupId: msg.chatGroupId,
			userId: msg.userId,
			userFullName: msg.userFullName,
			type: msg.type,
			content: msg.content,
			timestamp: normalizeDate(msg.timestamp),
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
					<MessageList
						messages={allMessages}
						currentUserId={currentUserId}
						sseMessages={sseMessages}
						clearSSEMessages={clearNewMessages}
					/>
				)}
			</div>
			<MessageComposer onSend={handleSend} incidentId={chatGroupId} />
		</div>
	);
}
