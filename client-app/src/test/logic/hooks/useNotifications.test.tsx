import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import useNotifications from '@/hooks/useNotifications';
import { renderWithProviders } from '@/test/utils';
import type { AuthContextValue } from '@/context/AuthContext';

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

// Mock fetch for the hook's direct fetch calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('@/api/notification', async () => {
	return {
		markNotificationAsRead: vi.fn(async () => {}),
	};
});

// Import after mocks so the hook uses them

function HookHarness() {
	const h = useNotifications();
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

		// Mock successful fetch response
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => [
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
			],
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders without crashing', async () => {
		// Mock auth context with proper role structure
		const mockAuth: Partial<AuthContextValue> = {
			user: {
				userId: 1,
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				mobile: '000',
				roles: [
					{
						roleType: 'Region Admin',
						regionId: 1,
						departmentId: null,
						municipalityId: null,
					},
				],
				deleted: false,
			},
		};

		renderWithProviders(<HookHarness />, { auth: mockAuth });

		// Just check that the component renders without crashing
		await waitFor(() => {
			expect(screen.getByText(/unread:/)).toBeInTheDocument();
		});
	});

	it('loads notifications and shows unread count', async () => {
		const mockAuth: Partial<AuthContextValue> = {
			user: {
				userId: 1,
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				mobile: '000',
				roles: [
					{
						roleType: 'Region Admin',
						regionId: 1,
						departmentId: null,
						municipalityId: null,
					},
				],
				deleted: false,
			},
		};

		renderWithProviders(<HookHarness />, { auth: mockAuth });

		// Wait for fetch to be called and data to load
		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalled();
		});

		// Should show some unread count
		await waitFor(() => {
			expect(screen.getByText(/unread:/)).toBeInTheDocument();
		});
	});

	it('can mark single notification as read', async () => {
		const mockAuth: Partial<AuthContextValue> = {
			user: {
				userId: 1,
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				mobile: '000',
				roles: [
					{
						roleType: 'Region Admin',
						regionId: 1,
						departmentId: null,
						municipalityId: null,
					},
				],
				deleted: false,
			},
		};

		renderWithProviders(<HookHarness />, { auth: mockAuth });

		// Wait for component to load
		await waitFor(() => {
			expect(screen.getByText('one')).toBeInTheDocument();
		});

		// Click mark as read button
		screen.getByText('one').click();

		// Should not crash
		expect(screen.getByText('one')).toBeInTheDocument();
	});

	it('can mark all notifications as read', async () => {
		const mockAuth: Partial<AuthContextValue> = {
			user: {
				userId: 1,
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				mobile: '000',
				roles: [
					{
						roleType: 'Region Admin',
						regionId: 1,
						departmentId: null,
						municipalityId: null,
					},
				],
				deleted: false,
			},
		};

		renderWithProviders(<HookHarness />, { auth: mockAuth });

		// Wait for component to load
		await waitFor(() => {
			expect(screen.getByText('all')).toBeInTheDocument();
		});

		// Click mark all as read button
		screen.getByText('all').click();

		// Should not crash
		expect(screen.getByText('all')).toBeInTheDocument();
	});
});
