import { describe, it, expect, vi } from 'vitest';
import UserDetailsPage from '@/pages/UserDetailsPage';
import { renderWithProviders } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';

const mockUseUser = vi.fn();
vi.mock('@/hooks/useUser', () => ({
	useUser: (...args: unknown[]) => mockUseUser(...args),
	useRemoveUser: () => ({ remove: vi.fn(), loading: false, success: false, error: null }),
}));

vi.mock('@/hooks/useRegion', () => ({
	useRegion: () => ({ fetchRegion: vi.fn().mockResolvedValue({ name: 'North Region' }) }),
}));

vi.mock('@/components/auth/AuthGuard', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/context/AuthContext', async orig => {
	const mod = await orig<typeof import('@/context/AuthContext')>();
	return {
		...mod,
		useIsUserLoggedIn: () => true,
		useUserHasAnyRole: () => true,
	};
});

describe('UserDetailsPage (smoke)', () => {
	it('renders user info', async () => {
		mockUseUser.mockReturnValue({
			user: {
				userId: 9,
				firstName: 'Grace',
				lastName: 'Hopper',
				email: 'grace@ex.com',
				mobile: '555',
				roles: [
					{
						roleType: 'Citizen',
						regionId: null,
						departmentId: null,
						municipalityId: null,
					},
				],
				deleted: false,
			},
			loading: false,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<UserDetailsPage />, { route: '/users/9' });
		expect(screen.getByText(/Grace Hopper/)).toBeInTheDocument();
		expect(screen.getByText(/Email/i)).toBeInTheDocument();
		expect(screen.getAllByText('Citizen').length).toBeGreaterThan(0);
	});

	it('renders not found when no user', async () => {
		mockUseUser.mockReturnValue({ user: null, loading: false, error: null, refetch: vi.fn() });
		renderWithProviders(<UserDetailsPage />, { route: '/users/1234' });
		await waitFor(() => expect(screen.getByText(/User not found/i)).toBeInTheDocument());
	});
});
