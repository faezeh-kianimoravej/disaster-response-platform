import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, Mock } from 'vitest';
import IncidentAllocateResourcePage from '@/pages/IncidentAllocateResourcePage';
import * as incidentApi from '@/api/incident';
import * as resourceApi from '@/api/resource';
import * as departmentApi from '@/api/department';
import * as municipalityApi from '@/api/municipality';
import { useToast } from '@/components/toast/ToastProvider';

// Mock toast provider
vi.mock('@/components/toast/ToastProvider', () => ({
	useToast: vi.fn(),
}));

// Mock incident API
vi.mock('@/api/incident', () => ({
	getIncidentById: vi.fn(),
	allocateResourcesToIncident: vi.fn(),
}));

// Mock resource API
vi.mock('@/api/resource', () => ({
	searchResources: vi.fn(),
}));

// Mock department API
vi.mock('@/api/department', () => ({
	getDepartments: vi.fn(),
}));

// Mock municipality API
vi.mock('@/api/municipality', () => ({
	getMunicipalities: vi.fn(),
}));

// Mock router
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => vi.fn(),
	};
});

describe('IncidentAllocateResourcePage', () => {
	const mockShowToast = vi.fn();

	const mockIncident = {
		incidentId: 123,
		title: 'Building fire emergency',
		description: 'Large fire at downtown office building',
		severity: 'Critical' as const,
		gripLevel: 4,
		location: 'Downtown',
		status: 'Active' as const,
		reportedAt: new Date('2025-01-01T10:00:00Z'),
	};

	const mockDepartments = [
		{ departmentId: 1, name: 'Fire Department', municipalityId: 1, image: '' },
		{ departmentId: 2, name: 'EMS', municipalityId: 1, image: '' },
	];

	const mockMunicipalities = [
		{ municipalityId: 1, name: 'Springfield', regionId: 1, image: '' },
		{ municipalityId: 2, name: 'Shelbyville', regionId: 1, image: '' },
	];

	const mockResources = [
		{
			resourceId: 1,
			resourceType: 'Ambulance',
			department: 'Central EMS',
			municipality: 'Springfield',
			available: 3,
			distance: '2.1 km',
		},
		{
			resourceId: 2,
			resourceType: 'Fire Truck',
			department: 'Downtown Fire Dept',
			municipality: 'Springfield',
			available: 2,
			distance: '3.7 km',
		},
	];

	beforeEach(() => {
		vi.resetAllMocks();
		(useToast as unknown as Mock).mockReturnValue({
			showToast: mockShowToast,
		});
		(incidentApi.getIncidentById as unknown as Mock).mockResolvedValue(mockIncident);
		(departmentApi.getDepartments as unknown as Mock).mockResolvedValue(mockDepartments);
		(municipalityApi.getMunicipalities as unknown as Mock).mockResolvedValue(mockMunicipalities);
		(resourceApi.searchResources as unknown as Mock).mockResolvedValue(mockResources);
	});

	const renderPage = () => {
		render(
			<MemoryRouter initialEntries={['/incidents/123/allocate-resources']}>
				<Routes>
					<Route
						path="/incidents/:incidentId/allocate-resources"
						element={<IncidentAllocateResourcePage />}
					/>
				</Routes>
			</MemoryRouter>
		);
	};

	it('shows loading state initially', () => {
		(incidentApi.getIncidentById as unknown as Mock).mockReturnValue(
			new Promise(() => {}) // never resolves
		);

		renderPage();

		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it("shows 'Incident not found' when API returns null", async () => {
		(incidentApi.getIncidentById as unknown as Mock).mockResolvedValue(null);

		renderPage();

		await waitFor(() => expect(screen.getByText(/incident not found/i)).toBeInTheDocument());
	});

	it('renders incident details and resource allocation form', async () => {
		renderPage();

		// Wait for incident to load
		await waitFor(() => expect(screen.getByText(/building fire emergency/i)).toBeInTheDocument());

		// Check incident details
		expect(screen.getByText(/allocate resources/i)).toBeInTheDocument();
		expect(screen.getByText(/priority:\s*critical/i)).toBeInTheDocument();
		expect(screen.getByText(/grip:\s*4/i)).toBeInTheDocument();
		expect(screen.getByText(/large fire at downtown office building/i)).toBeInTheDocument();

		// Check search form
		expect(screen.getByLabelText(/resource type/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/municipality/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();

		// Check action buttons
		expect(screen.getByRole('button', { name: /finalize allocation/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
	});

	it('loads and displays resource search results', async () => {
		renderPage();

		// Wait for resources to load - check for a table cell specifically
		await waitFor(() => {
			const table = screen.getByRole('table');
			expect(table).toBeInTheDocument();
		});

		// Check resource table headers (use more specific queries)
		expect(screen.getByRole('columnheader', { name: /^type$/i })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: /department/i })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: /municipality/i })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: /available/i })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: /distance/i })).toBeInTheDocument();
		expect(screen.getByRole('columnheader', { name: /allocate/i })).toBeInTheDocument();

		// Check resource data - use getAllByText to handle multiple matches
		expect(screen.getAllByText(/ambulance/i)).toHaveLength(2); // dropdown + table cell
		expect(screen.getAllByText(/fire truck/i)).toHaveLength(2); // dropdown + table cell
		expect(screen.getByText(/central ems/i)).toBeInTheDocument();
		expect(screen.getByText(/downtown fire dept/i)).toBeInTheDocument();
		expect(screen.getByText(/2\.1 km/i)).toBeInTheDocument();
		expect(screen.getByText(/3\.7 km/i)).toBeInTheDocument();
	});

	it('allows resource allocation input and updates summary', async () => {
		renderPage();

		// Wait for resources to load - check for table specifically
		await waitFor(() => {
			const table = screen.getByRole('table');
			expect(table).toBeInTheDocument();
		});

		// Find allocation inputs
		const inputs = screen.getAllByRole('spinbutton');
		expect(inputs).toHaveLength(2); // Two resources

		// Allocate 2 ambulances
		fireEvent.change(inputs[0]!, { target: { value: '2' } });

		// Check if allocation summary updates
		await waitFor(() => {
			expect(screen.getByText(/allocation summary/i)).toBeInTheDocument();
		});
	});

	it('performs search when search button is clicked', async () => {
		renderPage();

		await waitFor(() =>
			expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
		);

		// Clear the mock to check for new calls
		vi.clearAllMocks();
		(resourceApi.searchResources as unknown as Mock).mockResolvedValue(mockResources);

		// Click search button
		fireEvent.click(screen.getByRole('button', { name: /search/i }));

		// Verify search API was called
		await waitFor(() => {
			expect(resourceApi.searchResources).toHaveBeenCalled();
		});
	});

	it('filters resources by type when dropdown is changed', async () => {
		renderPage();

		await waitFor(() => expect(screen.getByLabelText(/resource type/i)).toBeInTheDocument());

		// Clear the mock to check for new calls
		vi.clearAllMocks();
		(resourceApi.searchResources as unknown as Mock).mockResolvedValue([mockResources[0]]); // Only ambulance

		// Change resource type dropdown
		const typeSelect = screen.getByLabelText(/resource type/i);
		fireEvent.change(typeSelect, { target: { value: 'Ambulance' } });

		// Click search
		fireEvent.click(screen.getByRole('button', { name: /search/i }));

		// Verify search was called with the filter
		await waitFor(() => {
			expect(resourceApi.searchResources).toHaveBeenCalledWith('Ambulance', '', '');
		});
	});

	it('calls APIs with correct parameters on mount', async () => {
		renderPage();

		await waitFor(() => {
			expect(incidentApi.getIncidentById).toHaveBeenCalledWith(123);
			expect(departmentApi.getDepartments).toHaveBeenCalled();
			expect(municipalityApi.getMunicipalities).toHaveBeenCalled();
			expect(resourceApi.searchResources).toHaveBeenCalled();
		});
	});
});
