import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import AccountPanel from '@/components/auth/AccountPanel';
import { renderWithProviders } from '@/test/utils';
vi.mock('@/hooks/useLogin', () => ({
	useLogin: () => ({ logout: vi.fn() }),
}));

describe('AccountPanel', () => {
	it('shows user info and can trigger logout', () => {
		const setAuth = vi.fn();
		renderWithProviders(<AccountPanel />, {
			auth: {
				setAuth,
				updateUser: vi.fn(),
				user: {
					userId: 1,
					firstName: 'Test',
					lastName: 'User',
					email: 'test@example.com',
					mobile: '000',
					roles: [
						{
							roleType: 'Region Admin',
							regionId: 1,
							municipalityId: null,
							departmentId: null,
						},
					],
					deleted: false,
				},
			},
		});
		fireEvent.click(screen.getByRole('button', { name: /account/i }));
		// Shows user name/email and their roles
		expect(screen.getByText(/your roles/i)).toBeInTheDocument();
		expect(screen.getByText(/Region Admin/i)).toBeInTheDocument();

		const logoutBtn = screen.getByRole('button', { name: /logout/i });
		expect(logoutBtn).toBeInTheDocument();
		// Click logout (we mock the hook; side-effect is handled there)
		fireEvent.click(logoutBtn);
	});

	it('shows hint when logged out', () => {
		const setAuth = vi.fn();
		renderWithProviders(<AccountPanel />, {
			auth: { isLoggedIn: false, user: null, token: undefined, setAuth, updateUser: vi.fn() },
		});
		fireEvent.click(screen.getByRole('button', { name: /account/i }));
		expect(screen.getByText(/please login/i)).toBeInTheDocument();
	});

	it('shows "No roles assigned" when user has no roles', () => {
		const setAuth = vi.fn();
		renderWithProviders(<AccountPanel />, {
			auth: {
				setAuth,
				updateUser: vi.fn(),
				user: {
					userId: 1,
					firstName: 'Test',
					lastName: 'User',
					email: 'test@example.com',
					mobile: '000',
					roles: [],
					deleted: false,
				},
			},
		});
		fireEvent.click(screen.getByRole('button', { name: /account/i }));
		expect(screen.getByText(/no roles assigned/i)).toBeInTheDocument();
	});
});
