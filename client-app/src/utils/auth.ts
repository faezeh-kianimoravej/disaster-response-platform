import { createRoles } from '@/types/role';
import type { RoleType } from '@/types/role';
import type { User } from '@/types/user';

type TokenParsed = {
	realm_access?: { roles?: string[] };
	given_name?: string;
	name?: string;
	family_name?: string;
	email?: string;
	sub?: string;
	exp?: number;
};

// Map Keycloak realm role names to frontend RoleType names
const ROLE_MAP: Record<string, string> = {
	REGION_ADMIN: 'Region Admin',
	MUNICIPALITY_ADMIN: 'Municipality Admin',
	DEPARTMENT_ADMIN: 'Department Admin',
};

export function mapTokenToPartialUser(tokenParsed: TokenParsed | null | undefined): Partial<User> {
	if (!tokenParsed) return {};

	const realmRoles: string[] = tokenParsed.realm_access?.roles ?? [];
	const roleTypes = realmRoles.map(r => ROLE_MAP[r] ?? r) as unknown as RoleType[];

	const partial: Partial<User> = {
		firstName: tokenParsed.given_name ?? tokenParsed.name ?? '',
		lastName: tokenParsed.family_name ?? '',
		email: tokenParsed.email ?? '',
		roles: createRoles(roleTypes),
		deleted: false,
		mobile: '',
	};

	if (tokenParsed.sub) partial.keycloakId = tokenParsed.sub;

	return partial;
}

export function tokenHasValidExpiry(tokenParsed: TokenParsed | null | undefined): boolean {
	if (!tokenParsed) return false;
	const exp = tokenParsed.exp;
	if (typeof exp !== 'number') return false;
	// exp is in seconds since epoch
	return Date.now() / 1000 < exp;
}

export function parseJwt(token: string | null | undefined): TokenParsed | null {
	if (!token) return null;
	try {
		const parts = token.split('.');
		if (parts.length < 2) return null;
		const payload = parts[1] ?? '';
		if (!payload) return null;
		const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
		const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
		return JSON.parse(decoded) as TokenParsed;
	} catch {
		return null;
	}
}

export default mapTokenToPartialUser;
