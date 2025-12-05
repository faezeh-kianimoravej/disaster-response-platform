import React, { useState, useLayoutEffect, useEffect } from 'react';
import type { Message } from '@/types/chat';
import { useSendMessage } from '@/hooks/chat/useChatMessages';
import { useCurrentUserId } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { ErrorRetryInline } from '@/components/ui/ErrorRetry';

interface Props {
	onSend: (content: string, type?: Message['type']) => void;
	textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
	incidentId?: number | undefined;
}

export default function MessageComposer({ onSend, textareaRef, incidentId }: Props) {
	const [text, setText] = useState('');
	const internalRef = React.useRef<HTMLTextAreaElement | null>(null);
	const usedRef = textareaRef ?? internalRef;
	const userId = useCurrentUserId();

	const {
		mutate: sendMessageMutation,
		isPending: isSending,
		isError: isSendError,
		error: sendError,
	} = useSendMessage();

	const adjustHeight = () => {
		const el = usedRef?.current as HTMLTextAreaElement | null;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${Math.max(el.scrollHeight, 40) + 2}px`;
	};

	const submit = () => {
		const trimmed = text.trim();
		if (!trimmed || !incidentId || isSending || !userId) return;

		onSend(trimmed, 'DEFAULT');
		setText('');

		sendMessageMutation(
			{
				chatGroupId: incidentId,
				userId: userId,
				content: trimmed,
				type: 'DEFAULT',
			},
			{
				onSuccess: () => {
					setTimeout(() => usedRef.current?.focus(), 0);
				},
				onError: () => {
					// no-op; render inline error below
				},
			}
		);
	};

	const storageKey = incidentId ? `chat-draft-${incidentId}` : 'chat-draft-unknown';

	useEffect(() => {
		try {
			const saved = localStorage.getItem(storageKey);
			if (saved) setText(saved);
		} catch {}
	}, [storageKey]);

	useEffect(() => {
		try {
			if (text) localStorage.setItem(storageKey, text);
			else localStorage.removeItem(storageKey);
		} catch {}
	}, [text]);

	useLayoutEffect(() => {
		adjustHeight();
	}, [text]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			submit();
		}
	};

	return (
		<div className="p-3 border-t border-slate-100 flex gap-2 items-end">
			<textarea
				aria-label="Write a message"
				value={text}
				onChange={e => setText(e.target.value)}
				onKeyDown={handleKeyDown}
				rows={1}
				ref={usedRef}
				className="flex-1 resize-none rounded-md border border-slate-200 p-2 pr-3 focus:outline-none focus:ring-2 focus:ring-sky-300 min-h-[40px] max-h-[240px] overflow-auto"
			/>
			<div className="flex flex-col justify-end">
				<Button
					variant="primary"
					onClick={submit}
					disabled={isSending || !text.trim() || !userId}
					aria-label="Send message"
					aria-keyshortcuts="Ctrl+Enter"
				>
					{isSending ? 'Sending...' : 'Send'}
				</Button>
				{isSendError ? (
					<div className="mt-2">
						<ErrorRetryInline
							message={sendError?.message || 'Failed to send. Retry'}
							onRetry={submit}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}
