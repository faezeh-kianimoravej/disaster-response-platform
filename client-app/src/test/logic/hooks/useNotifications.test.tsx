import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import useNotifications from '@/hooks/useNotifications';
import { renderWithProviders, createTestQueryClient } from '@/test/utils';

// Mock EventSource used by the hook to avoid jsdom issues
class FakeEventSource {
	url: string;
	onopen: (() => void) | null = null;
	onerror: (() => void) | null = null;
	private listeners: Record<string, Array<(e: MessageEvent) => void>> = {};
	constructor(url: string) {
		this.url = url;
	}
	addEventListener(type: string, cb: (e: MessageEvent) => void): void {
		this.listeners[type] = this.listeners[type] || [];
		this.listeners[type].push(cb);
	}
	removeEventListener(type: string, cb: (e: MessageEvent) => void): void {
		this.listeners[type] = (this.listeners[type] || []).filter(f => f !== cb);
	}
	close(): void {
		/* noop */
	}
	emit(type: string, data: unknown): void {
		(this.listeners[type] || []).forEach(fn =>
			fn({ data: JSON.stringify(data) } as unknown as MessageEvent)
		);
	}
}

type GlobalWithEventSource = typeof globalThis & {
	EventSource?: typeof EventSource;
};

const g = globalThis as GlobalWithEventSource;

vi.mock('@/utils/notificationUtils', () => ({
	showBrowserNotification: vi.fn(),
}));

vi.mock('@/api/notification', async () => {
	return {
		fetchNotifications: vi.fn(async () => [
			{
				notificationId: '1',
				title: 'A',
				description: 'a',
				read: false,
				createdAt: new Date().toISOString(),
			},
			{
				notificationId: '2',
				title: 'B',
				description: 'b',
				read: false,
				createdAt: new Date().toISOString(),
			},
		]),
		markNotificationAsRead: vi.fn(async () => {}),
	};
});

// Import after mocks so the hook uses them
import { fetchNotifications, markNotificationAsRead } from '@/api/notification';

function HookHarness({ regionId }: { regionId: number }) {
	const h = useNotifications(undefined, regionId);
	return (
		<div>
			<div>unread:{h.unreadCount}</div>
			<div>err:{h.error ? 'y' : 'n'}</div>
			<button
				onClick={() => {
					h.markAllAsRead().catch(() => undefined);
				}}
			>
				all
			</button>
			<button
				onClick={() => {
					h.markAsRead('1').catch(() => undefined);
				}}
			>
				one
			</button>
		</div>
	);
}

describe('useNotifications', () => {
	beforeEach(() => {
		g.EventSource = FakeEventSource as unknown as typeof EventSource;
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('marks all as read and updates unread count', async () => {
		const client = createTestQueryClient();

		renderWithProviders(<HookHarness regionId={1} />, { queryClient: client });

		// initial data comes from fetchNotifications
		await waitFor(() => expect(fetchNotifications).toHaveBeenCalled());
		expect(await screen.findByText(/unread:2/)).toBeInTheDocument();

		// trigger markAllAsRead
		screen.getByText('all').click();

		await waitFor(() => expect(screen.getByText(/unread:0/)).toBeInTheDocument());
		expect(markNotificationAsRead).toHaveBeenCalledTimes(2);
	});

	it('sets error when single markAsRead fails and keeps unread count', async () => {
		(markNotificationAsRead as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(
			async () => {
				throw new Error('boom');
			}
		);

		renderWithProviders(<HookHarness regionId={1} />);

		await waitFor(() => expect(fetchNotifications).toHaveBeenCalled());
		expect(await screen.findByText(/unread:2/)).toBeInTheDocument();

		screen.getByText('one').click();

		await waitFor(() => expect(screen.getByText(/err:y/)).toBeInTheDocument());
		// unread should still be 2 since it failed
		expect(screen.getByText(/unread:2/)).toBeInTheDocument();
	});
});
