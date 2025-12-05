export interface GenericSSEEvent<T extends string = string> {
	type: T;
	data: unknown;
}

export type GenericSSEEventHandler<T extends GenericSSEEvent = GenericSSEEvent> = (
	event: T
) => void;

export interface ConnectionStatusData {
	status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
	timestamp: string;
}

type ConnectionStatusEvent = GenericSSEEvent<'CONNECTION_STATUS'> & {
	data: ConnectionStatusData;
};

type CombinedEvent<E extends GenericSSEEvent> = E | ConnectionStatusEvent;

interface StreamConfig {
	streamKey?: string; // Required for multi-stream support
	eventName: string; // Event name to listen for (e.g., 'chat-message', 'notification')
	onConnect?: (streamKey: string) => void;
	onDisconnect?: (streamKey: string) => void;
}

/**
 * Generic SSE API class supporting both single and multiple concurrent streams.
 * Handles reconnection, event management, and connection pooling.
 * Auth tokens are automatically included via EventSource construction.
 */
export class GenericSSEApi<EventType extends GenericSSEEvent = GenericSSEEvent> {
	private eventSources: Map<string, EventSource> = new Map();
	private handlers: Map<string, GenericSSEEventHandler<CombinedEvent<EventType>>[]> = new Map();
	private reconnectAttempts: Map<string, number> = new Map();
	private reconnectDelays: Map<string, number> = new Map();
	private maxReconnectAttempts = 5;
	private streamConfigs: Map<string, StreamConfig> = new Map();

	/**
	 * Connect to SSE stream
	 * @param connectionKey Unique key for tracking the connection
	 * @param url The endpoint URL
	 * @param config Stream configuration with event name and optional callbacks
	 * @param params Optional URL parameters to append
	 */
	connect(
		connectionKey: string,
		url: string,
		config: StreamConfig,
		params?: Record<string, string | number>
	): void {
		this.disconnect(connectionKey);

		const urlObj = new URL(url);

		// Add URL parameters
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== null && value !== undefined) {
					urlObj.searchParams.set(key, String(value));
				}
			});
		}

		// EventSource doesn't support custom headers, so we must pass token via query param
		// Backend should validate this token parameter for authentication
		const token = localStorage.getItem('auth_token');
		if (token) {
			urlObj.searchParams.set('token', token);
		}

		const eventSource = new EventSource(urlObj.toString());
		this.streamConfigs.set(connectionKey, config);

		eventSource.onopen = () => {
			this.reconnectAttempts.set(connectionKey, 0);
			this.reconnectDelays.set(connectionKey, 1000);
			this.emitEvent(connectionKey, {
				type: 'CONNECTION_STATUS',
				data: {
					status: 'CONNECTED',
					timestamp: new Date().toISOString(),
				},
			});
			config.onConnect?.(connectionKey);
		};

		eventSource.onerror = () => {
			this.emitEvent(connectionKey, {
				type: 'CONNECTION_STATUS',
				data: {
					status: 'DISCONNECTED',
					timestamp: new Date().toISOString(),
				},
			});

			this.handleReconnection(connectionKey, url, config, params);
		};

		// Listen to the configured event name
		eventSource.addEventListener(config.eventName, event => {
			try {
				const data = JSON.parse(event.data);
				// Find the registered event type for this connection
				for (const key of this.handlers.keys()) {
					if (key.startsWith(`${connectionKey}:`) && !key.endsWith(':CONNECTION_STATUS')) {
						const eventType = key.split(':')[1] as EventType['type'];
						const parsedEvent = {
							type: eventType,
							data,
						} as CombinedEvent<EventType>;
						this.emitEvent(connectionKey, parsedEvent);
						return;
					}
				}
			} catch {
				// Silent error handling
			}
		});

		this.eventSources.set(connectionKey, eventSource);
	}

	/**
	 * Disconnect from a specific stream
	 */
	disconnect(connectionKey: string): void {
		const eventSource = this.eventSources.get(connectionKey);
		if (eventSource) {
			eventSource.close();
			this.eventSources.delete(connectionKey);
		}
		const config = this.streamConfigs.get(connectionKey);
		config?.onDisconnect?.(connectionKey);
		this.reconnectAttempts.delete(connectionKey);
		this.reconnectDelays.delete(connectionKey);
		this.streamConfigs.delete(connectionKey);
	}

	/**
	 * Disconnect all streams
	 */
	disconnectAll(): void {
		const keys = Array.from(this.eventSources.keys());
		keys.forEach(key => this.disconnect(key));
	}

	/**
	 * Add an event listener
	 */
	addEventListener(
		connectionKey: string,
		eventType: EventType['type'] | 'CONNECTION_STATUS',
		handler: GenericSSEEventHandler<CombinedEvent<EventType>>
	): void {
		const handlerKey = `${connectionKey}:${eventType}`;
		if (!this.handlers.has(handlerKey)) {
			this.handlers.set(handlerKey, []);
		}
		this.handlers.get(handlerKey)!.push(handler);
	}

	/**
	 * Remove an event listener
	 */
	removeEventListener(
		connectionKey: string,
		eventType: EventType['type'] | 'CONNECTION_STATUS',
		handler: GenericSSEEventHandler<CombinedEvent<EventType>>
	): void {
		const handlerKey = `${connectionKey}:${eventType}`;
		const handlers = this.handlers.get(handlerKey);
		if (handlers) {
			const index = handlers.indexOf(handler);
			if (index > -1) {
				handlers.splice(index, 1);
			}
		}
	}

	/**
	 * Check if a connection is active
	 */
	isConnected(connectionKey: string): boolean {
		const eventSource = this.eventSources.get(connectionKey);
		return eventSource?.readyState === EventSource.OPEN;
	}

	protected emitEvent(connectionKey: string, event: CombinedEvent<EventType>): void {
		const handlerKey = `${connectionKey}:${event.type}`;
		const handlers = this.handlers.get(handlerKey);
		if (handlers) {
			handlers.forEach(handler => {
				try {
					handler(event);
				} catch {
					// Silent error handling
				}
			});
		}
	}

	clearHandlersForKey(connectionKey: string): void {
		const keysToDelete: string[] = [];
		for (const key of this.handlers.keys()) {
			if (key.startsWith(`${connectionKey}:`)) {
				keysToDelete.push(key);
			}
		}
		keysToDelete.forEach(key => this.handlers.delete(key));
	}

	getReadyState(connectionKey: string): number | null {
		const eventSource = this.eventSources.get(connectionKey);
		return eventSource?.readyState ?? null;
	}

	protected handleReconnection(
		connectionKey: string,
		url: string,
		config: StreamConfig,
		params?: Record<string, string | number>
	): void {
		const attempts = this.reconnectAttempts.get(connectionKey) ?? 0;
		if (attempts < this.maxReconnectAttempts) {
			this.reconnectAttempts.set(connectionKey, attempts + 1);

			this.emitEvent(connectionKey, {
				type: 'CONNECTION_STATUS',
				data: {
					status: 'RECONNECTING',
					timestamp: new Date().toISOString(),
				},
			});

			const delay = this.reconnectDelays.get(connectionKey) ?? 1000;
			setTimeout(() => {
				this.connect(connectionKey, url, config, params);
			}, delay);

			// Exponential backoff
			const newDelay = Math.min(delay * 2, 30000);
			this.reconnectDelays.set(connectionKey, newDelay);
		}
	}
}
