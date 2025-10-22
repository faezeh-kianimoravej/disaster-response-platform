import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, MockInstance } from 'vitest';
import HomePage from '../pages/HomePage';
import * as incidentApi from '../api/incident';
import type { Incident } from '../types/incident';

vi.mock('../api/incident', () => ({
	getIncidents: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => vi.fn(),
	};
});

type GetIncidentsMock = MockInstance<() => Promise<Incident[]>>;
const mockedGetIncidents = incidentApi.getIncidents as unknown as GetIncidentsMock;

const renderWithRouter = (): void => {
	render(
		<MemoryRouter initialEntries={['/']}>
			<Routes>
				<Route path="/" element={<HomePage />} />
			</Routes>
		</MemoryRouter>
	);
};

describe('HomePage component', () => {
	const createMockIncident = (overrides?: Partial<Incident>): Incident => ({
		incidentId: 1,
		reportedBy: 'Test Department',
		title: 'Test Incident',
		description: 'Test Description',
		severity: 'High',
		gripLevel: 2,
		status: 'Open',
		reportedAt: new Date('2025-10-17T10:00:00'),
		location: 'Amsterdam',
		latitude: 52.3676,
		longitude: 4.9041,
		createdAt: new Date('2025-10-17T10:00:00'),
		updatedAt: new Date('2025-10-17T10:00:00'),
		...overrides,
	});

	const mockIncidents: Incident[] = [
		createMockIncident({
			incidentId: 1,
			title: 'Fire in building',
			severity: 'High',
			status: 'Open',
			gripLevel: 3,
			location: 'Amsterdam',
		}),
		createMockIncident({
			incidentId: 2,
			title: 'Medical emergency',
			severity: 'Critical',
			status: 'In Progress',
			gripLevel: 2,
			location: 'Rotterdam',
		}),
		createMockIncident({
			incidentId: 3,
			title: 'Traffic accident',
			severity: 'Medium',
			status: 'Resolved',
			gripLevel: 1,
			location: 'Utrecht',
		}),
	];

	beforeEach(() => {
		vi.clearAllMocks();
		mockedGetIncidents.mockResolvedValue(mockIncidents);
	});

	describe('ordering and grouping', () => {
		it('should not display Closed incidents even if returned by API', async () => {
			mockedGetIncidents.mockResolvedValue([
				createMockIncident({
					incidentId: 10,
					title: 'Closed case',
					status: 'Closed',
					severity: 'Critical',
				}),
				createMockIncident({
					incidentId: 11,
					title: 'Open case',
					status: 'Open',
					severity: 'Low',
				}),
				createMockIncident({
					incidentId: 12,
					title: 'Resolved case',
					status: 'Resolved',
					severity: 'Medium',
				}),
			]);

			renderWithRouter();

			await waitFor(() => {
				expect(screen.queryByText('Closed case')).not.toBeInTheDocument();
				expect(screen.getByText('Open case')).toBeInTheDocument();
				expect(screen.getByText('Resolved case')).toBeInTheDocument();
			});
		});

		it('orders incidents: Open first, then In Progress, then Resolved', async () => {
			mockedGetIncidents.mockResolvedValue([
				createMockIncident({
					incidentId: 21,
					title: 'Open Critical',
					status: 'Open',
					severity: 'Critical',
				}),
				createMockIncident({
					incidentId: 22,
					title: 'InProg Critical',
					status: 'In Progress',
					severity: 'Critical',
				}),
				createMockIncident({
					incidentId: 23,
					title: 'Resolved Low',
					status: 'Resolved',
					severity: 'Low',
				}),
				createMockIncident({
					incidentId: 24,
					title: 'Open Low',
					status: 'Open',
					severity: 'Low',
				}),
			]);

			renderWithRouter();

			await waitFor(() => {
				expect(document.querySelector('hr')).toBeInTheDocument();
			});

			const headings = await screen.findAllByRole('heading', { level: 3 });
			const titles = headings.map(h => h.textContent?.trim() ?? '');

			expect(titles.indexOf('Open Critical')).toBeLessThan(titles.indexOf('Open Low'));
			expect(titles.indexOf('Open Low')).toBeLessThan(titles.indexOf('InProg Critical'));
			expect(titles.indexOf('InProg Critical')).toBeLessThan(titles.indexOf('Resolved Low'));
		});
	});

	describe('rendering', () => {
		it('should show loading state initially', () => {
			renderWithRouter();
			expect(screen.getByText('Loading incidents...')).toBeInTheDocument();
		});

		it('should render page title', async () => {
			renderWithRouter();

			await waitFor(() => {
				expect(screen.queryByText('Loading incidents...')).not.toBeInTheDocument();
				expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
			});
		});

		it('should render all incidents after loading', async () => {
			renderWithRouter();

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
				expect(screen.getByText('Medical emergency')).toBeInTheDocument();
				expect(screen.getByText('Traffic accident')).toBeInTheDocument();
			});
		});
	});

	describe('data fetching', () => {
		it('should call getIncidents on mount', async () => {
			renderWithRouter();

			await waitFor(() => {
				expect(incidentApi.getIncidents).toHaveBeenCalledTimes(1);
			});
		});

		it('should handle empty incidents list', async () => {
			mockedGetIncidents.mockResolvedValue([]);

			renderWithRouter();

			await waitFor(() => {
				expect(screen.getByText('No incidents found matching your filters.')).toBeInTheDocument();
			});
		});

		it('should handle API errors gracefully', async () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
			mockedGetIncidents.mockRejectedValue(new Error('Failed to fetch'));

			renderWithRouter();

			await waitFor(() => {
				expect(consoleError).toHaveBeenCalledWith('Failed to load incidents:', expect.any(Error));
			});

			consoleError.mockRestore();
		});
	});
});
