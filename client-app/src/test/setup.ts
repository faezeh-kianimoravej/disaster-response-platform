import '@testing-library/jest-dom';

// Mock EventSource for tests
class MockEventSource {
	static readonly CONNECTING = 0;
	static readonly OPEN = 1;
	static readonly CLOSED = 2;
	readonly CONNECTING = 0;
	readonly OPEN = 1;
	readonly CLOSED = 2;
	readyState = MockEventSource.CONNECTING;
	url = '';
	withCredentials = false;
	onopen: ((this: EventSource, ev: Event) => void) | null = null;
	onerror: ((this: EventSource, ev: Event) => void) | null = null;
	onmessage: ((this: EventSource, ev: MessageEvent) => void) | null = null;
	close() {}
	addEventListener() {}
	removeEventListener() {}
	dispatchEvent(): boolean {
		return true;
	}
	constructor(url: string | URL) {
		this.url = url.toString();
	}
}
(globalThis as typeof globalThis).EventSource = MockEventSource;
