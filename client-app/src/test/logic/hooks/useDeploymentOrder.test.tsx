import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import type { DeploymentOrder, DeploymentOrderFormData } from '@/types/deployment';
import type { IncidentSeverity } from '@/types/incident';
import {
	useDeploymentOrderByIncidentId,
	useCreateDeploymentOrder,
} from '@/hooks/useDeploymentOrder';

vi.mock('@/api/deployment/deploymentOrder', () => ({
	getDeploymentOrderByIncidentId: vi.fn(),
	createDeploymentOrder: vi.fn(),
}));

const api = await import('@/api/deployment/deploymentOrder');
const mockedApi = vi.mocked(api, { partial: true });

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0, staleTime: 0 },
			mutations: { retry: false },
		},
	});
	function Wrapper({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	}
	return Wrapper;
}

describe('useDeploymentOrder hooks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('useDeploymentOrderByIncidentId fetches and returns data', async () => {
		const mock: DeploymentOrder = {
			deploymentOrderId: 1,
			incidentId: 99,
			orderedBy: 2,
			orderedAt: new Date(),
			deploymentRequests: [],
			incidentSeverity: 'LOW' as IncidentSeverity,
		};
		vi.mocked(mockedApi.getDeploymentOrderByIncidentId).mockResolvedValueOnce(mock);

		const { result } = renderHook(() => useDeploymentOrderByIncidentId(99), {
			wrapper: createWrapper(),
		});
		await waitFor(() => expect(result.current.isLoading).toBe(false));
		expect(result.current.data?.incidentId).toBe(99);
	});

	it('useCreateDeploymentOrder calls createDeploymentOrder and returns', async () => {
		const mock: DeploymentOrder = {
			deploymentOrderId: 2,
			incidentId: 100,
			orderedBy: 3,
			orderedAt: new Date(),
			deploymentRequests: [],
			incidentSeverity: 'HIGH' as IncidentSeverity,
		};
		vi.mocked(mockedApi.createDeploymentOrder).mockResolvedValueOnce(mock);

		const { result } = renderHook(() => useCreateDeploymentOrder(), { wrapper: createWrapper() });
		let res: DeploymentOrder | undefined;
		await act(async () => {
			res = await result.current.mutateAsync({
				incidentId: 100,
				orderedBy: 3,
				incidentSeverity: 'HIGH',
				deploymentRequests: [] as DeploymentOrderFormData['deploymentRequests'],
			});
		});
		expect(vi.mocked(mockedApi.createDeploymentOrder).mock.calls.length).toBe(1);
		expect(res?.deploymentOrderId).toBe(2);
	});
});
