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
const mockUseAssignDeploymentRequest = vi.fn();
const mockUseResources = vi.fn();
const mockUseUsersByDepartment = vi.fn();

vi.mock('@/hooks/useDeploymentRequest', () => ({
	useDeploymentRequest: (...args: unknown[]) => mockUseDeploymentRequest(...args),
	useAssignDeploymentRequest: (...args: unknown[]) => mockUseAssignDeploymentRequest(...args),
}));

vi.mock('@/hooks/useResource', () => ({
	useResources: (...args: unknown[]) => mockUseResources(...args),
	useResource: () => ({ resource: null, loading: false, error: null }),
}));

vi.mock('@/hooks/useUser', () => ({
	useUsersByDepartment: (...args: unknown[]) => mockUseUsersByDepartment(...args),
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
		mockUseAssignDeploymentRequest.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
			error: null,
		});
		mockUseResources.mockReturnValue({
			resources: [],
			loading: false,
			isFetching: false,
			error: null,
			refetch: vi.fn(),
		});
		mockUseUsersByDepartment.mockReturnValue({
			users: [],
			loading: false,
			isFetching: false,
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

		mockUseResources.mockReturnValue({
			resources: [{ id: 1, name: 'Emergency Response Team', type: 'Team' }],
			loading: false,
			isFetching: false,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<DeploymentRequestDetailsPage />, {
			route: '/deployment-requests/1',
			routePath: '/deployment-requests/:requestId',
			auth: {
				user: {
					userId: 1,
					roles: [{ roleId: 1, name: 'Department Manager' }],
				},
			},
		});

		expect(screen.getByText(/Assign Team Resources/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Assign/i })).toBeInTheDocument();
	});
});
