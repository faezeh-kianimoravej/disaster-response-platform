/**
 * Offline Message Queue for Chat
 * Stores messages when offline and sends them when back online
 */

import { useState, useEffect } from 'react';

export interface QueuedMessage {
	id: string;
	chatGroupId: number;
	userId: number;
	content: string;
	type: 'DEFAULT' | 'SYSTEM' | 'LEADER';
	timestamp: Date;
	attempts: number;
	status: 'pending' | 'sending' | 'failed' | 'sent';
	meta?: Record<string, unknown>;
}

class OfflineMessageQueue {
	private readonly storageKey = 'chat_offline_queue';
	private queue: QueuedMessage[] = [];
	private listeners: Set<() => void> = new Set();
	private isProcessing = false;
	private onlineListenerAdded = false;

	constructor() {
		this.loadFromStorage();
		this.setupOnlineListener();
	}

	private loadFromStorage() {
		try {
			const stored = localStorage.getItem(this.storageKey);
			if (stored) {
				const parsed = JSON.parse(stored);
				this.queue = parsed.map((item: Record<string, unknown>) => ({
					...item,
					timestamp: new Date(item.timestamp as string),
					status: 'pending' as const, // Reset status on reload
				}));
			}
		} catch {
			// Failed to load offline message queue
			this.queue = [];
		}
	}

	private saveToStorage() {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
		} catch {
			// Failed to save offline message queue
		}
	}

	private setupOnlineListener() {
		// Prevent multiple event listeners
		if (this.onlineListenerAdded) return;

		const handleOnline = () => {
			if (this.queue.length > 0 && !this.isProcessing) {
				// Back online - processing queued messages
				this.processQueue();
			}
		};

		window.addEventListener('online', handleOnline);
		this.onlineListenerAdded = true;
	}

	addMessage(message: Omit<QueuedMessage, 'id' | 'attempts' | 'status'>): QueuedMessage {
		const queuedMessage: QueuedMessage = {
			...message,
			id: `queued-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			attempts: 0,
			status: navigator.onLine ? 'sending' : 'pending',
		};

		this.queue.push(queuedMessage);
		this.saveToStorage();
		this.notifyListeners();

		// If online, try to send immediately
		if (navigator.onLine) {
			this.processQueue();
		}

		return queuedMessage;
	}

	removeMessage(id: string) {
		this.queue = this.queue.filter(msg => msg.id !== id);
		this.saveToStorage();
		this.notifyListeners();
	}

	updateMessageStatus(id: string, status: QueuedMessage['status']) {
		const message = this.queue.find(msg => msg.id === id);
		if (message) {
			message.status = status;
			if (status === 'sending') {
				message.attempts += 1;
			}
			this.saveToStorage();
			this.notifyListeners();
		}
	}

	async processQueue() {
		// Double-check to prevent race conditions
		if (this.isProcessing || !navigator.onLine) {
			// ProcessQueue skipped - already processing or offline
			return;
		}

		// Starting queue processing...
		this.isProcessing = true;

		try {
			const pendingMessages = this.queue.filter(
				msg => msg.status === 'pending' || msg.status === 'failed'
			);

			// Processing pending messages

			for (const message of pendingMessages) {
				if (!navigator.onLine) {
					// Stopping queue processing - went offline
					break;
				}

				try {
					this.updateMessageStatus(message.id, 'sending');
					// Sending message

					// Import dynamically to avoid circular dependency
					const { createChatMessage } = await import('@/api/chat/chatMessageApi');

					await createChatMessage({
						chatGroupId: message.chatGroupId,
						userId: message.userId,
						content: message.content,
						type: message.type,
						...(message.meta && { meta: message.meta }),
					});

					// Message sent successfully
					this.updateMessageStatus(message.id, 'sent');

					// Remove sent message after a short delay
					setTimeout(() => {
						this.removeMessage(message.id);
						// Message removed from queue
					}, 1000);
				} catch {
					// Failed to send queued message

					if (message.attempts >= 3) {
						this.updateMessageStatus(message.id, 'failed');
					} else {
						this.updateMessageStatus(message.id, 'pending');
					}
				}

				// Small delay between sends to avoid overwhelming the server
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		} finally {
			this.isProcessing = false;
			// Queue processing completed
		}
	}

	getQueue(): QueuedMessage[] {
		return [...this.queue];
	}

	getPendingCount(): number {
		return this.queue.filter(msg => msg.status === 'pending').length;
	}

	getFailedCount(): number {
		return this.queue.filter(msg => msg.status === 'failed').length;
	}

	subscribe(listener: () => void) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notifyListeners() {
		this.listeners.forEach(listener => listener());
	}

	clearQueue() {
		this.queue = [];
		this.saveToStorage();
		this.notifyListeners();
	}

	retryFailed() {
		this.queue.forEach(msg => {
			if (msg.status === 'failed') {
				msg.status = 'pending';
				msg.attempts = 0;
			}
		});
		this.saveToStorage();
		this.notifyListeners();

		if (navigator.onLine) {
			this.processQueue();
		}
	}
}

export const offlineMessageQueue = new OfflineMessageQueue();

// Hook for React components
export function useOfflineMessageQueue() {
	const [queue, setQueue] = useState<QueuedMessage[]>([]);
	const [pendingCount, setPendingCount] = useState(0);
	const [failedCount, setFailedCount] = useState(0);

	useEffect(() => {
		const updateState = () => {
			setQueue(offlineMessageQueue.getQueue());
			setPendingCount(offlineMessageQueue.getPendingCount());
			setFailedCount(offlineMessageQueue.getFailedCount());
		};

		updateState();
		const unsubscribe = offlineMessageQueue.subscribe(updateState);
		return unsubscribe;
	}, []);

	return {
		queue,
		pendingCount,
		failedCount,
		addMessage: (message: Omit<QueuedMessage, 'id' | 'attempts' | 'status'>) =>
			offlineMessageQueue.addMessage(message),
		retryFailed: () => offlineMessageQueue.retryFailed(),
		clearQueue: () => offlineMessageQueue.clearQueue(),
	};
}
