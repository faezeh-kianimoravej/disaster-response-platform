import React, { useState, useLayoutEffect, useEffect } from 'react';
import type { Message } from '@/types/chat';
import { useSendMessage } from '@/hooks/chat/useChatMessages';
import { useCurrentUserId } from '@/context/AuthContext';
import { useOfflineMessageQueue } from '@/utils/offlineMessageQueue';
import Button from '@/components/ui/Button';
import { ErrorRetryInline } from '@/components/ui/ErrorRetry';
import { AlertCircle, Wifi, WifiOff, Clock, Send } from 'lucide-react';

interface Props {
	onSend: (content: string, type?: Message['type']) => void;
	textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
	incidentId?: number | undefined;
}

export default function MessageComposer({ onSend, textareaRef, incidentId }: Props) {
	const [text, setText] = useState('');
	const [isOffline, setIsOffline] = useState(!navigator.onLine);
	const internalRef = React.useRef<HTMLTextAreaElement | null>(null);
	const usedRef = textareaRef ?? internalRef;
	const userId = useCurrentUserId();

	const {
		mutate: sendMessageMutation,
		isPending: isSending,
		isError: isSendError,
		error: sendError,
	} = useSendMessage();

	const { addMessage, pendingCount, failedCount, retryFailed } = useOfflineMessageQueue();

	// Monitor online/offline status
	useEffect(() => {
		const handleOnline = () => setIsOffline(false);
		const handleOffline = () => setIsOffline(true);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	const adjustHeight = () => {
		const el = usedRef?.current as HTMLTextAreaElement | null;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${Math.max(el.scrollHeight, 40) + 2}px`;
	};

	const submit = () => {
		const trimmed = text.trim();
		if (!trimmed || !incidentId || isSending || !userId) return;

		// Always call onSend to show the message in UI immediately
		onSend(trimmed, 'DEFAULT');
		setText('');

		if (isOffline) {
			// Add to offline queue when offline
			addMessage({
				chatGroupId: incidentId,
				userId: userId,
				content: trimmed,
				type: 'DEFAULT',
				timestamp: new Date(),
				meta: { offline: true },
			});
		} else {
			// Send immediately when online
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
						// If send fails while "online", add to queue as fallback
						// Send failed, adding to offline queue
						addMessage({
							chatGroupId: incidentId,
							userId: userId,
							content: trimmed,
							type: 'DEFAULT',
							timestamp: new Date(),
							meta: { failedSend: true },
						});
					},
				}
			);
		}
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

	const getConnectionIcon = () => {
		if (isOffline) return <WifiOff className="h-4 w-4 text-red-500" />;
		if (isSending) return <Send className="h-4 w-4 text-blue-500" />;
		return <Wifi className="h-4 w-4 text-green-500" />;
	};

	const getButtonText = () => {
		if (isSending) return 'Sending...';
		if (isOffline) return 'Queue';
		return 'Send';
	};

	return (
		<div className="border-t border-slate-100">
			{/* Connection Status & Queue Info */}
			{(isOffline || pendingCount > 0 || failedCount > 0) && (
				<div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-2">
							{getConnectionIcon()}
							<span className={isOffline ? 'text-red-600' : 'text-green-600'}>
								{isOffline ? 'Offline - messages will be queued' : 'Online'}
							</span>
						</div>

						{(pendingCount > 0 || failedCount > 0) && (
							<div className="flex items-center gap-3">
								{pendingCount > 0 && (
									<div className="flex items-center gap-1 text-amber-600">
										<Clock className="h-4 w-4" />
										<span>{pendingCount} pending</span>
									</div>
								)}

								{failedCount > 0 && (
									<div className="flex items-center gap-2">
										<div className="flex items-center gap-1 text-red-600">
											<AlertCircle className="h-4 w-4" />
											<span>{failedCount} failed</span>
										</div>
										<button
											onClick={retryFailed}
											className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
										>
											Retry
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Message Input */}
			<div className="p-3 flex gap-2 items-end">
				<textarea
					aria-label="Write a message"
					value={text}
					onChange={e => setText(e.target.value)}
					onKeyDown={handleKeyDown}
					rows={1}
					ref={usedRef}
					className="flex-1 resize-none rounded-md border border-slate-200 p-2 pr-3 focus:outline-none focus:ring-2 focus:ring-sky-300 min-h-[40px] max-h-[240px] overflow-auto"
					placeholder={isOffline ? 'Message will be sent when back online...' : 'Type a message...'}
				/>
				<div className="flex flex-col justify-end">
					<Button
						variant="primary"
						onClick={submit}
						disabled={isSending || !text.trim() || !userId}
						aria-label="Send message"
						aria-keyshortcuts="Ctrl+Enter"
					>
						{getButtonText()}
					</Button>
					{isSendError && !isOffline ? (
						<div className="mt-2">
							<ErrorRetryInline
								message={sendError?.message || 'Failed to send. Retry'}
								onRetry={submit}
							/>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
