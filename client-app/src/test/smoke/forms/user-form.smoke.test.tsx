import { describe, it, expect } from 'vitest';

describe('UserForm smoke', () => {
	it('exports a default function (smoke)', async () => {
		const mod = await import('../../../components/forms/UserForm');
		expect(typeof mod.default).toBe('function');
	});
});
