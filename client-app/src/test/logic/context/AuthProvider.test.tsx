import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { TestProviders, createTestQueryClient } from '@/test/utils';

// Mock needs to be defined before any imports that might use it
vi.mock('@/context/KeycloakProvider', () => ({
	useKeycloak: () => keycloakMock,
	KeycloakContext: React.createContext(undefined),
}));

function base64(payload: unknown) {
	return Buffer.from(JSON.stringify(payload))
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

if (typeof (globalThis as unknown as { atob?: unknown }).atob !== 'function') {
	Object.defineProperty(globalThis, 'atob', {
		value: (s: string) => Buffer.from(s, 'base64').toString('binary'),
	});
}

type MaybeUser = { user: Record<string, unknown> | null };

type KCMock = {
	keycloak?: { token?: string; tokenParsed?: Record<string, unknown> } | undefined;
	initialized: boolean;
	isAuthenticated: boolean;
	login: () => Promise<void>;
	logout: () => Promise<void>;
};

let keycloakMock: KCMock = {
	keycloak: {
		token: 'tok1',
		tokenParsed: {
			given_name: 'P',
			family_name: 'Q',
			email: 'p.q@example.com',
			sub: 's1',
			exp: Math.floor(Date.now() / 1000) + 300,
		},
	},
	initialized: true,
	isAuthenticated: true,
	login: vi.fn().mockResolvedValue(undefined),
	logout: vi.fn().mockResolvedValue(undefined),
};

const backendUser: Record<string, unknown> = {
	id: 99,
	firstName: 'Backend',
	lastName: 'User',
	email: 'p.q@example.com',
	roles: [],
};

let useUserByEmailMock: (email?: string) => MaybeUser = email => ({
	user: email === 'p.q@example.com' ? backendUser : null,
});

vi.mock('@/hooks/useUser', () => ({
	useUserByEmail: (email?: string) => useUserByEmailMock(email),
}));

import { AuthProvider } from '@/context/AuthProvider';
import { useAuth } from '@/context/AuthContext';

function Consumer() {
	const auth = useAuth();
	return (
		<div>
			<span data-testid="isLoggedIn">{String(auth?.isLoggedIn)}</span>
			<span data-testid="email">{auth?.user?.email ?? ''}</span>
			<span data-testid="firstName">{auth?.user?.firstName ?? ''}</span>
		</div>
	);
}

describe('AuthProvider', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('uses keycloak tokenParsed to set partial user then replaces with backend user', async () => {
		const queryClient = createTestQueryClient();
		render(
			<TestProviders options={{ queryClient }}>
				<AuthProvider>
					<Consumer />
				</AuthProvider>
			</TestProviders>
		);

		await waitFor(() => expect(screen.getByTestId('isLoggedIn').textContent).toBe('true'));

		await waitFor(() => expect(screen.getByTestId('email').textContent).toBe('p.q@example.com'));
		expect(screen.getByTestId('firstName').textContent).toBe('Backend');
	});

	it('falls back to localStorage token when not authenticated', async () => {
		keycloakMock = {
			initialized: true,
			isAuthenticated: false,
			login: vi.fn().mockResolvedValue(undefined),
			logout: vi.fn().mockResolvedValue(undefined),
		} as KCMock;

		const payload = {
			given_name: 'Loc',
			family_name: 'Storage',
			email: 'loc@example.com',
			sub: 'sub-local',
			exp: Math.floor(Date.now() / 1000) + 300,
		};
		const token = `${base64({ alg: 'none' })}.${base64(payload)}.`;
		localStorage.setItem('auth_token', token);

		useUserByEmailMock = () => ({ user: null });

		const queryClient = createTestQueryClient();
		render(
			<TestProviders options={{ queryClient }}>
				<AuthProvider>
					<Consumer />
				</AuthProvider>
			</TestProviders>
		);

		await waitFor(() => expect(screen.getByTestId('isLoggedIn').textContent).toBe('true'));
		expect(screen.getByTestId('email').textContent).toBe('loc@example.com');
	});
});
