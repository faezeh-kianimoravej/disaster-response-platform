import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';

// Mock heavy sub-components to keep this a smoke test
vi.mock('@/components/features/notifications/NotificationPanel', () => ({
	default: () => <div data-testid="notification-panel" />,
}));
vi.mock('@/components/auth/AccountPanel', () => ({
	default: () => <div data-testid="account-panel" />,
}));

import Navigation from '@/components/layout/Navigation';

describe('Navigation smoke', () => {
	it('renders brand logo', () => {
		renderWithProviders(<Navigation />);
		expect(screen.getByText(/drccs/i)).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /drccs/i })).toBeInTheDocument();
	});
});
