import { describe, it, expect } from 'vitest';
import {
	resourceAllocationFormSchema,
	allocationSchema,
	resourceSearchFormSchema,
} from '@/validation/resourceAllocationValidation';

const baseOk = {
	incidentId: 1,
	allocations: [{ resourceId: 5, quantity: 2 }],
};

describe('resourceAllocationValidation', () => {
	it('accepts valid allocation and form', () => {
		const parsed = resourceAllocationFormSchema.parse(baseOk);
		expect(parsed.incidentId).toBe(1);
		expect(parsed.allocations).toHaveLength(1);
	});

	it('rejects allocation with invalid quantity', () => {
		const bad = { incidentId: 1, allocations: [{ resourceId: 5, quantity: 0 }] };
		const result = resourceAllocationFormSchema.safeParse(bad);
		expect(result.success).toBe(false);
	});

	it('validates search schema optional fields', () => {
		const parsed = resourceSearchFormSchema.parse({});
		expect(parsed).toEqual({});
	});

	it('rejects when allocations missing or empty', () => {
		expect(resourceAllocationFormSchema.safeParse({ incidentId: 1 }).success).toBe(false);
		expect(resourceAllocationFormSchema.safeParse({ incidentId: 1, allocations: [] }).success).toBe(
			false
		);
	});

	it('allocation item validation enforces min quantity', () => {
		const bad = { resourceId: 2, quantity: 0 };
		const parsed = allocationSchema.safeParse(bad);
		expect(parsed.success).toBe(false);
	});
});
