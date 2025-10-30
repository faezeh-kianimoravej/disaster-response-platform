import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, Mock } from 'vitest';
import DashboardPage from '@/pages/DashboardPage';

import { useIncidents } from '@/hooks/useIncident';
import { useRegion } from '@/hooks/useRegion';
import { useAuth, useUserHasAnyRole } from '@/context/AuthContext';
import { useIncidentFilters } from '@/hooks/useIncidentFilters';
import { useToast } from '@/components/toast/ToastProvider';

describe('DashboardPage', () => {
	const mockShowError = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();

		(useToast as unknown as Mock).mockReturnValue({
			showError: mockShowError,
			showSuccess: vi.fn(),
		});

		// default auth
		(useAuth as unknown as Mock).mockReturnValue({ user: { regionId: 1 } });
		(useUserHasAnyRole as unknown as Mock).mockReturnValue(false);

		// default region
		(useRegion as unknown as Mock).mockReturnValue({
			regions: [],
			refetch: vi.fn(),
			loading: false,
			error: null,
		});

		// default incident filters
		(useIncidentFilters as unknown as Mock).mockReturnValue({
			filters: {
				statusFilter: null,
				priorityFilter: null,
				gripFilter: null,
				timeFilter: null,
				searchQuery: '',
			},
			setFilters: {
				setStatusFilter: () => {},
				setPriorityFilter: () => {},
				setGripFilter: () => {},
				setTimeFilter: () => {},
				setSearchQuery: () => {},
			},
			filteredIncidents: [],
			clearAllFilters: () => {},
		});
	});

	it('renders loading state', async () => {
		const refetch = vi.fn();
		(useIncidents as unknown as Mock).mockReturnValue({
			incidents: [],
			loading: true,
			error: null,
			refetch,
		});

		render(
			<MemoryRouter initialEntries={['/']}>
				<Routes>
					<Route path="/" element={<DashboardPage />} />
				</Routes>
			</MemoryRouter>
		);

		expect(await screen.findByText(/Loading incidents.../i)).toBeInTheDocument();
	});

	it('shows toast and inline retry when incidents fail', async () => {
		const refetch = vi.fn();
		(useIncidents as unknown as Mock).mockReturnValue({
			incidents: [],
			loading: false,
			error: 'Network',
			refetch,
		});

		render(
			<MemoryRouter initialEntries={['/']}>
				<Routes>
					<Route path="/" element={<DashboardPage />} />
				</Routes>
			</MemoryRouter>
		);

		await waitFor(() => expect(mockShowError).toHaveBeenCalledWith('Unable to load incidents.'));

		expect(screen.getByText(/Unable to load incidents\./i)).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: /retry/i }));
		expect(refetch).toHaveBeenCalled();
	});
});
