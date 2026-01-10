import { describe, it, expect, vi } from 'vitest';
import SendCrisisUpdatePage from '@/pages/SendCrisisUpdatePage';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';

vi.mock('@/components/auth/AuthGuard', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the toast provider
vi.mock('@/components/toast/ToastProvider', () => ({
	ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	useToast: () => ({
		showSuccess: vi.fn(),
		showError: vi.fn(),
	}),
}));

// Hook mock configurable per-test
const mockUseIncident = vi.fn();
vi.mock('@/hooks/useIncident', () => ({
	useIncident: (...args: unknown[]) => mockUseIncident(...args),
}));

// Mock the send message hook
vi.mock('@/hooks/chat/useChatMessages', () => ({
	useSendMessage: () => ({
		mutateAsync: vi.fn(),
		isLoading: false,
		error: null,
	}),
}));

// Mock the chat group API
vi.mock('@/api/chat/chatGroupApi', () => ({
	getChatGroupByIncident: vi.fn(),
}));

describe('SendCrisisUpdatePage (smoke)', () => {
	it('renders page heading and loading state initially', () => {
		mockUseIncident.mockReturnValue({
			incident: undefined,
			loading: true,
			error: null,
		});

		renderWithProviders(<SendCrisisUpdatePage />, { route: '/incidents/42/update' });
		expect(screen.getByText(/Send Crisis Update/i)).toBeInTheDocument();
		expect(screen.getByText(/Loading/i)).toBeInTheDocument();
	});

	it('renders quick actions and form when incident is loaded', () => {
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
		});

		renderWithProviders(<SendCrisisUpdatePage />, { route: '/incidents/42/update' });
		expect(screen.getByText(/Send Crisis Update/i)).toBeInTheDocument();
		expect(screen.getByText(/Quick Actions:/i)).toBeInTheDocument();
		expect(screen.getByText(/Fire-related/i)).toBeInTheDocument();
		expect(screen.getByText(/Flood-related/i)).toBeInTheDocument();
		expect(screen.getByText(/Additional Notes:/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Submit Update/i })).toBeInTheDocument();
	});

	it('renders quick action categories with selectable items', () => {
		mockUseIncident.mockReturnValue({
			incident: {
				incidentId: 42,
				title: 'Test Incident',
				status: 'Open',
			},
			loading: false,
			error: null,
		});

		renderWithProviders(<SendCrisisUpdatePage />, { route: '/incidents/42/update' });

		// Check for some quick action items
		expect(screen.getByText(/We've arrived/i)).toBeInTheDocument();
		expect(screen.getByText(/Water level rising/i)).toBeInTheDocument();
		expect(screen.getByText(/Need backup/i)).toBeInTheDocument();
		expect(screen.getByText(/Situation under control/i)).toBeInTheDocument();
	});

	it('renders error retry block on error', () => {
		mockUseIncident.mockReturnValue({
			incident: null,
			loading: false,
			error: 'Failed to load incident',
		});

		renderWithProviders(<SendCrisisUpdatePage />, { route: '/incidents/404/update' });
		expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
	});

	it('renders textarea for additional notes', () => {
		mockUseIncident.mockReturnValue({
			incident: {
				incidentId: 42,
				title: 'Test Incident',
				status: 'Open',
			},
			loading: false,
			error: null,
		});

		renderWithProviders(<SendCrisisUpdatePage />, { route: '/incidents/42/update' });
		expect(screen.getByPlaceholderText(/Enter additional information/i)).toBeInTheDocument();
	});
});
