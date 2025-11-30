import { describe, it, expect } from 'vitest';
import { DEPLOYMENT_STATUSES, DEPLOYMENT_REQUEST_STATUSES } from '@/types/deployment';

describe('types/deployment', () => {
	it('exports deployment status constants', () => {
		expect(Array.isArray(DEPLOYMENT_STATUSES)).toBe(true);
		expect(DEPLOYMENT_STATUSES.length).toBeGreaterThan(0);
		expect(DEPLOYMENT_STATUSES).toContain('Assigned');
		expect(DEPLOYMENT_STATUSES.length).toBeGreaterThan(5);
	});

	it('exports request status constants', () => {
		expect(Array.isArray(DEPLOYMENT_REQUEST_STATUSES)).toBe(true);
		expect(DEPLOYMENT_REQUEST_STATUSES).toContain('pending');
		expect(DEPLOYMENT_REQUEST_STATUSES).toContain('cancelled');
	});
});
