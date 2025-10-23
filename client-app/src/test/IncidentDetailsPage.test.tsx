import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, Mock } from 'vitest';
import IncidentDetailsPage from '@/pages/IncidentDetailsPage';
import * as incidentApi from '@/api/incident';

vi.mock('@/api/incident', () => ({
	getIncidentById: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => vi.fn(),
	};
});

describe('IncidentDetailsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderPage = async (incidentData: unknown) => {
		(incidentApi.getIncidentById as unknown as Mock).mockResolvedValue(incidentData);
		render(
			<MemoryRouter initialEntries={['/incidents/42']}>
				<Routes>
					<Route path="/incidents/:incidentId" element={<IncidentDetailsPage />} />
				</Routes>
			</MemoryRouter>
		);
	};

	it('shows loading state initially', async () => {
		(incidentApi.getIncidentById as unknown as Mock).mockReturnValue(
			new Promise(() => {}) // never resolves
		);

		render(
			<MemoryRouter initialEntries={['/incidents/1']}>
				<Routes>
					<Route path="/incidents/:incidentId" element={<IncidentDetailsPage />} />
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByText(/loading incident/i)).toBeInTheDocument();
	});

	it("shows 'Incident not found' when API returns null", async () => {
		await renderPage(null);

		await waitFor(() => expect(screen.getByText(/incident not found/i)).toBeInTheDocument());

		expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
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
