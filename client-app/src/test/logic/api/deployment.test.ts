import { vi, describe, it, expect } from 'vitest';
import { BaseApi } from '@/api/base';
import type { FillUnitAssignmentRequest } from '@/api/deployment/deployment';

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

		const deployment = await import('@/api/deployment/deployment');

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

		const deployment = await import('@/api/deployment/deployment');

		const req = { requestId: 9, assignedBy: 10, assignedUnitId: 123 };
		const res = await deployment.assignResponseUnitToDeploymentRequest(req);
		expect(res.success).toBe(true);
		expect(res.assignedUnitId).toBe(123);
	});

	it('getIncidentForResponder calls BaseApi.get and returns incident', async () => {
		vi.spyOn(BaseApi.prototype, 'get').mockResolvedValue({
			incidentId: 42,
			regionId: 1,
			title: 'Test Incident',
			location: 'Test Location',
			status: 'Open',
			severity: 'High',
			gripLevel: 2,
			description: 'Test description',
			reportedAt: '2024-01-15T10:00:00Z',
			createdAt: '2024-01-15T10:00:00Z',
			updatedAt: '2024-01-15T10:00:00Z',
			latitude: null,
			longitude: null,
		});

		const deployment = await import('@/api/deployment');
		const result = await deployment.getIncidentForResponder(123);

		expect(result).toBeDefined();
		expect(result?.incidentId).toBe(42);
		expect(result?.title).toBe('Test Incident');
		expect(BaseApi.prototype.get).toHaveBeenCalledWith('/responder/123/incident');
	});

	it('getIncidentForResponder returns null on error', async () => {
		vi.spyOn(BaseApi.prototype, 'get').mockRejectedValue(new Error('Not found'));

		const deployment = await import('@/api/deployment');
		const result = await deployment.getIncidentForResponder(999);

		expect(result).toBeNull();
	});
});
