import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axios } from '@/lib/axios';
import type { AxiosResponse } from 'axios';
import {
	createDeploymentOrder,
	getDeploymentOrderByIncidentId,
} from '@/api/deployment/deploymentOrder';
import type { DeploymentOrderFormData } from '@/types/deployment';

vi.mock('@/lib/axios', () => ({
	axios: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

describe('DeploymentOrder API (contract)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('createDeploymentOrder - posts payload to /deployment-orders', async () => {
		const form: DeploymentOrderFormData = {
			incidentId: 42,
			orderedBy: 7,
			incidentSeverity: 'HIGH',
			deploymentRequests: [
				{ targetDepartmentId: 1, requestedUnitType: 'AMBULANCE', requestedQuantity: 2 },
			],
		};

		const data = {
			deploymentOrderId: 9,
			incidentId: 42,
			orderedBy: 7,
			orderedAt: new Date().toISOString(),
			deploymentRequests: [
				{
					requestId: 11,
					incidentId: 42,
					deploymentOrderId: 9,
					requestedBy: 7,
					requestedAt: new Date().toISOString(),
					targetDepartmentId: 1,
					priority: 'HIGH',
					requestedUnitType: 'AMBULANCE',
					requestedQuantity: 2,
					status: 'pending',
				},
			],
			incidentSeverity: 'HIGH',
		};

		const mockResponse: AxiosResponse<typeof data> = { data } as unknown as AxiosResponse<
			typeof data
		>;

		vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

		const result = await createDeploymentOrder(form);

		expect(axios.post).toHaveBeenCalledWith(
			expect.stringContaining('/deployment-orders'),
			expect.objectContaining({ incidentId: 42 })
		);
		expect(result.deploymentOrderId).toBe(9);
		expect(result.deploymentRequests?.length).toBe(1);
	});

	it('getDeploymentOrderByIncidentId - GET /deployment-orders/incident/:id', async () => {
		const data2 = {
			deploymentOrderId: 5,
			incidentId: 123,
			orderedBy: 2,
			orderedAt: new Date().toISOString(),
			deploymentRequests: [],
			incidentSeverity: 'LOW',
		};
		const mockResponse2: AxiosResponse<typeof data2> = { data: data2 } as unknown as AxiosResponse<
			typeof data2
		>;
		vi.mocked(axios.get).mockResolvedValueOnce(mockResponse2);

		const r = await getDeploymentOrderByIncidentId(123);

		expect(axios.get).toHaveBeenCalledWith(
			expect.stringContaining('/deployment-orders/incident/123'),
			{ params: undefined }
		);
		expect(Array.isArray(r)).toBe(true);
		expect(r.length).toBeGreaterThan(0);
		if (r.length > 0) {
			expect(r[0]?.incidentId).toBe(123);
		}
	});
});
