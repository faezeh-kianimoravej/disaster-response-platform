import { describe, it, expect } from 'vitest';
import { deploymentAllocationSchema } from '@/validation/deploymentAllocationValidation';

describe('deploymentAllocationValidation', () => {
	it('accepts valid allocation with users', () => {
		const ok = { requestId: 1, assignedBy: 2, assignedUsers: [5] };
		const parsed = deploymentAllocationSchema.parse(ok);
		expect(parsed.requestId).toBe(1);
	});

	it('accepts valid allocation with resources', () => {
		const valid = {
			requestId: 1,
			assignedBy: 2,
			assignedResources: [{ resourceId: 1, quantity: 3 }],
		};
		expect(deploymentAllocationSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects when both users and resources are missing or empty', () => {
		const bad = { requestId: 1, assignedBy: 2 };
		const result = deploymentAllocationSchema.safeParse(bad);
		expect(result.success).toBe(false);
	});

	it('rejects when provided but empty arrays (superRefine)', () => {
		const bad = { requestId: 1, assignedBy: 2, assignedUsers: [], assignedResources: [] };
		const result = deploymentAllocationSchema.safeParse(bad);
		expect(result.success).toBe(false);
		if (!result.success) {
			const issues = result.error.issues.map(i => i.message);
			expect(issues.some(m => m.includes('At least one user or resource'))).toBe(true);
		}
	});

	it('rejects resource quantity <= 0', () => {
		const bad2 = {
			requestId: 1,
			assignedBy: 2,
			assignedResources: [{ resourceId: 1, quantity: 0 }],
		};
		const result = deploymentAllocationSchema.safeParse(bad2);
		expect(result.success).toBe(false);
	});
});
