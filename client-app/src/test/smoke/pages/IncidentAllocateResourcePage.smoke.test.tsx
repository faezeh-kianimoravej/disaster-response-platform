import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, Mock } from 'vitest';
import IncidentAllocateResourcePage from '@/pages/IncidentAllocateResourcePage';
import * as incidentApi from '@/api/incident';
import * as resourceApi from '@/api/resource';
import * as departmentApi from '@/api/department';
import * as municipalityApi from '@/api/municipality';
import { renderWithProviders } from '@/test/utils';

// Mock incident API
vi.mock('@/api/incident', () => ({
	getIncidentById: vi.fn(),
	allocateResourcesToIncident: vi.fn(),
	getAllocatedResources: vi.fn(),
}));

// Mock resource API
vi.mock('@/api/resource', () => ({
	searchResources: vi.fn(),
}));

// Mock department API
vi.mock('@/api/department', () => ({
	getDepartmentsByMunicipalityId: vi.fn(),
	getAllDepartments: vi.fn(),
}));

// Mock municipality API
vi.mock('@/api/municipality', () => ({
	getMunicipalitiesByRegionId: vi.fn(),
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
	const mockIncident = {
		incidentId: 123,
		title: 'Building fire emergency',
		description: 'Large fire at downtown office building',
		severity: 'Critical' as const,
		gripLevel: 4,
		location: 'Downtown',
		status: 'Active' as const,
		reportedAt: new Date('2025-01-01T10:00:00Z'),
		regionId: 1,
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
		(incidentApi.getIncidentById as unknown as Mock).mockResolvedValue(mockIncident);
		(incidentApi.getAllocatedResources as unknown as Mock).mockResolvedValue([]);
		(departmentApi.getAllDepartments as unknown as Mock).mockResolvedValue(mockDepartments);
		(departmentApi.getDepartmentsByMunicipalityId as unknown as Mock).mockResolvedValue(
			mockDepartments
		);
		(municipalityApi.getMunicipalitiesByRegionId as unknown as Mock).mockImplementation(() =>
			Promise.resolve(mockMunicipalities)
		);
		(resourceApi.searchResources as unknown as Mock).mockResolvedValue(mockResources);
	});

	const renderPage = () => {
		renderWithProviders(<IncidentAllocateResourcePage />, {
			route: '/incidents/123/allocate-resources',
			routePath: '/incidents/:incidentId/allocate-resources',
			auth: {
				user: {
					userId: 1,
					firstName: 'Test',
					lastName: 'User',
					email: 'test@example.com',
					mobile: '000',
					roles: [
						{ roleType: 'Region Admin', departmentId: null, municipalityId: null, regionId: 1 },
					],
					deleted: false,
				},
			},
		});
	};

	it('shows loading state initially', () => {
		(incidentApi.getIncidentById as unknown as Mock).mockReturnValue(
			new Promise(() => {}) // never resolves
		);

		renderPage();

		expect(screen.getByText(/loading incident details/i)).toBeInTheDocument();
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
		expect(
			screen.getByRole('button', { name: /finalize allocation|update allocation/i })
		).toBeInTheDocument();
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
			expect(resourceApi.searchResources).toHaveBeenCalledWith(123, 'Ambulance', '', '');
		});
	});

	it('calls APIs with correct parameters on mount', async () => {
		renderPage();

		await waitFor(() => {
			expect(incidentApi.getIncidentById).toHaveBeenCalledWith(123);
			expect(incidentApi.getAllocatedResources).toHaveBeenCalledWith(123);
			expect(departmentApi.getAllDepartments).toHaveBeenCalled();
			expect(municipalityApi.getMunicipalitiesByRegionId).toHaveBeenCalled();
			expect(resourceApi.searchResources).toHaveBeenCalled();
		});
	});

	it('handles existing allocations correctly', async () => {
		const existingAllocations = [
			{
				resourceId: 1,
				resourceType: 'Ambulance',
				quantity: 2,
				department: 'Central EMS',
				municipality: 'Springfield',
			},
			{
				resourceId: 2,
				resourceType: 'Fire Truck',
				quantity: 1,
				department: 'Downtown Fire Dept',
				municipality: 'Springfield',
			},
		];

		// Mock existing allocations
		(incidentApi.getAllocatedResources as unknown as Mock).mockResolvedValue(existingAllocations);

		renderPage();

		// Wait for page to load with existing allocations
		await waitFor(() => {
			expect(screen.getByText(/manage resource allocation/i)).toBeInTheDocument();
		});

		// Should show existing allocations message
		expect(screen.getByText(/existing resource allocations/i)).toBeInTheDocument();
		expect(screen.getByText(/this incident already has allocated resources/i)).toBeInTheDocument();

		// Should not show the search form (resource table is not rendered)
		expect(screen.queryByLabelText(/resource type/i)).not.toBeInTheDocument();

		// Should show finalize button (not update - this feature is not implemented yet)
		expect(
			screen.getByRole('button', { name: /finalize allocation|update allocation/i })
		).toBeInTheDocument();
	});
});
