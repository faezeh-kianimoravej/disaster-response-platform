import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthGuard from '@/components/auth/AuthGuard';

vi.mock('@/context/AuthContext', () => ({
	useIsUserLoggedIn: vi.fn(),
	useUserHasAnyRole: vi.fn(),
	useUserHasAllRoles: vi.fn(),
	useUserHasAccessToRegion: vi.fn(),
	useUserHasAccessToMunicipality: vi.fn(),
	useUserHasAccessToDepartment: vi.fn(),
	useUserHasAccessToResource: vi.fn(),
}));

const authHooks = await import('@/context/AuthContext');

describe('AuthGuard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders NotAuthorized when not logged in', () => {
		vi.mocked(authHooks.useIsUserLoggedIn).mockReturnValue(false);
		render(
			<MemoryRouter>
				<AuthGuard>
					<div>Secret</div>
				</AuthGuard>
			</MemoryRouter>
		);
		expect(screen.getByText(/Not Authorized/i)).toBeInTheDocument();
	});

	it('allows access when logged in and no extra requirements', () => {
		vi.mocked(authHooks.useIsUserLoggedIn).mockReturnValue(true);
		render(
			<MemoryRouter>
				<AuthGuard>
					<div>Secret</div>
				</AuthGuard>
			</MemoryRouter>
		);
		expect(screen.getByText('Secret')).toBeInTheDocument();
	});

	it('requires ANY role by default', () => {
		vi.mocked(authHooks.useIsUserLoggedIn).mockReturnValue(true);
		vi.mocked(authHooks.useUserHasAnyRole).mockReturnValue(false);
		render(
			<MemoryRouter>
				<AuthGuard requireRoles={['Region Admin', 'Municipality Admin']}>
					<div>Secret</div>
				</AuthGuard>
			</MemoryRouter>
		);
		expect(screen.getByText(/Not Authorized/i)).toBeInTheDocument();
	});

	it('requires ALL roles when roleMode=all', () => {
		vi.mocked(authHooks.useIsUserLoggedIn).mockReturnValue(true);
		vi.mocked(authHooks.useUserHasAllRoles).mockReturnValue(false);
		render(
			<MemoryRouter>
				<AuthGuard requireRoles={['Region Admin', 'Municipality Admin']} roleMode="all">
					<div>Secret</div>
				</AuthGuard>
			</MemoryRouter>
		);
		expect(screen.getByText(/Not Authorized/i)).toBeInTheDocument();
	});

	it('checks region/municipality/department/resource access', () => {
		vi.mocked(authHooks.useIsUserLoggedIn).mockReturnValue(true);
		vi.mocked(authHooks.useUserHasAnyRole).mockReturnValue(true);
		vi.mocked(authHooks.useUserHasAccessToRegion).mockReturnValue(false);
		vi.mocked(authHooks.useUserHasAccessToMunicipality).mockReturnValue(false);
		vi.mocked(authHooks.useUserHasAccessToDepartment).mockReturnValue(false);
		vi.mocked(authHooks.useUserHasAccessToResource).mockReturnValue(false);

		render(
			<MemoryRouter>
				<AuthGuard
					requireRoles={['Citizen']}
					requireAccessToRegion={1}
					requireAccessToMunicipality={2}
					requireAccessToDepartment={3}
					requireAccessToResource={4}
				>
					<div>Secret</div>
				</AuthGuard>
			</MemoryRouter>
		);

		expect(screen.getByText(/Not Authorized/i)).toBeInTheDocument();
	});
});
