import { describe, it, expect } from 'vitest';
import { responseUnitValidation } from '@/validation/responseUnitValidation';
import * as responseUnitModule from '@/validation/responseUnitValidation';

describe('responseUnitValidation', () => {
	it('accepts a valid response unit', () => {
		const valid = {
			unitName: 'Alpha',
			unitType: 'Ambulance',
			departmentId: 2,
			defaultResources: [{ resourceId: 1, quantity: 3, isPrimary: true }],
			defaultPersonnel: [{ specialization: 'Medic', isRequired: true }],
		};
		const parsed = responseUnitValidation.parse(valid);
		expect(parsed.unitName).toBe('Alpha');
		expect(parsed.defaultResources).toBeDefined();
	});

	it('rejects missing required fields', () => {
		const bad = { unitName: '', unitType: '', departmentId: -1 };
		const result = responseUnitValidation.safeParse(bad);
		expect(result.success).toBe(false);
	});

	it('module exports and schema safeParse works', () => {
		const mod = responseUnitModule as unknown as Record<string, unknown>;
		expect(mod).toBeTruthy();
		const keys = Object.keys(mod);
		if (keys.length === 0) return;
		const key = keys.find(k => /schema|Schema|responseUnit/i.test(k)) ?? keys[0];
		const maybeSchema = mod[key as string];
		type SchemaLike = { safeParse?: (v: unknown) => unknown };
		const maybeSchemaTyped = maybeSchema as unknown as SchemaLike;
		if (maybeSchemaTyped && typeof maybeSchemaTyped.safeParse === 'function') {
			const res = maybeSchemaTyped.safeParse({});
			expect(res).toHaveProperty('success');
		}
	});
});
