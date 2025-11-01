import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { ToastProvider } from '@/components/toast/ToastProvider';
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthContext, type AuthContextValue } from '@/context/AuthContext';

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

	return (
		<MemoryRouter initialEntries={[route]}>
			<QueryClientProvider client={client}>
				<ToastProvider>
					<NotificationProvider>
						<AuthContext.Provider value={defaultAuth}>
							{options?.routePath ? (
								<Routes>
									<Route path={options.routePath} element={children} />
								</Routes>
							) : (
								children
							)}
						</AuthContext.Provider>
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
