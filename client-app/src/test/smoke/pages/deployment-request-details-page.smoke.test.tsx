import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeploymentRequestDetailsPage from '@/pages/DeploymentRequestDetailsPage';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';

vi.mock('@/components/auth/AuthGuard', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Hook mocks configurable per-test
const mockUseDeploymentRequest = vi.fn();
const mockUseAssignResponseUnitToDeploymentRequest = vi.fn();
const mockUseResponseUnits = vi.fn();

vi.mock('@/hooks/useDeploymentRequest', () => ({
	useDeploymentRequest: (...args: unknown[]) => mockUseDeploymentRequest(...args),
	useAssignResponseUnitToDeploymentRequest: (...args: unknown[]) =>
		mockUseAssignResponseUnitToDeploymentRequest(...args),
}));

vi.mock('@/hooks/useResponseUnit', () => ({
	useResponseUnits: (...args: unknown[]) => mockUseResponseUnits(...args),
}));

vi.mock('@/hooks/useSingleErrorToast', () => ({
	__esModule: true,
	default: () => vi.fn(),
}));

vi.mock('@/hooks/useDepartment', () => ({
	useDepartment: () => ({ department: null, loading: false, error: null }),
}));

vi.mock('@/hooks/useMunicipality', () => ({
	useMunicipality: () => ({ municipality: null, loading: false, error: null }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => vi.fn(),
		useParams: () => ({ requestId: '1' }),
	};
});

describe('DeploymentRequestDetailsPage (smoke)', () => {
	beforeEach(() => {
		// Default mock implementations
		mockUseAssignResponseUnitToDeploymentRequest.mockReturnValue({
			mutate: vi.fn(),
			mutateAsync: vi.fn().mockResolvedValue({}),
			isPending: false,
			error: null,
		});
		mockUseResponseUnits.mockReturnValue({
			data: [],
			isLoading: false,
			error: null,
			refetch: vi.fn(),
		});
	});

	it('renders deployment request details when loaded', () => {
		mockUseDeploymentRequest.mockReturnValue({
			data: {
				requestId: 1,
				incidentId: 100,
				deploymentOrderId: 200,
				requestedBy: 3,
				requestedAt: new Date('2023-12-01T10:00:00Z'),
				targetDepartmentId: 5,
				priority: 'CRITICAL',
				requestedUnitType: 'Fire truck',
				requestedQuantity: 2,
				status: 'pending',
			},
			isLoading: false,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<DeploymentRequestDetailsPage />, {
			route: '/deployment-requests/1',
			routePath: '/deployment-requests/:requestId',
		});

		expect(screen.getByText(/Deployment Request/i)).toBeInTheDocument();
		expect(screen.getAllByText(/Fire truck/i)[0]).toBeInTheDocument(); // Use getAllBy for multiple matches
		expect(screen.getByText(/CRITICAL/i)).toBeInTheDocument();
	});

	it('renders loading state when data is loading', () => {
		mockUseDeploymentRequest.mockReturnValue({
			data: undefined,
			isLoading: true,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<DeploymentRequestDetailsPage />, {
			route: '/deployment-requests/1',
			routePath: '/deployment-requests/:requestId',
		});

		expect(screen.getByText(/Loading/i)).toBeInTheDocument();
	});

	it('renders error state when there is an error', () => {
		mockUseDeploymentRequest.mockReturnValue({
			data: undefined,
			isLoading: false,
			error: new Error('Failed to load'),
			refetch: vi.fn(),
		});

		renderWithProviders(<DeploymentRequestDetailsPage />, {
			route: '/deployment-requests/1',
			routePath: '/deployment-requests/:requestId',
		});

		expect(screen.getByText(/Unable to load deployment request/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
	});

	it('renders not found state when deployment request is null', () => {
		mockUseDeploymentRequest.mockReturnValue({
			data: null,
			isLoading: false,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<DeploymentRequestDetailsPage />, {
			route: '/deployment-requests/999',
			routePath: '/deployment-requests/:requestId',
		});

		expect(screen.getByText(/Deployment request not found/i)).toBeInTheDocument();
	});

	it('shows assignment panel for pending requests', () => {
		mockUseDeploymentRequest.mockReturnValue({
			data: {
				requestId: 1,
				incidentId: 100,
				deploymentOrderId: 200,
				requestedBy: 3,
				requestedAt: new Date('2023-12-01T10:00:00Z'),
				targetDepartmentId: 5,
				priority: 'HIGH',
				requestedUnitType: 'Team',
				requestedQuantity: 1,
				status: 'pending',
			},
			isLoading: false,
			error: null,
			refetch: vi.fn(),
		});

		mockUseResponseUnits.mockReturnValue({
			data: [
				{
					unitId: 1,
					unitName: 'Emergency Response Team Alpha',
					unitType: 'Team',
					departmentId: 5,
					status: 'AVAILABLE',
					defaultResources: [],
					defaultPersonnel: [],
				},
			],
			isLoading: false,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<DeploymentRequestDetailsPage />, {
			route: '/deployment-requests/1',
			routePath: '/deployment-requests/:requestId',
			auth: {
				user: {
					userId: 1,
					firstName: 'John',
					lastName: 'Doe',
					email: 'john.doe@example.com',
					mobile: '+1234567890',
					deleted: false,
					roles: [
						{
							roleType: 'Department Admin',
							departmentId: 5,
							municipalityId: null,
							regionId: null,
						},
					],
				},
			},
		});

		expect(screen.getByRole('heading', { name: /Fill Unit Assignment/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Create Deployment/i })).toBeInTheDocument();
	});
});
