import { describe, it, expect } from 'vitest';

describe('ResponseUnitPage smoke', () => {
	it('\nmodule loads and exports a function', async () => {
		const mod = await import('../../../pages/ResponseUnitPage');
		expect(typeof mod.default).toBe('function');
	}, 15000);
});
