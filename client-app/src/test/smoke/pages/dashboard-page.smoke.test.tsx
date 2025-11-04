import { describe, it, expect, vi } from 'vitest';
import DashboardPage from '@/pages/DashboardPage';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';

vi.mock('@/components/auth/AuthGuard', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/useIncident', () => ({
	useIncidents: () => ({ incidents: [], loading: false, error: null, refetch: vi.fn() }),
}));

vi.mock('@/hooks/useIncidentFilters', () => ({
	useIncidentFilters: () => ({
		filters: {
			statusFilter: 'Any',
			priorityFilter: 'Any',
			gripFilter: 'Any',
			timeFilter: 'Any',
			searchQuery: '',
		},
		setFilters: {
			setStatusFilter: vi.fn(),
			setPriorityFilter: vi.fn(),
			setGripFilter: vi.fn(),
			setTimeFilter: vi.fn(),
			setSearchQuery: vi.fn(),
		},
		filteredIncidents: [],
		clearAllFilters: vi.fn(),
	}),
}));

describe('DashboardPage (smoke)', () => {
	it('renders heading and empty state when no incidents', () => {
		renderWithProviders(<DashboardPage />);
		expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
		expect(screen.getByText(/No incidents found/i)).toBeInTheDocument();
	});

	it('renders filter section', () => {
		renderWithProviders(<DashboardPage />);
		expect(screen.getByText(/Active filters:/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Clear All Filters/i })).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
	});
});
