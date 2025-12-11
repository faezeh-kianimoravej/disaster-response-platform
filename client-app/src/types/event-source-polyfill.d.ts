declare module 'event-source-polyfill' {
	// Minimal typings for EventSourcePolyfill used in this project
	export interface EventSourcePolyfillInit extends EventSourceInit {
		headers?: Record<string, string>;
		withCredentials?: boolean;
		heartbeatTimeout?: number;
	}

	export class EventSourcePolyfill extends EventSource {
		constructor(url: string | URL, eventSourceInitDict?: EventSourcePolyfillInit);
	}
}
