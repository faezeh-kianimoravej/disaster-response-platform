import { describe, it, expect, vi } from 'vitest';
import UsersPage from '@/pages/UsersPage';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';

vi.mock('@/hooks/useUser', () => ({
	useUsersByDepartment: () => ({
		users: [],
		loading: false,
		error: null,
		refetch: vi.fn(),
	}),
	useUsersByMunicipality: () => ({
		users: [],
		loading: false,
		error: null,
		refetch: vi.fn(),
	}),
	useUsersByRegion: () => ({
		users: [
			{
				userId: 1,
				firstName: 'Ada',
				lastName: 'Lovelace',
				email: 'ada@ex.com',
				mobile: '123',
				roles: [
					{
						roleType: 'Region Admin',
						regionId: 1,
						departmentId: null,
						municipalityId: null,
					},
				],
				deleted: false,
			},
		],
		loading: false,
		error: null,
		refetch: vi.fn(),
	}),
}));

vi.mock('@/context/AuthContext', async orig => {
	const mod = await orig<typeof import('@/context/AuthContext')>();
	return {
		...mod,
		useIsUserLoggedIn: () => true,
		useUserHasAnyRole: () => true,
	};
});

describe('UsersPage (smoke)', () => {
	it('renders users page with heading', () => {
		renderWithProviders(<UsersPage />);
		expect(screen.getByRole('heading', { name: /Users/i })).toBeInTheDocument();
		// Mock returns user; page shows it or empty state depending on current user role
		expect(screen.getByRole('button', { name: /Create New User/i })).toBeInTheDocument();
	});
});
