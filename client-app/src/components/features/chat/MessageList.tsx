import React, { useEffect } from 'react';
import type { Message, SSEMessage } from '@/types/chat';
import MessageItem from './MessageItem';

interface Props {
	messages: Message[];
	currentUserId?: number | undefined;
	focusedMessageId?: string | undefined;
	sseMessages?: SSEMessage[];
	clearSSEMessages?: () => void;
}

export default function MessageList({
	messages,
	currentUserId,
	focusedMessageId,
	sseMessages = [],
	clearSSEMessages,
}: Props) {
	useEffect(() => {
		if (sseMessages.length > 0 && clearSSEMessages) {
			const timer = setTimeout(() => {
				clearSSEMessages();
			}, 100);
			return () => clearTimeout(timer);
		}
		return undefined;
	}, [sseMessages.length, clearSSEMessages]);

	const nodes: React.ReactNode[] = [];
	const timeThreshold = 1000 * 60 * 2;

	for (let i = 0; i < messages.length; i++) {
		const m = messages[i]!;
		const prev = i > 0 ? messages[i - 1]! : undefined;
		const next = i < messages.length - 1 ? messages[i + 1]! : undefined;

		const mDate = new Date(m.timestamp);
		const prevDate = prev ? new Date(prev.timestamp) : null;
		const isDifferentDay = !prevDate || mDate.toDateString() !== prevDate.toDateString();
		if (isDifferentDay) {
			nodes.push(
				<div
					key={`day-${m.chatMessageId ?? i}`}
					className="text-center text-sm text-slate-500 my-2"
				>
					{mDate.toLocaleDateString(undefined, {
						weekday: 'short',
						month: 'short',
						day: 'numeric',
					})}
				</div>
			);
		}

		const sameAuthor = !!(prev && prev.userId !== undefined && m.userId === prev.userId);
		const timeGap = prev
			? Math.abs(new Date(m.timestamp).getTime() - new Date(prev.timestamp).getTime())
			: Infinity;
		const firstInGroup = !sameAuthor || timeGap > timeThreshold;

		const nextSameAuthor = !!(next && next.userId !== undefined && m.userId === next.userId);
		const nextTimeGap = next
			? Math.abs(new Date(next.timestamp).getTime() - new Date(m.timestamp).getTime())
			: Infinity;
		const lastInGroup = !nextSameAuthor || nextTimeGap > timeThreshold;

		const isSystem = m.type === 'SYSTEM';
		const isOwn = !!(currentUserId && m.userId === currentUserId) || m.userFullName === 'You';

		const containerClass = isSystem ? 'py-1' : `${firstInGroup || isOwn ? '' : 'ml-12'} py-1`;
		nodes.push(
			<div key={m.chatMessageId ?? i} className={containerClass}>
				<MessageItem
					msg={m}
					isOwn={isOwn}
					showAvatar={isSystem ? false : firstInGroup}
					showTime={lastInGroup}
					isFocused={focusedMessageId === m.chatMessageId}
					data-msg-id={m.chatMessageId}
				/>
			</div>
		);
	}

	return (
		<div className="p-4 overflow-auto flex-1 flex flex-col" role="log" aria-label="Chat messages">
			{nodes}
		</div>
	);
}
