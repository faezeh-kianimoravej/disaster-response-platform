import { describe, it, expect, vi } from 'vitest';
import IncidentDetailsPage from '@/pages/IncidentDetailsPage';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';

vi.mock('@/components/auth/AuthGuard', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Hook mock configurable per-test
const mockUseIncident = vi.fn();
vi.mock('@/hooks/useIncident', () => ({
	useIncident: (...args: unknown[]) => mockUseIncident(...args),
}));

describe('IncidentDetailsPage (smoke)', () => {
	it('renders incident details when loaded', () => {
		mockUseIncident.mockReturnValue({
			incident: {
				incidentId: 42,
				regionId: 1,
				title: 'Warehouse Fire',
				location: 'District 9',
				status: 'Open',
				severity: 'High',
				gripLevel: 2,
				description: 'Big fire',
				reportedAt: new Date().toISOString(),
			},
			loading: false,
			error: null,
			fetchIncident: vi.fn(),
		});

		renderWithProviders(<IncidentDetailsPage />, { route: '/incidents/42' });
		expect(screen.getByText(/Incident details/i)).toBeInTheDocument();
		expect(screen.getByText(/Warehouse Fire/)).toBeInTheDocument();
		expect(screen.getByText(/GRIP:/i)).toBeInTheDocument();
	});

	it('renders error retry block on error', () => {
		mockUseIncident.mockReturnValue({
			incident: null,
			loading: false,
			error: 'Boom',
			fetchIncident: vi.fn(),
		});
		renderWithProviders(<IncidentDetailsPage />, { route: '/incidents/404' });
		// Error appears both in the page and as a toast; assert the Retry action to avoid duplicate text issue
		expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
	});

	it('renders not found when no incident', () => {
		mockUseIncident.mockReturnValue({
			incident: null,
			loading: false,
			error: null,
			fetchIncident: vi.fn(),
		});
		renderWithProviders(<IncidentDetailsPage />, { route: '/incidents/404' });
		expect(screen.getByText(/Incident not found/i)).toBeInTheDocument();
	});
});
