import { vi, describe, it, expect } from 'vitest';
import { BaseApi } from '@/api/base';

describe('api/deploymentRequest mapping', () => {
	afterEach(() => vi.restoreAllMocks());

	it('converts DTO dates to Date and maps fields', async () => {
		vi.spyOn(BaseApi.prototype, 'get').mockImplementation(async () => {
			return {
				requestId: 99,
				incidentId: 10,
				deploymentOrderId: 20,
				requestedBy: 3,
				requestedAt: '2020-01-02T03:04:05.000Z',
				targetDepartmentId: 5,
				priority: 'LOW',
				requestedUnitType: 'AMBULANCE',
				requestedQuantity: 2,
				status: 'OPEN',
			};
		});

		const module = await import('@/api/deploymentRequest');
		const out = await module.getDeploymentRequestById(99);
		expect(out).toBeDefined();
		expect(out.requestId).toBe(99);
		expect(out.requestedAt instanceof Date).toBe(true);
		expect(out.priority).toBe('LOW');
	});

	describe('API initialization', () => {
		it('should initialize BaseApi with correct exports', async () => {
			// Ensure the module loads and exports the expected function
			const module = await import('@/api/deploymentRequest');
			expect(typeof module.getDeploymentRequestById).toBe('function');
		});
	});
});
