import { describe, it, expect, vi } from 'vitest';
import ResponderDashboardPage from '@/pages/ResponderDashboardPage';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';

vi.mock('@/components/auth/AuthGuard', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/useSingleErrorToast', () => ({
	__esModule: true,
	default: () => vi.fn(),
}));

// Hook mock configurable per-test
const mockUseIncidentForResponder = vi.fn();
vi.mock('@/hooks/useDeployment', () => ({
	useIncidentForResponder: () => mockUseIncidentForResponder(),
}));

describe('ResponderDashboardPage (smoke)', () => {
	it('renders dashboard heading and loading state initially', () => {
		mockUseIncidentForResponder.mockReturnValue({
			incident: null,
			loading: true,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<ResponderDashboardPage />);
		expect(screen.getByText(/Your Current Incident/i)).toBeInTheDocument();
		expect(screen.getByText(/Loading your incident.../i)).toBeInTheDocument();
	});

	it('renders incident card when incident is loaded', () => {
		mockUseIncidentForResponder.mockReturnValue({
			incident: {
				incidentId: 42,
				regionId: 1,
				reportedBy: 'Test User',
				title: 'Warehouse Fire',
				location: 'District 9',
				status: 'Open',
				severity: 'HIGH',
				gripLevel: 2,
				description: 'Big fire',
				reportedAt: new Date('2024-01-01T10:00:00Z'),
				latitude: 0,
				longitude: 0,
				createdAt: new Date('2024-01-01T10:00:00Z'),
				updatedAt: new Date('2024-01-01T10:00:00Z'),
			},
			loading: false,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<ResponderDashboardPage />);
		expect(screen.getByText(/Your Current Incident/i)).toBeInTheDocument();
		expect(screen.getByText(/Warehouse Fire/)).toBeInTheDocument();
		expect(screen.getByText(/District 9/)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Send Update/i })).toBeInTheDocument();
	});

	it('renders no assignment message when no incident', () => {
		mockUseIncidentForResponder.mockReturnValue({
			incident: null,
			loading: false,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<ResponderDashboardPage />);
		expect(screen.getByText(/Your Current Incident/i)).toBeInTheDocument();
		expect(screen.getByText(/No Active Incident/i)).toBeInTheDocument();
	});

	it('renders error retry block on error', () => {
		mockUseIncidentForResponder.mockReturnValue({
			incident: null,
			loading: false,
			error: 'Failed to load incident',
			refetch: vi.fn(),
		});

		renderWithProviders(<ResponderDashboardPage />);
		expect(screen.getByText(/Your Current Incident/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
	});
});
