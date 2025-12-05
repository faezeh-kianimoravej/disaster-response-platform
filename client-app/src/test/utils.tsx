import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { ToastProvider } from '@/components/toast/ToastProvider';
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthContext, type AuthContextValue } from '@/context/AuthContext';
import { KeycloakContext, KeycloakContextType } from '@/context/KeycloakProvider';
import { KeycloakInstance } from 'keycloak-js';

export type TestProvidersOptions = {
	route?: string;
	routePath?: string; // optional route pattern to enable useParams in components under test
	queryClient?: QueryClient;
	auth?: Partial<AuthContextValue>;
};

export function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0, staleTime: 0 },
			mutations: { retry: false },
		},
	});
}

function TestProviders({
	children,
	options,
}: {
	children: React.ReactNode;
	options?: TestProvidersOptions;
}) {
	const client = options?.queryClient ?? createTestQueryClient();
	const route = options?.route ?? '/';

	// Broadly-permitted default auth (non-user tests). Customizable via options.auth
	const defaultAuth: AuthContextValue = {
		isLoggedIn: true,
		token: 'test-token',
		user: {
			userId: 1,
			firstName: 'Test',
			lastName: 'User',
			email: 'test@example.com',
			mobile: '000',
			roles: ['Region Admin'],
			departmentId: undefined,
			municipalityId: undefined,
			regionId: 1,
		},
		setAuth: () => undefined,
		updateUser: () => undefined,
		...(options?.auth ?? {}),
	} as AuthContextValue;

	const providedAuth = options?.auth;
	const isLoggedInOption = providedAuth?.isLoggedIn ?? defaultAuth.isLoggedIn;
	const authUser = isLoggedInOption ? (providedAuth?.user ?? defaultAuth.user) : undefined;

	const defaultKc = {
		keycloak: {
			token: isLoggedInOption ? 'test-token' : null,
			tokenParsed: authUser ? { email: authUser.email } : undefined,
			authenticated: isLoggedInOption,
			init: async () => true,
			login: async () => {},
			logout: async () => {},
			updateToken: async () => true,
			register: async () => {},
			accountManagement: async () => {},
			createLoginUrl: () => '',
			createLogoutUrl: () => '',
			createRegisterUrl: () => '',
			createAccountUrl: () => '',
			isTokenExpired: () => false,
			clearToken: () => {},
			hasRealmRole: () => false,
			hasResourceRole: () => false,
			loadUserProfile: async () => ({}),
			realmAccess: undefined,
			resourceAccess: undefined,
			idToken: undefined,
			idTokenParsed: undefined,
			clientId: '',
			realm: '',
			authServerUrl: '',
			refreshToken: undefined,
			refreshTokenParsed: undefined,
			timeSkew: 0,
		} as unknown as KeycloakInstance,
		initialized: true,
		isAuthenticated: isLoggedInOption,
		login: async () => {},
		logout: async () => {},
	} as KeycloakContextType;

	return (
		<MemoryRouter initialEntries={[route]}>
			<QueryClientProvider client={client}>
				<ToastProvider>
					<NotificationProvider>
						<KeycloakContext.Provider value={defaultKc}>
							<AuthContext.Provider value={defaultAuth}>
								{options?.routePath ? (
									<Routes>
										<Route path={options.routePath} element={children} />
									</Routes>
								) : (
									children
								)}
							</AuthContext.Provider>
						</KeycloakContext.Provider>
					</NotificationProvider>
				</ToastProvider>
			</QueryClientProvider>
		</MemoryRouter>
	);
}

export function renderWithProviders(ui: React.ReactElement, options?: TestProvidersOptions) {
	return render(<TestProviders options={options ?? {}}>{ui}</TestProviders>);
}

export function renderWithRouter(ui: React.ReactElement, options?: TestProvidersOptions) {
	return render(<MemoryRouter initialEntries={[options?.route ?? '/']}>{ui}</MemoryRouter>);
}
