import { createContext, useContext } from 'react';
import type { User } from '@/types/user';
import type { Role } from '@/types/role';

export function isUserLoggedIn(auth: AuthState | null | undefined): boolean {
	return !!auth && !!auth.user;
}

export function userHasAnyRole(auth: AuthState | null | undefined, roles: Role[]): boolean {
	if (!auth?.user?.roles) return false;
	return auth.user.roles.some(r => roles.includes(r));
}

export function userHasAllRoles(auth: AuthState | null | undefined, roles: Role[]): boolean {
	if (!auth?.user?.roles) return false;
	return roles.every(role => auth.user?.roles && auth.user.roles.includes(role));
}

export type AuthState = {
	isLoggedIn: boolean;
	user: User | null;
	token: string | undefined;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth() {
	return useContext(AuthContext);
}
