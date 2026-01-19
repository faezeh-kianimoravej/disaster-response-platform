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
        this.queue = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          status: 'pending' // Reset status on reload
        }));
      }
    } catch (error) {
      console.warn('Failed to load offline message queue:', error);
      this.queue = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.warn('Failed to save offline message queue:', error);
    }
  }

  private setupOnlineListener() {
    // Prevent multiple event listeners
    if (this.onlineListenerAdded) return;
    
    const handleOnline = () => {
      if (this.queue.length > 0 && !this.isProcessing) {
        console.log('Back online - processing queued messages');
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
      status: navigator.onLine ? 'sending' : 'pending'
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
      console.log('ProcessQueue skipped - already processing or offline:', { isProcessing: this.isProcessing, online: navigator.onLine });
      return;
    }
    
    console.log('Starting queue processing...');
    this.isProcessing = true;
    
    try {
      const pendingMessages = this.queue.filter(msg => 
        msg.status === 'pending' || msg.status === 'failed'
      );

      console.log(`Processing ${pendingMessages.length} pending messages`);

      for (const message of pendingMessages) {
        if (!navigator.onLine) {
          console.log('Stopping queue processing - went offline');
          break;
        }
        
        try {
          this.updateMessageStatus(message.id, 'sending');
          console.log(`Sending message ${message.id} (attempt ${message.attempts + 1})`);
          
          // Import dynamically to avoid circular dependency
          const { createChatMessage } = await import('@/api/chat/chatMessageApi');
          
          await createChatMessage({
            chatGroupId: message.chatGroupId,
            userId: message.userId,
            content: message.content,
            type: message.type,
            ...(message.meta && { meta: message.meta })
          });

          console.log(`Message ${message.id} sent successfully`);
          this.updateMessageStatus(message.id, 'sent');
          
          // Remove sent message after a short delay
          setTimeout(() => {
            this.removeMessage(message.id);
            console.log(`Message ${message.id} removed from queue`);
          }, 1000);
          
        } catch (error) {
          console.warn(`Failed to send queued message ${message.id}:`, error);
          
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
      console.log('Queue processing completed');
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
    clearQueue: () => offlineMessageQueue.clearQueue()
  };
}