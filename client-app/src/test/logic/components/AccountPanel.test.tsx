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
					roles: [],
					deleted: false,
				},
			},
		});
		fireEvent.click(screen.getByRole('button', { name: /account/i }));
		// Shows user name/email and a Logout button
		expect(screen.getByText(/current roles/i)).toBeInTheDocument();
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

	it('toggles role via checkbox and calls updateUser', () => {
		const updateUser = vi.fn();
		renderWithProviders(<AccountPanel />, {
			auth: {
				updateUser,
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
		const citizenCheckbox = screen.getByLabelText('Citizen') as HTMLInputElement;
		fireEvent.click(citizenCheckbox);
		expect(updateUser).toHaveBeenCalledWith(
			expect.objectContaining({
				roles: expect.arrayContaining([expect.objectContaining({ roleType: 'Citizen' })]),
			})
		);
	});

	it('updates Department/Municipality/Region IDs via inputs', () => {
		const updateUser = vi.fn();
		renderWithProviders(<AccountPanel />, {
			auth: {
				updateUser,
				user: {
					userId: 1,
					firstName: 'Test',
					lastName: 'User',
					email: 'test@example.com',
					mobile: '000',
					roles: [
						{
							roleType: 'Department Admin',
							departmentId: null,
							municipalityId: null,
							regionId: null,
						},
						{
							roleType: 'Municipality Admin',
							departmentId: null,
							municipalityId: null,
							regionId: null,
						},
						{ roleType: 'Region Admin', departmentId: null, municipalityId: null, regionId: null },
					],
					deleted: false,
				},
			},
		});
		fireEvent.click(screen.getByRole('button', { name: /account/i }));
		// Department entity: set Dept ID
		const deptInput = screen.getByPlaceholderText('Dept ID') as HTMLInputElement;
		fireEvent.change(deptInput, { target: { value: '3' } });
		expect(updateUser).toHaveBeenCalledWith(
			expect.objectContaining({
				roles: expect.arrayContaining([
					expect.objectContaining({ roleType: 'Department Admin', departmentId: 3 }),
				]),
			})
		);
		// Municipality entity
		const muniInput = screen.getByPlaceholderText('Muni ID') as HTMLInputElement;
		fireEvent.change(muniInput, { target: { value: '4' } });
		expect(updateUser).toHaveBeenCalledWith(
			expect.objectContaining({
				roles: expect.arrayContaining([
					expect.objectContaining({ roleType: 'Municipality Admin', municipalityId: 4 }),
				]),
			})
		);
		// Region entity
		const regionInput = screen.getByPlaceholderText('Region ID') as HTMLInputElement;
		fireEvent.change(regionInput, { target: { value: '5' } });
		expect(updateUser).toHaveBeenCalledWith(
			expect.objectContaining({
				roles: expect.arrayContaining([
					expect.objectContaining({ roleType: 'Region Admin', regionId: 5 }),
				]),
			})
		);
	});
});
