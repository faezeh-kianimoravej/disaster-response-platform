import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, Mock } from 'vitest';
import IncidentDetailsPage from '@/pages/IncidentDetailsPage';
import { useIncident } from '@/hooks/useIncident';
vi.mock('@/api/incident', () => ({
	getIncidentById: vi.fn(),
}));

// Mock the toast provider hook used by the page
vi.mock('@/components/toast/ToastProvider', () => ({
	useToast: () => ({ showError: vi.fn(), showSuccess: vi.fn() }),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => vi.fn(),
	};
});

// Bypass AuthGuard in tests so we can render the content directly
vi.mock('@/components/AuthGuard', () => ({
	default: ({ children }: { children: unknown }) => children,
}));

// Mock the data hook used by the page to avoid setting up QueryClientProvider
vi.mock('@/hooks/useIncident', () => ({
	useIncident: vi.fn(),
}));

describe('IncidentDetailsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderPage = async (
		incidentData: unknown,
		opts?: { loading?: boolean; error?: string | null }
	) => {
		const mock = useIncident as Mock;
		const refetch = vi.fn();
		mock.mockReturnValue({
			incident: incidentData ?? null,
			loading: opts?.loading ?? false,
			error: opts?.error ?? null,
			refetch,
		});

		render(
			<MemoryRouter initialEntries={['/incidents/42']}>
				<Routes>
					<Route path="/incidents/:incidentId" element={<IncidentDetailsPage />} />
				</Routes>
			</MemoryRouter>
		);
		return { refetch };
	};

	it('shows loading state initially', async () => {
		await renderPage(null, { loading: true });

		expect(screen.getByText(/loading incident/i)).toBeInTheDocument();
	});

	it("shows 'Incident not found' when API returns null", async () => {
		await renderPage(null, { loading: false, error: null });

		await waitFor(() => expect(screen.getByText(/incident not found/i)).toBeInTheDocument());

		expect(screen.getAllByRole('button', { name: /back/i }).length).toBeGreaterThan(0);
	});

	it('renders incident details when data is found', async () => {
		const mockIncident = {
			incidentId: 42,
			title: 'Bridge collapse',
			description: 'Main bridge partially collapsed due to heavy rain.',
			severity: 'High',
			gripLevel: 3,
			location: 'City Center',
			status: 'Active',
			reportedAt: new Date('2025-01-01T10:00:00Z'),
		};

		await renderPage(mockIncident);

		await waitFor(() => expect(screen.getByText(/bridge collapse/i)).toBeInTheDocument());

		const priorityLabels = screen.getAllByText(/priority:\s*high/i);
		expect(priorityLabels.length).toBeGreaterThan(0);

		const gripLabels = screen.getAllByText(/grip:\s*3/i);
		expect(gripLabels.length).toBeGreaterThan(0);

		expect(screen.getByText(/main bridge partially collapsed/i)).toBeInTheDocument();

		expect(screen.getByText(/prioritize/i)).toBeInTheDocument();
		expect(screen.getByText('Back')).toBeInTheDocument();
	});
});
