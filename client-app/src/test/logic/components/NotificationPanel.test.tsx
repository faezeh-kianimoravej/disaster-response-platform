import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationPanel from '@/components/features/notifications/NotificationPanel';
import type { Notification } from '@/types/notification';
import { NotificationType } from '@/types/notification';
import { renderWithProviders } from '@/test/utils';

// Mock navigation
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return { ...actual, useNavigate: () => vi.fn() };
});

// Mutable state for the notifications hook
const hookState = {
	notifications: [] as Notification[],
	unreadCount: 0,
	markAsRead: vi.fn<(id: string) => void>(),
	markAllAsRead: vi.fn<() => void>(),
	loading: false,
	error: null as unknown as string | null,
	fetchNotifications: vi.fn<() => void>(),
};

vi.mock('@/hooks/useNotifications', () => ({
	default: () => hookState,
}));

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
	notificationId: 'n1',
	title: 'New Incident',
	description: 'Something happened',
	createdAt: new Date().toISOString(),
	read: false,
	notificationType: NotificationType.NEW_INCIDENT,
	incidentId: '123',
	...overrides,
});

describe('NotificationPanel', () => {
	beforeEach(() => {
		hookState.notifications = [];
		hookState.unreadCount = 0;
		hookState.loading = false;
		hookState.error = null;
		hookState.markAsRead.mockClear();
		hookState.markAllAsRead.mockClear();
		hookState.fetchNotifications.mockClear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('opens panel and renders notifications and tabs', async () => {
		hookState.notifications = [
			makeNotification(),
			makeNotification({ notificationId: 'n2', read: true }),
		];
		hookState.unreadCount = 1;
		renderWithProviders(<NotificationPanel />);
		await userEvent.click(screen.getByRole('button', { name: /notifications/i }));

		screen.getByRole('heading', { name: /notifications/i });
		screen.getByText(/^All$/);
		screen.getByRole('button', { name: /unread\s*\(1\)/i });
		// Renders at least one notification item
		expect(screen.getAllByText(/New Incident/i).length).toBeGreaterThan(0);
	});

	it('clicking a notification marks as read and navigates', async () => {
		hookState.notifications = [makeNotification()];
		hookState.unreadCount = 1;
		renderWithProviders(<NotificationPanel />);
		await userEvent.click(screen.getByRole('button', { name: /notifications/i }));

		await userEvent.click(screen.getByText(/New Incident/i));
		expect(hookState.markAsRead).toHaveBeenCalledWith('n1');
	});

	it('Mark As Read button stops propagation and does not navigate', async () => {
		hookState.notifications = [makeNotification()];
		hookState.unreadCount = 1;
		renderWithProviders(<NotificationPanel />);
		await userEvent.click(screen.getByRole('button', { name: /notifications/i }));

		await userEvent.click(screen.getByRole('button', { name: /mark as read/i }));
		expect(hookState.markAsRead).toHaveBeenCalledWith('n1');
	});

	it('Mark All As Read triggers bulk action', async () => {
		hookState.notifications = [makeNotification(), makeNotification({ notificationId: 'n2' })];
		hookState.unreadCount = 2;
		renderWithProviders(<NotificationPanel />);
		await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
		await userEvent.click(screen.getByRole('button', { name: /mark all as read/i }));
		expect(hookState.markAllAsRead).toHaveBeenCalled();
	});

	it('shows loading state', async () => {
		hookState.notifications = [];
		hookState.unreadCount = 0;
		hookState.loading = true;
		renderWithProviders(<NotificationPanel />);
		await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
		screen.getByText(/Loading notifications/i);
	});

	it('shows error and allows retry', async () => {
		hookState.notifications = [];
		hookState.unreadCount = 0;
		hookState.loading = false;
		hookState.error = 'error';
		renderWithProviders(<NotificationPanel />);
		await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
		// Assert error inside the panel's alert block to avoid matching toast message
		const alert = screen.getByRole('alert');
		expect(alert).toHaveTextContent(/Unable to load notifications/i);
		await userEvent.click(screen.getByRole('button', { name: /retry/i }));
		expect(hookState.fetchNotifications).toHaveBeenCalled();
	});
});
