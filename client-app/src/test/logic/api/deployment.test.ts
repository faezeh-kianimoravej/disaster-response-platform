import { vi, describe, it, expect } from 'vitest';
import { BaseApi } from '@/api/base';
import type { FillUnitAssignmentRequest } from '@/api/deployment';

describe('api/deployment', () => {
	afterEach(() => vi.restoreAllMocks());

	it('assignFillUnitToDeploymentRequest calls BaseApi.post and returns response', async () => {
		vi.spyOn(BaseApi.prototype, 'post').mockImplementation(
			async (_endpoint?: string, data?: unknown) => {
				// return a shaped response matching DeploymentAssignmentResponse
				const assignedUnitId = (data as Record<string, unknown>)?.['assignedUnitId'] as
					| number
					| undefined;
				return {
					success: true,
					assignedUnitId: assignedUnitId ?? 123,
					message: 'ok',
				};
			}
		);

		const deployment = await import('@/api/deployment');

		const req: FillUnitAssignmentRequest = {
			requestId: 1,
			assignedBy: 2,
			assignedUnitId: 3,
			assignedPersonnel: [{ slotId: 1, userId: 7, specialization: 'emt_basic' }],
			allocatedResources: [{ resourceId: 5, quantity: 1, isPrimary: true }],
		};

		const res = await deployment.assignFillUnitToDeploymentRequest(req);
		expect(res).toBeDefined();
		expect(res.success).toBe(true);
		expect(res.assignedUnitId).toBe(3);
	});

	it('assignResponseUnitToDeploymentRequest returns response', async () => {
		vi.spyOn(BaseApi.prototype, 'post').mockImplementation(
			async (_endpoint?: string, data?: unknown) => {
				const assignedUnitId = (data as Record<string, unknown>)?.['assignedUnitId'] as
					| number
					| undefined;
				return {
					success: true,
					assignedUnitId: assignedUnitId ?? 123,
					message: 'ok',
				};
			}
		);

		const deployment = await import('@/api/deployment');

		const req = { requestId: 9, assignedBy: 10, assignedUnitId: 123 };
		const res = await deployment.assignResponseUnitToDeploymentRequest(req);
		expect(res.success).toBe(true);
		expect(res.assignedUnitId).toBe(123);
	});
});
