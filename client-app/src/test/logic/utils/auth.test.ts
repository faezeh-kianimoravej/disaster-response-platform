import { describe, it, expect } from 'vitest';
import { mapTokenToPartialUser, tokenHasValidExpiry, parseJwt } from '@/utils/auth';

// Helper to create a base64 payload for JWT-like tokens
function base64(payload: unknown) {
	return Buffer.from(JSON.stringify(payload))
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

type TokenParsed = {
	exp?: number;
	realm_access?: { roles?: string[] };
	given_name?: string;
	family_name?: string;
	email?: string;
	sub?: string;
};

describe('auth utils', () => {
	it('parseJwt returns null for invalid inputs', () => {
		expect(parseJwt(null)).toBeNull();
		expect(parseJwt('')).toBeNull();
		expect(parseJwt('not-a.jwt')).toBeNull();
	});

	it('parseJwt decodes a valid token payload', () => {
		// ensure atob exists in the test env (Vitest/jsdom usually provides it, but be safe)
		if (typeof (globalThis as unknown as { atob?: unknown }).atob !== 'function') {
			Object.defineProperty(globalThis, 'atob', {
				value: (s: string) => Buffer.from(s, 'base64').toString('binary'),
			});
		}

		const payload = {
			given_name: 'Jane',
			family_name: 'Doe',
			email: 'jane@example.com',
			sub: 'abc-123',
		};
		const token = `${base64({ alg: 'none' })}.${base64(payload)}.`;
		const parsed = parseJwt(token);
		expect(parsed).toMatchObject({
			given_name: 'Jane',
			family_name: 'Doe',
			email: 'jane@example.com',
			sub: 'abc-123',
		});
	});

	it('tokenHasValidExpiry returns correct booleans', () => {
		const future: TokenParsed = { exp: Math.floor(Date.now() / 1000) + 60 };
		const past: TokenParsed = { exp: Math.floor(Date.now() / 1000) - 60 };
		expect(tokenHasValidExpiry(null as unknown as TokenParsed)).toBe(false);
		expect(tokenHasValidExpiry(undefined as unknown as TokenParsed)).toBe(false);
		expect(tokenHasValidExpiry({} as TokenParsed)).toBe(false);
		expect(tokenHasValidExpiry(future)).toBe(true);
		expect(tokenHasValidExpiry(past)).toBe(false);
	});

	it('mapTokenToPartialUser maps token to partial user and role names', () => {
		const tokenParsed: TokenParsed & { realm_access: { roles: string[] } } = {
			realm_access: { roles: ['REGION_ADMIN', 'DEPARTMENT_ADMIN', 'CUSTOM_ROLE'] },
			given_name: 'A',
			family_name: 'B',
			email: 'a.b@example.com',
			sub: 'sub-1',
		};

		const partial = mapTokenToPartialUser(tokenParsed as unknown as Record<string, unknown>);
		expect(partial.firstName).toBe('A');
		expect(partial.lastName).toBe('B');
		expect(partial.email).toBe('a.b@example.com');
		expect(partial.keycloakId).toBe('sub-1');
		// roles should be created via createRoles -> array of objects with roleType
		expect(Array.isArray(partial.roles)).toBe(true);
		const roleTypes = (partial.roles as unknown as Array<{ roleType?: string }>).map(
			r => r.roleType
		);
		expect(roleTypes).toContain('Region Admin');
		expect(roleTypes).toContain('Department Admin');
		expect(roleTypes).toContain('CUSTOM_ROLE');
	});

	it('mapTokenToPartialUser returns empty object for falsy token', () => {
		expect(mapTokenToPartialUser(null)).toEqual({});
		expect(mapTokenToPartialUser(undefined)).toEqual({});
	});
});
