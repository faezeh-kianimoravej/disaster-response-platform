import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import AccountPanel from '@/components/auth/AccountPanel';
import { renderWithProviders } from '@/test/utils';

// helpers removed

describe('AccountPanel', () => {
	it('toggles Logged In off calls setAuth(false)', () => {
		const setAuth = vi.fn();
		renderWithProviders(<AccountPanel />, { auth: { setAuth, updateUser: vi.fn() } });
		fireEvent.click(screen.getByRole('button', { name: /account/i }));
		const checkbox = screen.getByLabelText(/Logged In/i) as HTMLInputElement;
		expect(checkbox.checked).toBe(true);
		fireEvent.click(checkbox); // uncheck
		expect(setAuth).toHaveBeenCalledWith({ isLoggedIn: false, user: null, token: undefined });
	});

	it('logs in when toggled on from logged out', () => {
		const setAuth = vi.fn();
		renderWithProviders(<AccountPanel />, {
			auth: { isLoggedIn: false, user: null, token: undefined, setAuth, updateUser: vi.fn() },
		});
		fireEvent.click(screen.getByRole('button', { name: /account/i }));
		const checkbox = screen.getByLabelText(/Logged In/i) as HTMLInputElement;
		expect(checkbox.checked).toBe(false);
		fireEvent.click(checkbox); // check
		expect(setAuth).toHaveBeenCalledWith(
			expect.objectContaining({
				isLoggedIn: true,
				user: expect.any(Object),
				token: expect.any(String),
			})
		);
	});

	it('toggles role via checkbox and calls updateUser', () => {
		const updateUser = vi.fn();
		renderWithProviders(<AccountPanel />, { auth: { updateUser } });
		fireEvent.click(screen.getByRole('button', { name: /account/i }));
		const citizenCheckbox = screen.getByLabelText('Citizen') as HTMLInputElement;
		fireEvent.click(citizenCheckbox);
		expect(updateUser).toHaveBeenCalledWith(
			expect.objectContaining({ roles: expect.arrayContaining(['Citizen']) })
		);
	});

	it('updates Department/Municipality/Region IDs via inputs', () => {
		const updateUser = vi.fn();
		renderWithProviders(<AccountPanel />, { auth: { updateUser } });
		fireEvent.click(screen.getByRole('button', { name: /account/i }));
		const deptGroup = screen.getByText(/Department ID/i).closest('div')!;
		const deptInput = within(deptGroup).getByRole('spinbutton') as HTMLInputElement;
		fireEvent.change(deptInput, { target: { value: '3' } });
		expect(updateUser).toHaveBeenCalledWith({ departmentId: 3 });

		const munGroup = screen.getByText(/Municipality ID/i).closest('div')!;
		const munInput = within(munGroup).getByRole('spinbutton') as HTMLInputElement;
		fireEvent.change(munInput, { target: { value: '4' } });
		expect(updateUser).toHaveBeenCalledWith({ municipalityId: 4 });

		const regionGroup = screen.getByText(/Region ID/i).closest('div')!;
		const regionInput = within(regionGroup).getByRole('spinbutton') as HTMLInputElement;
		fireEvent.change(regionInput, { target: { value: '5' } });
		expect(updateUser).toHaveBeenCalledWith({ regionId: 5 });
	});
});
