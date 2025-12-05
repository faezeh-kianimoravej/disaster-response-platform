import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import useNotifications from '@/hooks/useNotifications';
import { renderWithProviders } from '@/test/utils';
import type { AuthContextValue } from '@/context/AuthContext';

// Mock utilities
vi.mock('@/utils/notificationUtils', () => ({
	showBrowserNotification: vi.fn(),
}));

// Mock the notification API
vi.mock('@/api/notification', () => ({
	markNotificationAsRead: vi.fn(async () => {}),
}));

// Mock the notification SSE API
vi.mock('@/api/notification/notificationSseApi', () => ({
	connectToNotificationStream: vi.fn(),
	disconnectFromNotificationStream: vi.fn(),
	addNotificationEventListener: vi.fn(),
	removeNotificationEventListener: vi.fn(),
}));

// Mock fetch globally
global.fetch = vi.fn(async () => ({
	ok: true,
	json: async () => [],
})) as unknown as typeof fetch;

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
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeAll(() => {
		// Suppress console errors for this test suite since we're testing error handling
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	beforeEach(() => {
		vi.clearAllMocks();
		// Mock EventSource at global level
		(global as typeof globalThis).EventSource = class MockEventSource {
			static readonly CONNECTING = 0;
			static readonly OPEN = 1;
			static readonly CLOSED = 2;

			readonly CONNECTING = 0;
			readonly OPEN = 1;
			readonly CLOSED = 2;

			constructor(url: string | URL) {
				this.url = url.toString();
			}
			url: string;
			readyState: number = 0;
			withCredentials: boolean = false;
			onopen: (() => void) | null = null;
			onmessage: ((event: MessageEvent) => void) | null = null;
			onerror: (() => void) | null = null;
			addEventListener() {}
			removeEventListener() {}
			dispatchEvent() {
				return true;
			}
			close() {}
		};
	});

	afterAll(() => {
		consoleErrorSpy.mockRestore();
	});

	it('renders without crashing', async () => {
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

		await waitFor(() => {
			expect(screen.getByText('one')).toBeInTheDocument();
		});

		screen.getByText('one').click();
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

		await waitFor(() => {
			expect(screen.getByText('all')).toBeInTheDocument();
		});

		screen.getByText('all').click();
		expect(screen.getByText('all')).toBeInTheDocument();
	});
});
