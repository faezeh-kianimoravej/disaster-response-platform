import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';

vi.mock('@/hooks/useNotifications', () => ({
	default: () => ({
		notifications: [],
		unreadCount: 0,
		markAsRead: vi.fn(),
		markAllAsRead: vi.fn(),
		loading: false,
		error: null,
		fetchNotifications: vi.fn(),
	}),
}));

import NotificationPanel from '@/components/features/notifications/NotificationPanel';

describe('NotificationPanel smoke', () => {
	it('renders bell button', () => {
		renderWithProviders(<NotificationPanel />);
		expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument();
	});
});
