import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import IncidentDeploymentOrder from '@/pages/IncidentDeploymentOrder';
import { screen } from '@testing-library/react';

vi.mock('@/components/auth/AuthGuard', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseIncident = vi.fn();
const mockUseAllDepartments = vi.fn();
const mockUseDepartment = vi.fn();
const mockUseMunicipalities = vi.fn();
const mockUseMunicipality = vi.fn();
const mockUseCreateDeploymentOrder = vi.fn();
const mockUseSearchAvailableResponseUnits = vi.fn();
const mockUseDeploymentOrderByIncidentId = vi.fn();

vi.mock('@/hooks/useIncident', () => ({
	useIncident: (...args: unknown[]) => mockUseIncident(...args),
}));
vi.mock('@/hooks/useDepartment', () => ({
	useAllDepartments: (...args: unknown[]) => mockUseAllDepartments(...args),
	useDepartment: (...args: unknown[]) => mockUseDepartment(...args),
}));
vi.mock('@/hooks/useMunicipality', () => ({
	useMunicipalities: (...args: unknown[]) => mockUseMunicipalities(...args),
	useMunicipality: (...args: unknown[]) => mockUseMunicipality(...args),
}));
vi.mock('@/hooks/useDeploymentOrder', () => ({
	useCreateDeploymentOrder: (...args: unknown[]) => mockUseCreateDeploymentOrder(...args),
	useDeploymentOrderByIncidentId: (...args: unknown[]) =>
		mockUseDeploymentOrderByIncidentId(...args),
}));
vi.mock('@/hooks/useResponseUnit', () => ({
	useSearchAvailableResponseUnits: (...args: unknown[]) =>
		mockUseSearchAvailableResponseUnits(...args),
}));

describe('IncidentDeploymentOrder page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseIncident.mockReturnValue({
			incident: { incidentId: 42, title: 'Test', severity: 'HIGH', description: 'd', regionId: 1 },
			loading: false,
			error: null,
		});
		mockUseAllDepartments.mockReturnValue({
			departments: [{ departmentId: 10, name: 'Alpha Dept' }],
			loading: false,
			error: null,
			refetch: vi.fn(),
		});
		mockUseDepartment.mockReturnValue({
			department: null,
			loading: false,
			error: null,
			refetch: vi.fn(),
		});
		mockUseMunicipalities.mockReturnValue({
			municipalities: [],
			loading: false,
			error: null,
			refetch: vi.fn(),
		});
		mockUseMunicipality.mockReturnValue({
			municipality: null,
			loading: false,
			error: null,
			refetch: vi.fn(),
		});
		mockUseCreateDeploymentOrder.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
		mockUseSearchAvailableResponseUnits.mockReturnValue({ data: [], isFetching: false });
	});

	it('renders existing deployment order when present', () => {
		mockUseDeploymentOrderByIncidentId.mockReturnValue({
			data: {
				deploymentOrderId: 1,
				incidentId: 42,
				orderedBy: 1,
				orderedAt: new Date().toISOString(),
				deploymentRequests: [
					{
						requestId: 2,
						incidentId: 42,
						deploymentOrderId: 1,
						requestedBy: 1,
						requestedAt: new Date().toISOString(),
						targetDepartmentId: 10,
						priority: 'HIGH',
						requestedUnitType: 'AMBULANCE',
						requestedQuantity: 1,
						status: 'pending',
					},
				],
				incidentSeverity: 'HIGH',
			},
			isLoading: false,
			error: null,
		});

		renderWithProviders(<IncidentDeploymentOrder />, {
			route: '/incidents/42/deployment-order',
			routePath: '/incidents/:incidentId/deployment-order',
		});

		expect(screen.getByText(/Existing Deployment Order/i)).toBeInTheDocument();
		expect(screen.getAllByText(/Alpha Dept/)[0]).toBeInTheDocument();
		expect(screen.getByText(/AMBULANCE/)).toBeInTheDocument();
	});

	it('renders no existing order message when none', () => {
		mockUseDeploymentOrderByIncidentId.mockReturnValue({
			data: undefined,
			isLoading: false,
			error: null,
		});

		renderWithProviders(<IncidentDeploymentOrder />, {
			route: '/incidents/42/deployment-order',
			routePath: '/incidents/:incidentId/deployment-order',
		});

		expect(
			screen.getByText(/No existing deployment orders for this incident/i)
		).toBeInTheDocument();
	});
});
