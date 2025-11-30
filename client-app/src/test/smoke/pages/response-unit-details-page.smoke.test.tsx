import { describe, it, expect } from 'vitest';

describe('ResponseUnitDetailsPage smoke', () => {
	it('module loads and exports a function', async () => {
		const mod = await import('../../../pages/ResponseUnitDetailsPage');
		expect(typeof mod.default).toBe('function');
	});
});
